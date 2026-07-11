import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/backend/students";
import { useAppointments } from "@/hooks/backend/support";
import { useRoleStore } from "@/store/roleStore";
import { Calendar, Plus } from "lucide-react";
import { useState } from "react";

function groupByDate(items: any[]): Record<string, any[]> {
  return items.reduce<Record<string, any[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

export default function Appointments() {
  const { currentUser } = useRoleStore();
  const { data: students } = useStudents();
  const { data: appts = [], isLoading } = useAppointments(currentUser?.id);
  const studentName = (id: string) => {
    const s = (students ?? []).find((x: any) => x.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    date: "",
    time: "",
    purpose: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const withNames = appts.map((a: any) => ({
    ...a,
    studentName: studentName(a.studentId),
  }));
  const groups = groupByDate(withNames);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setShowForm(false);
    setForm({ studentName: "", date: "", time: "", purpose: "" });
  }

  return (
    <PageLayout>
      <PageHeader
        title="Appointments"
        subtitle="Upcoming counsellor appointments"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            data-ocid="appointments.add_button"
          >
            <Plus className="h-4 w-4 mr-1" /> Book Appointment
          </Button>
        }
      />
      {submitted && (
        <div
          className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
          data-ocid="appointments.success_state"
        >
          Appointment booked.
        </div>
      )}
      {showForm && (
        <SectionCard title="New Appointment" className="mb-4">
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            data-ocid="appointments.form"
          >
            <div>
              <Label
                className="block text-sm font-medium text-foreground mb-1"
                htmlFor="apt-student"
              >
                Student Name
              </Label>
              <Input
                id="apt-student"
                className="w-full"
                placeholder="Student name"
                value={form.studentName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentName: e.target.value }))
                }
                required
                data-ocid="appointments.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  className="block text-sm font-medium text-foreground mb-1"
                  htmlFor="apt-date"
                >
                  Date
                </Label>
                <Input
                  id="apt-date"
                  type="date"
                  className="w-full"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                  data-ocid="appointments.date_input"
                />
              </div>
              <div>
                <Label
                  className="block text-sm font-medium text-foreground mb-1"
                  htmlFor="apt-time"
                >
                  Time
                </Label>
                <Input
                  id="apt-time"
                  type="time"
                  className="w-full"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  required
                  data-ocid="appointments.time_input"
                />
              </div>
            </div>
            <div>
              <Label
                className="block text-sm font-medium text-foreground mb-1"
                htmlFor="apt-purpose"
              >
                Purpose
              </Label>
              <Input
                id="apt-purpose"
                className="w-full"
                placeholder="Purpose of appointment"
                value={form.purpose}
                onChange={(e) =>
                  setForm((f) => ({ ...f, purpose: e.target.value }))
                }
                required
                data-ocid="appointments.purpose_input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                data-ocid="appointments.submit_button"
              >
                Book
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                data-ocid="appointments.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <EmptyState icon={Calendar} title="No upcoming appointments" />
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([date, apts]) => (
            <SectionCard key={date} title={date}>
              <ul
                className="divide-y divide-border"
                data-ocid="appointments.list"
              >
                {apts.map((apt, i) => (
                  <li
                    key={apt.id}
                    className="py-3 flex items-center justify-between"
                    data-ocid={`appointments.item.${i + 1}`}
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {apt.studentName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.purpose}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {apt.time}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
