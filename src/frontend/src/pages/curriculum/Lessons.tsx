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

export default function CurriculumLessons() {
  const { data: courses = [], isLoading: lc } = useCourses();
  const { data: allUnits = [], isLoading: lu } = useUnits();
  const { data: lessons = [], isLoading: ll } = useLessons();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const isLoading = lc || lu || ll;

  const _getCourse = (id: string) => courses.find((c: any) => c.id === id);
  const getUnit = (id: string) => allUnits.find((u: any) => u.id === id);

  return (
    <PageLayout>
      <PageHeader title="Lessons" />
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-12 rounded-lg" />
          ))}
        </div>
      )}
      {!isLoading && lessons.length === 0 && (
        <div className="text-center py-12 text-foreground/50">
          No lessons yet
        </div>
      )}
      {!isLoading &&
        courses.map((course: any) => {
          const courseLessons = lessons.filter(
            (l: any) => l.courseId === course.id,
          );
          if (courseLessons.length === 0) return null;
          return (
            <div key={course.id} className="mb-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-foreground/60 border-b border-border pb-1 mb-2">
                {course.name}
              </div>
              <SectionCard className="divide-y divide-border">
                {courseLessons.map((lesson: any) => {
                  const unit = getUnit(lesson.unitId);
                  return (
                    <div key={lesson.id}>
                      <div className="flex items-center gap-2 px-4 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setExpandedId(
                              expandedId === lesson.id ? null : lesson.id,
                            )
                          }
                          aria-label={
                            expandedId === lesson.id ? "Collapse" : "Expand"
                          }
                        >
                          {expandedId === lesson.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        {editingId === lesson.id ? (
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
                              {lesson.title}
                            </span>
                            {unit && (
                              <span className="text-xs text-foreground/50">
                                {unit.title}
                              </span>
                            )}
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">
                              {lesson.assignmentIds?.length ?? 0} assignments
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingId(lesson.id);
                                setEditTitle(lesson.title);
                              }}
                              aria-label="Edit lesson"
                              className="ml-2"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      {expandedId === lesson.id && (
                        <div className="px-10 pb-3">
                          <p className="text-sm text-foreground/70">
                            {lesson.description || "No description available."}
                          </p>
                          {lesson.assignmentIds?.length > 0 ? (
                            <div className="mt-2 text-xs text-foreground/50">
                              {lesson.assignmentIds.length} linked assignment(s)
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-foreground/40">
                              No linked assignments
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </SectionCard>
            </div>
          );
        })}
    </PageLayout>
  );
}
