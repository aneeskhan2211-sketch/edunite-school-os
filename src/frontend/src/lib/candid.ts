/**
 * Helpers for the raw Candid actor (window.__ACTOR__), where optionals are
 * encoded as `[]` (none) / `[value]` (some) rather than null. Centralizing this
 * avoids the inline `[] as any` footgun across every wired hook.
 */

/** Encode a TS value as a Candid `opt` argument: [] = none, [v] = some. */
export const opt = <T>(v: T | null | undefined): [] | [T] =>
  v === null || v === undefined ? [] : [v];

/** Read a Candid `opt` return (`[] | [v]`, or a bare value) into value-or-undefined. */
export function unwrapOpt<T>(
  v: [] | [T] | T | null | undefined,
): T | undefined {
  if (Array.isArray(v)) return v.length > 0 ? (v[0] as T) : undefined;
  return v ?? undefined;
}

/** Read the tag of a Candid variant object (e.g. { medium: null } -> "medium"). */
export const variantKey = (v: unknown): string =>
  v && typeof v === "object"
    ? (Object.keys(v as object)[0] ?? "")
    : String(v ?? "");

/** Convert a nanosecond Timestamp (bigint | number | string) to an ISO date (YYYY-MM-DD). */
export function nsToISODate(ns: unknown): string {
  try {
    const ms = Number(BigInt(String(ns)) / 1_000_000n);
    return new Date(ms).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
