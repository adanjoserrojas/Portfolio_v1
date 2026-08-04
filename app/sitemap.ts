import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";

const BASE = "https://www.4dan.dev";

/**
 * §9.1 — every real route, with honest priorities.
 *
 * The previous sitemap emitted exactly one URL. Per-project and per-role
 * routes are the point of §5.1: /experience/publix and /experience/aws can
 * rank for queries where LinkedIn has no competing page.
 *
 * /lab/* is deliberately absent — those are Phase 2 prototypes, noindex, and
 * deleted before ship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/experience`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${BASE}/skills`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...projects.map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...experience.map((r) => ({
      url: `${BASE}/experience/${r.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
