import type { Metadata } from "next";
{/* import Link from "next/link"; Add Tags in import below too*/} 
import { Page, PageTitle } from "@/components/site/Prose";
import CalendarPanel from "@/components/site/calendar/CalendarPanel";
import RecordsTable from "@/components/site/calendar/DataTable";

export const revalidate = 86400;

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
        lede="This is Assistant, my personal time management bot. I am adding more features periodically so he becomes a 10x Assistant!"
      />

      {/* The only client component on the page; it fetches its own data. */}
      <CalendarPanel />
      <RecordsTable/>
    </Page>
  );
}
