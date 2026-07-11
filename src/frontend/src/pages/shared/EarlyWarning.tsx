import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEarlyWarning } from "@/hooks/backend/pastoral";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const TIERS = [
  {
    tier: 3,
    label: "Tier 3 · Intensive",
    desc: "Multiple risk indicators — needs an individualised plan.",
    badge: "danger" as const,
  },
  {
    tier: 2,
    label: "Tier 2 · Targeted",
    desc: "One risk indicator — targeted support recommended.",
    badge: "warning" as const,
  },
  {
    tier: 1,
    label: "Tier 1 · Universal",
    desc: "No active risk indicators — core support.",
    badge: "success" as const,
  },
];

export default function EarlyWarning() {
  const { data: roster = [], isLoading } = useEarlyWarning();

  const byTier = (t: number) => (roster as any[]).filter((s) => s.tier === t);

  return (
    <PageLayout>
      <PageHeader
        title="Early Warning (MTSS)"
        subtitle="Support tiers computed from attendance, behaviour, and course performance"
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-24 w-full" />
          ))}
        </div>
      ) : roster.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No roster available"
          description="Early-warning data will appear once students are loaded."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {TIERS.map((t) => (
              <div
                key={t.tier}
                className="rounded-xl border border-border bg-card p-5"
              >
                <Badge variant={t.badge}>{t.label}</Badge>
                <p className="mt-3 text-3xl font-bold text-foreground font-display">
                  {byTier(t.tier).length}
                </p>
                <p className="text-xs text-muted-foreground">students</p>
              </div>
            ))}
          </div>

          {TIERS.filter((t) => t.tier >= 2).map((t) => {
            const students = byTier(t.tier);
            return (
              <SectionCard key={t.tier} title={t.label} className="mb-5">
                <p className="text-xs text-muted-foreground mb-3">{t.desc}</p>
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No students in this tier.
                  </p>
                ) : (
                  <ul
                    className="divide-y divide-border"
                    data-ocid={`early_warning.tier_${t.tier}_list`}
                  >
                    {students.map((s: any) => (
                      <li
                        key={s.studentId}
                        className="py-3 flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/report-card/${s.studentId}` as never}
                            className="text-sm font-semibold text-foreground hover:text-primary"
                          >
                            {s.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Grade {s.grade} · {s.attendanceRate}% attendance ·{" "}
                            {s.incidentCount} incident
                            {s.incidentCount === 1 ? "" : "s"}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {s.flags.map((f: string) => (
                              <span
                                key={f}
                                className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
                              >
                                <ShieldAlert className="h-3 w-3" aria-hidden />
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Badge variant={t.badge}>Tier {t.tier}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            );
          })}
        </>
      )}
    </PageLayout>
  );
}
