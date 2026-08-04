import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

/**
 * §9.1 — "Generate them with next/og (ImageResponse) so they're consistent
 * and cheap."
 *
 * Replaces public/images/og-image.png, which was a 27 MB file declared as
 * 1200×630. Most link-preview crawlers would time out fetching it and render
 * no preview at all (AUDIT.md §2, RESULTS.md §3). This renders at request
 * time, is cached, and weighs a few KB.
 */
export const alt = "Adan Rojas — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0f11",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#99a1a9",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          4dan.dev
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              color: "#e6e8ea",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 34,
              color: "#99a1a9",
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            {profile.roleLine}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", width: 40, height: 4, background: "#e2ae55" }} />
          <div style={{ display: "flex", fontSize: 22, color: "#99a1a9" }}>
            {profile.location}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
