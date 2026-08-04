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
    </footer>
  );
}
