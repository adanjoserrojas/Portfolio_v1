import type { Metadata } from "next";
import { profile } from "@/content/profile";
import { education } from "@/content/education";
import { Page, PageTitle, Fields, Field } from "@/components/site/Prose";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description:
    "Adan Rojas — software engineer, University of Central Florida, Bachelor of Science in Information Technology with a minor in Computer Engineering, Fall 2027.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Page>
      <PageTitle eyebrow="Profile" title={profile.name} lede={profile.roleLine} />

      <div className="mb-10">
        {/**
         * The only image on the site.
         *
         * Deliberately a plain <picture>, not next/image. The source was
         * DSC_0037.png — 6000×4000, 36.5 MB, rendered through a raw
         * <motion.img> so it shipped unoptimised and made up 97.5% of the
         * page (RESULTS.md §3). It is now pre-resized to 640×640, twice the
         * largest render, and encoded once at build time.
         *
         * Since the file never needs runtime resizing, next/image would add
         * ~5 kB of client JS and an optimizer round-trip to negotiate formats
         * the browser can negotiate itself. Explicit width/height reserve the
         * box, so there is no layout shift either way.
         */}
        <picture>
          <source srcSet="/img/portrait.avif" type="image/avif" />
          <source srcSet="/img/portrait.webp" type="image/webp" />
          <img
            src="/img/portrait.jpg"
            alt="Adan Rojas"
            width={640}
            height={640}
            fetchPriority="high"
            decoding="async"
            className="h-[200px] w-[200px] rounded-full border border-line object-cover sm:h-[280px] sm:w-[280px]"
          />
        </picture>
      </div>

      <div className="mb-10 max-w-(--measure)">
        {profile.bio.map((p) => (
          <p key={p.slice(0, 24)} className="mb-4 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        Education
      </h2>
      <Fields>
        <Field label="school">{education.institution}</Field>
        <Field label="degree">{education.degree}</Field>
        {education.minor && <Field label="minor">{education.minor}</Field>}
        <Field label="location">{education.location}</Field>
        {education.expectedGraduation && (
          <Field label="expected">
            <span className="tabular">{education.expectedGraduation}</span>
          </Field>
        )}
      </Fields>

      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        Elsewhere
      </h2>
      <ul className="m-0 list-none p-0">
        {profile.links.map((l) => (
          <li key={l.href} className="border-b border-line py-2">
            {/* Underlined by default, not on hover: these sit beside muted
                text, so colour alone would be the only distinguishing cue —
                the WCAG 1.4.1 failure axe reports as link-in-text-block. */}
            <a
              href={l.href}
              rel="me noopener"
              className="text-accent underline underline-offset-2"
            >
              {l.label}
            </a>
            <span className="ml-3 font-mono text-xs text-muted">
              {l.href.replace("https://", "")}
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
