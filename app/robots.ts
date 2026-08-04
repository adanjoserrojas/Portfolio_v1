import type { MetadataRoute } from "next";

/**
 * §9.1 — generated rather than static, so the sitemap URL and the host can
 * never drift from what the app actually serves.
 *
 * Replaces public/robots.txt, which was a hand-maintained file next to a
 * generated sitemap — two sources of truth for the same thing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Phase 2 prototypes. They are deleted before ship, but if a build
        // ever includes them they must not be indexed.
        disallow: ["/lab/"],
      },
    ],
    sitemap: "https://www.4dan.dev/sitemap.xml",
    host: "https://www.4dan.dev",
  };
}
