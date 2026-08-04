import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, projectBySlug } from "@/content/projects";
import { Page, Breadcrumbs, Fields, Field, Bullets, Tags } from "@/components/site/Prose";

export const dynamic = "force-static";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    // Drawn from existing copy — no new marketing claims (§9.1).
    description: p.stack ? `${p.summary} Built with ${p.stack.join(", ")}.` : p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: {
      title: `Adan Rojas — ${p.name}`,
      description: p.summary,
      url: `/projects/${p.slug}`,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();

  /**
   * §9.1 — the iPalo hackathon win is a real, verifiable award attached to the
   * right entity, so it is expressed as `award` on this project's CreativeWork
   * node. No other project claims one, because no other project won one.
   */
  const award =
    p.slug === "ipalo"
      ? "1st place of 22 teams, Best Use of ElevenLabs, Knight Hacks VIII"
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    description: p.summary,
    applicationCategory: "DeveloperApplication",
    author: { "@type": "Person", name: "Adan Rojas", url: "https://www.4dan.dev" },
    url: `https://www.4dan.dev/projects/${p.slug}`,
    ...(p.stack ? { keywords: p.stack.join(", ") } : {}),
    ...(p.href ? { codeRepository: p.href } : {}),
    ...(award ? { award } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.4dan.dev" },
      { "@type": "ListItem", position: 2, name: "Projects", item: "https://www.4dan.dev/projects" },
      {
        "@type": "ListItem",
        position: 3,
        name: p.name,
        item: `https://www.4dan.dev/projects/${p.slug}`,
      },
    ],
  };

  const bullets = p.bullets?.filter((b) => b.disclosure === "cleared").map((b) => b.text) ?? [];

  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Breadcrumbs
        trail={[
          { href: "/", label: "4dan.dev" },
          { href: "/projects", label: "projects" },
          { href: `/projects/${p.slug}`, label: p.slug },
        ]}
      />

      <header className="enter mb-8">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <p className="mt-2 max-w-[52ch] text-muted">{p.summary}</p>
      </header>

      <Fields>
        <Field label="date">
          <span className="tabular">{p.date}</span>
        </Field>
        {p.stack && (
          <Field label="stack">
            <Tags items={p.stack} />
          </Field>
        )}
        {p.href && (
          <Field label="repo">
            <a
              href={p.href}
              className="text-accent underline underline-offset-2"
              rel="noopener"
            >
              {p.href.replace("https://", "")}
            </a>
          </Field>
        )}
      </Fields>

      {bullets.length > 0 ? (
        <Bullets items={bullets} />
      ) : (
        /**
         * §5.1 — "Knight Finder stays thin because that's all the truth there
         * is; do not pad it to match the others. A short honest page outranks
         * a padded one."
         */
        <p className="font-mono text-xs leading-relaxed text-muted">
          This project predates the material on record, so there is no detail
          beyond the above. It is listed because it was built, not padded to
          match the others.
        </p>
      )}
    </Page>
  );
}
