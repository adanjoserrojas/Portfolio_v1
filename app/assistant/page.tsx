import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageTitle, Tags } from "@/components/site/Prose";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Assistant",
  description:
    "A DeepSeek V3.2/LR (Logistics Regression) powered and AWS deployed assistant for my daily task.",
  alternates: { canonical: "/assistant" },
};

export default function ProjectsIndex() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="Assistant"
        lede="A personal project that actually speaks about me!"
      />
    </Page>
  );
}
