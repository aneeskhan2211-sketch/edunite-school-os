import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses, useLessons, useUnits } from "@/hooks/backend/courses";
import { Check, ChevronDown, ChevronRight, Pencil, X } from "lucide-react";
import { useState } from "react";

export default function CurriculumUnits() {
  const { data: courses = [], isLoading: loadingCourses } = useCourses();
  const { data: allUnits = [], isLoading: loadingUnits } = useUnits();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const isLoading = loadingCourses || loadingUnits;

  return (
    <PageLayout>
      <PageHeader title="Units" />
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-12 rounded-lg" />
          ))}
        </div>
      )}
      {!isLoading && allUnits.length === 0 && (
        <div className="text-center py-12 text-foreground/50">No units yet</div>
      )}
      {!isLoading &&
        courses.map((course: any) => {
          const units = allUnits.filter((u: any) => u.courseId === course.id);
          if (units.length === 0) return null;
          return (
            <div key={course.id} className="mb-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-foreground/60 border-b border-border pb-1 mb-2">
                {course.name}
              </div>
              <SectionCard className="divide-y divide-border">
                {units.map((unit: any) => (
                  <div key={unit.id}>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setExpandedId(expandedId === unit.id ? null : unit.id)
                        }
                        aria-label={
                          expandedId === unit.id ? "Collapse" : "Expand"
                        }
                      >
                        {expandedId === unit.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {editingId === unit.id ? (
                        <>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(null)}
                            aria-label="Save"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 font-medium text-sm">
                            {unit.title}
                          </span>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {unit.lessonCount ?? 0} lessons
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingId(unit.id);
                              setEditTitle(unit.title);
                            }}
                            aria-label="Edit unit"
                            className="ml-2"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    {expandedId === unit.id && <UnitLessons unitId={unit.id} />}
                  </div>
                ))}
              </SectionCard>
            </div>
          );
        })}
    </PageLayout>
  );
}

function UnitLessons({ unitId }: { unitId: string }) {
  const { data: lessons = [] } = useLessons(unitId);
  return (
    <div className="px-10 pb-3 space-y-1">
      {lessons.length === 0 && (
        <div className="text-xs text-foreground/40">
          No lessons in this unit
        </div>
      )}
      {lessons.map((l: any) => (
        <div key={l.id} className="text-sm text-foreground/70">
          {l.title}
        </div>
      ))}
    </div>
  );
}
