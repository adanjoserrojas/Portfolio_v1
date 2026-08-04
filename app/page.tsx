import type { Metadata } from "next";
import { profile } from "@/content/profile";
import Retrieval from "@/components/site/Retrieval";
import { corpus } from "@/lib/retrieval";

export const dynamic = "force-static";

export const metadata: Metadata = {
  // Homepage title leads with the name (§9.1), so it overrides the template.
  title: { absolute: "Adan Rojas — Software Engineer | 4dan.dev" },
  description:
    "Aspiring Software engineer working on agentic AI, MCP tooling, and full-stack development. UCF Information Technology, Fall 2027. Search every project, role, and skill.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <header className="enter mb-2">
        <h1 className="text-2xl font-semibold">{profile.name}</h1>
        <p className="mt-2 max-w-[46ch] text-muted">{profile.roleLine}</p>
      </header>

      {/* The full corpus is server-rendered inside <Retrieval> on first paint,
          so crawlers and no-JS readers get every word without querying. */}
      <Retrieval docs={corpus} />

      <noscript>
        <p className="mt-8 font-mono text-xs text-muted">
          Search needs JavaScript. Every one of the {corpus.length} documents below is
          also reachable from the navigation above.
        </p>
      </noscript>
    </div>
  );
}
