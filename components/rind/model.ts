/** UI-only fixtures. No tools execute and no usage is incurred. */
export type Status = "ready" | "running" | "needs-input" | "completed" | "failed" | "stopped";
export type Scenario = "navigation" | "review" | "research";
export type ToolEvent = { id: string; name: string; description: string; input: string; output: string; duration: string };
export type Message = { id: string; role: "user" | "agent"; text: string; events?: ToolEvent[] };
export type Session = {
  id: string; title: string; status: Status; scenario: Scenario;
  messages: Message[]; events: ToolEvent[]; step: number; elapsed: number;
};

export const statusLabels: Record<Status, string> = {
  ready: "Ready", running: "Running", "needs-input": "Needs input", completed: "Completed", failed: "Failed", stopped: "Stopped",
};

export const examples: { scenario: Scenario; title: string; description: string; prompt: string; number: string }[] = [
  { scenario: "navigation", title: "Build something", description: "Follow a change from task to diff.", prompt: "Add an active state to the portfolio navigation.", number: "01" },
  { scenario: "review", title: "Review a change", description: "Explore a run that asks for your input.", prompt: "Review the navigation for accessibility.", number: "02" },
  { scenario: "research", title: "Investigate an issue", description: "See how a blocked tool call is handled.", prompt: "Investigate a slow page load.", number: "03" },
];

export const fixtures: Record<Scenario, ToolEvent[]> = {
  navigation: [
    { id: "read", name: "Read project context", description: "Inspect the navigation component", input: 'read_file("components/site/Header.tsx")', output: "Sample output: navigation uses Next.js links. No active-page indicator is present.", duration: "0.4s" },
    { id: "edit", name: "Prepare navigation update", description: "Add an accessible active-page indicator", input: 'propose_change("components/site/Header.tsx")', output: "Sample proposal: add aria-current to the matching link and emphasize its label. No files have been changed.", duration: "1.2s" },
    { id: "check", name: "Check the proposed change", description: "Review keyboard and route behavior", input: 'review_proposal("navigation")', output: "Sample review: active link has a semantic indicator; keyboard focus remains visible. These are fixture results, not executed checks.", duration: "0.8s" },
  ],
  review: [
    { id: "inspect", name: "Inspect navigation semantics", description: "Review links, labels, and focus states", input: 'inspect("navigation")', output: "Sample finding: navigation links have readable labels. A scope decision is needed before continuing.", duration: "0.6s" },
    { id: "review", name: "Review keyboard navigation", description: "Inspect focus order and active-page semantics", input: 'review("keyboard-navigation")', output: "Sample recommendation: preserve document order and add aria-current to the active link.", duration: "0.9s" },
    { id: "summary", name: "Prepare review notes", description: "Summarize the proposed improvements", input: 'summarize("accessibility-review")', output: "Sample review complete. No real accessibility audit has been performed.", duration: "0.3s" },
  ],
  research: [
    { id: "context", name: "Read performance context", description: "Identify the page and measurement source", input: 'read_context("page-performance")', output: "Sample context loaded. Next step requires a performance service.", duration: "0.4s" },
    { id: "request", name: "Request performance trace", description: "Connect to the measurement service", input: 'fetch_trace("sample-page")', output: "Simulated error: the measurement service is unavailable. Retry the sample to explore recovery.", duration: "1.0s" },
    { id: "report", name: "Summarize performance findings", description: "Prepare a short investigation report", input: 'summarize("sample-trace")', output: "Sample recovery succeeded. Inspect font loading, image sizing, and client-side JavaScript in a real investigation.", duration: "0.5s" },
  ],
};

export function createSession(id: string): Session {
  return { id, title: "New session", status: "ready", scenario: "navigation", messages: [], events: [], step: 0, elapsed: 0 };
}

export const sampleDiff = `--- a/components/site/Header.tsx
+++ b/components/site/Header.tsx
@@ Illustrative proposal only
- <Link href={link.href}>
+ <Link
+   href={link.href}
+   aria-current={pathname === link.href ? "page" : undefined}
+ >
    {link.label}
  </Link>`;
