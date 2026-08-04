import Link from "next/link";
import { corpus } from "@/lib/retrieval";

export const metadata = { title: "Not found", robots: { index: false } };

/**
 * §5.1 — a 404 that is useful rather than decorative. It lists every real
 * document on the site, so a wrong URL still lands somewhere.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.09em] text-muted">404</p>
      <h1 className="text-2xl font-semibold">No document at that address</h1>
      <p className="mt-3 max-w-[52ch] text-muted">
        Nothing is indexed here. Everything on this site is listed below.
      </p>

      <ul className="mt-8 list-none p-0">
        {corpus.map((d) => (
          <li key={d.id} className="flex items-baseline gap-3 border-b border-line py-2">
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
              {d.kind}
            </span>
            <Link href={d.href} className="text-ink no-underline hover:underline">
              {d.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
