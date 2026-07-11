import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

/**
 * Real authentication control (Internet Identity). Increment 1 of the
 * principal-based RBAC work: signs the user in/out and surfaces the
 * authenticated principal. Server-side role enforcement (deriving the role
 * from `caller`) lands in a later increment; until then the "View as"
 * switcher below still drives the app's role.
 */
export function AuthControl() {
  const { isAuthenticated, isLoggingIn, login, clear, identity } =
    useInternetIdentity();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={login}
        disabled={isLoggingIn}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-2 py-2 font-display text-sm font-medium text-white transition-colors hover:bg-white/15 disabled:opacity-60"
        data-ocid="auth.sign_in"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        {isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
      </button>
    );
  }

  const principal = identity?.getPrincipal().toText() ?? "";
  const short = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "Signed in";

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <ShieldCheck
          className="h-3.5 w-3.5 shrink-0 text-sidebar-primary"
          aria-hidden
        />
        <span
          className="truncate font-mono text-[11px] text-white/80"
          title={principal}
        >
          {short}
        </span>
      </div>
      <button
        type="button"
        onClick={clear}
        className="rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Sign out"
        data-ocid="auth.sign_out"
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
