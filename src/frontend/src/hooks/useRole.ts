import { NAV_CONFIGS } from "@/config/navigation";
import { useRoleStore } from "@/store/roleStore";
import type { NavConfig, Role } from "@/types";

export function useRole(): {
  role: Role;
  navConfig: NavConfig;
  userId: string | null;
} {
  const { currentRole, currentUser } = useRoleStore();
  return {
    role: currentRole,
    navConfig: NAV_CONFIGS[currentRole],
    userId: currentUser?.id ?? null,
  };
}
