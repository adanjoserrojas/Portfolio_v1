/**
 * shadcn's class merger, required by components pulled from the registry.
 *
 * The registry ships this as `twMerge(clsx(inputs))`. Both are omitted — ~8 KB
 * gzipped for conflict resolution that `components/ui/calendar.tsx` no longer
 * needs, since its class map was rewritten against this repo's tokens rather
 * than layered on the registry's.
 *
 * If a future `shadcn add` brings in a component that leans on conflict
 * resolution, swap this body for the real thing:
 *
 *     import { clsx, type ClassValue } from "clsx";
 *     import { twMerge } from "tailwind-merge";
 *     export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
 */

export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue) => {
    if (!value && value !== 0) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    out.push(String(value));
  };

  inputs.forEach(walk);
  return out.join(" ");
}
