# Buildlog prototype

The prototype adds `/board`, `/admin`, and `/login` to the Next.js portfolio. The live local preview is http://localhost:3100/board. It uses isolated AWS resources in us-east-1; the existing portfolio has not been deployed or pushed.

## Design and behavior

DM Sans and DM Mono, warm amber accents, a four-column board, search, status filters, list view, light/dark themes and a responsive private workspace. Admins can create, edit, publish/unpublish, archive, move and delete projects. Deletion requires a confirmation and a current version. Public cards expose only approved public fields; private notes and unpublished projects never enter the public cache.

[Editable Figma screens](https://www.figma.com/design/HFoJkjR9k2SbgdtoOW1a78) were created using the Figma MCP, informed by a 21st.dev Kanban reference. These are editable layout frames, not a published component library.

## Runtime architecture

Public request → Next.js cache → DynamoDB PUBLIC record on a cache miss. Public reads never call Lambda. The parser in the Next.js server validates the public record and removes unknown fields. No S3 publisher is involved.

Admin request → Next.js server session → API Gateway JWT authorizer → Rails Lambda → DynamoDB transaction. Each mutation atomically updates PRIVATE and PUBLIC records plus a 24-hour idempotency record. Next.js then invalidates the board cache. API Gateway and Rails both check the token; Rails also requires the admin group and the appropriate scope.

`unstable_cache` stores the public record with the `buildlog-board` tag and a 300-second revalidation interval. `/board` uses ISR. Public JSON reads share the same data cache. `revalidateTag` and `revalidatePath` run after successful create, edit or deletion. Existing open browser tabs update when revisited/refreshed; there is no real-time subscription. Direct AWS API writes refresh on the cache's next scheduled revalidation.

These cache mechanisms are implemented and testable locally. **Vercel-hosted caching is not deployed or verified yet.** Production setup still needs the Vercel team/project, environment variables, restricted OIDC trust, and the hosted Cognito callback URL. See [Next.js 15 caching](https://nextjs.org/docs/15/app/guides/caching) and [Vercel AWS OIDC](https://vercel.com/docs/oidc/aws).

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

Before production, set a stable random SESSION_SECRET; the values in `scripts/project-dashboard/prototype-config.json` are resource identifiers, not credentials. Set BOARD_AWS_REGION=us-east-1, BOARD_TABLE, SESSION_TABLE, APP_ORIGIN, COGNITO_POOL_ID, COGNITO_CLIENT_ID, COGNITO_DOMAIN, BOARD_API and BOARD_AWS_ROLE_ARN on Vercel. Use the project's exact OIDC issuer configuration. CDK supports optional VERCEL_TEAM_SLUG and VERCEL_PROJECT_NAME for a production-only role and BUILDLOG_WEB_ORIGIN for callback/logout URLs. Do not use the local profile or root keys in Vercel.

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
- Vercel deployment, hosted OIDC and hosted cache verification remain pending. No Git push or PR was performed.

## Rebuilding the backend

From the repository, run `pwsh -File scripts/project-dashboard/package-backend.ps1 -Profile <deployment-profile>` to rebuild in AWS and synthesize the CDK template. Add `-Deploy` to update the prototype stack. The profile must have deployment permissions; the scoped web role cannot deploy infrastructure. This script uses the private artifact bucket only for code packaging and executes both Rails test files before producing the ZIP.
