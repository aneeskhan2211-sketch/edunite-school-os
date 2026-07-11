import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useUpdateAssignment,
} from "@/hooks/backend/assignments";
import { useTeacherCourses } from "@/hooks/backend/courses";
import { useRoleStore } from "@/store/roleStore";
import type { Assignment } from "@/types";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function AssignmentForm({
  initial,
  courseId,
  onSave,
  onCancel,
}: {
  initial?: Partial<Assignment>;
  courseId: string;
  onSave: (data: Omit<Assignment, "id">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [weight, setWeight] = useState(String(initial?.weight ?? 0.1));
  const [maxPoints, setMaxPoints] = useState(String(initial?.maxPoints ?? 100));
  const [isHighStakes, setIsHighStakes] = useState(
    initial?.isHighStakes ?? false,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      courseId,
      title: title.trim(),
      dueDate,
      weight: Number(weight) || 0,
      maxPoints: Number(maxPoints) || 0,
      isHighStakes,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-border bg-background p-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="a-title">Title</Label>
          <Input
            id="a-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 5 Test"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="a-due">Due Date</Label>
          <Input
            id="a-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="a-weight">Weight</Label>
          <Input
            id="a-weight"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="a-points">Max Points</Label>
          <Input
            id="a-points"
            type="number"
            min="1"
            value={maxPoints}
            onChange={(e) => setMaxPoints(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="a-stakes"
          checked={isHighStakes}
          onCheckedChange={(checked: boolean) => setIsHighStakes(checked)}
        />
        <Label htmlFor="a-stakes" className="text-sm font-normal">
          High-stakes assessment (&gt;15%)
        </Label>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          data-ocid="assignments.form.save_button"
        >
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          data-ocid="assignments.form.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function TeacherAssignments() {
  const { currentUser } = useRoleStore();
  const { data: courses, isLoading: loadingCourses } = useTeacherCourses(
    currentUser?.id,
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const courseId = selectedCourseId || courses?.[0]?.id || "";

  const { data: allAssignments, isLoading: loadingAssignments } =
    useAssignments();
  const assignments =
    allAssignments?.filter((a) => a.courseId === courseId) ?? [];

  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState("");

  const course = courses?.find((c) => c.id === courseId);

  const handleCreate = (data: Omit<Assignment, "id">) => {
    setActionError("");
    createAssignment.mutate(data, {
      onSuccess: () => setCreating(false),
      onError: (err: any) => setActionError(err?.message ?? "Failed to create"),
    });
  };

  const handleUpdate = (id: string, data: Omit<Assignment, "id">) => {
    setActionError("");
    updateAssignment.mutate(
      { id, ...data },
      {
        onSuccess: () => setEditingId(null),
        onError: (err: any) =>
          setActionError(err?.message ?? "Failed to update"),
      },
    );
  };

  const handleDelete = (id: string) => {
    setActionError("");
    deleteAssignment.mutate(id, {
      onError: (err: any) => setActionError(err?.message ?? "Failed to delete"),
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Assignments"
        subtitle="Create and manage assignments for your courses"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setCreating(true);
              setEditingId(null);
              setActionError("");
            }}
            data-ocid="assignments.create_button"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Assignment
          </Button>
        }
      />

      {/* Course selector */}
      {loadingCourses ? (
        <SkeletonCard lines={1} className="mb-5 w-64" />
      ) : (
        <div
          className="flex gap-2 mb-5 flex-wrap"
          data-ocid="assignments.course_tabs"
        >
          {courses?.map((c, i) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={courseId === c.id ? "default" : "outline"}
              onClick={() => {
                setSelectedCourseId(c.id);
                setEditingId(null);
                setCreating(false);
              }}
              data-ocid={`assignments.course_tab.${i + 1}`}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}

      {actionError && (
        <p className="mb-4 text-sm text-destructive">{actionError}</p>
      )}

      {creating && courseId && (
        <div className="mb-5">
          <AssignmentForm
            courseId={courseId}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {loadingAssignments ? (
        <div className="space-y-3">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
      ) : !assignments.length ? (
        <EmptyState
          icon={FileText}
          title="No assignments yet"
          description={`Create the first assignment for ${course?.name ?? "this course"}.`}
          action={{
            label: "Create assignment",
            onClick: () => {
              setCreating(true);
              setEditingId(null);
            },
          }}
        />
      ) : (
        <SectionCard
          title={`${assignments.length} Assignments — ${course?.name}`}
        >
          <div className="space-y-3" data-ocid="assignments.list">
            {assignments.map((a, i) => {
              const isEditing = editingId === a.id;
              return (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-background p-4"
                  data-ocid={`assignments.item.${i + 1}`}
                >
                  {isEditing ? (
                    <AssignmentForm
                      initial={a}
                      courseId={a.courseId}
                      onSave={(data) => handleUpdate(a.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground">
                            {a.title}
                          </h3>
                          {a.isHighStakes && (
                            <StatusBadge
                              variant="warning"
                              label="High Stakes"
                            />
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Due {a.dueDate}</span>
                          <span>•</span>
                          <span>
                            Weight {((a.weight ?? 0) * 100).toFixed(0)}%
                          </span>
                          <span>•</span>
                          <span>{a.maxPoints} pts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(a.id);
                            setCreating(false);
                          }}
                          aria-label="Edit assignment"
                          data-ocid={`assignments.edit_button.${i + 1}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(a.id)}
                          aria-label="Delete assignment"
                          data-ocid={`assignments.delete_button.${i + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </PageLayout>
  );
}
