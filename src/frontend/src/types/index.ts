import {
  ConferenceBooking,
  ConferenceBookingStatus,
  ConferenceSlot,
  ConferenceSlotStatus,
} from "./conference";
export type Role =
  | "teacher"
  | "coTeacher"
  | "student"
  | "parent"
  | "schoolAdmin"
  | "departmentHead"
  | "principal"
  | "districtAdmin"
  | "counsellor"
  | "spedCoordinator"
  | "curriculumCoordinator"
  | "substitute";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "excused"
  | "tardy"
  | "unknown";
export type IncidentStatus =
  | "logged"
  | "routed"
  | "under_review"
  | "follow_up"
  | "closed";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type CommitmentType =
  | "counsellor_followup"
  | "iep_renewal"
  | "conference"
  | "parent_call"
  | "permission_slip"
  | "behaviour_followup"
  | "work_home"
  | "check_in";
export type CommitmentStatus = "pending" | "due_soon" | "overdue" | "completed";
export type SignalType =
  | "opportunity"
  | "workload"
  | "continuity"
  | "commitment_due"
  | "celebration"
  | "pattern"
  | "risk";
export type SignalUrgency = "low" | "medium" | "high" | "critical";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dob: string;
  grade: number;
  homeroom: string;
  photoUrl?: string;
  guardians: Guardian[];
  counsellorId?: string;
  spedCoordinatorId?: string;
  specialPopulations: SpecialPopulation[];
  gpa?: number;
  attendanceRate?: number;
  trajectory?: "thriving" | "steady" | "coasting" | "slipping";
  enrolmentStatus: "active" | "inactive" | "transferred";
  name?: string;
  gradeLevel?: number;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  homeLanguage: string;
  isEmergencyContact: boolean;
}

export interface SpecialPopulation {
  type:
    | "iep"
    | "ell"
    | "mckinney_vento"
    | "foster_youth"
    | "gifted"
    | "medical_alert";
  details?: string;
  wida_level?: string;
  iepRenewalDate?: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  roles: Role[];
  email: string;
  subjects?: string[];
  department?: string;
  photoUrl?: string;
  role?: string;
}

export interface Course {
  id: string;
  name: string;
  shortCode: string;
  teacherId: string;
  coTeacherId?: string;
  grade: number;
  subject: string;
  studentIds: string[];
  period?: number;
  room?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  value: number;
  maxValue: number;
  weight: number;
  gradedAt: string;
  gradedBy: string;
  letterGrade?: string;
  score?: number;
  dueDate?: string;
  assignmentName?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  dueDate: string;
  weight: number;
  maxPoints: number;
  isHighStakes: boolean;
  unitId?: string;
  lessonId?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId?: string;
  date: string;
  period?: number;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  excused?: boolean;
}

export interface AttendancePattern {
  studentId: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  excusedDays: number;
  tardyDays: number;
  attendanceRate: number;
  isChronicallyAbsent: boolean;
  recentTrend: "improving" | "stable" | "declining";
}

export interface Incident {
  id: string;
  studentId: string;
  reportedBy: string;
  date: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  routedTo?: string;
  followUpDate?: string;
  resolution?: string;
  timeline: IncidentTimelineEntry[];
}

export interface IncidentTimelineEntry {
  status: IncidentStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Commitment {
  id: string;
  type: CommitmentType;
  ownerId: string;
  studentId?: string;
  description: string;
  dueDate: string;
  status: CommitmentStatus;
  completedAt?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: Role;
  content: string;
  sentAt: string;
  readBy: string[];
}

export interface Thread {
  id: string;
  subject: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export interface UnderstandingSignal {
  id: string;
  studentId: string;
  type: SignalType;
  urgency: SignalUrgency;
  headline: string;
  reason: string;
  forRoles: Role[];
  generatedAt: string;
  acknowledged: boolean;
  commitment?: Commitment;
}

export interface StudentGradeSummary {
  studentId: string;
  currentGrade: number;
  letterGrade: string;
  trend: "up" | "stable" | "down";
  trendDetail?: string;
  recentAssignments: Grade[];
}

export interface GradebookSummary {
  courseId: string;
  term: string;
  overloaded: boolean;
  overloadedWeek?: string;
  studentSummaries: StudentGradeSummary[];
}

export interface MorningDelta {
  category: string;
  description: string;
  urgency: SignalUrgency;
}

export interface MorningPicture {
  date: string;
  headline: string;
  deltas: MorningDelta[];
  workingWell: string[];
  needsDecision: string[];
  nothingChanged: boolean;
}

export interface CourseReportEntry {
  courseId: string;
  courseName: string;
  grade: number;
  letterGrade: string;
  credits: number;
  teacherComment?: string;
}

export interface ReportCardData {
  studentId: string;
  term: string;
  academicYear: string;
  courses: CourseReportEntry[];
  gpa: number;
  attendance: AttendancePattern;
  comments?: string;
}

export interface SchoolStats {
  totalStudents: number;
  totalStaff: number;
  attendanceRate: number;
  avgGpa: number;
  activeIncidents: number;
  openCommitments: number;
}

export interface DepartmentStats {
  department: string;
  teacherCount: number;
  courseCount: number;
  avgGpa: number;
  attendanceRate: number;
}

export interface NavItem {
  id: string;
  label: string;
  labelEs?: string;
  icon: string;
  path: string;
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  assignmentIds: string[];
}

export type SubmissionStatus = "notSubmitted" | "submitted" | "graded";

export interface AssignmentWithStatus extends Assignment {
  submissionStatus: SubmissionStatus;
  earnedPoints?: number;
  submittedAt?: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  targetRoles: string[];
  priority: "normal" | "important" | "critical";
  createdAt: number;
}

export interface CourseSummary {
  courseId: string;
  courseName: string;
  grade: number;
  letterGrade: string;
  credits: number;
  teacherComment?: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  excusedDays: number;
  tardyDays: number;
  attendanceRate: number;
}

export interface BehaviourSummary {
  totalIncidents: number;
  openIncidents: number;
  severityBreakdown: Record<IncidentSeverity, number>;
}

export interface ReportCard {
  studentId: string;
  termId: string;
  courseSummaries: CourseSummary[];
  attendanceSummary: AttendanceSummary;
  behaviourSummary: BehaviourSummary;
}

export interface NavConfig {
  primary: NavItem[];
  tools?: NavItem[];
  defaultPath: string;
}
