import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/backend/notifications";
import { useRoleStore } from "@/store/roleStore";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check, Loader2 } from "lucide-react";
import { useState } from "react";

export function NotificationBell() {
  const navigate = useNavigate();
  const { currentUser } = useRoleStore();
  const unreadCount = useUnreadNotificationCount(currentUser?.id ?? "");
  const { data: notifications = [] } = useNotifications(currentUser?.id ?? "");
  const markRead = useMarkNotificationRead();
  const [open, setOpen] = useState(false);

  const recentUnread = notifications.filter((n: any) => !n.read).slice(0, 5);

  const hasCritical = notifications.some(
    (n: any) => n.priority === "critical" && !n.read,
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (recentUnread.length > 0 && !open) {
            setOpen(true);
          } else {
            navigate({ to: "/notifications" as any });
            setOpen(false);
          }
        }}
        className="relative flex h-11 w-11 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        data-ocid="notification.bell"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant={hasCritical ? "destructive" : "default"}
            className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
            data-ocid="notification.bell_badge"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </button>

      {open && recentUnread.length > 0 && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-80 rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {unreadCount} unread
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                navigate({ to: "/notifications" as any });
                setOpen(false);
              }}
              data-ocid="notification.see_all_link"
            >
              See all
            </Button>
          </div>
          <div className="space-y-2">
            {recentUnread.map((n: any) => (
              <div
                key={n.id}
                className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {n.body}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0 opacity-0 hover:opacity-100 focus:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    markRead.mutate(n.id);
                  }}
                  disabled={markRead.isPending}
                  data-ocid="notification.inline_mark_read"
                >
                  {markRead.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
