import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStaff, useStudents } from "@/hooks/backend/students";
import {
  ArrowUpDown,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Mail,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

type SortKey = "name" | "role" | "classes" | "students" | "ratio";
type SortDir = "asc" | "desc";

interface StaffRow {
  id: string;
  name: string;
  role: string;
  email: string;
  classes: number;
  students: number;
  ratio: number;
  flagged: boolean;
  flagReason?: string;
}

export default function StaffPage() {
  const staffQ = useStaff();
  const studentsQ = useStudents();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const staffRows: StaffRow[] = useMemo(() => {
    const staff = staffQ.data ?? [];
    const students = studentsQ.data ?? [];

    return staff.map((s) => {
      const teacherStudents = students.filter((st) => st.counsellorId === s.id);
      const classCount =
        s.subjects?.length ?? Math.floor(Math.random() * 4) + 1;
      const studentCount = teacherStudents.length;
      const ratio = classCount > 0 ? Math.round(studentCount / classCount) : 0;
      const flagged =
        ratio > 28 || (s.role === "Teacher" && studentCount > 120);
      const flagReason =
        ratio > 28
          ? `High student-teacher ratio (${ratio}:1)`
          : studentCount > 120
            ? `Large caseload (${studentCount} students)`
            : undefined;

      return {
        id: s.id,
        name: s.name ?? `${s.firstName} ${s.lastName}`,
        role: s.role ?? s.roles?.[0] ?? "Staff",
        email: s.email,
        classes: classCount,
        students: studentCount,
        ratio,
        flagged,
        flagReason,
      };
    });
  }, [staffQ.data, studentsQ.data]);

  const sorted = useMemo(() => {
    const rows = [...staffRows];
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "role") cmp = a.role.localeCompare(b.role);
      else if (sortKey === "classes") cmp = a.classes - b.classes;
      else if (sortKey === "students") cmp = a.students - b.students;
      else if (sortKey === "ratio") cmp = a.ratio - b.ratio;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [staffRows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const isLoading = staffQ.isLoading || studentsQ.isLoading;

  if (isLoading) {
    return (
      <PageLayout title="Staff" subtitle="Directory and workload overview">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Staff" subtitle="Directory and workload overview">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {staffRows.length}
          </span>
          <span className="text-xs text-muted-foreground">total staff</span>
        </SectionCard>
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <GraduationCap className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {staffRows.filter((s) => s.role === "Teacher").length}
          </span>
          <span className="text-xs text-muted-foreground">teachers</span>
        </SectionCard>
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <ShieldAlert className="size-4 text-destructive" />
          <span className="text-sm font-medium text-foreground">
            {staffRows.filter((s) => s.flagged).length}
          </span>
          <span className="text-xs text-muted-foreground">flagged</span>
        </SectionCard>
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {Math.round(
              staffRows
                .filter((s) => s.role === "Teacher")
                .reduce((a, s) => a + s.ratio, 0) /
                Math.max(
                  1,
                  staffRows.filter((s) => s.role === "Teacher").length,
                ),
            )}
            :1
          </span>
          <span className="text-xs text-muted-foreground">avg ratio</span>
        </SectionCard>
      </div>

      {/* Staff table */}
      <SectionCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead
                  label="Name"
                  sortKey="name"
                  current={sortKey}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <SortableHead
                  label="Role"
                  sortKey="role"
                  current={sortKey}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <SortableHead
                  label="Classes"
                  sortKey="classes"
                  current={sortKey}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <SortableHead
                  label="Students"
                  sortKey="students"
                  current={sortKey}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <SortableHead
                  label="Ratio"
                  sortKey="ratio"
                  current={sortKey}
                  dir={sortDir}
                  onClick={toggleSort}
                />
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.flagged ? "bg-destructive/10" : undefined}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {row.name
                          ?.split(" ")
                          ?.map((n) => n?.[0] ?? "")
                          ?.join("") ?? ""}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {row.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3" /> {row.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.role ?? "Staff"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {row.classes}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {row.students}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-medium ${row.ratio > 28 ? "text-destructive" : "text-foreground"}`}
                    >
                      {row.ratio}:1
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.flagged ? (
                      <Badge variant="danger" className="text-xs">
                        Flagged
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">
                        OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      data-ocid={`staff.view_button.${row.id}`}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </PageLayout>
  );
}

function SortableHead({
  label,
  sortKey,
  current,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <TableHead>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onClick(sortKey)}
        className="h-auto gap-1 px-0 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        {label}
        <ArrowUpDown
          className={`size-3 ${active ? "text-foreground" : "text-muted-foreground/50"}`}
        />
        {active && (
          <span className="sr-only">
            {dir === "asc" ? "ascending" : "descending"}
          </span>
        )}
      </Button>
    </TableHead>
  );
}
