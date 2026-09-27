import Link from "next/link";
import { profile } from "@/content/profile";
import EmailLink from "./EmailLink";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        <p className="font-mono text-xs text-muted">
          {profile.name} · {profile.location}
        </p>
        <ul className="flex flex-wrap items-center gap-4">
          {profile.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                data-target
                rel="me noopener"
                className="text-sm text-muted no-underline transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <EmailLink user={profile.email.user} domain={profile.email.domain} />
          </li>
        </ul>
      </div>
      <nav
        aria-label="Site policies"
        className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 px-4 pb-8 sm:px-6"
      >
        <Link
          href="/privacy"
          className="inline-flex min-h-6 items-center text-xs text-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          Privacy policy
        </Link>
        <Link
          href="/terms"
          className="inline-flex min-h-6 items-center text-xs text-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          Terms &amp; conditions
        </Link>
      </nav>
    </footer>
  );
}
