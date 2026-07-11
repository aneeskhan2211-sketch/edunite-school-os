import {
  ROLE_DEFAULT_PATHS,
  ROLE_LABELS,
  useRoleStore,
} from "@/store/roleStore";
import type { Role } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Eye } from "lucide-react";
import { useState } from "react";

const ALL_ROLES: Role[] = [
  "teacher",
  "coTeacher",
  "student",
  "parent",
  "schoolAdmin",
  "departmentHead",
  "principal",
  "districtAdmin",
  "counsellor",
  "spedCoordinator",
  "curriculumCoordinator",
  "substitute",
];

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { currentRole, currentUser, isDevMode, setRole } = useRoleStore();
  const [open, setOpen] = useState(false);

  if (!isDevMode) return null;

  const handleSelect = (role: Role) => {
    setRole(role);
    setOpen(false);
    navigate({ to: ROLE_DEFAULT_PATHS[role] });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring font-display"
        aria-expanded={open}
        aria-haspopup="listbox"
        data-ocid="role_switcher.toggle"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold font-display">
          {currentUser?.firstName[0]}
          {currentUser?.lastName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white font-display">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p className="truncate text-[11px] text-white/90 font-display">
            {ROLE_LABELS[currentRole]}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-white/90 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            aria-hidden
          />
          <div
            className="absolute bottom-full left-0 z-50 mb-1 w-56 rounded-xl border border-sidebar-border bg-sidebar py-1 shadow-elevated"
            aria-label="Switch role"
          >
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-sidebar-border mb-1">
              <Eye className="h-3.5 w-3.5 text-sidebar-primary" />
              <span className="text-[11px] font-bold text-sidebar-primary uppercase tracking-wider font-display">
                View as · demo
              </span>
            </div>
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                aria-current={role === currentRole ? "true" : undefined}
                className={`flex w-full items-center px-3 py-2 text-sm transition-colors duration-100 hover:bg-white/10 font-display ${
                  role === currentRole
                    ? "text-sidebar-primary font-semibold"
                    : "text-white/80 font-medium"
                }`}
                data-ocid={`role_switcher.option.${role}`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
