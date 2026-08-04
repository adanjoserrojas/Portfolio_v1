import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";
import { Page, PageTitle, Tags } from "@/components/site/Prose";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Four projects by Adan Rojas: ReCueCareer, iPalo, Face2Learn, and Knight Finder — with the technologies and results behind each.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsIndex() {
  return (
    <Page>
      <PageTitle
        eyebrow="Index"
        title="Projects"
        lede={`${projects.length} projects, in the order they appear on the site.`}
      />

      <ul className="m-0 list-none p-0">
        {projects.map((p) => (
          <li key={p.slug} className="border-b border-line py-6">
            <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-lg font-semibold">
                <Link href={`/projects/${p.slug}`} className="text-ink no-underline hover:underline">
                  {p.name}
                </Link>
              </h2>
              <span className="tabular font-mono text-xs text-muted">{p.date}</span>
            </div>
            <p className="mb-3 text-muted">{p.summary}</p>
            {p.stack && <Tags items={p.stack} />}
          </li>
        ))}
      </ul>
    </Page>
  );
}
