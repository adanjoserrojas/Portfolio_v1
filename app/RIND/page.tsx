import type { Metadata } from "next";
{/* import Link from "next/link"; Add Tags in import below too*/} 
import { Page, PageTitle } from "@/components/site/Prose";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "RIND",
  description:
    "A coding agent harness design for heavy tool-invocation workflows to save $$$ through ML. Still in development!",
  alternates: { canonical: "/assistant" },
};

export default function ProjectsIndex() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="RIND"
        lede="This is RIND, try out my Pre-Alpha build, I can solve LeetCodes!"
      />

      {/*
        The TUI is a separate Rust crate in /tui, compiled to WebAssembly by
        trunk and emitted into /public/tui. See tui/README.md to rebuild.

        Embedded as an iframe rather than mounted into this page directly, on
        purpose: Ratzilla's DOM backend takes over document.body and installs
        global key listeners. Inside a frame that stays scoped, so it cannot
        fight Next.js for the document or swallow the page's own shortcuts —
        and a panic in the WASM takes down the frame, not the route.

        No client JS needed, so this page stays a server component.
      */}
      <div className="enter overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
        <iframe
          src="/tui/index.html"
          title="RIND — an interactive Rust TUI running in WebAssembly"
          className="block h-[70vh] min-h-[420px] w-full border-0 bg-[#0d1117]"
          // Same-origin so the frame can fetch its own wasm; scripts are the
          // whole point. No allow-top-navigation, so it cannot move the page.
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      </div>

      <p className="mt-4 font-mono text-xs text-muted">
        Keyboard only — click the frame to focus it, then type{" "}
        <code>help</code>.
      </p>
    </Page>
  );
}
