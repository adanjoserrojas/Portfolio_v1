# RIND agent workspace

The `/RIND` route now renders a React workspace. It does not load the Ratatui iframe, JavaScript, or WebAssembly. The old `tui/` source and `public/tui/` artifacts are retained as inactive legacy assets; changes to this workspace do not require a Rust build.

## Preview behavior

- Sessions, titles, messages, and drafts exist only in memory for the current page visit.
- Example cards exercise completion, a scope decision, and failure/retry.
- Custom prompts run the navigation sample; they are not sent to a model.
- Stop cancels subsequent simulated activity for that session. Other sessions can continue running.
- Follow-up requests retain earlier messages and tool activity.
- The inspector shows fixture inputs/outputs, an illustrative diff, and unavailable usage metrics. No tools run and no costs are incurred.
- The responsive workspace supports collapsible sessions/inspection, light/dark themes, reduced motion, and an expanded view. Escape closes panels and exits expanded view.

## Structure

- `app/RIND/page.tsx`: server route and metadata.
- `components/rind/Workspace.tsx`: interactive UI and deterministic preview runner.
- `components/rind/model.ts`: typed session/event contract and sample data.
- `components/rind/Workspace.module.css`: scoped styles using portfolio theme tokens.

A future service integration should replace the preview runner with real run events and authoritative usage values. Credentials and tool execution belong on the server. Persistence and repository access are deliberately absent from this UI preview.

## Checks

Run the app on port 3200, then `node scripts/smoke-rind.mjs`. Screenshots go to `screenshots/rind/` (override with `RIND_SCREENSHOTS`). The check covers the main sample flows, stopping, expansion, removal of the iframe, runtime errors, and mobile overflow.

Also run the repository typecheck, lint, content, contrast, and production build checks.

## Validation for redesign/v3

- TypeScript and repository ESLint: passed.
- Browser regression check: passed; desktop/mobile and dark-theme screenshots inspected.
- Theme contrast verification: passed.
- Production build: compiled and passed type/lint validation, then failed prerendering the unchanged `/assistant` route because the configured AWS session has expired.
- Content verification: 253 checks passed, 6 failed in unchanged content/documentation (AWS CDK résumé backing and historical removal-token checks).
