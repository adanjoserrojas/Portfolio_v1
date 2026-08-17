import type { Metadata } from "next";
{/* import Link from "next/link"; Add Tags in import below too*/} 
import { Page, PageTitle } from "@/components/site/Prose";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "RIND",
  description:
    "A coding agent harness design for heavy tool-invocation workflows to save $$$ through ML. Still in development!",
  alternates: { canonical: "/RIND" },
};

export default function ProjectsIndex() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="RIND"
        lede={<>
        This is RIND, try out my Pre-Alpha build! <br/>
        To anyone using this thing, you have 3 bucks... Gotta share with everyone else today lol, enjoy :D
        </>}
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
      {/*
        Full-bleed breakout. <Page> clamps children to max-w-3xl, which left the
        terminal close to square — an odd shape for a widget whose whole job is
        rendering rows of fixed-width characters. Escaping the column gives the
        grid room to be properly rectangular and puts more columns on screen.

        w-[calc(100vw-3rem)] rather than w-screen because 100vw *includes* the
        scrollbar: w-screen overflows by the scrollbar's width and adds a
        horizontal scrollbar to the whole page. Subtracting 3rem clears it and
        leaves the gap from the right margin.

        Square corners throughout — no rounded-lg on the wrapper — to match the
        Plain border the TUI draws inside.
      */}
      <div className="enter relative left-1/2 w-[calc(100vw-3rem)] max-w-400 -translate-x-1/2">
        <div className="overflow-hidden border border-black/10 dark:border-white/10">
          <iframe
            src="/tui/index.html"
            title="RIND — an interactive Rust TUI running in WebAssembly"
            className="block h-[clamp(360px,52vh,620px)] w-full border-0 bg-black"
            // Same-origin so the frame can fetch its own wasm; scripts are the
            // whole point. No allow-top-navigation, so it cannot move the page.
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      <p className="mt-4 font-mono text-xs text-muted">
        Keyboard only — click the frame to focus it, then type{" "}
        <code>help</code>.
      </p>
    </Page>
  );
}
