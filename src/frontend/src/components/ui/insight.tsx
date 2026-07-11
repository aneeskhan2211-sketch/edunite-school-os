import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Lightbulb,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * Insight kit — a small set of reusable components for surfacing high-level,
 * understanding-layer information. Every colour comes from a semantic design
 * token (success / warning / info / destructive / muted), never raw palette,
 * and every status is paired with an icon + text (never colour alone).
 */

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
  neutral: "text-muted-foreground",
};
const TONE_FILL: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};
const TONE_SOFT: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  neutral: "bg-muted text-muted-foreground",
};

/** A one-line "so what" callout — states the takeaway, not just numbers. */
export function InsightBanner({
  children,
  tone = "info",
  icon: Icon = Lightbulb,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3",
        TONE_SOFT[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden />
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

/** A single figure with an optional trend delta or sub-label. */
export function MetricCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  sub,
  className,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: Tone;
  sub?: string;
  className?: string;
}) {
  const DeltaIcon =
    deltaTone === "success"
      ? TrendingUp
      : deltaTone === "danger" || deltaTone === "warning"
        ? TrendingDown
        : Minus;
  return (
    <div className={cn("rounded-lg bg-muted/40 p-3", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold leading-tight text-foreground">
        {value}
      </p>
      {delta ? (
        <p
          className={cn(
            "mt-0.5 flex items-center gap-1 text-[11px]",
            TONE_TEXT[deltaTone],
          )}
        >
          <DeltaIcon className="h-3 w-3" aria-hidden />
          {delta}
        </p>
      ) : sub ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
      ) : null}
    </div>
  );
}

export interface Segment {
  label: string;
  value: number;
  tone: Tone;
  icon?: LucideIcon;
}

/** A stacked proportion bar with an icon+label+count legend (never colour alone). */
export function DistributionBar({
  segments,
  className,
}: {
  segments: Segment[];
  className?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div
              key={s.label}
              className={TONE_FILL[s.tone]}
              style={{ width: `${(s.value / total) * 100}%` }}
            />
          ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((s) => {
          const Icon = s.icon;
          return (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              {Icon ? (
                <Icon
                  className={cn("h-3.5 w-3.5", TONE_TEXT[s.tone])}
                  aria-hidden
                />
              ) : (
                <span
                  className={cn("h-2 w-2 rounded-full", TONE_FILL[s.tone])}
                />
              )}
              {s.label} · {s.value}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export interface PriorityItem {
  id: string;
  icon: LucideIcon;
  tone: Tone;
  title: string;
  subtitle?: string;
  to?: string;
}

const PRIORITY_ROW_CLASS =
  "flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-3 transition-colors hover:bg-muted/30";

function PriorityRowBody({ item }: { item: PriorityItem }) {
  const Icon = item.icon;
  return (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          TONE_SOFT[item.tone],
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{item.title}</p>
        {item.subtitle ? (
          <p className="truncate text-xs text-muted-foreground">
            {item.subtitle}
          </p>
        ) : null}
      </div>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </>
  );
}

/** A prioritized, severity-coded list of actions — "what needs you now." */
export function PriorityList({
  items,
  className,
}: {
  items: PriorityItem[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((it) =>
        it.to ? (
          <Link key={it.id} to={it.to as never} className={PRIORITY_ROW_CLASS}>
            <PriorityRowBody item={it} />
          </Link>
        ) : (
          <div key={it.id} className={PRIORITY_ROW_CLASS}>
            <PriorityRowBody item={it} />
          </div>
        ),
      )}
    </div>
  );
}
