import { PageHeader, PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/backend/messaging";
import { useUnderstandingSignals } from "@/hooks/backend/pastoral";
import { useRoleStore } from "@/store/roleStore";
import { Award, Megaphone, Newspaper } from "lucide-react";

type FeedItem = {
  id: string;
  kind: "announcement" | "celebration";
  title: string;
  body: string;
  date: string;
  priority?: string;
};

export default function CommunityFeed() {
  const { currentRole } = useRoleStore();
  const { data: announcements = [], isLoading: loadingAnns } =
    useAnnouncements(currentRole);
  const { data: signals = [], isLoading: loadingSignals } =
    useUnderstandingSignals();

  const isLoading = loadingAnns || loadingSignals;

  const items: FeedItem[] = [
    ...(announcements as any[]).map((a) => ({
      id: `a-${a.id}`,
      kind: "announcement" as const,
      title: a.title,
      body: a.body,
      date: a.date,
      priority: a.priority,
    })),
    ...(signals as any[])
      .filter((s) => s.type === "celebration")
      .map((s) => ({
        id: `c-${s.id}`,
        kind: "celebration" as const,
        title: s.headline || "Worth celebrating",
        body: s.reason,
        date: s.generatedAt,
      })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <PageLayout>
      <PageHeader
        title="Community Feed"
        subtitle="School announcements and celebrations"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Nothing new"
          description="Announcements and celebrations will appear here."
        />
      ) : (
        <div className="space-y-3" data-ocid="community_feed.list">
          {items.map((item) => {
            const isCeleb = item.kind === "celebration";
            const Icon = isCeleb ? Award : Megaphone;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-5"
                data-ocid={`community_feed.item.${item.id}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isCeleb
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      {isCeleb ? (
                        <Badge variant="success">Celebration</Badge>
                      ) : item.priority && item.priority !== "info" ? (
                        <Badge
                          variant={
                            item.priority === "urgent" ? "danger" : "warning"
                          }
                        >
                          {item.priority}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                    {item.date ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.date}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
