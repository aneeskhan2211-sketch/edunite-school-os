import { PageLayout } from "@/components/layout/PageLayout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/backend/notifications";
import { useRoleStore } from "@/store/roleStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  Info,
  Loader2,
  Megaphone,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const priorityConfig: Record<
  string,
  {
    label: string;
    variant: "danger" | "warning" | "info" | "success" | "neutral";
    icon: React.ReactNode;
  }
> = {
  critical: {
    label: "Critical",
    variant: "danger",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  important: {
    label: "Important",
    variant: "warning",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  informational: {
    label: "Info",
    variant: "info",
    icon: <Info className="h-4 w-4" />,
  },
  announcement: {
    label: "Announcement",
    variant: "success",
    icon: <Megaphone className="h-4 w-4" />,
  },
  event: {
    label: "Event",
    variant: "neutral",
    icon: <Calendar className="h-4 w-4" />,
  },
  assignment: {
    label: "Assignment",
    variant: "info",
    icon: <BookOpen className="h-4 w-4" />,
  },
};

function getPriorityConfig(type: string) {
  return priorityConfig[type] ?? priorityConfig.informational;
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: {
    id: string;
    title: string;
    body: string;
    type: string;
    priority: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
  };
  onMarkRead: (id: string) => void;
}) {
  const navigate = useNavigate();
  const cfg = getPriorityConfig(notification.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/40 ${
        notification.read
          ? "border-border bg-card/50"
          : "border-primary/20 bg-primary/[0.03]"
      }`}
      data-ocid="notification.item"
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          notification.read
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {cfg.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`text-sm font-medium ${
                notification.read ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
              {notification.body}
            </p>
          </div>
          <StatusBadge
            variant={cfg.variant}
            label={cfg.label}
            className="shrink-0"
          />
        </div>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!notification.read && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onMarkRead(notification.id)}
              data-ocid="notification.mark_read_button"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark read
            </Button>
          )}

          {notification.actionUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => navigate({ to: notification.actionUrl! })}
              data-ocid="notification.action_link"
            >
              View
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border p-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-20 shrink-0" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { currentUser } = useRoleStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<
    "all" | "unread" | "critical" | "important"
  >("all");

  const {
    data: notifications = [],
    isLoading,
    error,
  } = useNotifications(currentUser?.id ?? "");
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const filtered = notifications.filter((n: any) => {
    if (filter === "unread") return !n.read;
    if (filter === "critical") return n.priority === "critical";
    if (filter === "important") return n.priority === "important";
    return true;
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const criticalCount = notifications.filter(
    (n: any) => n.priority === "critical" && !n.read,
  ).length;

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <PageLayout
      title="Notifications"
      subtitle="Stay on top of what needs your attention"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            data-ocid="notification.filter.all"
          >
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </Button>
          <Button
            type="button"
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            data-ocid="notification.filter.unread"
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            type="button"
            variant={filter === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("critical")}
            data-ocid="notification.filter.critical"
          >
            Critical
            {criticalCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalCount}
              </Badge>
            )}
          </Button>
          <Button
            type="button"
            variant={filter === "important" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("important")}
            data-ocid="notification.filter.important"
          >
            Important
          </Button>

          <div className="ml-auto">
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                data-ocid="notification.mark_all_read_button"
              >
                {markAllRead.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="mr-1 h-3 w-3" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
            <p className="mt-3 text-sm font-medium text-destructive">
              Could not load notifications
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["notifications"] })
              }
              data-ocid="notification.retry_button"
            >
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {filter === "unread"
                ? "You're all caught up"
                : filter === "critical"
                  ? "No critical notifications"
                  : "No notifications yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {filter === "unread"
                ? "Nothing needs your attention right now."
                : "When something important happens, you'll see it here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification: any) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
