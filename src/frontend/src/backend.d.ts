import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type BoardItemId = bigint;
export interface StudentGradeView {
    weight: number;
    assignmentName: string;
    term: string;
    score: number;
    courseName: string;
    courseId: CourseId;
    letterGrade: string;
}
export type SignalId = bigint;
export interface ReportCard {
    studentId: StudentId;
    behaviourSummary: BehaviourSummary;
    attendanceSummary: AttendanceSummary;
    termId: string;
    courseSummaries: Array<CourseSummary>;
}
export type IncidentId = bigint;
export interface IEPStudent {
    studentId: StudentId;
    name: string;
    urgencyTier: Variant_warning_danger_info_future_overdue;
    grade: bigint;
    spedFlags: SpecialPopFlags;
    daysToRenewal: bigint;
    contextualNextStep: string;
    renewalDate: Timestamp;
}
export interface UnderstandingSignal {
    id: SignalId;
    studentId?: StudentId;
    urgency: SignalUrgency;
    createdAt: Timestamp;
    commitmentId?: CommitmentId;
    roleTarget: Role;
    signalType: SignalType;
    reason: string;
}
export interface PermissionSlip {
    id: PermissionSlipId;
    status: Variant_costBarrier_signed_unsigned_declined;
    studentId: string;
    tripId: FieldTripId;
    signedAt?: bigint;
    signedBy?: string;
}
export type AttendanceId = bigint;
export type AppointmentId = bigint;
export interface TranscriptTerm {
    gpa: number;
    courses: Array<TranscriptCourse>;
    year: bigint;
    termId: string;
}
export type SubmissionId = bigint;
export type FieldTripId = bigint;
export interface InterventionOutcome {
    recordedAt: Timestamp;
    notes: string;
    outcome: string;
}
export interface ActivityRoster {
    status: Variant_active_inactive_waitlisted;
    studentId: string;
    joinedAt: bigint;
    role: Variant_member_leader_captain;
    activityId: ActivityId;
}
export type ConferenceSlotId = bigint;
export interface AssignmentV2 {
    id: AssignmentId;
    categoryId: CategoryId;
    pointsPossible: bigint;
    name: string;
    dueDate?: string;
    classId: CourseId;
}
export interface TrajectoryResult__1 {
    priorTermDelta?: number;
    direction: Variant_Up_Down_Flat;
    studentId: string;
    rolling3Avg: number;
    passStatus: Variant_Passing_Failing_AtRisk;
    lastFiveScores: Array<number>;
    courseId: string;
}
export interface Student {
    id: StudentId;
    dob: string;
    specialPopFlags: SpecialPopFlags;
    guardians: Array<Guardian>;
    name: string;
    homeroom: string;
    enrollmentStatus: EnrollmentStatus;
    counsellorId?: StaffId;
    grade: bigint;
    preferredName?: string;
    spedCoordinatorId?: StaffId;
    photo?: string;
    isDemoData: boolean;
}
export interface CourseSummary {
    teacherComment: string;
    courseName: string;
    finalGrade: number;
    courseId: CourseId;
    letterGrade: string;
}
export interface CaseloadStudent {
    specialPopFlags: {
        ell: boolean;
        medicalAlert?: string;
        sped: boolean;
    };
    studentId: StudentId;
    gradeTrajectory: string;
    recentIncidents: bigint;
    openCommitments: bigint;
    name: string;
    hasActiveIntervention: boolean;
    attendancePct: number;
    grade: bigint;
}
export interface SubstituteClass {
    period: string;
    room: string;
    classId: string;
    mustKnows: Array<string>;
    lessonPlan: string;
    className: string;
    studentCount: bigint;
}
export type ChannelId = bigint;
export interface Score {
    id: ScoreId;
    studentId: StudentId;
    pointsEarned?: bigint;
    assignmentId: AssignmentId;
}
export interface StudentGradebookClassSummary {
    classId: CourseId;
    weightedPercentage: number;
    className: string;
    letterGrade: string;
}
export interface ClassMeeting {
    id: MeetingId;
    period: bigint;
    dayOfWeek: bigint;
    room: string;
    term: string;
    teacherId: StaffId;
    courseId: CourseId;
    isDemoData: boolean;
}
export interface AttendanceSummary {
    tardy: bigint;
    present: bigint;
    rate: number;
    absent: bigint;
}
export interface StudentContact {
    homeLanguage?: string;
    relationship: string;
    name: string;
    email?: string;
    phone?: string;
    emergencyPriority: bigint;
}
export interface TranscriptTerm__1 {
    courses: Array<TranscriptCourse__1>;
    termGpa: number;
    term: string;
    termCredits: number;
}
export interface StudentTranscript {
    terms: Array<TranscriptTerm__1>;
    studentId: StudentId;
    studentName: string;
    cumulativeGpa: number;
    totalCredits: number;
}
export type MessageId = bigint;
export type NotificationId = bigint;
export interface Notification {
    id: NotificationId;
    title: string;
    body: string;
    createdAt: Timestamp;
    tier: NotificationTier;
    isRead: boolean;
    relatedId?: bigint;
    isDemoData: boolean;
    recipientId: StaffId;
    relatedType?: string;
    eventType: NotificationEventType;
}
export type CommitmentId = bigint;
export interface ConferenceBooking {
    id: ConferenceBookingId;
    status: Variant_cancelled_rescheduled_confirmed;
    studentId: string;
    bookedAt: bigint;
    notificationSent: boolean;
    slotId: ConferenceSlotId;
    teacherId: string;
    parentId: string;
    isDemoData: boolean;
}
export type ComplianceItemId = bigint;
export interface Account {
    displayName: string;
    userId: bigint;
    role: Role;
    principalText: string;
    isOwner: boolean;
}
export interface DistrictHealthSummary {
    attendanceRate: number;
    averageGPA: number;
    incidentCount: bigint;
    staffCount: bigint;
    enrollmentCount: bigint;
    schoolName: string;
}
export interface CommitmentTransitionEvent {
    toStatus: CommitmentStatus;
    note: string;
    fromStatus: CommitmentStatus;
    actorId: StaffId;
    timestamp: Timestamp;
}
export interface TranscriptCourse {
    credits: number;
    grade: number;
    courseName: string;
    courseId: CourseId;
}
export interface UrgentStudent {
    studentId: StudentId;
    urgency: SignalUrgency;
    name: string;
    reason: string;
}
export interface CommitmentSurfacing {
    thisWeek: Array<Commitment>;
    dueToday: Array<Commitment>;
    overdue: Array<Commitment>;
    comingSoon: Array<Commitment>;
}
export type ScoreId = string;
export interface Unit {
    id: UnitId;
    name: string;
    lessons: Array<Lesson>;
    courseId: CourseId;
    orderIndex: bigint;
}
export interface AttendancePattern {
    trend: AttendanceTrend;
    studentId: StudentId;
    attendanceRate: number;
    thresholdFlag: boolean;
    chronicAbsenceFlag: boolean;
    lastFiveEntries: Array<AttendanceRecord__1>;
}
export interface Staff {
    id: StaffId;
    departments: Array<string>;
    name: string;
    role: Role;
    email: string;
    assignedClasses: Array<CourseId>;
    isDemoData: boolean;
}
export type GradeId = bigint;
export interface Announcement {
    id: AnnouncementId;
    title: string;
    authorId: StaffId;
    body: string;
    createdAt: Timestamp;
    targetRoles: Array<Role>;
    priority: AnnouncementPriority;
    isDemoData: boolean;
}
export interface AuditEntry__1 {
    id: AuditId;
    action: string;
    actorRole: Role;
    actorId: string;
    entityId: string;
    timestamp: bigint;
    entityType: string;
    delta?: string;
}
export interface IEPReviewEntry {
    reviewedAt: Timestamp;
    reviewedBy: StaffId;
    notes: string;
}
export interface ChannelMessage {
    id: ChannelMsgId;
    content: string;
    channelId: ChannelId;
    authorId: string;
    sentAt: bigint;
    mentionedUsers: Array<string>;
    parentId?: ChannelMsgId;
    editedAt?: bigint;
    isPinned: boolean;
}
export interface DecisionItem {
    title: string;
    urgency: SignalUrgency;
    description: string;
}
export interface CaseloadSummary {
    studentsWithAttendanceConcerns: bigint;
    openCommitments: bigint;
    studentsWithGradeConcerns: bigint;
    totalStudents: bigint;
    dueThisWeek: bigint;
    overdueRenewals: bigint;
}
export interface CaseloadEntry {
    student: CaseloadStudent;
    upcomingCommitments: Array<Commitment>;
    interventions: Array<Intervention>;
}
export interface CoTeacherClassRow {
    classId: string;
    coTeacher: string;
    leadTeacher: string;
    className: string;
    studentCount: bigint;
}
export interface BehaviourSummary {
    incidents: bigint;
    followUpsComplete: bigint;
}
export interface Commitment {
    id: CommitmentId;
    status: CommitmentStatus;
    completedAt?: Timestamp;
    studentId: StudentId;
    ownerId: StaffId;
    createdAt: Timestamp;
    dueDate: Timestamp;
    description: string;
    transitionLog: Array<CommitmentTransitionEvent>;
    commitmentType: CommitmentType;
    notes: string;
    isDemoData: boolean;
}
export interface AssignmentWithStatus {
    earnedPoints?: number;
    assignment: Assignment;
    submissionStatus: SubmissionStatus;
}
export type ThreadId = bigint;
export interface CurriculumCourseRow {
    assignmentCount: bigint;
    unitCount: bigint;
    lessonCount: bigint;
    courseName: string;
    courseId: string;
}
export type AuditId = bigint;
export interface TranscriptCourse__1 {
    credits: number;
    term: string;
    grade: number;
    courseName: string;
    courseId: CourseId;
    letterGrade: string;
}
export interface BoardItem {
    id: BoardItemId;
    title: string;
    content: string;
    channelId?: ChannelId;
    createdAt: bigint;
    createdBy: string;
    pinnedAt?: bigint;
    pinnedBy?: string;
    isPinned: boolean;
}
export interface Activity {
    id: ActivityId;
    eligibilityGpaMin: number;
    name: string;
    actType: Variant_fineArts_club_sport_serviceHours;
    season?: string;
    eligibilityAttendanceMin: number;
    coachAdvisorId?: string;
    maxRoster?: bigint;
}
export type CategoryId = string;
export type AnnouncementId = bigint;
export interface PaginatedStudents {
    total: bigint;
    students: Array<Student>;
}
export interface IEPGoal {
    id: bigint;
    domain: string;
    description: string;
    progress: string;
    targetDate?: Timestamp;
}
export interface ConferenceSlot {
    id: ConferenceSlotId;
    status: Variant_cancelled_booked_available;
    studentId: string;
    bookedBy?: string;
    durationMinutes: bigint;
    notes?: string;
    teacherId: string;
    parentId: string;
    dateTime: bigint;
    isDemoData: boolean;
}
export type PermissionSlipId = bigint;
export interface ClassGradebookEntry {
    grades: Array<{
        weight: number;
        maxScore: number;
        assignmentName: string;
        score?: number;
        assignmentId: AssignmentId;
    }>;
    studentId: StudentId;
    studentName: string;
    average: number;
}
export interface AuditEntry {
    id: AuditId;
    action: string;
    newValue?: string;
    previousValue?: string;
    entityId: bigint;
    performedAt: Timestamp;
    performedBy: StaffId;
    entityType: string;
}
export interface Student__1 {
    id: StudentId;
    dob?: string;
    enrolmentStatus: Variant_Inactive_Active_Transferred;
    contacts: Array<StudentContact>;
    enrolmentDate: bigint;
    assignedSpedId?: string;
    code: string;
    name: string;
    homeroom?: string;
    specialPop: SpecialPopFlags__1;
    grade: bigint;
    assignedCounsellorId?: string;
    preferredName?: string;
    photo?: string;
    isDemoData: boolean;
    demographics: Demographics;
}
export interface Lesson {
    id: LessonId;
    name: string;
    description: string;
    unitId: UnitId;
    orderIndex: bigint;
}
export interface Guardian {
    isEmergency: boolean;
    homeLanguage: string;
    relationship: string;
    name: string;
    email?: string;
    phone?: string;
}
export type CourseId = bigint;
export interface Assignment {
    id: AssignmentId;
    weight: number;
    assignmentType: AssignmentType;
    name: string;
    term: string;
    dueDate: Timestamp;
    description?: string;
    isHighStakes: boolean;
    courseId: CourseId;
    isDemoData: boolean;
    points: number;
    linkedLessonId?: LessonId;
}
export interface Demographics {
    frl: boolean;
    race?: string;
    districtCode?: string;
    ethnicity?: string;
}
export type UpdateResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface WeightedAverageResult {
    studentId: StudentId;
    count: bigint;
    average: number;
    trajectory: TrajectoryResult;
    courseId: CourseId;
}
export interface Submission {
    id: SubmissionId;
    earnedPoints?: number;
    status: SubmissionStatus;
    studentId: StudentId;
    submittedAt: Timestamp;
    assignmentId: AssignmentId;
    submissionText: string;
    isDemoData: boolean;
}
export interface StudentSummary {
    studentId: StudentId;
    name: string;
    courseIds: Array<CourseId>;
    grade: bigint;
}
export interface Intervention {
    id: InterventionId;
    status: InterventionStatus;
    studentId: StudentId;
    createdAt: Timestamp;
    commitmentId?: CommitmentId;
    description: string;
    finalOutcome?: string;
    outcomes: Array<InterventionOutcome>;
    planDetails: string;
    interventionType: InterventionType;
    counsellorId: StaffId;
    isDemoData: boolean;
    followUpDate: Timestamp;
}
export interface AttendanceRecord {
    id: AttendanceId;
    status: AttendanceStatus;
    studentId: StudentId;
    period?: string;
    date: string;
    markedBy: StaffId;
    courseId: CourseId;
    isDemoData: boolean;
}
export interface OvernightDelta {
    metric: string;
    previous: number;
    change: string;
    current: number;
}
export interface AttendancePattern__1 {
    trend: string;
    studentId: StudentId;
    chronicAbsence: boolean;
    presentDays: bigint;
    totalDays: bigint;
    excusedDays: bigint;
    tardyDays: bigint;
    absentDays: bigint;
    belowThreshold: boolean;
    percentage: number;
}
export type LessonId = bigint;
export interface IncidentEvent {
    status: IncidentStatus;
    staffId: StaffId;
    note: string;
    occurredAt: Timestamp;
}
export interface Incident {
    id: IncidentId;
    status: IncidentStatus;
    studentId: StudentId;
    createdAt: Timestamp;
    commitmentId?: CommitmentId;
    routedTo?: StaffId;
    description: string;
    reportedBy: StaffId;
    severity: IncidentSeverity;
    isDemoData: boolean;
    timeline: Array<IncidentEvent>;
}
export interface ClassReport {
    topStudents: Array<StudentGradeSummary>;
    classAverage: number;
    term: string;
    totalStudents: bigint;
    teacherName: string;
    roster: Array<StudentGradeSummary>;
    courseName: string;
    courseId: CourseId;
    strugglingStudents: Array<StudentGradeSummary>;
}
export interface Channel {
    id: ChannelId;
    name: string;
    createdAt: bigint;
    createdBy: string;
    description?: string;
    isArchived: boolean;
    scopedRoles: Array<string>;
    isRoleScoped: boolean;
}
export type StudentId = bigint;
export interface ReportCardData {
    gpa: number;
    term: string;
    courseGrades: Array<[Course, number]>;
    student: Student;
    attendanceSummary: AttendancePattern__1;
}
export interface MorningPicture {
    generatedAt: Timestamp;
    headline: string;
    whatsWorking: Array<string>;
    urgentStudents: Array<UrgentStudent>;
    needsDecision: Array<DecisionItem>;
    overnightDeltas: Array<OvernightDelta>;
}
export interface IEPRecord {
    studentId: StudentId;
    reviewHistory: Array<IEPReviewEntry>;
    lastUpdatedAt: Timestamp;
    lastUpdatedBy: StaffId;
    goals: Array<IEPGoal>;
    accommodations: Array<IEPAccommodation>;
    services: Array<IEPService>;
    isDemoData: boolean;
    renewalDate: Timestamp;
}
export type InterventionId = bigint;
export interface Appointment {
    id: AppointmentId;
    status: AppointmentStatus;
    studentId: StudentId;
    createdAt: Timestamp;
    appointmentType: AppointmentType;
    counsellorId: StaffId;
    notes: string;
    dateTime: Timestamp;
    isDemoData: boolean;
}
export interface AttendanceRecord__1 {
    id: AttendanceId;
    status: AttendanceStatus__1;
    studentId: StudentId;
    date: string;
    classId?: string;
    notes?: string;
    isDemoData: boolean;
    enteredAt: bigint;
    enteredBy: string;
}
export interface SubstituteEndOfDay {
    attendanceTaken: boolean;
    presentCount: bigint;
    lessonCompletionNotes: string;
    incidentCount: bigint;
    absentCount: bigint;
}
export interface GradeCategory {
    id: CategoryId;
    weight: bigint;
    name: string;
    classId: CourseId;
}
export type Timestamp = bigint;
export interface StudentWeightedResult {
    studentId: StudentId;
    overallPercent: number;
    letterGrade: string;
}
export interface StudentFullRecord {
    signals: Array<UnderstandingSignal>;
    attendanceRate: number;
    trajectory: Array<TrajectoryResult__1>;
    student: Student__1;
    auditTrail: Array<AuditEntry__1>;
    currentGPA?: number;
    commitments: Array<Commitment>;
    behaviourPatternFlag: boolean;
}
export interface IEPDetail {
    notes: Array<IEPNote>;
    record: IEPRecord;
}
export interface StudentRosterRow {
    gpa?: number;
    attendanceRate: number;
    student: Student;
}
export interface SignalCard {
    id: SignalId;
    studentId?: StudentId;
    studentName?: string;
    urgency: SignalUrgency;
    createdAt: Timestamp;
    signalType: SignalType;
    reason: string;
}
export interface OverloadFlag {
    week: string;
    affectedStudentIds: Array<string>;
    courseId: string;
    assignmentIds: Array<string>;
    reason: string;
}
export interface Enrollment {
    studentId: StudentId;
    term: string;
    courseId: CourseId;
    isDemoData: boolean;
}
export interface IEPService {
    serviceType: string;
    provider: string;
    endDate?: Timestamp;
    minutesPerWeek: bigint;
    startDate: Timestamp;
}
export interface Course {
    id: CourseId;
    code: string;
    name: string;
    coTeacherId?: StaffId;
    grade: bigint;
    teacherId: StaffId;
    units: Array<Unit>;
    department: string;
    isDemoData: boolean;
}
export interface Grade {
    id: GradeId;
    weight: number;
    studentId: StudentId;
    gradedAt: Timestamp;
    gradedBy: StaffId;
    value: number;
    term: string;
    auditLog: Array<AuditEntry>;
    isHighStakes: boolean;
    assignmentId: AssignmentId;
    courseId: CourseId;
    isDemoData: boolean;
}
export interface FieldTrip {
    id: FieldTripId;
    destination: string;
    cost?: number;
    date: bigint;
    name: string;
    activityId?: ActivityId;
    approvalStatus: Variant_cancelled_pending_approved;
    permissionSlipRequired: boolean;
}
export type ServiceEntryId = bigint;
export interface IEPNote {
    id: IEPNoteId;
    studentId: StudentId;
    authorId: StaffId;
    body: string;
    createdAt: Timestamp;
    noteType: IEPNoteType;
    isDemoData: boolean;
}
export interface ComplianceItem {
    id: ComplianceItemId;
    status: ComplianceStatus;
    completedAt?: Timestamp;
    studentId: StudentId;
    ownerId: StaffId;
    dueDate: Timestamp;
    notes?: string;
    itemType: ComplianceItemType;
    isDemoData: boolean;
}
export type ConferenceBookingId = bigint;
export type AssignmentId = bigint;
export interface StudentGradeSummary {
    studentId: StudentId;
    studentName: string;
    letterGrade: string;
    weightedAvg: number;
}
export type StaffId = bigint;
export interface Thread {
    id: ThreadId;
    participants: Array<StaffId>;
    lastMessageAt: Timestamp;
    subject: string;
    isDemoData: boolean;
}
export interface IncidentPattern {
    trend: IncidentTrend;
    studentId: StudentId;
    severityBreakdown: Array<[bigint, bigint]>;
    count90day: bigint;
    repeatPatternFlag: boolean;
    escalationTimelineDays?: bigint;
}
export interface HandoffLogEntry {
    action: string;
    oldValue?: string;
    studentName: string;
    newValue: string;
    gradeId: string;
    teacherName: string;
    teacherId: string;
    timestamp: bigint;
}
export type IEPNoteId = bigint;
export interface TrajectoryResult {
    priorTermDelta?: number;
    direction: Variant_Up_Down_Flat;
    studentId: StudentId;
    rolling3Avg: number;
    passStatus: Variant_Passing_Failing_AtRisk;
    lastFiveScores: Array<number>;
    courseId: CourseId;
}
export type MeetingId = bigint;
export interface RoleContext {
    userId: StaffId;
    role: Role;
}
export type ChannelMsgId = bigint;
export type ActivityId = bigint;
export interface SpecialPopFlags__1 {
    medicalAlerts: Array<string>;
    isGifted: boolean;
    isMcKinneyVento: boolean;
    iepStartDate?: bigint;
    widaLevel?: bigint;
    isELL: boolean;
    isIEP: boolean;
    isFosterYouth: boolean;
    iepRenewalDate?: bigint;
}
export interface ServiceHoursEntry {
    id: ServiceEntryId;
    studentId: string;
    hours: number;
    approvedBy?: string;
    activityId?: ActivityId;
    description: string;
    loggedAt: bigint;
}
export interface Message {
    id: MessageId;
    subject: string;
    body: string;
    toId: StaffId;
    isRead: boolean;
    sentAt: Timestamp;
    fromId: StaffId;
    threadId: ThreadId;
    isDemoData: boolean;
}
export type UnitId = bigint;
export interface IEPAccommodation {
    description: string;
    category: string;
}
export interface SpecialPopFlags {
    ell: boolean;
    medicalAlert?: string;
    sped: boolean;
    wida?: string;
    mcKinneyVento: boolean;
    gifted: boolean;
    fosterYouth: boolean;
}
export enum AnnouncementPriority {
    info = "info",
    important = "important",
    urgent = "urgent"
}
export enum AppointmentStatus {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed"
}
export enum AppointmentType {
    groupSession = "groupSession",
    checkIn = "checkIn",
    custom = "custom",
    intervention = "intervention",
    referralFollowUp = "referralFollowUp",
    parentConference = "parentConference"
}
export enum AssignmentType {
    quiz = "quiz",
    test = "test",
    homework = "homework",
    essay = "essay",
    project = "project"
}
export enum AttendanceStatus {
    tardy = "tardy",
    present = "present",
    absent = "absent",
    excused = "excused"
}
export enum AttendanceStatus__1 {
    Present = "Present",
    Excused = "Excused",
    Tardy = "Tardy",
    Absent = "Absent"
}
export enum AttendanceTrend {
    Flat = "Flat",
    Improving = "Improving",
    Declining = "Declining"
}
export enum CommitmentStatus {
    cancelled = "cancelled",
    open = "open",
    completed = "completed",
    overdue = "overdue",
    inProgress = "inProgress"
}
export enum CommitmentType {
    behaviourFollowUp = "behaviourFollowUp",
    permissionSlip = "permissionSlip",
    custom = "custom",
    conferenceBooking = "conferenceBooking",
    iepRenewal = "iepRenewal",
    counsellorFollowUp = "counsellorFollowUp",
    parentCall = "parentCall",
    workHome = "workHome"
}
export enum ComplianceItemType {
    progressReport = "progressReport",
    triennial = "triennial",
    iepMeeting = "iepMeeting",
    annualReview = "annualReview"
}
export enum ComplianceStatus {
    pending = "pending",
    complete = "complete",
    overdue = "overdue"
}
export enum EnrollmentStatus {
    active = "active",
    transferred = "transferred",
    graduated = "graduated",
    withdrawn = "withdrawn"
}
export enum IEPNoteType {
    service = "service",
    review = "review",
    goal = "goal",
    accommodation = "accommodation",
    meeting = "meeting",
    general = "general"
}
export enum IncidentSeverity {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum IncidentStatus {
    closed = "closed",
    reviewing = "reviewing",
    logged = "logged",
    followUp = "followUp",
    routed = "routed"
}
export enum IncidentTrend {
    Flat = "Flat",
    Decreasing = "Decreasing",
    Increasing = "Increasing"
}
export enum InterventionStatus {
    closed = "closed",
    active = "active",
    completed = "completed"
}
export enum InterventionType {
    custom = "custom",
    academic = "academic",
    attendance = "attendance",
    socialEmotional = "socialEmotional",
    family = "family",
    behavioural = "behavioural"
}
export enum NotificationEventType {
    conferenceBooked = "conferenceBooked",
    attendanceFlagged = "attendanceFlagged",
    riskSignal = "riskSignal",
    behaviourFollowUp = "behaviourFollowUp",
    other = "other",
    assignmentSubmitted = "assignmentSubmitted",
    messageReceived = "messageReceived",
    announcementPosted = "announcementPosted",
    gradePosted = "gradePosted",
    commitmentDue = "commitmentDue",
    iepDue = "iepDue",
    incidentRouted = "incidentRouted"
}
export enum NotificationTier {
    important = "important",
    critical = "critical",
    informational = "informational"
}
export enum Role {
    principal = "principal",
    departmentHead = "departmentHead",
    curriculumCoordinator = "curriculumCoordinator",
    spedCoordinator = "spedCoordinator",
    counsellor = "counsellor",
    teacher = "teacher",
    substitute = "substitute",
    coTeacher = "coTeacher",
    schoolAdmin = "schoolAdmin",
    student = "student",
    districtAdmin = "districtAdmin",
    parent = "parent"
}
export enum SignalType {
    pattern = "pattern",
    workload = "workload",
    risk = "risk",
    opportunity = "opportunity",
    continuity = "continuity",
    celebration = "celebration",
    commitment = "commitment"
}
export enum SignalUrgency {
    info = "info",
    important = "important",
    critical = "critical"
}
export enum SubmissionStatus {
    notSubmitted = "notSubmitted",
    graded = "graded",
    submitted = "submitted"
}
export enum Variant_Inactive_Active_Transferred {
    Inactive = "Inactive",
    Active = "Active",
    Transferred = "Transferred"
}
export enum Variant_Passing_Failing_AtRisk {
    Passing = "Passing",
    Failing = "Failing",
    AtRisk = "AtRisk"
}
export enum Variant_Up_Down_Flat {
    Up = "Up",
    Down = "Down",
    Flat = "Flat"
}
export enum Variant_active_inactive_waitlisted {
    active = "active",
    inactive = "inactive",
    waitlisted = "waitlisted"
}
export enum Variant_cancelled_booked_available {
    cancelled = "cancelled",
    booked = "booked",
    available = "available"
}
export enum Variant_cancelled_pending_approved {
    cancelled = "cancelled",
    pending = "pending",
    approved = "approved"
}
export enum Variant_cancelled_rescheduled_confirmed {
    cancelled = "cancelled",
    rescheduled = "rescheduled",
    confirmed = "confirmed"
}
export enum Variant_costBarrier_signed_unsigned_declined {
    costBarrier = "costBarrier",
    signed = "signed",
    unsigned = "unsigned",
    declined = "declined"
}
export enum Variant_fineArts_club_sport_serviceHours {
    fineArts = "fineArts",
    club = "club",
    sport = "sport",
    serviceHours = "serviceHours"
}
export enum Variant_member_leader_captain {
    member = "member",
    leader = "leader",
    captain = "captain"
}
export enum Variant_warning_danger_info_future_overdue {
    warning = "warning",
    danger = "danger",
    info = "info",
    future = "future",
    overdue = "overdue"
}
export interface backendInterface {
    addFollowUpToIncident(incidentId: IncidentId, dueDate: bigint, note: string, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Commitment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addIEPNote(studentId: StudentId, body: string, noteType: IEPNoteType, authorId: StaffId): Promise<UpdateResult>;
    batchRecordAttendance(records: Array<AttendanceRecord>): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    bookConference(slotId: ConferenceSlotId, parentId: string, studentId: string): Promise<{
        __kind__: "ok";
        ok: ConferenceBooking;
    } | {
        __kind__: "err";
        err: string;
    }>;
    cancelAppointment(appointmentId: AppointmentId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    cancelBooking(bookingId: ConferenceBookingId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    checkEligibility(studentId: string, activityId: ActivityId): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    closeIntervention(interventionId: InterventionId, finalOutcome: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    computeClassWeightedAverages(classId: CourseId): Promise<Array<StudentWeightedResult>>;
    computeOpportunitySignals(ctx: RoleContext): Promise<Array<UnderstandingSignal>>;
    computeRiskSignal(studentId: StudentId): Promise<UnderstandingSignal | null>;
    createAnnouncement(title: string, body: string, targetRoles: Array<Role>, staffOnly: boolean, authorId: StaffId): Promise<{
        __kind__: "ok";
        ok: AnnouncementId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAppointment(studentId: StudentId, dateTime: Timestamp, atype: AppointmentType, notes: string): Promise<{
        __kind__: "ok";
        ok: Appointment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAppointmentForCounsellor(counsellorId: StaffId, studentId: StudentId, dateTime: Timestamp, atype: AppointmentType, notes: string): Promise<{
        __kind__: "ok";
        ok: Appointment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAssignment(assignment: Assignment, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Assignment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createBoardItem(title: string, content: string, createdBy: string, channelId: ChannelId | null): Promise<{
        __kind__: "ok";
        ok: BoardItem;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createChannel(name: string, description: string | null, createdBy: string, scopedRoles: Array<string>): Promise<{
        __kind__: "ok";
        ok: Channel;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createCommitment(commitment: Commitment): Promise<{
        __kind__: "ok";
        ok: Commitment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createFollowUpCommitment(commitmentType: CommitmentType, ownerId: StaffId, studentId: StudentId, dueDate: Timestamp, description: string): Promise<{
        __kind__: "ok";
        ok: Commitment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createGradeCategory(classId: CourseId, name: string, weight: bigint): Promise<GradeCategory>;
    createGradebookAssignment(classId: CourseId, categoryId: CategoryId, name: string, pointsPossible: bigint, dueDate: string | null): Promise<AssignmentV2>;
    createIntervention(studentId: StudentId, itype: InterventionType, description: string, planDetails: string, followUpDate: Timestamp): Promise<{
        __kind__: "ok";
        ok: Intervention;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createInterventionForCounsellor(counsellorId: StaffId, studentId: StudentId, itype: InterventionType, description: string, planDetails: string, followUpDate: Timestamp): Promise<{
        __kind__: "ok";
        ok: Intervention;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createSignal(signal: UnderstandingSignal): Promise<{
        __kind__: "ok";
        ok: UnderstandingSignal;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createStudent(student: Student): Promise<{
        __kind__: "ok";
        ok: Student;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createThread(participantIds: Array<StaffId>, subject: string, firstMessage: string, authorId: StaffId): Promise<ThreadId>;
    deleteGradeCategory(id: CategoryId): Promise<boolean>;
    deleteGradebookAssignment(id: AssignmentId): Promise<boolean>;
    deleteStudent(id: StudentId, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    detectScheduleConflicts(): Promise<Array<string>>;
    dismissSignal(id: SignalId, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    emitNotification(recipientId: StaffId, eventType: NotificationEventType, tier: NotificationTier, title: string, body: string, relatedId: bigint | null, relatedType: string | null): Promise<NotificationId>;
    enrollStudent(activityId: ActivityId, studentId: string): Promise<{
        __kind__: "ok";
        ok: ActivityRoster;
    } | {
        __kind__: "err";
        err: string;
    }>;
    exportAttendanceCSV(courseId: CourseId, dateRange: [string, string] | null): Promise<string>;
    exportClassReport(courseId: CourseId, term: string): Promise<ClassReport>;
    exportGradebookCSV(courseId: CourseId, term: string): Promise<string>;
    flagCostBarrier(slipId: PermissionSlipId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    generateReportCardData(studentId: StudentId, term: string): Promise<ReportCardData>;
    generateSlotsFromTimetable(teacherId: string): Promise<Array<ConferenceSlot>>;
    generateTimetable(): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getActivities(): Promise<Array<Activity>>;
    getActivityRoster(activityId: ActivityId): Promise<Array<ActivityRoster>>;
    getAnnouncements(roleFilter: Role | null): Promise<Array<Announcement>>;
    getAppointments(counsellorId: StaffId): Promise<Array<Appointment>>;
    getAssignmentsByCourse(courseId: CourseId, term: string): Promise<Array<Assignment>>;
    getAssignmentsForCourse(courseId: CourseId): Promise<Array<Assignment>>;
    getAttendancePattern(studentId: StudentId): Promise<AttendancePattern>;
    getAvailableSlots(teacherId: string): Promise<Array<ConferenceSlot>>;
    getBoardItems(channelId: ChannelId | null): Promise<Array<BoardItem>>;
    getBookingsForParent(parentId: string): Promise<Array<ConferenceBooking>>;
    getBookingsForTeacher(teacherId: string): Promise<Array<ConferenceBooking>>;
    getCaseload(counsellorId: StaffId): Promise<Array<CaseloadStudent>>;
    getCaseloadInsight(spedCoordId: StaffId): Promise<CaseloadSummary>;
    getCaseloadStudent(counsellorId: StaffId, studentId: StudentId): Promise<{
        __kind__: "ok";
        ok: CaseloadEntry;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getChannelMessages(channelId: ChannelId, limit: bigint, offset: bigint): Promise<Array<ChannelMessage>>;
    getChannels(): Promise<Array<Channel>>;
    getClassGradebook(courseId: CourseId, term: string): Promise<Array<ClassGradebookEntry>>;
    getCoTeacherClasses(teacherId: string): Promise<Array<CoTeacherClassRow>>;
    getCommitmentById(id: CommitmentId): Promise<Commitment | null>;
    getCommitmentSurfacing(ownerId: StaffId): Promise<CommitmentSurfacing>;
    getComplianceItems(spedCoordId: StaffId): Promise<Array<ComplianceItem>>;
    getCounsellorCaseload(counsellorId: string): Promise<Array<StudentId>>;
    getCourse(id: CourseId): Promise<Course | null>;
    getCourseRoster(courseId: CourseId): Promise<Array<StudentId>>;
    getCourseWithUnits(courseId: CourseId): Promise<Course | null>;
    getCourses(teacherId: StaffId | null): Promise<Array<Course>>;
    getCurrentRole(): Promise<Role>;
    getCurriculumOverview(): Promise<Array<CurriculumCourseRow>>;
    getDevUser(role: Role): Promise<Staff | null>;
    getDistrictHealthSummary(): Promise<DistrictHealthSummary>;
    getEarlyWarningRoster(): Promise<Array<{
        flags: Array<string>;
        studentId: StudentId;
        avgGrade: number;
        name: string;
        tier: bigint;
        attendanceRate: number;
        grade: bigint;
        incidentCount: bigint;
    }>>;
    getEligibilityThresholds(): Promise<{
        attendanceMin: number;
        gpaMin: number;
    }>;
    getFieldTrips(): Promise<Array<FieldTrip>>;
    getHandoffLog(classId: string): Promise<Array<HandoffLogEntry>>;
    getIEP(studentId: StudentId): Promise<IEPDetail | null>;
    getIEPCaseload(spedCoordId: StaffId): Promise<Array<IEPStudent>>;
    getInbox(userId: StaffId): Promise<Array<Thread>>;
    getIncident(id: IncidentId): Promise<Incident | null>;
    getIncidentPattern(studentId: StudentId): Promise<IncidentPattern>;
    getInterventions(studentId: StudentId): Promise<Array<Intervention>>;
    getInterventionsByOwner(counsellorId: StaffId): Promise<Array<Intervention>>;
    getLessonsForUnit(unitId: UnitId): Promise<Array<Lesson>>;
    getMasterTimetable(): Promise<Array<ClassMeeting>>;
    getMessages(threadId: ThreadId): Promise<Array<Message>>;
    getMorningPicture(): Promise<MorningPicture>;
    getMyAccount(): Promise<Account | null>;
    getNotifications(userId: StaffId): Promise<Array<Notification>>;
    getOverloadFlags(courseId: CourseId | null, term: string | null): Promise<Array<OverloadFlag>>;
    getPermissionSlips(tripId: FieldTripId): Promise<Array<PermissionSlip>>;
    getReportCard(studentId: StudentId, termId: string): Promise<ReportCard>;
    getServiceHours(studentId: string): Promise<Array<ServiceHoursEntry>>;
    getSignalContext(id: SignalId): Promise<UnderstandingSignal | null>;
    getSmartPreFill(courseId: CourseId, date: string): Promise<Array<AttendanceRecord>>;
    getStaffMember(id: StaffId): Promise<Staff | null>;
    getStaffMembers(): Promise<Array<Staff>>;
    getStudent(id: StudentId, ctx: RoleContext): Promise<Student | null>;
    getStudentAssignments(studentId: StudentId): Promise<Array<AssignmentWithStatus>>;
    getStudentAuditTrail(id: StudentId): Promise<Array<AuditEntry__1>>;
    getStudentCourses(studentId: StudentId): Promise<Array<CourseId>>;
    getStudentFullRecord(id: StudentId, ctx: RoleContext): Promise<StudentFullRecord | null>;
    getStudentGradebookSummary(studentId: StudentId): Promise<Array<StudentGradebookClassSummary>>;
    getStudentGrades(studentId: StudentId): Promise<Array<StudentGradeView>>;
    getStudentRoster(_ctx: RoleContext): Promise<Array<StudentRosterRow>>;
    getStudentSchedule(studentId: StudentId): Promise<Array<ClassMeeting>>;
    getStudentTranscript(studentId: StudentId): Promise<StudentTranscript>;
    getSubstituteDayClasses(date: bigint, substituteId: string): Promise<Array<SubstituteClass>>;
    getSubstituteEndOfDay(date: bigint, substituteId: string): Promise<SubstituteEndOfDay>;
    getTeacherSchedule(teacherId: StaffId): Promise<Array<ClassMeeting>>;
    getThread(threadId: ThreadId): Promise<Thread | null>;
    getThreads(userId: StaffId): Promise<Array<Thread>>;
    getThresholdViolations(ctx: RoleContext): Promise<Array<AttendancePattern>>;
    getTrajectory(studentId: StudentId, courseId: CourseId | null): Promise<Array<TrajectoryResult>>;
    getTranscript(studentId: StudentId): Promise<Array<TranscriptTerm>>;
    getUnderstandingSignals(role: Role, userId: StaffId): Promise<Array<SignalCard>>;
    getUnitsForCourse(courseId: CourseId): Promise<Array<Unit>>;
    getUnreadCount(userId: StaffId): Promise<bigint>;
    getUnreadNotificationCount(userId: StaffId): Promise<bigint>;
    getWeightedAverage(studentId: StudentId, courseId: CourseId, term: string): Promise<WeightedAverageResult>;
    getWhatNeedsYouToday(role: Role, userId: StaffId): Promise<Array<UnderstandingSignal>>;
    isDemoDataLoaded(): Promise<boolean>;
    listAttendanceByStudent(studentId: StudentId, fromDate: string | null, toDate: string | null): Promise<Array<AttendanceRecord>>;
    listCommitmentsByOwner(ownerId: StaffId, status: CommitmentStatus | null): Promise<Array<Commitment>>;
    listCommitmentsByStudent(studentId: StudentId): Promise<Array<Commitment>>;
    listGradeCategories(classId: CourseId): Promise<Array<GradeCategory>>;
    listGradebookAssignments(classId: CourseId): Promise<Array<AssignmentV2>>;
    listGradesByCourse(courseId: CourseId, term: string): Promise<Array<Grade>>;
    listGradesByStudent(studentId: StudentId, courseId: CourseId | null, term: string | null): Promise<Array<Grade>>;
    listIncidentsByStudent(studentId: StudentId, ctx: RoleContext): Promise<Array<Incident>>;
    listIncidentsForRole(ctx: RoleContext): Promise<Array<Incident>>;
    listReportableStudents(teacherId: StaffId): Promise<Array<StudentSummary>>;
    listScores(assignmentId: AssignmentId): Promise<Array<Score>>;
    listScoresByClass(classId: CourseId): Promise<Array<Score>>;
    listSignalsByRole(ctx: RoleContext): Promise<Array<UnderstandingSignal>>;
    listStudents(page: bigint, pageSize: bigint, ctx: RoleContext): Promise<PaginatedStudents>;
    logIncident(incident: Incident, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Incident;
    } | {
        __kind__: "err";
        err: string;
    }>;
    logServiceHours(entry: ServiceHoursEntry): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markAllNotificationsRead(userId: StaffId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markCommitmentComplete(id: CommitmentId): Promise<{
        __kind__: "ok";
        ok: Commitment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markIEPRenewed(studentId: StudentId, renewedDate: Timestamp, reviewedBy: StaffId): Promise<UpdateResult>;
    markNotificationRead(notificationId: NotificationId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markRead(messageId: MessageId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markThreadRead(userId: StaffId, threadId: ThreadId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    postAnnouncement(authorId: StaffId, title: string, body: string, targetRoles: Array<Role>, priority: AnnouncementPriority): Promise<AnnouncementId>;
    postMessage(channelId: ChannelId, authorId: string, content: string, mentionedUsers: Array<string>, parentId: ChannelMsgId | null): Promise<{
        __kind__: "ok";
        ok: ChannelMessage;
    } | {
        __kind__: "err";
        err: string;
    }>;
    recordAttendance(record: AttendanceRecord): Promise<{
        __kind__: "ok";
        ok: AttendanceRecord;
    } | {
        __kind__: "err";
        err: string;
    }>;
    register(role: Role, userId: bigint, displayName: string): Promise<{
        __kind__: "ok";
        ok: Account;
    } | {
        __kind__: "err";
        err: string;
    }>;
    replyToAnnouncement(announcementId: AnnouncementId, body: string, replierId: StaffId): Promise<{
        __kind__: "ok";
        ok: MessageId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    replyToThread(threadId: ThreadId, body: string, fromId: StaffId): Promise<{
        __kind__: "ok";
        ok: MessageId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    routeIncident(id: IncidentId, routedTo: string, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Incident;
    } | {
        __kind__: "err";
        err: string;
    }>;
    sendMessage(toUserId: StaffId, subject: string, body: string, threadId: ThreadId | null, fromId: StaffId): Promise<{
        __kind__: "ok";
        ok: MessageId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setEligibilityThresholds(gpaMin: number, attendanceMin: number): Promise<void>;
    setScore(assignmentId: AssignmentId, studentId: StudentId, pointsEarned: bigint | null): Promise<Score>;
    signPermissionSlip(slipId: PermissionSlipId, signedBy: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitAssignment(studentId: StudentId, assignmentId: AssignmentId, submissionText: string): Promise<{
        __kind__: "ok";
        ok: Submission;
    } | {
        __kind__: "err";
        err: string;
    }>;
    surfaceSignalsForRole(ctx: RoleContext): Promise<Array<UnderstandingSignal>>;
    switchDevRole(role: Role): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    togglePin(boardItemId: BoardItemId, pinnedBy: string): Promise<{
        __kind__: "ok";
        ok: BoardItem;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transitionCommitmentStatus(id: CommitmentId, newStatus: CommitmentStatus, note: string, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Commitment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateAssignment(assignmentId: AssignmentId, name: string | null, description: string | null, dueDate: Timestamp | null, weight: number | null, points: number | null): Promise<{
        __kind__: "ok";
        ok: Assignment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateCommitmentStatus(id: CommitmentId, status: CommitmentStatus): Promise<{
        __kind__: "ok";
        ok: Commitment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateComplianceItem(itemId: ComplianceItemId, status: ComplianceStatus, notes: string | null): Promise<UpdateResult>;
    updateCourse(courseId: CourseId, name: string | null, code: string | null, department: string | null): Promise<{
        __kind__: "ok";
        ok: Course;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateGrade(grade: Grade, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Grade;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateGradeCategory(id: CategoryId, name: string, weight: bigint): Promise<GradeCategory | null>;
    updateGradebookAssignment(id: AssignmentId, name: string, pointsPossible: bigint, dueDate: string | null): Promise<AssignmentV2 | null>;
    updateIEPRenewalDate(studentId: StudentId, newDate: Timestamp, updatedBy: StaffId): Promise<UpdateResult>;
    updateIncidentStatus(id: IncidentId, status: IncidentStatus, note: string, ctx: RoleContext): Promise<{
        __kind__: "ok";
        ok: Incident;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateInterventionOutcome(interventionId: InterventionId, outcome: string, notes: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateLesson(lessonId: LessonId, name: string | null, description: string | null): Promise<{
        __kind__: "ok";
        ok: Lesson;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateScore(id: ScoreId, pointsEarned: bigint | null): Promise<Score | null>;
    updateStudent(id: StudentId, student: Student): Promise<{
        __kind__: "ok";
        ok: Student;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateUnit(unitId: UnitId, name: string | null): Promise<{
        __kind__: "ok";
        ok: Unit;
    } | {
        __kind__: "err";
        err: string;
    }>;
    whoami(): Promise<Principal>;
}
