import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

import { THEME_SCRIPT } from "@/lib/theme";
import { profile, emailAddress } from "@/content/profile";
import { education } from "@/content/education";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Palette from "@/components/site/Palette";
import { corpus } from "@/lib/retrieval";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.4dan.dev"),
  title: {
    default: "Adan Rojas — Software Engineer",
    template: "Adan Rojas — %s | Software Engineer",
  },
  description:
    "Adan Rojas is a software engineer and UCF Information Technology student working on agentic AI, MCP tooling, and full-stack development.",
  applicationName: "Adan Rojas",
  authors: [{ name: profile.name, url: "https://www.4dan.dev" }],
  creator: profile.name,
  publisher: profile.name,
  // Rebuilt from the content layer. The old list carried "Dahiana Rojas" (a
  // removed employer) and "Computer Science" (the wrong major) — AUDIT.md §6.6.
  keywords: [
    "Adan Rojas",
    "Software Engineer",
    "Agentic AI",
    "Model Context Protocol",
    "MCP",
    "Full-Stack Developer",
    "University of Central Florida",
    "UCF",
    "Information Technology",
    "Knight Hacks",
    "Orlando",
    "Next.js",
    "TypeScript",
    "Python",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: "https://www.4dan.dev",
    siteName: "Adan Rojas",
    title: "Adan Rojas — Software Engineer",
    description:
      "Software engineer working on agentic AI, MCP tooling, and full-stack development. UCF Information Technology, Fall 2027.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adan Rojas — Software Engineer",
    description:
      "Software engineer working on agentic AI, MCP tooling, and full-stack development.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

/**
 * §9.1 — Person schema. `sameAs` is the specific mechanism by which Google
 * links the profiles into one entity, making the site a candidate for the
 * knowledge panel rather than a competitor to LinkedIn.
 *
 * Deliberately ABSENT (§9.1): `worksFor`. The Publix internship ended in
 * July 2026 and the AWS role is a program affiliation, not employment —
 * `worksFor: Amazon` would read as a claim Adan is not making.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: "https://www.4dan.dev",
  email: `mailto:${emailAddress()}`,
  jobTitle: "Software Engineer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: education.institution,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Orlando",
      addressRegion: "FL",
    },
  },
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: education.institution,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Oviedo",
    addressRegion: "FL",
    addressCountry: "US",
  },
  knowsAbout: [
    "Agentic AI",
    "Model Context Protocol",
    "Machine Learning",
    "Computer Vision",
    "Software Engineering",
  ],
  sameAs: profile.links.map((l) => l.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Blocking, before paint — no flash of the wrong theme (§4.1). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} ${dmMono.variable}`}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        {/* Corpus is built on the server and handed down, so zod and the
            content modules never enter the client bundle (§5.3). */}
        <Palette docs={corpus} />
      </body>
    </html>
  );
}
