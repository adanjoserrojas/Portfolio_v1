import Link from "next/link";
import { Page, PageTitle } from "./Prose";

export default function PolicyPage({
  title,
  description,
  relatedHref,
  relatedLabel,
  children,
  updatedDate = "2026-10-02",
  updatedLabel = "October 2, 2026",
}: {
  title: string;
  description: string;
  relatedHref: string;
  relatedLabel: string;
  children: React.ReactNode;
  updatedDate?: string;
  updatedLabel?: string;
}) {
  return (
    <Page>
      <PageTitle eyebrow="Site information" title={title} lede={description} />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3 font-mono text-xs text-muted">
        <p>
          Last updated <time dateTime={updatedDate}>{updatedLabel}</time>
        </p>
        <Link
          href={relatedHref}
          className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-ink"
        >
          {relatedLabel}
        </Link>
      </div>
      <div className="max-w-(--measure) space-y-8 text-muted [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-ink [&_p]:leading-relaxed [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </Page>
  );
}
