# Contact form: public release setup

The code is ready for these service settings. Production fails closed until the
origin allowlist, Turnstile keys, AWS credentials, topic, table, and trusted IP
source are available. Do these steps before publishing the updated deployment.
This guide assumes the existing Vercel + AWS setup.

## What the code now enforces

| Protection | Behavior |
| --- | --- |
| Request filtering | Exact allowed Origin; cross-site browser requests rejected; JSON only; no compressed bodies |
| Body limits | At most 32 KiB of actual streamed bytes; five-second body read deadline |
| Validation | Name 100 characters, email 254, message 1,600; fixed server-selected topic and subject |
| Bot checks | Hidden honeypot; server-verified Turnstile token, hostname, and `contact` action |
| IP limits | Three attempts per fixed UTC minute, 20 per UTC day; checked before visitor counters and Turnstile API calls |
| Visitor limit | 10 per UTC day; cookie is only a secondary signal and can be reset |
| Global cap | 100 verified publish attempts per UTC day by default; configurable |
| Expiration | New counters carry numeric `expiresAt`, seven days after their window ends |
| Failure handling | Dependencies fail closed; generic client errors; no caching; Retry-After on 429 |
| Form recovery | Entries survive failed verification, outages, and rate limits; challenge refreshes after each attempt |
| Logs | Structured outcome, status, duration, and generated request ID; no message, email, token, cookie, raw IP, or secret |
| Shutoff | `CONTACT_FORM_ENABLED=false` rejects before database, bot-check, or SNS work |

Counters use atomic DynamoDB conditional updates. Separate counters are not a
transaction: an attempt can consume earlier quotas even if verification or
delivery later fails. Fixed windows allow a boundary burst. IP limits can affect
people sharing a network, and attackers can rotate IPs. Edge protection remains
necessary to contain requests, compute, logging, and database costs. The global
cap limits publish attempts; it is not a spending cap or a delivery guarantee.

## 1. Create the Turnstile widget

1. Open your Cloudflare dashboard and select **Turnstile**. Create a widget named
   `Portfolio contact`.
2. Choose **Managed** mode. Add the exact production hostname(s), such as
   `your-domain.com` and `www.your-domain.com`. These are hostnames without `https://`.
3. Save the widget. Copy its **site key** and **secret key**.
4. Keep the secret private. The site key is intentionally public.
5. For local testing of the full challenge, create a separate development widget
   allowing `localhost` and `127.0.0.1`. Use that widget's real key pair locally.
   This implementation checks hostname and action strictly; public dummy keys are
   rejected in production and are not used for the manual end-to-end test.

