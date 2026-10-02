import type { Metadata } from "next";
import { Page, PageTitle, Tags } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Adan Rojas's portfolio handles contact information, messages, site preferences, and notifications.",
  alternates: { canonical: "/privacy" },
};


export default function MCP(){
    return (
        <Page>
            <PageTitle
                eyebrow="Index"
                title="MCP"
                lede={`Instructions on how to use my MCP are down Below, checkout the README.md Sandbox.`}
            />
        </Page>
    );
}