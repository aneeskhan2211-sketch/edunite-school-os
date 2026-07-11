import { NAV_CONFIGS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useRoleStore } from "@/store/roleStore";
import type { NavItem } from "@/types";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { Circle, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthControl } from "./AuthControl";
import { NotificationBell } from "./NotificationBell";
import { RoleSwitcher } from "./RoleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<
    string,
    LucideIcon | undefined
  >;
  return icons[name] ?? icons.Circle ?? Circle;
}

function NavLink({
  item,
  active,
  onClick,
}: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = getIcon(item.icon);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring font-display",
        active
          ? "bg-white/20 text-white font-semibold border-l-2 border-sidebar-primary pl-[10px]"
          : "text-white/80 hover:bg-white/10 hover:text-white font-semibold",
      )}
      aria-current={active ? "page" : undefined}
      data-ocid={`nav.${item.id}`}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export function SidebarNav() {
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { currentRole } = useRoleStore();
  const config = NAV_CONFIGS[currentRole];

  function onNavigate(path: string) {
    navigate({ to: path });
  }

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col bg-sidebar font-display"
      aria-label="Main navigation"
    >
      {/* Header — school crest */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/20">
          <Shield className="h-5 w-5 text-sidebar-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white font-display">
            Lincoln High School
          </p>
          <p className="truncate text-[11px] text-white/60 font-display">
            EdUnite OS
          </p>
        </div>
      </div>

      {/* Primary nav — flat list, no Tools section */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5"
        aria-label="Primary navigation"
      >
        {config.primary.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={
              currentPath === item.path ||
              currentPath.startsWith(`${item.path}/`)
            }
            onClick={() => onNavigate(item.path)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-1 font-display">
        <div className="flex items-center gap-1 justify-between px-1 pb-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
        <AuthControl />
        <RoleSwitcher />
      </div>
    </aside>
  );
}
