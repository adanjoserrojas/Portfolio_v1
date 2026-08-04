import Link from "next/link";

/** Shared page furniture. Server components — no client JS. */

export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">{children}</div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="enter mb-10">
      {eyebrow && (
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.09em] text-muted">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
      {lede && <p className="mt-3 max-w-[52ch] text-muted">{lede}</p>}
    </header>
  );
}

/** Breadcrumb trail. Also the DOM source for BreadcrumbList JSON-LD. */
export function Breadcrumbs({ trail }: { trail: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted">
        {trail.map((t, i) => (
          <li key={t.href} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === trail.length - 1 ? (
              <span aria-current="page" className="text-ink">
                {t.label}
              </span>
            ) : (
              <Link href={t.href} className="no-underline hover:text-ink">
                {t.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="pt-0.5 font-mono text-xs text-muted">{label}</dt>
      <dd className="m-0 leading-relaxed">{children}</dd>
    </>
  );
}

export function Fields({ children }: { children: React.ReactNode }) {
  return (
    <dl className="mb-8 grid grid-cols-[minmax(5rem,max-content)_1fr] gap-x-6 gap-y-3.5 text-[0.95rem]">
      {children}
    </dl>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((b) => (
        <li key={b.slice(0, 32)} className="relative mb-3.5 pl-4 leading-relaxed">
          <span aria-hidden="true" className="absolute left-0.5 text-accent">
            ·
          </span>
          {b}
        </li>
      ))}
    </ul>
  );
}

export function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-(--radius) border border-line px-2 py-0.5 font-mono text-xs text-muted"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * §0.3 — REMOVED, deliberately.
 *
 * An earlier version rendered "N further items from this role are not shown —
 * pending a confidentiality review". That was right while the question was
 * open: it distinguished "there is more, withheld" from "there is nothing
 * more".
 *
 * Adan closed the question on 2026-08-04: do not disclose. Once the answer is
 * "never", the notice becomes a disclosure in its own right — it tells a
 * reader (and a crawler) that four more facts about a named employer exist and
 * invites the question of what they are. The withheld bullets stay in
 * content/experience.ts, marked and reasoned, and simply have no public
 * surface.
 */
