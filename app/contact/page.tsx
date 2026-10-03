import type { Metadata } from "next";
import { Page, PageTitle } from "@/components/site/Prose";
import Form from "@/components/site/form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send a message directly to my inbox about a project or professional opportunity.",
  alternates: { canonical: "/contact" },
};

export default function ProjectsIndex() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="Contact"
        lede="Send a message to my inbox. Leave your email address so I can reply."
      />
      <Form/>
    </Page>
  );
}
