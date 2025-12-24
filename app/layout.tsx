import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Portfolio | Adan Rojas",
    description:
        "An aspiring software engineer passionate about building impactful and performant software solutions. Currently a student at the University of Central Florida, actively seeking opportunities to contribute to innovative projects and collaborate with like-minded professionals in the tech industry.",
    keywords: [
        "Adan Rojas",
        "Software Engineer",
        "UCF",
        "Knight Hacks",
        "Full-Stack Developer",
        "Dahiana Rojas",
        "Intern",
        "UCF",
        "University of Central Florida",
        "Workshop Team Member",
        "Python",
        "React",
        "Next.js",
        "Computer Science",
    ],
    authors: [{ name: "Adan Rojas" }],
    creator: "Adan Rojas",
    publisher: "Adan Rojas",

    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://www.4dan.dev",
        title: "Portfolio | Adan Rojas",
        description:
            "An aspiring software engineer passionate about building impactful and performant software solutions. Currently a student at the University of Central Florida, actively seeking opportunities to contribute to innovative projects and collaborate with like-minded professionals in the tech industry.",
        siteName: "Adan Rojas",
    },
};

export const viewport = 'width=device-width, initial-scale=1'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark !scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
