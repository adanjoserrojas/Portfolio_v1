"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export default function SiteChrome({
  children,
  header,
  footer,
  palette,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  palette: ReactNode;
}) {
  const pathname = usePathname();
  if (
    ["/board", "/admin", "/login"].some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  )
    return <>{children}</>;
  return (
    <>
      {header}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      {footer}
      {palette}
    </>
  );
}