The widget is already integrated into the form. The server calls Siteverify,
requires `success`, checks the origin hostname and `action=contact`, and rejects
timeouts and reused/expired tokens. No Cloudflare DNS migration is required.
[Cloudflare setup](https://developers.cloudflare.com/turnstile/get-started/),
[server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## 2. Configure Vercel environment variables

1. Open **Vercel → your project → Settings → Environment Variables**.
2. Set the following for **Production**, using your real values:

   ```dotenv
   CONTACT_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-public-site-key
   TURNSTILE_SECRET_KEY=your-private-secret-key
   CONTACT_FORM_ENABLED=true
   CONTACT_GLOBAL_DAILY_LIMIT=100
   AWS_REGION=us-east-1
   CONTACT_TOPIC_ARN=arn:aws:sns:us-east-1:ACCOUNT_ID:TOPIC_NAME
   CONTACT_TABLE_NAME=ContactMessages
   RATE_LIMIT_SECRET=your-existing-strong-random-secret
   ```

3. Keep the existing server-side AWS credential configuration. If using access
   keys, they belong in `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; temporary
   credentials also need `AWS_SESSION_TOKEN`. Use a role with temporary credentials
   where your deployment supports it. Do not prefix secrets with `NEXT_PUBLIC_`.
4. The only new public variable is `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. It is embedded
   at build time, so **redeploy after changing it or any deployment environment setting**.
5. Configure **Preview** separately. Either leave its contact form disabled or
   use separate AWS resources, a Turnstile widget, and exact preview origins.
   Do not allow every `*.vercel.app` origin. Add only the specific preview hostname
   that you intend to test to both the widget and the origin allowlist.
6. Keep the same `RATE_LIMIT_SECRET` across running instances and redeployments.
   Changing it changes the IP/visitor counter keys and resets those effective limits.

Vercel supplies the trusted `x-vercel-forwarded-for` header. The code does not fall
back to an arbitrary client-supplied forwarding header in production. If hosting
elsewhere, use a proxy that overwrites forwarding headers and prevents direct
access to the app; then set `CONTACT_TRUSTED_IP_HEADER` to `x-forwarded-for` or
`x-real-ip`. Do not set this variable on an unprotected public Node server.
[Vercel request headers](https://vercel.com/docs/headers/request-headers).

### Local development

Copy the relevant entries from [contact.env.example](contact.env.example) into
your private `.env.local`; keep your existing AWS credentials. The default local
origin allowlist is `http://localhost:3000,http://127.0.0.1:3000` when no list is set.
For another port, configure its exact origin. Restart the development server after
editing environment variables.

Only `NODE_ENV=development` may omit **both** Turnstile keys. If either key is set,
both are required. Production has no verification bypass. Local IP requests share
one development bucket; forwarded headers cannot change it. Local submissions
still use AWS and send real notifications unless mocked by a test.

## 3. Apply the IAM policy and check the SNS topic

1. Identify the user or role that the deployed server actually uses. It may differ
   from your local profile or the identity signed into the AWS console.
2. Open **IAM → Users (or Roles) → that identity → Permissions → Add permissions
   → Create inline policy → JSON**.
3. Use [contact-iam-policy.json](contact-iam-policy.json). Replace each placeholder
   with the exact region, account, topic ARN, and contact-table ARN.
4. The form needs `sns:Publish` on its topic and `dynamodb:UpdateItem` on its counter
   table. Preserve the separate `dynamodb:Query` permission for the assistant's
   records table if the same identity serves that feature.
5. Remove unused SMS, `sns:Subscribe`, and `sns:CreateTopic` grants from this app
   identity after confirming no other app shares it. Do not remove unrelated permissions.
6. Open **SNS → Topics → contact topic → Access policy**. Ensure public principals
   cannot publish or subscribe. The default owner-restricted policy is sufficient
   alongside IAM in a same-account setup, absent an explicit deny.
7. Under **Subscriptions**, confirm that only your intended inbox is subscribed
   and its status is confirmed. Use the **topic ARN**, not a subscription ARN, in
   `CONTACT_TOPIC_ARN`.
8. If the topic uses KMS encryption, grant the publisher the documented
   `kms:GenerateDataKey*` and `kms:Decrypt` access to that specific key, with an
   appropriate key policy. Cross-account publishing also needs a topic policy grant.

Creating subscribers, topics, alarms, and TTL settings is administration work;
those permissions do not belong to the runtime app merely to send messages.
[SNS security](https://docs.aws.amazon.com/sns/latest/dg/sns-security-best-practices.html),
[encryption permissions](https://docs.aws.amazon.com/sns/latest/dg/sns-key-management.html).

## 4. Enable DynamoDB expiration

1. Open **DynamoDB → Tables → the table in CONTACT_TABLE_NAME**.
2. Open **Additional settings → Time to Live (TTL) → Turn on**.
3. Enter **`expiresAt`**, exactly matching the code, and save.
4. After a legitimate test submission, inspect a new `RATE#...` item. Its `expiresAt`
   attribute must be a **Number containing Unix seconds**.
5. Confirm TTL becomes enabled. Expired items can take a few days to disappear.

Existing items without `expiresAt` will not expire automatically. After a day's
window has closed, review only old `RATE#` records and backfill expiration or
remove those records manually. Do not delete current-day counters or other data.
The application enforces windows using keys, so delayed TTL deletion cannot
extend or reset a limit. No `DeleteItem` or TTL-management permission is needed
by the application.
[AWS TTL setup](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/time-to-live-ttl-how-to.html).

## 5. Add a Vercel firewall rate-limit rule

1. Open **Vercel → your project → Firewall → Rules / Configure → Add rule**.
2. Match **Request Path equals `/api/contact` AND Request Method equals `POST`**.
3. Choose a **Rate Limit** action, grouped by the client IP. Start with **10 requests
   per 60 seconds**, with a **429** response when exceeded. Use the closest supported
   settings if your plan exposes different intervals.
4. Save and enable the rule. Review firewall events and tune it if legitimate
   shared networks are blocked. Leave platform DDoS protection enabled.
5. Add an emergency **Deny** rule for the same path and method if active abuse needs
   an immediate stop. Disable that emergency rule after resolving the incident.

The rule is deliberately looser than the app's three-per-minute quota. It catches
repeated malformed requests and rejects traffic before application/database work.
Prefer a 429 response over a browser challenge on this JSON POST endpoint; the
form already handles interactive verification. Feature availability depends on
the current Vercel plan. If rate limiting is unavailable, select a hosting/CDN
plan that supports an equivalent edge rule before relying on this protection.
[Vercel rules](https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules).

## 6. Set up operational and spending alerts

### Submission logs

1. Open your project's Vercel runtime logs and filter to `/api/contact` or
   `contact_submission`.
2. Check outcomes: `published`, `rate_limited`, `global_limit`, `verification_failed`,
   `turnstile_unavailable`, `rate_limit_failure`, `publish_failure`, or configuration errors.
3. If your Vercel plan supports alerts or log drains, connect your chosen monitoring
   destination. Add alerts for repeated 5xx responses, any `global_limit`, and an
   unusual surge in 429/403 responses. A reasonable starting 5xx rule is five errors
   in five minutes, then adjust to real traffic. Configure these in your provider;
   the repository does not provision an alert service.
4. Use `requestId` to correlate a browser response with a log event. Avoid adding
   complete request bodies, AWS errors with account details, or credentials to logs.

### AWS spending

1. Open **AWS Billing and Cost Management → Budgets → Create budget**.
2. Choose a monthly cost budget covering the relevant AWS usage. Pick an amount
   you are comfortable spending; include DynamoDB and SNS.
3. Add email alerts at, for example, 50%, 80%, and 100% of that amount. Confirm the
   recipient and notifications. Use your operational inbox, independently of the
   contact form topic.
4. Review Vercel usage/spend management and enable available spending notifications
   or limits there too.

AWS budget notifications are delayed and do not enforce a hard cap. For immediate
containment, use the firewall Deny rule. The app shutoff is
`CONTACT_FORM_ENABLED=false` followed by redeployment; local changes require a
restart. The global cap is an additional notification limit, not a cost ceiling.
[AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html).

## 7. Verify the release

1. Run `npm run test:contact`, `npm run verify`, `npm run build`, and
   `npm audit --omit=dev`.
2. Check that your production domain loads over HTTPS and HTTP redirects to HTTPS.
3. In the production browser, complete a real challenge and send **one** intended
   test message. Confirm the inbox receipt and a `published` log event. An SNS
   acceptance response alone does not prove delivery.
4. Confirm a request missing Origin returns 403; text/plain returns 415 with an
   otherwise allowed origin; an oversized body returns 413; and a missing token
   returns 403. These should not send a notification.
5. Check that the form preserves entered text on a failed verification or 429.
6. Verify the counter TTL attribute and the enabled firewall rule.
7. Test the shutoff in Preview: set `CONTACT_FORM_ENABLED=false`, redeploy, and
   confirm submissions return 503 without counter or SNS work. Restore it when done.

Automated tests mock AWS and Siteverify. They do not verify live IAM, actual
DynamoDB concurrency, TTL configuration, real challenge acceptance, firewall rules,
or inbox delivery. Those checks require the configured external services.

### Dependency maintenance

Next.js and its lint configuration have been updated to 15.5.27. The scoped
`next → postcss` override pins 8.5.28 because Next 15 still declares an older
PostCSS release. Recheck the override when upgrading Next and remove it once
the upstream dependency is patched. Run the full `npm audit` as well when
maintaining development tools; `--omit=dev` only assesses production dependencies.

As checked on October 3, 2026, the production audit reports zero vulnerabilities.
After compatible fixes, the full audit still reports nine high-severity entries
in the development-only `braces`/`micromatch`/`fast-glob` dependency chain used by
the lint and shadcn tools. The audit currently marks all `braces` versions as
affected. Its force-fix suggestions downgrade major tool versions; those were not
applied. Recheck upstream updates before running these tools on untrusted patterns.
These remaining entries are not a clean full dependency audit.

### Checks performed for this change

- 36 server/security tests passed, with AWS and Siteverify mocked.
- Browser checks passed at 320, 768, and 1,440 pixels in light and dark themes,
  with a simulated widget and intercepted submissions. Screenshots were inspected.
- The built API returned the expected 403, 415, 400, and 413 responses for rejected
  requests and discarded a honeypot request without publishing.
- Production build, type checking, lint, and the existing token-contrast check passed.
- The full `npm run verify` command stops at six pre-existing content-audit failures:
  `AWS CDK` is not found in the resume source, and removal checks match historical
  references in the existing design/audit documents. Those content files were not
  changed for this security work.
- Live widget acceptance, AWS IAM, TTL activation, edge rules, and inbox delivery
  still need the manual release checks above.

### Repeating browser checks locally

The browser test uses a simulated widget and intercepts every submission; it sends
no notifications. To repeat it in PowerShell, start an isolated preview:

```powershell
$env:NEXT_DIST_DIR = '.next-security'
$env:NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'contact-ui-test-key'
$env:TURNSTILE_SECRET_KEY = 'contact-ui-test-secret'
$env:CONTACT_ALLOWED_ORIGINS = 'http://127.0.0.1:3100'
node ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100
```

This invokes Next.js directly so npm/PowerShell argument forwarding cannot consume
the hostname and port flags.

In another terminal, run `npm run test:contact:ui`. It checks validation, challenge
requirements, retries, preserved inputs, success, and mobile/tablet/desktop layouts
in both themes. Screenshots are saved under the ignored `screenshots/contact-security`
directory. Stop the preview when finished. These fake keys are only for this mocked
test and must never be configured on a public deployment.
