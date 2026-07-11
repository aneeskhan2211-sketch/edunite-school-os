import { PageLayout, SectionCard } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudents } from "@/hooks/backend/students";
import { useRoleStore } from "@/store/roleStore";
import type { Student } from "@/types";
import {
  Bus,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  MapPin,
  Medal,
  Music,
  Palette,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";

interface Activity {
  id: string;
  name: string;
  actType: "sport" | "club" | "fineArts" | "serviceHours";
  season?: string;
  coachAdvisor: string;
  eligibilityGpaMin: number;
  eligibilityAttendanceMin: number;
  maxRoster?: number;
  roster: ActivityRosterEntry[];
}

interface ActivityRosterEntry {
  studentId: string;
  role: "member" | "leader" | "captain";
  joinedAt: string;
  status: "active" | "inactive" | "waitlisted";
}

const DEMO_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    name: "Varsity Basketball",
    actType: "sport",
    season: "Winter",
    coachAdvisor: "Coach Williams",
    eligibilityGpaMin: 2.0,
    eligibilityAttendanceMin: 0.85,
    maxRoster: 15,
    roster: [
      {
        studentId: "s1",
        role: "captain",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s2",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s3",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s4",
        role: "member",
        joinedAt: "2023-09-01",
        status: "waitlisted",
      },
    ],
  },
  {
    id: "a2",
    name: "Soccer",
    actType: "sport",
    season: "Fall",
    coachAdvisor: "Coach Davis",
    eligibilityGpaMin: 2.0,
    eligibilityAttendanceMin: 0.85,
    maxRoster: 22,
    roster: [
      {
        studentId: "s5",
        role: "captain",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s6",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s4",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
  {
    id: "a3",
    name: "Track & Field",
    actType: "sport",
    season: "Spring",
    coachAdvisor: "Coach Thompson",
    eligibilityGpaMin: 2.0,
    eligibilityAttendanceMin: 0.85,
    roster: [
      {
        studentId: "s1",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s5",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
  {
    id: "a4",
    name: "Robotics Club",
    actType: "club",
    coachAdvisor: "Ms. Patel",
    eligibilityGpaMin: 2.0,
    eligibilityAttendanceMin: 0.8,
    roster: [
      {
        studentId: "s1",
        role: "leader",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s3",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s6",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
  {
    id: "a5",
    name: "Debate Team",
    actType: "club",
    coachAdvisor: "Mr. Kim",
    eligibilityGpaMin: 2.5,
    eligibilityAttendanceMin: 0.85,
    roster: [
      {
        studentId: "s2",
        role: "leader",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s4",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
  {
    id: "a6",
    name: "Student Council",
    actType: "club",
    coachAdvisor: "Ms. Nguyen",
    eligibilityGpaMin: 2.5,
    eligibilityAttendanceMin: 0.9,
    roster: [
      {
        studentId: "s4",
        role: "leader",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s5",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
  {
    id: "a7",
    name: "Environmental Club",
    actType: "club",
    coachAdvisor: "Mr. Walsh",
    eligibilityGpaMin: 2.0,
    eligibilityAttendanceMin: 0.8,
    roster: [
      {
        studentId: "s6",
        role: "leader",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s3",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
  {
    id: "a8",
    name: "Symphony Orchestra",
    actType: "fineArts",
    season: "Year-round",
    coachAdvisor: "Ms. Chen",
    eligibilityGpaMin: 2.0,
    eligibilityAttendanceMin: 0.8,
    roster: [
      {
        studentId: "s2",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s4",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s6",
        role: "member",
        joinedAt: "2023-09-01",
        status: "active",
      },
      {
        studentId: "s1",
        role: "leader",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
  },
];

interface ServiceHourEntry {
  id: string;
  studentId: string;
  studentName: string;
  activity?: string;
  description: string;
  hours: number;
  date: string;
}

const DEMO_SERVICE_HOURS: ServiceHourEntry[] = [
  {
    id: "sh1",
    studentId: "s1",
    studentName: "Jordan Ellis",
    activity: "Robotics Club",
    description: "Community demo at library",
    hours: 4,
    date: "2024-01-15",
  },
  {
    id: "sh2",
    studentId: "s2",
    studentName: "Maya Okonkwo",
    activity: "Debate Team",
    description: "Judged middle school tournament",
    hours: 3,
    date: "2024-01-20",
  },
  {
    id: "sh3",
    studentId: "s4",
    studentName: "Priya Sharma",
    description: "Tutored after school",
    hours: 6,
    date: "2024-02-01",
  },
  {
    id: "sh4",
    studentId: "s3",
    studentName: "Tyler Reyes",
    activity: "Symphony Orchestra",
    description: "Performed at senior center",
    hours: 2,
    date: "2024-02-10",
  },
  {
    id: "sh5",
    studentId: "s5",
    studentName: "Marcus Brown",
    description: "Park cleanup",
    hours: 5,
    date: "2024-02-15",
  },
];

type SlipStatus = "unsigned" | "signed" | "declined" | "costBarrier";

interface PermissionSlip {
  id: string;
  tripId: string;
  studentId: string;
  studentName: string;
  status: SlipStatus;
  signedAt?: string;
  signedBy?: string;
}

interface FieldTrip {
  id: string;
  name: string;
  date: string;
  destination: string;
  permissionSlipRequired: boolean;
  cost?: number;
  approvalStatus: "pending" | "approved" | "cancelled";
  slips: PermissionSlip[];
}

const DEMO_FIELD_TRIPS: FieldTrip[] = [
  {
    id: "ft1",
    name: "Science Museum Visit",
    date: "2024-03-15",
    destination: "City Science Museum",
    permissionSlipRequired: true,
    cost: 12,
    approvalStatus: "approved",
    slips: [
      {
        id: "ps1",
        tripId: "ft1",
        studentId: "s1",
        studentName: "Jordan Ellis",
        status: "signed",
        signedAt: "2024-03-01",
        signedBy: "Sandra Ellis",
      },
      {
        id: "ps2",
        tripId: "ft1",
        studentId: "s2",
        studentName: "Maya Okonkwo",
        status: "signed",
        signedAt: "2024-03-02",
        signedBy: "Adaeze Okonkwo",
      },
      {
        id: "ps3",
        tripId: "ft1",
        studentId: "s3",
        studentName: "Tyler Reyes",
        status: "unsigned",
      },
      {
        id: "ps4",
        tripId: "ft1",
        studentId: "s4",
        studentName: "Priya Sharma",
        status: "costBarrier",
      },
      {
        id: "ps5",
        tripId: "ft1",
        studentId: "s5",
        studentName: "Marcus Brown",
        status: "signed",
        signedAt: "2024-03-01",
        signedBy: "Patricia Brown",
      },
    ],
  },
  {
    id: "ft2",
    name: "Historical Landmark Tour",
    date: "2024-05-20",
    destination: "Old Town Historic District",
    permissionSlipRequired: true,
    cost: 8,
    approvalStatus: "pending",
    slips: [
      {
        id: "ps6",
        tripId: "ft2",
        studentId: "s1",
        studentName: "Jordan Ellis",
        status: "unsigned",
      },
      {
        id: "ps7",
        tripId: "ft2",
        studentId: "s2",
        studentName: "Maya Okonkwo",
        status: "unsigned",
      },
      {
        id: "ps8",
        tripId: "ft2",
        studentId: "s6",
        studentName: "Aisha Williams",
        status: "unsigned",
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────

function studentDisplayName(s: Student): string {
  return `${s.firstName} ${s.lastName}`;
}

function checkEligibility(
  student: Student,
  gpaMin: number,
  attendanceMin: number,
): { eligible: true } | { eligible: false; reason: string } {
  if ((student.gpa ?? 0) < gpaMin) {
    return {
      eligible: false,
      reason: `GPA ${(student.gpa ?? 0).toFixed(1)} / required ${gpaMin.toFixed(1)}`,
    };
  }
  // attendanceRate in DEMO_STUDENTS is 0-100 (e.g. 96), eligibilityAttendanceMin is 0-1 (e.g. 0.85)
  const attendanceFraction = (student.attendanceRate ?? 0) / 100;
  if (attendanceFraction < attendanceMin) {
    return {
      eligible: false,
      reason: `Attendance ${student.attendanceRate ?? 0}% / required ${Math.round(attendanceMin * 100)}%`,
    };
  }
  return { eligible: true };
}

function slipStatusVariant(
  status: SlipStatus,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "signed":
      return "success";
    case "unsigned":
      return "warning";
    case "declined":
      return "danger";
    case "costBarrier":
      return "info";
    default:
      return "neutral";
  }
}

function slipStatusLabel(status: SlipStatus): string {
  switch (status) {
    case "signed":
      return "Signed";
    case "unsigned":
      return "Unsigned";
    case "declined":
      return "Declined";
    case "costBarrier":
      return "Cost Barrier";
    default:
      return status;
  }
}

// ── Sub-components ──────────────────────────────────────────────────────

function ActivityCard({
  activity,
  students,
}: {
  activity: Activity;
  students: Student[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const { currentRole } = useRoleStore();
  const isAdmin = currentRole === "schoolAdmin";

  const activeCount = activity.roster.filter(
    (r) => r.status === "active",
  ).length;

  function getStudent(id: string) {
    return students.find((s) => s.id === id);
  }

  const typeIcon =
    activity.actType === "sport" ? (
      <Trophy className="h-4 w-4" />
    ) : activity.actType === "club" ? (
      <Users className="h-4 w-4" />
    ) : activity.actType === "fineArts" ? (
      <Music className="h-4 w-4" />
    ) : (
      <Palette className="h-4 w-4" />
    );

  return (
    <Card className="transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              {typeIcon}
            </div>
            <div>
              <CardTitle className="text-base">{activity.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {activity.season ? `${activity.season} · ` : ""}
                {activity.coachAdvisor}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {activeCount}
            {activity.maxRoster ? ` / ${activity.maxRoster}` : ""} members
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="neutral" className="text-[10px]">
            GPA ≥ {(activity.eligibilityGpaMin ?? 0).toFixed(1)}
          </Badge>
          <Badge variant="neutral" className="text-[10px]">
            Attendance ≥{" "}
            {Math.round((activity.eligibilityAttendanceMin ?? 0) * 100)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
          className="h-auto w-full justify-between px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
          data-ocid={`activity.${activity.id}.view_roster_button`}
        >
          <span>View Roster</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {expanded ? (
          <div className="mt-3 space-y-2">
            {activity.roster.map((entry) => {
              const student = getStudent(entry.studentId);
              if (!student) return null;
              const eligibility = checkEligibility(
                student,
                activity.eligibilityGpaMin,
                activity.eligibilityAttendanceMin,
              );
              const badgeVariant =
                entry.status === "waitlisted"
                  ? "warning"
                  : !eligibility.eligible
                    ? "danger"
                    : "success";
              const badgeLabel =
                entry.status === "waitlisted"
                  ? "Waitlisted"
                  : !eligibility.eligible
                    ? "Ineligible"
                    : "Eligible";

              return (
                <div
                  key={entry.studentId}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  data-ocid={`activity.${activity.id}.roster.${entry.studentId}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {studentDisplayName(student)}
                    </span>
                    {entry.role !== "member" ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.role === "captain" ? "Captain" : "Leader"}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="group relative">
                    <Badge variant={badgeVariant} className="text-[10px]">
                      {badgeLabel}
                    </Badge>
                    {!eligibility.eligible ? (
                      <div className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden w-max max-w-[200px] rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block border border-border">
                        {eligibility.reason}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {isAdmin ? (
              <div className="pt-2">
                {!showEnroll ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEnroll(true)}
                    data-ocid={`activity.${activity.id}.enroll_button`}
                  >
                    Enroll Student
                  </Button>
                ) : (
                  <div className="flex items-end gap-2 rounded-lg border border-border p-3">
                    <div className="flex-1">
                      <Label className="text-xs">Student</Label>
                      <Select
                        value={selectedStudent}
                        onValueChange={setSelectedStudent}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {(students ?? []).map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {studentDisplayName(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!selectedStudent}
                      onClick={() => {
                        setShowEnroll(false);
                        setSelectedStudent("");
                      }}
                      data-ocid={`activity.${activity.id}.confirm_enroll_button`}
                    >
                      Enroll
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowEnroll(false);
                        setSelectedStudent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ServiceHoursTab({ students }: { students: Student[] }) {
  const { currentRole, currentUser } = useRoleStore();
  const isStudent = currentRole === "student";
  const isAdmin = currentRole === "schoolAdmin";
  const canLog = isStudent || isAdmin;

  const [entries, setEntries] =
    useState<ServiceHourEntry[]>(DEMO_SERVICE_HOURS);
  const [form, setForm] = useState({
    studentId: isStudent && currentUser ? currentUser.id : "",
    activity: "",
    description: "",
    hours: "",
  });

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  const leaderboard = [...entries]
    .reduce<{ studentId: string; studentName: string; total: number }[]>(
      (acc, e) => {
        const existing = acc.find((a) => a.studentId === e.studentId);
        if (existing) {
          existing.total += e.hours;
        } else {
          acc.push({
            studentId: e.studentId,
            studentName: e.studentName,
            total: e.hours,
          });
        }
        return acc;
      },
      [],
    )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const myEntries =
    isStudent && currentUser
      ? entries.filter((e) => e.studentId === currentUser.id)
      : [];

  function handleLog() {
    const hours = Number.parseFloat(form.hours);
    if (
      !form.studentId ||
      !form.description ||
      Number.isNaN(hours) ||
      hours <= 0
    )
      return;
    const student = (students ?? []).find((s) => s.id === form.studentId);
    if (!student) return;
    const newEntry: ServiceHourEntry = {
      id: `sh-${Date.now()}`,
      studentId: form.studentId,
      studentName: studentDisplayName(student),
      activity: form.activity || undefined,
      description: form.description,
      hours,
      date: new Date().toISOString().slice(0, 10),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setForm({
      studentId: isStudent && currentUser ? currentUser.id : "",
      activity: "",
      description: "",
      hours: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-xs text-muted-foreground">
                Total Hours Logged
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {canLog ? (
        <SectionCard title="Log Hours">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {!isStudent ? (
              <div>
                <Label className="text-xs">Student</Label>
                <Select
                  value={form.studentId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, studentId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {(students ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {studentDisplayName(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div>
              <Label className="text-xs">Activity (optional)</Label>
              <Input
                value={form.activity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, activity: e.target.value }))
                }
                placeholder="e.g. Robotics Club"
              />
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What did you do?"
              />
            </div>
            <div>
              <Label className="text-xs">Hours</Label>
              <Input
                type="number"
                min={0.5}
                step={0.5}
                value={form.hours}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hours: e.target.value }))
                }
                placeholder="0.0"
              />
            </div>
          </div>
          <div className="mt-3">
            <Button
              type="button"
              onClick={handleLog}
              disabled={!form.studentId || !form.description || !form.hours}
              data-ocid="service_hours.log_button"
            >
              Log Hours
            </Button>
          </div>
        </SectionCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Student Leaderboard">
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.studentId}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                data-ocid={`service_hours.leaderboard.item.${idx + 1}`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {entry.studentName}
                  </span>
                </div>
                <span className="text-sm font-semibold">{entry.total} hrs</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {isStudent ? (
          <SectionCard title="My Service Hours">
            <div className="space-y-2">
              {myEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hours logged yet.
                </p>
              ) : (
                myEntries.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      {e.activity ? (
                        <p className="text-xs text-muted-foreground">
                          {e.activity}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{e.hours} hrs</p>
                      <p className="text-xs text-muted-foreground">{e.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Recent Entries">
            <div className="space-y-2">
              {entries.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{e.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{e.hours} hrs</p>
                    <p className="text-xs text-muted-foreground">{e.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function FieldTripsTab() {
  const { currentRole } = useRoleStore();
  const isAdmin = currentRole === "schoolAdmin" || currentRole === "teacher";
  const isParent = currentRole === "parent";
  const [trips, setTrips] = useState<FieldTrip[]>(DEMO_FIELD_TRIPS);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  function toggleTrip(tripId: string) {
    setExpandedTrip((id) => (id === tripId ? null : tripId));
  }

  function updateSlip(tripId: string, slipId: string, newStatus: SlipStatus) {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              slips: t.slips.map((s) =>
                s.id === slipId
                  ? {
                      ...s,
                      status: newStatus,
                      signedAt:
                        newStatus === "signed"
                          ? new Date().toISOString().slice(0, 10)
                          : undefined,
                      signedBy:
                        newStatus === "signed" ? "Parent Guardian" : undefined,
                    }
                  : s,
              ),
            }
          : t,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => {
        const signed = trip.slips.filter((s) => s.status === "signed").length;
        const unsigned = trip.slips.filter(
          (s) => s.status === "unsigned",
        ).length;
        const costBarrier = trip.slips.filter(
          (s) => s.status === "costBarrier",
        ).length;
        const expanded = expandedTrip === trip.id;

        return (
          <Card key={trip.id} className="transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Bus className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{trip.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {trip.date}
                      </span>
                      {trip.cost ? (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />${trip.cost}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    trip.approvalStatus === "approved"
                      ? "success"
                      : trip.approvalStatus === "pending"
                        ? "warning"
                        : "danger"
                  }
                >
                  {trip.approvalStatus === "approved"
                    ? "Approved"
                    : trip.approvalStatus === "pending"
                      ? "Pending"
                      : "Cancelled"}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="success" className="text-[10px]">
                  {signed} signed
                </Badge>
                <Badge variant="warning" className="text-[10px]">
                  {unsigned} unsigned
                </Badge>
                {costBarrier > 0 ? (
                  <Badge variant="info" className="text-[10px]">
                    {costBarrier} cost barrier
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleTrip(trip.id)}
                className="h-auto w-full justify-between px-2 py-1.5 text-sm font-medium text-primary hover:bg-primary/5"
                data-ocid={`field_trip.${trip.id}.view_slips_button`}
              >
                <span>Permission Slips</span>
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {expanded ? (
                <div className="mt-3 space-y-2">
                  {trip.slips.map((slip) => (
                    <div
                      key={slip.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                      data-ocid={`field_trip.${trip.id}.slip.${slip.studentId}`}
                    >
                      <span className="text-sm font-medium">
                        {slip.studentName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={slipStatusVariant(slip.status)}
                          className="text-[10px]"
                        >
                          {slipStatusLabel(slip.status)}
                        </Badge>
                        {isAdmin ? (
                          <div className="flex gap-1">
                            {slip.status !== "signed" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  updateSlip(trip.id, slip.id, "signed")
                                }
                                data-ocid={`field_trip.${trip.id}.mark_signed_button.${slip.studentId}`}
                              >
                                Mark Signed
                              </Button>
                            ) : null}
                            {slip.status !== "costBarrier" ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  updateSlip(trip.id, slip.id, "costBarrier")
                                }
                                data-ocid={`field_trip.${trip.id}.flag_cost_button.${slip.studentId}`}
                              >
                                Flag Cost
                              </Button>
                            ) : null}
                          </div>
                        ) : isParent ? (
                          slip.status === "unsigned" ? (
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() =>
                                updateSlip(trip.id, slip.id, "signed")
                              }
                              data-ocid={`field_trip.${trip.id}.sign_button.${slip.studentId}`}
                            >
                              Sign Permission Slip
                            </Button>
                          ) : null
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const { data: students = [] } = useStudents();
  const sports = DEMO_ACTIVITIES.filter((a) => a.actType === "sport");
  const clubs = DEMO_ACTIVITIES.filter((a) => a.actType === "club");
  const fineArts = DEMO_ACTIVITIES.filter((a) => a.actType === "fineArts");

  return (
    <PageLayout
      title="Extracurriculars"
      subtitle="Sports, clubs, fine arts, service hours, and field trips"
      width="wide"
    >
      <Tabs defaultValue="sports" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sports" data-ocid="extracurriculars.tab.sports">
            <Trophy className="h-4 w-4 mr-1.5" />
            Sports
          </TabsTrigger>
          <TabsTrigger value="clubs" data-ocid="extracurriculars.tab.clubs">
            <Users className="h-4 w-4 mr-1.5" />
            Clubs
          </TabsTrigger>
          <TabsTrigger
            value="fineArts"
            data-ocid="extracurriculars.tab.fine_arts"
          >
            <Music className="h-4 w-4 mr-1.5" />
            Fine Arts
          </TabsTrigger>
          <TabsTrigger
            value="serviceHours"
            data-ocid="extracurriculars.tab.service_hours"
          >
            <Medal className="h-4 w-4 mr-1.5" />
            Service Hours
          </TabsTrigger>
          <TabsTrigger
            value="fieldTrips"
            data-ocid="extracurriculars.tab.field_trips"
          >
            <Bus className="h-4 w-4 mr-1.5" />
            Field Trips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sports.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                students={students}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clubs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clubs.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                students={students}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fineArts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fineArts.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                students={students}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="serviceHours">
          <ServiceHoursTab students={students} />
        </TabsContent>

        <TabsContent value="fieldTrips">
          <FieldTripsTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
