import { nsToISODate, unwrapOpt, variantKey } from "@/lib/candid";
import type {
  Commitment,
  CommitmentStatus,
  CommitmentType,
  Guardian,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  Role,
  SignalType,
  SignalUrgency,
  SpecialPopulation,
  Student,
  UnderstandingSignal,
} from "@/types";
import type { ConferenceBooking, ConferenceSlot } from "@/types/conference";
import { useQuery } from "@tanstack/react-query";
import type { ScheduleEntry } from "./types";

// ── Hook factory ─────────────────────────────────────────────────────────────

// Shared infra + mappers for the backend hook layer (extracted from useBackend.ts).

export function makeQuery<T>(key: string[], data: T) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => data,
    staleTime: 60_000,
  });
}

// ── Student record mapping (backend Candid record -> frontend Student) ──────

export function mapGuardian(g: any, i: number): Guardian {
  return {
    id: `g${i + 1}`,
    name: safeString(g.name),
    relationship: safeString(g.relationship),
    email: unwrapOpt<string>(g.email),
    phone: unwrapOpt<string>(g.phone),
    homeLanguage: safeString(g.homeLanguage),
    isEmergencyContact: !!g.isEmergency,
  };
}

export function mapSpecialPops(f: any): SpecialPopulation[] {
  const pops: SpecialPopulation[] = [];
  if (!f) return pops;
  if (f.sped) pops.push({ type: "iep" });
  if (f.ell) pops.push({ type: "ell", wida_level: unwrapOpt<string>(f.wida) });
  if (f.mcKinneyVento) pops.push({ type: "mckinney_vento" });
  if (f.fosterYouth) pops.push({ type: "foster_youth" });
  if (f.gifted) pops.push({ type: "gifted" });
  const medical = unwrapOpt<string>(f.medicalAlert);
  if (medical) pops.push({ type: "medical_alert", details: medical });
  return pops;
}

export function mapEnrolment(
  v: unknown,
): "active" | "inactive" | "transferred" {
  return variantKey(v) === "active" ? "active" : "inactive";
}

// Map a backend Candid Student record onto the frontend Student shape.
// GPA / attendanceRate are NOT on the record; they come from the roster row
// (list) or the dedicated gradebook/attendance hooks (profile).

export function mapStudentRecord(s: any): Student {
  const { first, last } = splitName(s.name);
  const counsellor = unwrapOpt<bigint | number>(s.counsellorId);
  const sped = unwrapOpt<bigint | number>(s.spedCoordinatorId);
  return {
    id: `s${s.id}`,
    firstName: first,
    lastName: last,
    preferredName: unwrapOpt<string>(s.preferredName),
    dob: safeString(s.dob),
    grade: Number(s.grade),
    gradeLevel: Number(s.grade),
    homeroom: safeString(s.homeroom),
    photoUrl: unwrapOpt<string>(s.photo),
    guardians: safeArray<any>(s.guardians).map(mapGuardian),
    counsellorId: counsellor !== undefined ? `staff-${counsellor}` : undefined,
    spedCoordinatorId: sped !== undefined ? `staff-${sped}` : undefined,
    specialPopulations: mapSpecialPops(s.specialPopFlags),
    enrolmentStatus: mapEnrolment(s.enrollmentStatus),
    name: safeString(s.name),
  };
}

// Map a backend StudentRosterRow (record + computed GPA + attendance) onto Student.

export function mapRosterRow(row: any): Student {
  const gpa = unwrapOpt<number>(row.gpa);
  return {
    ...mapStudentRecord(row.student),
    gpa: gpa !== undefined ? Number(gpa) : undefined,
    attendanceRate: Math.round(Number(row.attendanceRate ?? 0) * 100),
  };
}

// Roster of all students with real computed GPA + attendance, in one call.

export function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  return "";
}

export function safeNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return 0;
}

export function safeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;
  return [];
}

