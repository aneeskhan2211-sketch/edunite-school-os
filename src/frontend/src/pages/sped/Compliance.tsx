import {
  PageHeader,
  PageLayout,
  SectionCard,
} from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useStudents } from "@/hooks/backend/students";
import { useComplianceItems } from "@/hooks/backend/support";
import { useRoleStore } from "@/store/roleStore";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface ComplianceItem {
  student: string;
  type: "Annual Review" | "Triennial" | "IEP Meeting" | "Progress Report";
  dueDate: string;
  daysToDeadline: number;
  status: "overdue" | "pending" | "complete";
  notes: string;
}

const DEMO_ITEMS: ComplianceItem[] = [
  {
    student: "Maya Okonkwo",
    type: "Annual Review",
    dueDate: "2026-06-12",
    daysToDeadline: -3,
    status: "overdue",
    notes: "",
  },
  {
    student: "Jordan Lee",
    type: "IEP Meeting",
    dueDate: "2026-06-18",
    daysToDeadline: 3,
    status: "pending",
    notes: "",
  },
  {
    student: "Marcus Thompson",
    type: "Progress Report",
    dueDate: "2026-06-20",
    daysToDeadline: 5,
    status: "pending",
    notes: "",
  },
  {
    student: "Aiden Kim",
    type: "Annual Review",
    dueDate: "2026-07-01",
    daysToDeadline: 16,
    status: "pending",
    notes: "",
  },
  {
    student: "Emma Johnson",
    type: "Triennial",
    dueDate: "2026-06-01",
    daysToDeadline: -14,
    status: "complete",
    notes: "Completed and filed",
  },
  {
    student: "Zoe Martinez",
    type: "IEP Meeting",
    dueDate: "2026-05-15",
    daysToDeadline: -31,
    status: "complete",
    notes: "Meeting held, IEP updated",
  },
];

function typeBadge(type: ComplianceItem["type"]) {
  switch (type) {
    case "Annual Review":
    case "Triennial":
      return <StatusBadge variant="info" label={type} />;
    case "IEP Meeting":
      return <StatusBadge variant="warning" label={type} />;
    case "Progress Report":
      return <StatusBadge variant="neutral" label={type} />;
  }
}

function statusBadge(status: ComplianceItem["status"]) {
  switch (status) {
    case "complete":
      return <StatusBadge variant="success" label="Complete" />;
    case "pending":
      return <StatusBadge variant="info" label="Pending" />;
    case "overdue":
      return <StatusBadge variant="danger" label="Overdue" />;
  }
}

function daysCell(days: number) {
  if (days < 0) {
    return (
      <span className="text-destructive font-medium">
        {Math.abs(days)} days overdue
      </span>
    );
  }
  if (days <= 7) {
    return <span className="text-warning font-medium">in {days} days</span>;
  }
  return <span className="text-muted-foreground">in {days} days</span>;
}

function KPICard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant?: "danger" | "warning" | "success";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-foreground font-display">
          {value}
        </span>
        {variant ? <StatusBadge variant={variant} label={label} /> : null}
      </div>
    </div>
  );
}

export default function Compliance() {
  const [filter, setFilter] = useState<
    "all" | "overdue" | "due-this-week" | "upcoming"
  >("all");
  const { currentUser } = useRoleStore();
  const { data: students } = useStudents();
  const { data: fetched = [], isLoading } = useComplianceItems(currentUser?.id);
  const [items, setItems] = useState<ComplianceItem[]>(DEMO_ITEMS);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editStatus, setEditStatus] =
    useState<ComplianceItem["status"]>("pending");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if ((fetched as any[]).length === 0) return;
    const byId = new Map((students ?? []).map((s: any) => [s.id, s]));
    setItems(
      (fetched as any[]).map((it) => {
        const s = byId.get(it.studentId) as any;
        return {
          ...it,
          student: s ? `${s.firstName} ${s.lastName}` : it.studentId,
        };
      }),
    );
  }, [fetched, students]);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "overdue") return item.status === "overdue";
    if (filter === "due-this-week")
      return item.daysToDeadline >= 0 && item.daysToDeadline <= 7;
    if (filter === "upcoming")
      return item.daysToDeadline > 7 && item.status !== "complete";
    return true;
  });

  const total = items.length;
  const overdueCount = items.filter((i) => i.status === "overdue").length;
  const dueThisWeekCount = items.filter(
    (i) =>
      i.daysToDeadline >= 0 && i.daysToDeadline <= 7 && i.status !== "complete",
  ).length;
  const completeCount = items.filter((i) => i.status === "complete").length;

  function handleSave(index: number) {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      status: editStatus,
      notes: editNotes,
    };
    setItems(updated);
    setEditingRow(null);
  }

  const tabs = [
    { key: "all" as const, label: "All" },
    { key: "overdue" as const, label: "Overdue" },
    { key: "due-this-week" as const, label: "Due This Week" },
    { key: "upcoming" as const, label: "Upcoming" },
  ];

  return (
    <PageLayout width="wide">
      <PageHeader title="Compliance Tracker" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total" value={total} />
        <KPICard label="Overdue" value={overdueCount} variant="danger" />
        <KPICard
          label="Due This Week"
          value={dueThisWeekCount}
          variant="warning"
        />
        <KPICard label="Complete" value={completeCount} variant="success" />
      </div>

      <SectionCard>
        <div className="flex gap-2 mb-4" data-ocid="compliance.filter.tabs">
          {tabs.map((t) => (
            <Button
              key={t.key}
              type="button"
              variant={filter === t.key ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFilter(t.key);
                setEditingRow(null);
              }}
              data-ocid={`compliance.filter.tab.${t.key}`}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Skeleton
                key={`comp-sk-${n}`}
                className="h-14 w-full rounded-lg"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No compliance items found"
            description="Compliance items will appear here when created."
          />
        ) : (
          <Table data-ocid="compliance.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days to Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, i) => {
                const isEditing = editingRow === i;
                return (
                  <TableRow
                    key={item.student + item.type}
                    className="hover:bg-muted/40 transition-colors"
                    data-ocid={`compliance.row.${i + 1}`}
                  >
                    <TableCell className="font-medium text-foreground">
                      {item.student}
                    </TableCell>
                    <TableCell>{typeBadge(item.type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.dueDate}
                    </TableCell>
                    <TableCell>{daysCell(item.daysToDeadline)}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs">
                      {item.notes || "—"}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2 min-w-[200px]">
                          <Select
                            value={editStatus}
                            onValueChange={(val) =>
                              setEditStatus(val as ComplianceItem["status"])
                            }
                          >
                            <SelectTrigger
                              className="w-full"
                              data-ocid={`compliance.status_select.${i + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="complete">Complete</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add notes..."
                            rows={2}
                            className="w-full"
                            data-ocid={`compliance.notes_input.${i + 1}`}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => handleSave(i)}
                              data-ocid={`compliance.save_button.${i + 1}`}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingRow(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRow(i);
                            setEditStatus(item.status);
                            setEditNotes(item.notes);
                          }}
                          data-ocid={`compliance.update_button.${i + 1}`}
                        >
                          Update Status
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </PageLayout>
  );
}
