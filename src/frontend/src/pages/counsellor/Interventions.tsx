import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/backend/students";
import { useInterventions } from "@/hooks/backend/support";
import { useRoleStore } from "@/store/roleStore";
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";

export default function Interventions() {
  const { currentUser } = useRoleStore();
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: interventions = [], isLoading: loadingInterventions } =
    useInterventions(currentUser?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    type: "",
    startDate: "",
    nextFollowUp: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const isLoading = loadingStudents || loadingInterventions;

  const studentName = (id: string) => {
    const s = (students ?? []).find((s) => s.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId) return;
    setSubmitted(true);
    setShowForm(false);
    setForm({ studentId: "", type: "", startDate: "", nextFollowUp: "" });
  }

  return (
    <PageLayout>
      <PageHeader
        title="Interventions"
        subtitle="Active interventions across your caseload"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            data-ocid="interventions.add_button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Intervention
          </Button>
        }
      />
      {submitted && (
        <div
          className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
          data-ocid="interventions.success_state"
        >
          Intervention added successfully.
        </div>
      )}
      {showForm && (
        <SectionCard title="New Intervention" className="mb-4">
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            data-ocid="interventions.form"
          >
            <div>
              <Label
                className="block text-sm font-medium text-foreground mb-1"
                htmlFor="int-student"
              >
                Student
              </Label>
              <Select
                value={form.studentId}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, studentId: val }))
                }
              >
                <SelectTrigger
                  id="int-student"
                  className="w-full"
                  data-ocid="interventions.select"
                >
                  <SelectValue placeholder="Select student…" />
                </SelectTrigger>
                <SelectContent>
                  {(students ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                className="block text-sm font-medium text-foreground mb-1"
                htmlFor="int-type"
              >
                Intervention Type
              </Label>
              <Input
                id="int-type"
                className="w-full"
                placeholder="e.g. Attendance Support"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                required
                data-ocid="interventions.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  className="block text-sm font-medium text-foreground mb-1"
                  htmlFor="int-start"
                >
                  Start Date
                </Label>
                <Input
                  id="int-start"
                  type="date"
                  className="w-full"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  required
                  data-ocid="interventions.start_input"
                />
              </div>
              <div>
                <Label
                  className="block text-sm font-medium text-foreground mb-1"
                  htmlFor="int-followup"
                >
                  Next Follow-up
                </Label>
                <Input
                  id="int-followup"
                  type="date"
                  className="w-full"
                  value={form.nextFollowUp}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nextFollowUp: e.target.value }))
                  }
                  required
                  data-ocid="interventions.followup_input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                data-ocid="interventions.submit_button"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                data-ocid="interventions.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
      <SectionCard>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : interventions.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No active interventions" />
        ) : (
          <ul className="divide-y divide-border" data-ocid="interventions.list">
            {interventions.map((int: any, i: number) => (
              <li
                key={int.id}
                className="py-4"
                data-ocid={`interventions.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {studentName(int.studentId)}
                    </p>
                    <p className="text-sm text-muted-foreground">{int.type}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Started {int.startDate}</p>
                    <p className="text-foreground">
                      Follow-up {int.nextFollowUp}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageLayout>
  );
}
