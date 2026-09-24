import type { Metadata } from "next";
import { Page, PageTitle } from "@/components/site/Prose";
import Form from "@/components/site/form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "This is a form submission to contact me directly to my phone.",
  alternates: { canonical: "/contact" },
};

export default function ProjectsIndex() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="Contact"
        lede={`Type your name and message. This will go directly to my phone!`}
      />
      <Form/>
    </Page>
  );
}