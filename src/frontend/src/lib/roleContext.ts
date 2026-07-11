import type { Role } from "@/types";
import { toNat } from "./toNat";

export interface CandidRoleContext {
  userId: bigint;
  role: Record<string, null>;
}

/**
 * Single seam for producing the backend RoleContext.
 *
 * Today it derives from the client-side role store (role + userId passed in by
 * the caller, usually via useRole()). This is intentionally the ONLY place that
 * constructs a RoleContext. When real authentication lands, change just this
 * function to derive userId/role from the authenticated Internet Identity
 * principal instead of the client store — every call site updates for free.
 */
export function buildRoleContext(
  role: Role,
  userId: string | null,
): CandidRoleContext {
  return {
    userId: userId ? toNat(userId) : 0n,
    role: { [role]: null },
  };
}
