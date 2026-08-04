import type { Metadata } from "next";
import Link from "next/link";
import "./lab.css";

/**
 * Phase 2 design lab (§3.2).
 *
 * These routes are throwaway: excluded from the sitemap, noindex, and DELETED
 * BEFORE SHIP (§9.1 crawlability, §10 cleanup gate). They exist only to be
 * screenshotted and Lighthoused against the real content layer.
 */
export const metadata: Metadata = {
  title: "Design lab — not for publication",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-static";

const DIRECTIONS = [
  { slug: "v1", name: "~/adan", note: "filesystem" },
  { slug: "v2", name: "Run trace", note: "agent execution" },
  { slug: "v3", name: "Latent atlas", note: "2D map" },
  { slug: "v4", name: "Reading room", note: "typographic" },
  { slug: "v5", name: "Inspector", note: "split-pane" },
  { slug: "v6", name: "Retrieval", note: "wildcard — RAG" },
];

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-root">
      <nav className="lab-bar" aria-label="Design lab directions">
        <span className="lab-bar__tag">design lab · noindex · deleted before ship</span>
        <ul className="lab-bar__list">
          {DIRECTIONS.map((d) => (
            <li key={d.slug}>
              <Link href={`/lab/${d.slug}`}>
                <b>{d.slug}</b> {d.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {children}
    </div>
  );
}
