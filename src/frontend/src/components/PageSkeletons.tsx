import { Skeleton } from "@/components/Skeleton";

/* ── Shared helpers ─────────────────────────────────────────────── */

function SkeletonPill({ className }: { className?: string }) {
  return (
    <Skeleton
      className={`inline-block rounded-full bg-muted ${className ?? ""}`}
    />
  );
}

const TAB_NAMES = [
  "overview",
  "grades",
  "attendance",
  "behaviour",
  "commitments",
];

function SkeletonTabBar({ count = 5 }: { count?: number }) {
  const tabs = TAB_NAMES.slice(0, count);
  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-1 mb-6">
      {tabs.map((tab) => (
        <Skeleton
          key={`skeleton-tab-${tab}`}
          className="h-9 w-24 rounded-t-lg"
        />
      ))}
    </div>
  );
}

const TABLE_COLS = ["col-a", "col-b", "col-c", "col-d", "col-e"];
const TABLE_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5", "row-6"];

function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  const colKeys = TABLE_COLS.slice(0, cols);
  const rowKeys = TABLE_ROWS.slice(0, rows);
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-3 pb-2 border-b border-border">
        {colKeys.map((col, idx) => (
          <Skeleton
            key={`skeleton-th-${col}`}
            className={`h-3 rounded ${idx === 0 ? "flex-1" : "w-20"}`}
          />
        ))}
      </div>
      {/* Rows */}
      {rowKeys.map((row, rIdx) => (
        <div key={`skeleton-tr-${row}`} className="flex gap-3 py-2">
          {colKeys.map((col, cIdx) => (
            <Skeleton
              key={`skeleton-td-${row}-${col}`}
              className={`h-4 rounded ${cIdx === 0 ? "flex-1" : "w-20"} ${rIdx === rows - 1 && cIdx === cols - 1 ? "w-16" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── 1. Student Profile Skeleton ────────────────────────────────── */

export function StudentProfileSkeleton() {
  return (
    <div className="space-y-6" data-ocid="student_profile.loading_state">
      {/* Header row */}
      <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-48 rounded" />
            <SkeletonPill className="h-5 w-16" />
            <SkeletonPill className="h-5 w-10" />
            <SkeletonPill className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-64 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
      </div>

      {/* 4 metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["gpa", "attendance", "incidents", "commitments"].map((kpi) => (
          <div
            key={`skeleton-kpi-${kpi}`}
            className="relative rounded-xl border border-border bg-card p-4 space-y-2"
          >
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-16 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="absolute right-3 top-3 h-4 w-4 rounded" />
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <SkeletonTabBar count={6} />

      {/* Tab content — generic table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-32 rounded mb-4" />
        <SkeletonTable rows={5} cols={4} />
      </div>
    </div>
  );
}

/* ── 2. Class Detail Skeleton ───────────────────────────────────── */

export function ClassDetailSkeleton() {
  return (
    <div className="space-y-6" data-ocid="class_detail.loading_state">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-24 rounded" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded" />
            <Skeleton className="h-4 w-80 rounded" />
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 shrink-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-6 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <SkeletonTabBar count={5} />

      {/* Tab content */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-40 rounded mb-4" />
        <SkeletonTable rows={4} cols={5} />
      </div>
    </div>
  );
}

/* ── 3. Students List Skeleton ──────────────────────────────────── */

export function StudentsListSkeleton() {
  return (
    <div className="space-y-5" data-ocid="students.loading_state">
      {/* Search bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Filter chips */}
      <div className="flex gap-2">
        <SkeletonPill className="h-6 w-16" />
        <SkeletonPill className="h-6 w-20" />
        <SkeletonPill className="h-6 w-14" />
        <SkeletonPill className="h-6 w-18" />
      </div>

      {/* Table header */}
      <div className="flex gap-3 pb-2 border-b border-border px-1">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-8 rounded ml-auto" />
      </div>

      {/* Rows */}
      {["a", "b", "c", "d", "e", "f"].map((row) => (
        <div
          key={`skeleton-student-row-${row}`}
          className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
        >
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="hidden sm:block h-8 w-16 rounded" />
          <Skeleton className="hidden sm:block h-8 w-16 rounded" />
          <Skeleton className="hidden md:block h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ── 4. Teacher Today Skeleton ──────────────────────────────────── */

export function TeacherTodaySkeleton() {
  return (
    <div className="space-y-4" data-ocid="teacher_today.loading_state">
      {/* Greeting header */}
      <div className="space-y-1 mb-2">
        <Skeleton className="h-7 w-64 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Stat strip */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-2">
        {["messages", "grades", "attendance", "commitments"].map((stat) => (
          <div
            key={`skeleton-stat-${stat}`}
            className="flex items-center gap-1.5"
          >
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3 w-6 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {/* What Needs You Today */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <Skeleton className="h-5 w-40 rounded mb-3" />
          {["a", "b", "c", "d", "e"].map((sig) => (
            <div
              key={`skeleton-signal-${sig}`}
              className="flex gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <Skeleton className="h-3.5 w-3.5 rounded mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-48 rounded" />
                  <SkeletonPill className="h-4 w-14" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Today's Classes */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <Skeleton className="h-5 w-32 rounded mb-3" />
          {["p1", "p2", "p3", "p4"].map((period) => (
            <div
              key={`skeleton-class-${period}`}
              className="flex items-center justify-between py-2 px-1 border-b border-border/50 last:border-0"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-32 rounded" />
                  <SkeletonPill className="h-4 w-12" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-3.5 rounded ml-2 shrink-0" />
            </div>
          ))}
        </div>

        {/* At a Glance */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <Skeleton className="h-5 w-24 rounded mb-3" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {["g1", "g2", "g3"].map((glance) => (
              <div
                key={`skeleton-glance-${glance}`}
                className="flex items-center gap-1.5"
              >
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-6 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 5. Morning Picture Skeleton ────────────────────────────────── */

export function MorningPictureSkeleton() {
  return (
    <div className="space-y-4" data-ocid="morning_picture.loading_state">
      {/* Greeting */}
      <div className="space-y-1 mb-2">
        <Skeleton className="h-5 w-56 rounded" />
        <Skeleton className="h-3 w-48 rounded" />
      </div>

      {/* 4 tight metric cards */}
      <div className="flex flex-wrap gap-3">
        {["attendance", "grades", "behaviour", "commitments"].map((delta) => (
          <div
            key={`skeleton-delta-${delta}`}
            className="flex-1 min-w-[10rem] rounded-lg border border-border bg-card px-3 py-2.5 space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-3.5 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-6 w-12 rounded" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-6 w-12 rounded ml-auto" />
          </div>
        ))}
      </div>

      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* What's working */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-1">
          <Skeleton className="h-5 w-32 rounded mb-2" />
          {["w1", "w2", "w3", "w4", "w5"].map((item) => (
            <div
              key={`skeleton-working-${item}`}
              className="flex items-start gap-2 py-1.5 px-2"
            >
              <Skeleton className="h-4 w-4 rounded mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Needs a decision */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-1 border-l-4 border-l-warning">
          <Skeleton className="h-5 w-40 rounded mb-2" />
          {["d1", "d2", "d3", "d4", "d5"].map((item) => (
            <div
              key={`skeleton-decision-${item}`}
              className="flex items-start gap-2 py-1.5 px-2"
            >
              <Skeleton className="h-4 w-4 rounded mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-40 rounded" />
                  <SkeletonPill className="h-4 w-10" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
              </div>
              <Skeleton className="h-6 w-16 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Across the school today */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-3">
        <Skeleton className="h-5 w-48 rounded mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { panel: "attendance", rows: ["r1", "r2", "r3", "r4"] },
            { panel: "incidents", rows: ["r1", "r2", "r3", "r4"] },
            { panel: "commitments", rows: ["r1", "r2", "r3", "r4"] },
          ].map(({ panel, rows }) => (
            <div key={`skeleton-panel-${panel}`} className="space-y-2">
              <Skeleton className="h-3 w-28 rounded mb-2" />
              {rows.map((row) => (
                <div
                  key={`skeleton-panel-${panel}-row-${row}`}
                  className="flex items-center justify-between py-0.5"
                >
                  <Skeleton className="h-3 w-20 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-1.5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
