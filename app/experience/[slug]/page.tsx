import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { experience, roleBySlug } from "@/content/experience";
import {
  Page,
  Breadcrumbs,
  Fields,
  Field,
  Bullets,
  Withheld,
} from "@/components/site/Prose";

export const dynamic = "force-static";

export function generateStaticParams() {
  return experience.map((r) => ({ slug: r.slug }));
}

/**
 * §5.1 — "Giving each role its own route is a real SEO gain:
 * 4dan.dev/experience/publix and /experience/aws are pages that can rank for
 * 'Adan Rojas Publix' and 'Adan Rojas AWS' — queries where LinkedIn currently
 * has no competition."
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = roleBySlug(slug);
  if (!r) return {};
  const dates = r.ongoing ? `${r.start} – Present` : r.end ? `${r.start} – ${r.end}` : r.start;
  return {
    title: `${r.role} at ${r.org}`,
    description: `Adan Rojas — ${r.role} at ${r.org}, ${r.location}, ${dates}.`,
    alternates: { canonical: `/experience/${r.slug}` },
    openGraph: {
      title: `Adan Rojas — ${r.role} at ${r.org}`,
      description: `${r.location} · ${dates}`,
      url: `/experience/${r.slug}`,
      type: "profile",
    },
  };
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = roleBySlug(slug);
  if (!r) notFound();

  const dates = r.ongoing ? `${r.start} – Present` : r.end ? `${r.start} – ${r.end}` : r.start;
  const cleared = r.bullets.filter((b) => b.disclosure === "cleared").map((b) => b.text);
  const held = r.bullets.filter((b) => b.disclosure === "hold").length;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.4dan.dev" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Experience",
        item: "https://www.4dan.dev/experience",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: r.role,
        item: `https://www.4dan.dev/experience/${r.slug}`,
      },
    ],
  };

  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Breadcrumbs
        trail={[
          { href: "/", label: "4dan.dev" },
          { href: "/experience", label: "experience" },
          { href: `/experience/${r.slug}`, label: r.slug },
        ]}
      />

      <header className="enter mb-8">
        <h1 className="text-2xl font-semibold">{r.role}</h1>
        <p className="mt-2 text-muted">{r.org}</p>
      </header>

      <Fields>
        <Field label="dates">
          <span className="tabular">{dates}</span>
        </Field>
        <Field label="location">{r.location}</Field>
      </Fields>

      <Bullets items={cleared} />

      {r.siteProse && (
        <p className="mt-6 max-w-(--measure) leading-relaxed">{r.siteProse}</p>
      )}

      <Withheld count={held} />
    </Page>
  );
}
