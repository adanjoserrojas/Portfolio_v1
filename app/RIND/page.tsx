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

      {/* The only client component on the page; it fetches its own data. */}
    </Page>
  );
}
