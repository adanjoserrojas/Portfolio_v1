import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import PaletteTrigger from "./PaletteTrigger";

/**
 * §5.2 — "The tree is navigation, not the only path — every page is reachable
 * by a plain link, and the site works with JS disabled well enough to read."
 *
 * The chosen direction (v6) makes retrieval the primary way through the site,
 * so this header is deliberately quiet: real anchors to every section, plus
 * the ⌘K trigger. It is a Server Component; only the toggle and the trigger
 * are client leaves.
 */
const LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
];

// Not a route — a file. Kept out of LINKS so it renders as a plain <a>
// rather than a prefetching <Link>, and so its label can say what it is.
const RESUME = { href: "/Adan_Rojas_Resume.pdf", label: "Résumé" };

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-ink no-underline"
        >
          4dan.dev
        </Link>

        <nav aria-label="Main" className="flex-1">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  data-target
                  className="inline-flex items-center text-sm text-muted no-underline transition-colors hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={RESUME.href}
                data-target
                className="inline-flex items-center text-sm text-muted no-underline transition-colors hover:text-ink"
              >
                {RESUME.label}
                <span className="sr-only"> (PDF)</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <PaletteTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
