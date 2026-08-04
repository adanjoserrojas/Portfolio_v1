"use client";

import { useEffect, useState } from "react";

/**
 * §0.2 — "Obfuscate it against scrapers (render via a mailto: built at runtime
 * or an SVG/JS-assembled string) rather than printing it as plain text in the
 * HTML source."
 *
 * The address is stored split in content/profile.ts and only joined here,
 * after mount. The server-rendered HTML contains neither the address nor a
 * mailto:, so a source scrape finds nothing — while a human still gets a real
 * link, and a no-JS visitor gets a readable instruction rather than a dead
 * control.
 */
export default function EmailLink({ user, domain }: { user: string; domain: string }) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    setHref(`mailto:${user}@${domain}`);
  }, [user, domain]);

  if (!href) {
    return (
      <span className="text-sm text-muted">
        {user} <span aria-hidden="true">[at]</span>
        <span className="sr-only"> at </span> {domain}
      </span>
    );
  }

  return (
    <a
      href={href}
      data-target
      className="text-sm text-muted no-underline transition-colors hover:text-ink"
    >
      Email
    </a>
  );
}
