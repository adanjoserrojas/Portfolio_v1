import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // §7.3 — AVIF first, WebP fallback.
    formats: ["image/avif", "image/webp"],
    // The site renders exactly one photo, at ≤320 CSS px. No point generating
    // a ladder up to 3840.
    imageSizes: [200, 280, 320, 400, 560, 640],
    deviceSizes: [640, 828, 1080],
  },

  /**
   * §5.1 — the quiz is gone. There was never a /quiz ROUTE (it was inline on
   * `/`), so no redirect is needed for it — see OPEN-QUESTIONS.md §Q4.
   *
   * These two are real: the site previously linked the October résumé, and
   * that URL is live today.
   */
  async redirects() {
    return [
      // The October résumé file is deleted. This keeps any inbound link alive
      // and pointing at the current document instead of 404ing.
      {
        source: "/Adan_Rojas_Resume_Oct.pdf",
        destination: "/Adan_Rojas_Resume.pdf",
        permanent: true,
      },
      { source: "/resume", destination: "/Adan_Rojas_Resume.pdf", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        /**
         * Everything except /tui/* keeps the strict DENY.
         *
         * The negative lookahead is load-bearing. `X-Frame-Options: DENY` is
         * absolute — it blocks framing by *any* page including our own origin,
         * so a blanket DENY stopped app/RIND/page.tsx from embedding the WASM
         * terminal it serves from /tui (net::ERR_BLOCKED_BY_RESPONSE). Carving
         * the exception out here rather than relaxing the global value to
         * SAMEORIGIN keeps every real page as locked down as it was.
         */
        source: "/:path((?!tui/).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        /**
         * The WASM terminal, framed by /RIND. SAMEORIGIN lets our own pages
         * embed it while still refusing every other site — so this is not an
         * open frame, just one that trusts this origin.
         */
        source: "/tui/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        /**
         * The résumé PDF is downloadable but not indexed.
         *
         * Adan asked for the résumé in the portfolio, and separately asked
         * that four Publix bullets not be disclosed. The PDF still contains
         * those four bullets verbatim — so a human who clicks through gets the
         * document he wants published, while search engines do not ingest and
         * cache its text. That is the narrowest way to honour both
         * instructions without editing his résumé for him.
         *
         * See OPEN-QUESTIONS.md §Q15. Remove this header if the intent is for
         * the PDF's contents to be fully public.
         */
        source: "/Adan_Rojas_Resume.pdf",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
