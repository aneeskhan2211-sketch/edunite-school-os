import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useCourses, useLessons, useUnits } from "@/hooks/backend/courses";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

function UnitRow({ unitId, courseId }: { unitId: string; courseId: string }) {
  const [expanded, setExpanded] = useState(false);
  const { data: lessons = [] } = useLessons(unitId);
  const { data: allUnits = [] } = useUnits(courseId);
  const unit = allUnits.find((u: any) => u.id === unitId);
  if (!unit) return null;
  return (
    <div className="ml-4 border-l border-border pl-3 mb-1">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm py-1 w-full text-left hover:text-primary"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span className="font-medium">{unit.title}</span>
        <span className="ml-auto text-xs text-foreground/50">
          {unit.lessonCount ?? lessons.length} lessons
        </span>
      </button>
      {expanded && (
        <div className="ml-4">
          {lessons.map((l: any) => (
            <div
              key={l.id}
              className="text-xs text-foreground/60 py-0.5 flex items-center gap-1"
            >
              <BookOpen className="h-3 w-3" /> {l.title}
            </div>
          ))}
          {lessons.length === 0 && (
            <div className="text-xs text-foreground/40 py-1">
              No lessons yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CurriculumCourses() {
  const { data: courses = [], isLoading } = useCourses();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <PageLayout>
      <PageHeader title="Courses" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-32" />
          ))}
        {!isLoading && courses.length === 0 && (
          <div className="col-span-3 text-center py-12 text-foreground/50">
            No courses yet
          </div>
        )}
        {!isLoading &&
          courses.map((c: any) => (
            <SectionCard key={c.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-base">{c.name}</div>
                  {c.code && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setExpandedId(expandedId === c.id ? null : c.id)
                  }
                  aria-label={expandedId === c.id ? "Collapse" : "Expand"}
                >
                  {expandedId === c.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {c.teacher && (
                <div className="text-sm text-foreground/60 mb-2">
                  {c.teacher}
                </div>
              )}
              {expandedId === c.id && (
                <div className="mt-2 border-t border-border pt-2">
                  <UnitList courseId={c.id} />
                </div>
              )}
            </SectionCard>
          ))}
      </div>
    </PageLayout>
  );
}

function UnitList({ courseId }: { courseId: string }) {
  const { data: units = [], isLoading } = useUnits(courseId);
  if (isLoading)
    return (
      <div className="text-xs text-foreground/50 py-2">Loading units...</div>
    );
  if (units.length === 0)
    return <div className="text-xs text-foreground/40 py-1">No units yet</div>;
  return (
    <div>
      {units.map((u: any) => (
        <UnitRow key={u.id} unitId={u.id} courseId={courseId} />
      ))}
    </div>
  );
}
