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
        source: "/:path*",
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
        // Fingerprinted build assets are immutable.
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
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