export function splitName(full: string): { first: string; last: string } {
  const parts = safeString(full).trim().split(" ");
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

// Map a backend Candid Staff onto the frontend Staff shape.

export function mapStaff(s: any) {
  const { first, last } = splitName(s.name);
  const role = variantKey(s.role);
  const depts = safeArray<string>(s.departments);
  return {
    id: `staff-${s.id}`,
    firstName: first,
    lastName: last,
    name: safeString(s.name),
    roles: [role as Role],
    role,
    email: safeString(s.email),
    department: depts[0],
    subjects: depts,
  };
}

// Map a backend Candid Course onto the frontend Course shape.

export function mapCourse(c: any) {
  const coTeacher =
    Array.isArray(c.coTeacherId) && c.coTeacherId.length > 0
      ? `staff-${c.coTeacherId[0]}`
      : undefined;
  return {
    id: `c${c.id}`,
    name: safeString(c.name),
    shortCode: safeString(c.code),
    teacherId: `staff-${c.teacherId}`,
    coTeacherId: coTeacher,
    grade: Number(c.grade),
    subject: safeString(c.department),
    studentIds: [],
  };
}

// Bell schedule: period → start/end times.

export const BELL: Record<number, { start: string; end: string }> = {
  1: { start: "8:00", end: "8:50" },
  2: { start: "9:00", end: "9:50" },
  3: { start: "10:00", end: "10:50" },
  4: { start: "11:00", end: "11:50" },
  5: { start: "12:00", end: "12:50" },
  6: { start: "1:00", end: "1:50" },
};

// Map a backend Candid ClassMeeting onto the frontend ScheduleEntry shape.

export function mapMeeting(m: any): ScheduleEntry {
  const period = Number(m.period);
  const bell = BELL[period] ?? { start: "", end: "" };
  return {
    day: Number(m.dayOfWeek),
    period,
    courseId: `c${m.courseId}`,
    room: safeString(m.room),
    startTime: bell.start,
    endTime: bell.end,
  };
}

export function safeCourseName(name: unknown): string {
  if (typeof name === "string") return name;
  return "";
}

export function safeLetterGrade(grade: unknown): string {
  if (typeof grade === "string") return grade;
  return "";
}

export function mapIncident(i: any): Incident {
  const routed = Array.isArray(i.routedTo)
    ? i.routedTo.length > 0
      ? i.routedTo[0]
      : null
    : i.routedTo;
  return {
    id: String(i.id),
    studentId: `s${i.studentId}`,
    reportedBy: `staff-${i.reportedBy}`,
    date: nsToISODate(i.createdAt),
    description: safeString(i.description),
    severity: (variantKey(i.severity) || "low") as IncidentSeverity,
    status: (variantKey(i.status) || "logged") as IncidentStatus,
    routedTo: routed != null ? `staff-${routed}` : undefined,
    timeline: safeArray<any>(i.timeline).map((e: any) => ({
      status: (variantKey(e.status) || "logged") as IncidentStatus,
      timestamp: nsToISODate(e.occurredAt),
      actor: `staff-${e.staffId}`,
      note: e.note ? safeString(e.note) : undefined,
    })),
  };
}

export const COMMITMENT_TYPE_MAP: Record<string, CommitmentType> = {
  counsellorFollowUp: "counsellor_followup",
  iepRenewal: "iep_renewal",
  conferenceBooking: "conference",
  parentCall: "parent_call",
  permissionSlip: "permission_slip",
  behaviourFollowUp: "behaviour_followup",
  workHome: "work_home",
  custom: "check_in",
};

export function mapCommitment(c: any): Commitment {
  const statusKey = variantKey(c.status);
  let status: CommitmentStatus;
  if (statusKey === "completed" || statusKey === "cancelled") {
    status = "completed";
  } else if (statusKey === "overdue") {
    status = "overdue";
  } else {
    let dueMs = Number.POSITIVE_INFINITY;
    try {
      dueMs = Number(BigInt(String(c.dueDate)) / 1_000_000n);
    } catch {
      dueMs = Number.POSITIVE_INFINITY;
    }
    const days = (dueMs - Date.now()) / 86_400_000;
    status = days <= 3 ? "due_soon" : "pending";
  }
  const completedAt =
    Array.isArray(c.completedAt) && c.completedAt.length > 0
      ? nsToISODate(c.completedAt[0])
      : undefined;
  return {
    id: String(c.id),
    type: COMMITMENT_TYPE_MAP[variantKey(c.commitmentType)] ?? "check_in",
    ownerId: `staff-${c.ownerId}`,
    studentId: `s${c.studentId}`,
    description: safeString(c.description),
    dueDate: nsToISODate(c.dueDate),
    status,
    completedAt,
  };
}

export const SIGNAL_TYPE_MAP: Record<string, SignalType> = {
  opportunity: "opportunity",
  workload: "workload",
  continuity: "continuity",
  commitment: "commitment_due",
  celebration: "celebration",
  pattern: "pattern",
  risk: "risk",
};

export const SIGNAL_HEADLINE: Record<string, string> = {
  opportunity: "Opportunity to stretch",
  workload: "Workload clash",
  continuity: "Continuity context",
  commitment: "Commitment due",
  celebration: "Worth celebrating",
  pattern: "Pattern detected",
  risk: "Needs support",
};

export function mapSignal(s: any): UnderstandingSignal {
  const typeKey = variantKey(s.signalType);
  const urgencyKey = variantKey(s.urgency);
  const urgency: SignalUrgency =
    urgencyKey === "critical"
      ? "critical"
      : urgencyKey === "important"
        ? "high"
        : "low";
  const sid =
    Array.isArray(s.studentId) && s.studentId.length > 0
      ? `s${s.studentId[0]}`
      : "";
  return {
    id: String(s.id),
    studentId: sid,
    type: SIGNAL_TYPE_MAP[typeKey] ?? "pattern",
    urgency,
    headline: SIGNAL_HEADLINE[typeKey] ?? "Signal",
    reason: safeString(s.reason),
    forRoles: [variantKey(s.roleTarget) as Role],
    generatedAt: nsToISODate(s.createdAt),
    acknowledged: false,
  };
}

export function useIsDemoDataLoaded() {
  return makeQuery(["demo-loaded"], true);
}

// ============ REAL ACTOR HOOKS ============
// Wire to canister; fall back to demo data on error or when canister is empty

export function getActor() {
  // Try window.__ACTOR__ first (set by the platform runtime)
  if (typeof window !== "undefined" && (window as any).__ACTOR__) {
    return (window as any).__ACTOR__;
  }
  return null;
}

export const INTERVENTION_TYPE_LABEL: Record<string, string> = {
  academic: "Academic Coaching",
  behavioural: "Behaviour Support",
  socialEmotional: "Social-Emotional",
  attendance: "Attendance Support",
  family: "Family Outreach",
  custom: "Intervention",
};

export function mapIntervention(x: any) {
  return {
    id: String(x.id),
    studentId: `s${x.studentId}`,
    type: x.description
      ? safeString(x.description)
      : (INTERVENTION_TYPE_LABEL[variantKey(x.interventionType)] ??
        "Intervention"),
    startDate: nsToISODate(x.createdAt),
    nextFollowUp: nsToISODate(x.followUpDate),
  };
}

export function mapAppointment(x: any) {
  let date = "";
  let time = "";
  try {
    const ms = Number(BigInt(String(x.dateTime)) / 1_000_000n);
    const d = new Date(ms);
    date = d.toISOString().slice(0, 10);
    time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    /* leave blank */
  }
  return {
    id: String(x.id),
    studentId: `s${x.studentId}`,
    date,
    time,
    purpose: safeString(x.notes),
  };
}

export const COMPLIANCE_TYPE_LABEL: Record<string, string> = {
  annualReview: "Annual Review",
  triennial: "Triennial",
  iepMeeting: "IEP Meeting",
  progressReport: "Progress Report",
};

export function mapComplianceItem(x: any) {
  let dueMs = Date.now();
  try {
    dueMs = Number(BigInt(String(x.dueDate)) / 1_000_000n);
  } catch {
    dueMs = Date.now();
  }
  const days = Math.round((dueMs - Date.now()) / 86_400_000);
  const notes = Array.isArray(x.notes) ? (x.notes[0] ?? "") : (x.notes ?? "");
  return {
    studentId: `s${x.studentId}`,
    type: COMPLIANCE_TYPE_LABEL[variantKey(x.itemType)] ?? "Annual Review",
    dueDate: nsToISODate(x.dueDate),
    daysToDeadline: days,
    status: variantKey(x.status),
    notes: safeString(notes),
  };
}

export function mapMessage(m: any) {
  return {
    id: String(m.id),
    threadId: String(m.threadId),
    senderId: `staff-${m.fromId}`,
    content: safeString(m.body),
    sentAt: nsToISODate(m.sentAt),
    readBy: m.isRead ? [`staff-${m.toId}`] : [],
  };
}

export function mapThread(t: any, last: any, unreadCount: number) {
  return {
    id: String(t.id),
    subject: safeString(t.subject),
    participantIds: safeArray<any>(t.participants).map(
      (p: any) => `staff-${p}`,
    ),
    unreadCount,
    lastMessage: last ? mapMessage(last) : undefined,
    createdAt: nsToISODate(t.lastMessageAt),
  };
}

export function mapNotification(n: any) {
  const tier = variantKey(n.tier);
  return {
    id: String(n.id),
    title: safeString(n.title),
    body: safeString(n.body),
    tier,
    priority: tier,
    type: variantKey(n.eventType),
    read: n.isRead === true,
    createdAt: nsToISODate(n.createdAt),
  };
}

export const DEMO_NOTIFICATIONS = [
  {
    id: "notif-1",
    tier: "important",
    title: "Grade posted",
    body: "A new grade has been posted for Math 101.",
    isRead: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: "notif-2",
    tier: "critical",
    title: "Attendance alert",
    body: "Student attendance has dropped below 85%.",
    isRead: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "notif-3",
    tier: "informational",
    title: "Assignment due",
    body: "Assignment 'Essay Draft' is due tomorrow.",
    isRead: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: "notif-4",
    tier: "important",
    title: "IEP renewal",
    body: "IEP renewal for student is due in 5 days.",
    isRead: false,
    createdAt: Date.now() - 1800000,
  },
];

export const DEMO_SLOTS: ConferenceSlot[] = [
  {
    id: 1n,
    teacherId: "staff-1",
    parentId: "",
    studentId: "s1",
    dateTime: BigInt(Date.now() + 2 * 86400000),
    durationMinutes: 20n,
    status: "available",
    notes: "Algebra II progress discussion",
  },
  {
    id: 2n,
    teacherId: "staff-1",
    parentId: "",
    studentId: "s1",
    dateTime: BigInt(Date.now() + 3 * 86400000),
    durationMinutes: 20n,
    status: "available",
    notes: "Mid-term check-in",
  },
  {
    id: 3n,
    teacherId: "staff-4",
    parentId: "",
    studentId: "s2",
    dateTime: BigInt(Date.now() + 1 * 86400000),
    durationMinutes: 30n,
    status: "available",
    notes: "Biology Honors — lab performance",
  },
  {
    id: 4n,
    teacherId: "staff-1",
    parentId: "parent-1",
    studentId: "s1",
    dateTime: BigInt(Date.now() + 5 * 86400000),
    durationMinutes: 20n,
    status: "booked",
    notes: "End-of-term review",
    bookedBy: "parent-1",
  },
];

export const DEMO_BOOKINGS: ConferenceBooking[] = [
  {
    id: 1n,
    slotId: 4n,
    studentId: "s1",
    teacherId: "staff-1",
    parentId: "parent-1",
    status: "confirmed",
    bookedAt: BigInt(Date.now() - 86400000),
    notificationSent: true,
  },
];
