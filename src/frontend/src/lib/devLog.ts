/**
 * Returns demo data, and in dev builds logs a visible warning so a silent
 * backend failure can never masquerade as real data. Use this in the `catch`
 * branch of any hook that is wired to the canister — the graceful fallback is
 * preserved in production, but never silent in development.
 */
export function demoFallback<T>(label: string, data: T, reason?: unknown): T {
  if (import.meta.env?.DEV) {
    console.warn(
      `[EdUnite] ${label}: backend call failed — using demo data.`,
      reason ?? "",
    );
  }
  return data;
}
