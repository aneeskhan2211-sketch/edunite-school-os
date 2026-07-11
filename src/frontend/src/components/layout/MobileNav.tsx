import { NAV_CONFIGS } from "@/config/navigation";
import { useRoleStore } from "@/store/roleStore";
import type { NavItem } from "@/types";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import { Circle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<
    string,
    LucideIcon | undefined
  >;
  return icons[name] ?? icons.Circle ?? Circle;
}

function MobileNavItem({
  item,
  active,
  onClick,
}: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = getIcon(item.icon);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors duration-150 focus-visible:outline-none ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      aria-current={active ? "page" : undefined}
      data-ocid={`mobile_nav.${item.id}`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="truncate max-w-[56px]">{item.label}</span>
    </button>
  );
}

export function MobileNav() {
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { currentRole } = useRoleStore();
  const config = NAV_CONFIGS[currentRole];
  const topItems = config.primary.slice(0, 4);

  function onNavigate(path: string) {
    navigate({ to: path });
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Mobile navigation"
    >
      {topItems.map((item) => (
        <MobileNavItem
          key={item.id}
          item={item}
          active={currentPath === item.path}
          onClick={() => onNavigate(item.path)}
        />
      ))}
    </nav>
  );
}
