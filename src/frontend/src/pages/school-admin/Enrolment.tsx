import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudents } from "@/hooks/backend/students";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Mail,
  Plus,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type GradeFilter = "all" | "9" | "10" | "11" | "12";
type StatusFilter = "all" | "active" | "inactive" | "transferred" | "at-risk";

interface EnrolmentStudent {
  id: string;
  name: string;
  email: string;
  grade: number;
  status: "active" | "inactive" | "transferred";
  attendanceRate: number;
  gpa: number;
  counsellorName: string;
  teacherName: string;
  enrolledDate: string;
  flagged: boolean;
  firstName: string;
  lastName: string;
}

export default function EnrolmentPage() {
  const studentsQ = useStudents();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formGrade, setFormGrade] = useState("9");
  const [formCounsellor, setFormCounsellor] = useState("");

  const students: EnrolmentStudent[] = useMemo(() => {
    const raw = studentsQ.data ?? [];
    return raw.map((s) => {
      const name = s.name ?? `${s.firstName} ${s.lastName}`;
      return {
        id: s.id,
        name,
        email: s.guardians?.[0]?.email ?? "—",
        grade: s.grade ?? 9,
        status:
          (s.enrolmentStatus as "active" | "inactive" | "transferred") ??
          "active",
        attendanceRate: s.attendanceRate ?? 95,
        gpa: s.gpa ?? 3.0,
        counsellorName: s.counsellorId ?? "Unassigned",
        teacherName: "Unassigned",
        enrolledDate: "2024-09-01",
        flagged: (s.attendanceRate ?? 100) < 85 || (s.gpa ?? 4) < 2.0,
        firstName: s.firstName,
        lastName: s.lastName,
      };
    });
  }, [studentsQ.data]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        (s.name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        (s.email?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        (s.id ?? "").includes(search);
      const matchesGrade =
        gradeFilter === "all" || String(s.grade) === gradeFilter;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "at-risk"
            ? s.flagged
            : s.status === statusFilter;
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, search, gradeFilter, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: students.length,
      active: students.filter((s) => s.status === "active").length,
      inactive: students.filter((s) => s.status === "inactive").length,
      transferred: students.filter((s) => s.status === "transferred").length,
      atRisk: students.filter((s) => s.flagged).length,
    };
  }, [students]);

  const handleEnrol = () => {
    if (!formName.trim() || !formEmail.trim()) return;
    setFormName("");
    setFormEmail("");
    setFormGrade("9");
    setFormCounsellor("");
    setShowForm(false);
  };

  const isLoading = studentsQ.isLoading;

  if (isLoading) {
    return (
      <PageLayout
        title="Enrolment"
        subtitle="Student directory and registration"
        width="wide"
      >
        <Skeleton className="h-9 w-64 mb-6" />
        <Skeleton className="h-12 mb-4" />
        <Skeleton className="h-64" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Enrolment"
      subtitle="Student directory and registration"
      width="wide"
    >
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {counts.all}
          </span>
          <span className="text-xs text-muted-foreground">total</span>
        </SectionCard>
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <UserCheck className="size-4 text-success" />
          <span className="text-sm font-medium text-foreground">
            {counts.active}
          </span>
          <span className="text-xs text-muted-foreground">active</span>
        </SectionCard>
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <ShieldAlert className="size-4 text-destructive" />
          <span className="text-sm font-medium text-foreground">
            {counts.atRisk}
          </span>
          <span className="text-xs text-muted-foreground">at risk</span>
        </SectionCard>
        <SectionCard className="py-2 px-3 flex items-center gap-2">
          <GraduationCap className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {counts.transferred}
          </span>
          <span className="text-xs text-muted-foreground">transferred</span>
        </SectionCard>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="enrolment.search_input"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={gradeFilter}
            onValueChange={(val) => setGradeFilter(val as GradeFilter)}
          >
            <SelectTrigger data-ocid="enrolment.grade_filter">
              <SelectValue placeholder="All grades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grades</SelectItem>
              <SelectItem value="9">Grade 9</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="11">Grade 11</SelectItem>
              <SelectItem value="12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as StatusFilter)}
          >
            <SelectTrigger data-ocid="enrolment.status_filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="at-risk">At risk</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            data-ocid="enrolment.add_button"
          >
            <Plus className="size-4 mr-1" /> Enrol
          </Button>
        </div>
      </div>

      {/* Inline enrol form */}
      {showForm && (
        <SectionCard className="mb-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Enrol new student
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setShowForm(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Full name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Emma Rodriguez"
                data-ocid="enrolment.form.name"
              />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. emma@lincoln.edu"
                data-ocid="enrolment.form.email"
              />
            </div>
            <div>
              <Label className="text-xs">Grade</Label>
              <Select value={formGrade} onValueChange={setFormGrade}>
                <SelectTrigger
                  className="w-full"
                  data-ocid="enrolment.form.grade"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Assigned counsellor</Label>
              <Input
                value={formCounsellor}
                onChange={(e) => setFormCounsellor(e.target.value)}
                placeholder="e.g. Ms. Lee"
                data-ocid="enrolment.form.counsellor"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEnrol}
              disabled={!formName.trim() || !formEmail.trim()}
              data-ocid="enrolment.form.submit_button"
            >
              Enrol student
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Student table */}
      <SectionCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Counsellor</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Users className="size-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      No students found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search or filters.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student) => (
                  <TableRow
                    key={student.id}
                    className={
                      student.flagged ? "bg-destructive/10" : undefined
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(student.name ?? "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {student.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" /> {student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {student.grade}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={student.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          student.attendanceRate < 85
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {student.attendanceRate?.toFixed(0) ?? "—"}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          student.gpa < 2.0
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {student.gpa?.toFixed(2) ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.counsellorName ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.teacherName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() =>
                          setExpandedId(
                            expandedId === student.id ? null : student.id,
                          )
                        }
                        data-ocid={`enrolment.expand_button.${student.id}`}
                      >
                        {expandedId === student.id ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </PageLayout>
  );
}

function StatusBadge({
  status,
}: { status: "active" | "inactive" | "transferred" }) {
  const map = {
    active: { label: "Active", variant: "success" as const },
    inactive: { label: "Inactive", variant: "neutral" as const },
    transferred: { label: "Transferred", variant: "info" as const },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
