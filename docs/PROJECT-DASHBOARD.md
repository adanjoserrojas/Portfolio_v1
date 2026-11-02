# Buildlog prototype

The prototype adds `/board`, `/admin`, and `/login` to the Next.js portfolio. The live local preview is http://localhost:3100/board. It uses isolated AWS resources in us-east-1; the existing portfolio has not been deployed or pushed.

## Design and behavior

DM Sans and DM Mono, warm amber accents, a four-column board, search, status filters, list view, light/dark themes and a responsive private workspace. Admins can create, edit, publish/unpublish, archive, move and delete projects. Deletion requires a confirmation and a current version. Public cards expose only approved public fields; private notes and unpublished projects never enter the public cache.

[Editable Figma screens](https://www.figma.com/design/HFoJkjR9k2SbgdtoOW1a78) were created using the Figma MCP, informed by a 21st.dev Kanban reference. These are editable layout frames, not a published component library.

## Runtime architecture

Public request → Next.js cache → DynamoDB PUBLIC record on a cache miss. Public reads never call Lambda. The parser in the Next.js server validates the public record and removes unknown fields. No S3 publisher is involved.

Admin request → Next.js server session → API Gateway JWT authorizer → Rails Lambda → DynamoDB transaction. Each mutation atomically updates PRIVATE and PUBLIC records plus a 24-hour idempotency record. Next.js then invalidates the board cache. API Gateway and Rails both check the token; Rails also requires the admin group and the appropriate scope.

`unstable_cache` stores the public record with the `buildlog-board` tag and a 300-second revalidation interval. `/board` uses ISR. Public JSON reads share the same data cache. `revalidateTag` and `revalidatePath` run after successful create, edit or deletion. Existing open browser tabs update when revisited/refreshed; there is no real-time subscription. Direct AWS API writes refresh on the cache's next scheduled revalidation.

These cache mechanisms are implemented and tested locally. **Production configuration is saved, but Vercel-hosted caching is not deployed or verified yet.** The production environment variables, restricted OIDC role and hosted Cognito callback are configured. They take effect on the next production deployment. See [Next.js 15 caching](https://nextjs.org/docs/15/app/guides/caching) and [Vercel AWS OIDC](https://vercel.com/docs/oidc/aws).

## Endpoints

| Client endpoint | Purpose | Protection |
| --- | --- | --- |
| GET `/api/board` | Cached public projection | Public, sanitized |
| GET `/api/admin/projects` | Full private board | Server session |
| POST `/api/admin/projects` | Create project | Session, origin check, validation, idempotency key |
| PATCH `/api/admin/projects` | Edit project; body includes id/version | Same protection plus version check |
| DELETE `/api/admin/projects/:id` | Delete project; body includes version/idempotencyKey | Same protection plus version check |
| GET `/auth/login` | Start Cognito login | PKCE, state and nonce |
| GET `/auth/callback` | Complete login | Verified state, ID token and admin group |
| POST `/auth/logout` | End session | Origin check, token revocation |

AWS exposes the corresponding GET/POST `/v1/admin/projects` and PATCH/DELETE `/v1/admin/projects/:id`. These addresses are internet reachable but require authorization. Hiding an endpoint's address is not an access control. Tokens remain on the server; browsers receive an opaque HttpOnly session cookie.

## Requirements and acceptance tests

| Requirement | Acceptance test |
| --- | --- |
| Four stages | Cards display Not Started, In Progress, In Review and Finished; changing status moves a card |
| Private dashboard | Signed-out `/admin` redirects to login; unauthenticated APIs reject access |
| Owner authorization | Wrong client, expired token, missing scope, ID token and non-admin group are rejected |
| Cognito login | Owner completes password change and authenticator setup; login returns to `/admin` |
| Publish boundary | Drafts, archives and private notes do not appear in public HTML or JSON |
| Create/edit/delete | Create a disposable test project, edit after reload, cancel deletion, then confirm deletion |
| Concurrency | Stale versions return 409 without changing stored data |
| Safe retries | Repeating a successful request key does not create duplicates or apply deletion twice |
| Input validation | Invalid stages, unsafe URLs, blank titles and oversized fields are rejected |
| Cache | Warm public reads use cache; successful mutations invalidate; misses read DynamoDB without Lambda |
| Responsive UI | Search, list, details and editor work on desktop and phone without horizontal overflow |
| Keyboard access | Visible focus, modal focus containment, Escape dismissal and usable native form controls |
| Existing portfolio | Run `npm run verify`, dashboard tests and a production build |

## AWS resources and limits

Stacks: `BuildlogPrototype` and `BuildlogPackaging`. Runtime resources: one Ruby Lambda, HTTP API Gateway, Cognito pool, two on-demand DynamoDB tables, scoped IAM roles, retained board data and short-retention logs. The local dashboard client assumes an eight-hour role using the existing development profile; it does not use root credentials. Existing portfolio AWS integrations keep their own credential configuration.

The packaging stack contains a private S3 bucket and CodeBuild project used only to build/store the Lambda ZIP. **S3 is not part of board reads, publication or caching.** Lambda execution uses its own copy of the uploaded code. Packaging objects expire after 30 days, so rebuild before deploying an expired artifact.

The board is deliberately small: each aggregate record is limited to 256 KB. Conflicting admin changes return a retry message. DynamoDB point-in-time recovery is enabled for the board. Delete removes the project from current board records; older backups and successful request results can retain it until their retention periods expire. The UI has no undo operation.

AWS resources are deployed and can incur usage/storage charges. No claim of guaranteed zero cost is made. An error alarm exists without a notification destination; budget notifications and production Vercel checks remain deployment work. Sample cards are labelled as prototype content and are not portfolio claims.

## Test and run commands

From the portfolio, using PowerShell 7:

```powershell
npm ci
npm run verify
npm run test:dashboard
pwsh -File scripts/project-dashboard/start-prototype.ps1 -Build
```

The start script assumes `calendar-agent-dev` can assume the scoped prototype web role. It generates the OAuth flow encryption secret in memory and binds the preview to localhost:3100. Restart when its eight-hour AWS session expires. Existing login sessions are stored server-side and expire after eight hours.

Rails tests use the official Ruby 3.3 SAM image:

```powershell
docker run --rm --entrypoint bash -v "${PWD}/services/project-dashboard:/var/task" public.ecr.aws/sam/build-ruby3.3:latest -lc 'cd /var/task && bundle config set --local path vendor/bundle && bundle install --jobs 4 && bundle exec ruby test_app.rb && bundle exec ruby test_auth.rb'
```

Vercel Production now has a stable, randomly generated SESSION_SECRET stored as a Secret variable, plus the nine connection variables listed below. The values in `scripts/project-dashboard/prototype-config.json` and `infra/project-dashboard/deployment-config.json` are nonsecret resource/configuration identifiers. CDK defaults to the committed production origin and Vercel team/project, so future infrastructure updates preserve the production role and callbacks. Optional VERCEL_TEAM_SLUG and VERCEL_PROJECT_NAME overrides must be supplied together; BUILDLOG_WEB_ORIGIN overrides the hosted HTTPS origin. Do not use the local profile or root keys in Vercel.

The owner controls the password after the first-login reset. Subsequent password resets use Cognito's recovery flow. Passwords and AWS credentials are not committed.

## Verified results (2026-11-02)

- Rails: 8 tests, 39 assertions pass, including create/update/delete, conflicts, retries, public projection, DynamoDB numeric conversion and JWT authorization.
- TypeScript model: 3 tests pass. Type checking, ESLint and both-theme contrast checks pass.
- Production build: passes on Next.js 15.5.28, including the existing assistant page and the five-minute board route.
- Live admin: a seeded sample card was changed and restored through the authenticated UI. The public API reflected the change; board responses changed from MISS to HIT. Public JSON contained no private notes.
- Deletion: confirmation and cancellation verified in the browser, transactional deletion/retries tested in Rails, and the deployed AWS DELETE route rejects anonymous calls with 401. The final authenticated cloud deletion remains available for the owner's manual acceptance test.
- Public UI: search, list, details, keyboard dismissal and phone overflow checks passed in the initial prototype. The integrated tablet preview and deletion dialog were visually reviewed.
- Existing repository issue: the content check reports one failure because `AWS CDK` is marked as résumé-backed but does not occur in the résumé source. Content files were unchanged. This prevents claiming that the entire `npm run verify` command passes.
- Next.js and Zod security patches were applied. Other dependency advisories remain outside this feature's scope and should be reviewed before production.
- Vercel Production configuration and AWS trust/callback setup are complete. Hosted token exchange and cache verification remain pending the first production deployment. No Git push, Vercel deployment or PR was performed.

## Rebuilding the backend

From the repository, run `pwsh -File scripts/project-dashboard/package-backend.ps1 -Profile <deployment-profile>` to rebuild in AWS and synthesize the CDK template. Add `-Deploy` to update the prototype stack. The profile must have deployment permissions; the scoped web role cannot deploy infrastructure. This script uses the private artifact bucket only for code packaging and executes both Rails test files before producing the ZIP.

## Normal development server

`npm run dev` now obtains the scoped dashboard session automatically and serves the portfolio and Buildlog at http://localhost:3000. `npm run dev:turbo` uses the same setup. Credentials stay in the child process environment and do not overwrite existing portfolio AWS credentials or environment files. AWS CLI and the existing `calendar-agent-dev` profile are required; `BOARD_AWS_PROFILE` selects another authorized profile. Restart after eight hours to renew the session.

Cognito accepts localhost ports 3000 and 3100 alongside the explicitly configured hosted origin, https://www.4dan.dev. Arbitrary preview URLs are not allowed. Next.js development output uses `.next-dev`, while the production preview uses `.next`, so both servers can run without overwriting each other. Run `npm run smoke:dashboard` against port 3000 to verify the public board, private route protection, and Cognito callback.

## Production configuration (2026-11-02)

Project: [portfolio_v1](https://vercel.com/adanjoserrojas-projects/portfolio_v1). Canonical origin: https://www.4dan.dev (the apex domain redirects to www). All ten variables below were saved for **Production only**; existing portfolio variables were left unchanged. No additional cache service or cache toggle is required: the deployed Next.js code supplies the Data Cache and ISR behavior.

| Variable | Configured value |
| --- | --- |
| BOARD_AWS_REGION | us-east-1 |
| BOARD_TABLE | buildlog-prototype-board |
| SESSION_TABLE | buildlog-prototype-sessions |
| APP_ORIGIN | https://www.4dan.dev |
| COGNITO_POOL_ID | us-east-1_iELrcw2vs |
| COGNITO_CLIENT_ID | 71ad6pdrt9uecc17it1aej8jjg |
| COGNITO_DOMAIN | https://buildlog-004575106238-prototype.auth.us-east-1.amazoncognito.com |
| BOARD_API | https://e70u32bci5.execute-api.us-east-1.amazonaws.com |
| BOARD_AWS_ROLE_ARN | arn:aws:iam::004575106238:role/buildlog-vercel-production |
| SESSION_SECRET | Generated from 48 random bytes; stored only as a Vercel Secret, not recorded here |

The AWS role trusts exactly issuer https://oidc.vercel.com/adanjoserrojas-projects, audience https://vercel.com/adanjoserrojas-projects, and subject owner:adanjoserrojas-projects:project:portfolio_v1:environment:production. It has only GetItem for the board's PUBLIC record and GetItem/PutItem/DeleteItem for the isolated session table. Project mutations still require the Cognito-protected API and Rails Lambda. Preview deployments have neither these variables nor this role's trust.

The CDK template uses the native AWS IAM OIDC resource ([AWS reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-iam-oidcprovider.html)); it does not add a helper Lambda. CloudFormation completed the update. The change added only the identity provider, role and policy, and added https://www.4dan.dev/auth/callback plus https://www.4dan.dev/login to the existing Cognito client. The local callback/logout URLs remain available.

Validation completed:

- Synthesized template assertions: exact production-only trust, public-only board read, session permissions, all three allowed origins, no removed resources and no Rails/API/table changes.
- Deployed role, policies, Cognito URLs and CloudFormation UPDATE_COMPLETE verified.
- AWS permission simulation: PUBLIC GetItem allowed; PRIVATE GetItem and board PutItem/DeleteItem denied; session GetItem/PutItem/DeleteItem allowed.
- Type checking, infrastructure ESLint, three dashboard model tests and local smoke check pass. The existing résumé-content check limitation above still applies.

After the owner merges and deploys the feature, verify:

1. Visit /board and /api/board on www.4dan.dev; both must succeed with sanitized public data. Repeated public reads must not invoke the Rails Lambda. The JSON route uses the Data Cache internally; it does not promise a CDN HIT header on every request.
2. Visit /admin signed out; it must redirect to login. Complete Cognito login and confirm return to the hosted /admin route. This exercises the actual Vercel OIDC exchange and session storage.
3. Create, edit and delete a disposable published project through the hosted admin UI. After each success, revisit /board and /api/board and confirm the new state, without waiting five minutes. Unpublished projects and private notes must stay absent.
4. Check production logs for OIDC/access-denied errors and compare Lambda invocations during a public-only read window. A warm cache reuses data; a cold or revalidated read may access DynamoDB directly but never Lambda. Admin reads intentionally use Lambda.

Local development and the hosted site share the prototype tables. Each environment has its own cache, so a local mutation does not immediately invalidate Vercel's cache; Vercel refreshes on a later read after the five-minute revalidation interval. Use the hosted admin for immediate hosted invalidation. There is no real-time browser push.

## UI edits and development hydration

Development assets must not have a long-lived immutable cache policy. Next.js reuses JavaScript/CSS filenames during development; a custom one-year rule on all /_next/static paths made browsers combine updated server HTML with an older BoardView module. The global override was removed so Next.js sets development and production caching appropriately. This does not disable the board's Data Cache, ISR or production asset caching.

After upgrading from the old configuration, hard-refresh existing localhost tabs once (Ctrl+Shift+R in Chrome) to discard previously cached assets. Normal UI edits then use Fast Refresh. There is no separate server copy of the board layout to maintain: BoardView supplies the server pre-render and browser hydration.

Run `npm run smoke:dev-assets` against `npm run dev` to verify the actual JavaScript/CSS URLs reject stale browser caching. The check fails on the old immutable header and passes with Next.js development defaults. `npm run smoke:dashboard` now checks board structure instead of a particular heading so personalized copy is supported.
