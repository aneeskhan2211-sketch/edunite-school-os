import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Named content-width variants. Pages choose one instead of hardcoding max-w-*. */
const WIDTH = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-screen-2xl",
  full: "max-w-none",
} as const;

export type PageWidth = keyof typeof WIDTH;

export function PageLayout({
  children,
  className,
  contentClassName,
  title,
  subtitle,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  title?: string;
  subtitle?: string;
  width?: PageWidth;
}) {
  return (
    <main className={cn("flex-1 overflow-visible bg-background", className)}>
      <div
        className={cn(
          "mx-auto w-full px-6 py-6",
          WIDTH[width],
          contentClassName,
        )}
      >
        {title ? <PageHeader title={title} subtitle={subtitle} /> : null}
        {children}
      </div>
    </main>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="ml-4 flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/**
 * Standard section container — a shadcn Card with an optional title. Padding
 * defaults to p-5; callers can still override via className (tailwind-merge
 * resolves the conflict), preserving the prior API.
 */
export function SectionCard({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Card className={cn("block p-5 shadow-none", className)}>
      {title ? (
        <div className="mb-4 flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
          {action ?? null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}
