import Time "mo:core/Time";

module {

  // ── Scalar aliases ────────────────────────────────────────────────────
  public type StudentId  = Nat;
  public type StaffId    = Nat;
  public type CourseId   = Nat;
  public type UnitId     = Nat;
  public type LessonId   = Nat;
  public type AssignmentId = Nat;
  public type GradeId    = Nat;
  public type AttendanceId = Nat;
  public type IncidentId = Nat;
  public type CommitmentId = Nat;
  public type MessageId  = Nat;
  public type ThreadId   = Nat;
  public type AuditId    = Nat;
  public type SignalId   = Nat;
  public type CategoryId = Text;
  public type ScoreId    = Text;
  public type Timestamp  = Int; // nanoseconds from Time.now()

  // ── Role ──────────────────────────────────────────────────────────────
  public type Role = {
    #teacher;
    #coTeacher;
    #student;
    #parent;
    #schoolAdmin;
    #departmentHead;
    #principal;
    #districtAdmin;
    #counsellor;
    #spedCoordinator;
    #curriculumCoordinator;
    #substitute;
  };

  // ── Special-population flags ───────────────────────────────────────────
  public type SpecialPopFlags = {
    sped        : Bool;
    ell         : Bool;
    wida        : ?Text;  // WIDA proficiency level when ell = true
    mcKinneyVento : Bool;
    fosterYouth : Bool;
    gifted      : Bool;
    medicalAlert : ?Text;
  };

  // ── Guardian ────────────────────────────────────────────────────────────
  public type Guardian = {
    name         : Text;
    relationship : Text;
    homeLanguage : Text;
    phone        : ?Text;
    email        : ?Text;
    isEmergency  : Bool;
  };

  // ── Student ────────────────────────────────────────────────────────────
  public type EnrollmentStatus = {
    #active;
    #withdrawn;
    #graduated;
    #transferred;
  };

  public type Student = {
    id                : StudentId;
    name              : Text;
    preferredName     : ?Text;
    grade             : Nat;          // 9–12
    dob               : Text;         // ISO date string
    homeroom          : Text;
    photo             : ?Text;
    guardians         : [Guardian];
    counsellorId      : ?StaffId;
    spedCoordinatorId : ?StaffId;
    enrollmentStatus  : EnrollmentStatus;
    specialPopFlags   : SpecialPopFlags;
    isDemoData        : Bool;
  };

  // ── Staff ──────────────────────────────────────────────────────────────
  public type Staff = {
    id             : StaffId;
    name           : Text;
    role           : Role;
    email          : Text;
    departments    : [Text];
    assignedClasses : [CourseId];
    isDemoData     : Bool;
  };

  // ── Curriculum ─────────────────────────────────────────────────────────
  public type Lesson = {
    id          : LessonId;
    unitId      : UnitId;
    name        : Text;
    description : Text;
    orderIndex  : Nat;
  };

  public type Unit = {
    id          : UnitId;
    courseId    : CourseId;
    name        : Text;
    orderIndex  : Nat;
    lessons     : [Lesson];
  };

  public type Course = {
    id          : CourseId;
    name        : Text;
    code        : Text;
    department  : Text;
    teacherId   : StaffId;
    coTeacherId : ?StaffId;
    grade       : Nat;
    units       : [Unit];
    isDemoData  : Bool;
  };

  // ── Assignment ─────────────────────────────────────────────────────────
  public type AssignmentType = {
    #homework;
    #quiz;
    #test;
    #project;
    #essay;
  };

  public type Assignment = {
    id             : AssignmentId;
    courseId       : CourseId;
    name           : Text;
    description    : ?Text;
    dueDate        : Timestamp;
    points         : Float;     // max possible points
    weight         : Float;
    isHighStakes   : Bool;
    assignmentType : AssignmentType;
    linkedLessonId : ?LessonId;
    term           : Text;
    isDemoData     : Bool;
  };

  // ── Submission ─────────────────────────────────────────────────────────
  public type SubmissionId = Nat;

  public type SubmissionStatus = {
    #notSubmitted;
    #submitted;
    #graded;
  };

  public type Submission = {
    id             : SubmissionId;
    assignmentId   : AssignmentId;
    studentId      : StudentId;
    submittedAt    : Timestamp;
    submissionText : Text;
    status         : SubmissionStatus;
    earnedPoints   : ?Float;
    isDemoData     : Bool;
  };

  public type AssignmentWithStatus = {
    assignment     : Assignment;
    submissionStatus : SubmissionStatus;
    earnedPoints   : ?Float;
  };

  // ── Grade ──────────────────────────────────────────────────────────────
  public type AuditEntry = {
    id            : AuditId;
    entityType    : Text;
    entityId      : Nat;
    action        : Text;
    performedBy   : StaffId;
    performedAt   : Timestamp;
    previousValue : ?Text;
    newValue      : ?Text;
  };

  public type Grade = {
    id           : GradeId;
    studentId    : StudentId;
    courseId     : CourseId;
    assignmentId : AssignmentId;
    value        : Float;
    weight       : Float;
    isHighStakes : Bool;
    gradedAt     : Timestamp;
    gradedBy     : StaffId;
    term         : Text;
    auditLog     : [AuditEntry];
    isDemoData   : Bool;
  };

  // ── Attendance ─────────────────────────────────────────────────────────
  public type AttendanceStatus = {
    #present;
    #absent;
    #excused;
    #tardy;
  };

  public type AttendanceRecord = {
    id        : AttendanceId;
    studentId : StudentId;
    courseId  : CourseId;
    date      : Text;   // ISO date string
    period    : ?Text;
    status    : AttendanceStatus;
    markedBy  : StaffId;
    isDemoData : Bool;
  };

  // ── Behaviour ─────────────────────────────────────────────────────────
  public type IncidentSeverity = {
    #low;
    #medium;
    #high;
    #critical;
  };

  public type IncidentStatus = {
    #logged;
    #routed;
    #reviewing;
    #followUp;
    #closed;
  };

  public type IncidentEvent = {
    status      : IncidentStatus;
    staffId     : StaffId;
    note        : Text;
    occurredAt  : Timestamp;
  };

  public type Incident = {
    id           : IncidentId;
    studentId    : StudentId;
    reportedBy   : StaffId;
    severity     : IncidentSeverity;
    description  : Text;
    routedTo     : ?StaffId;
    status       : IncidentStatus;
    createdAt    : Timestamp;
    timeline     : [IncidentEvent];
    commitmentId : ?CommitmentId;
    isDemoData   : Bool;
  };

  // ── Commitments ────────────────────────────────────────────────────────
  public type CommitmentType = {
    #counsellorFollowUp;
    #iepRenewal;
    #conferenceBooking;
    #parentCall;
    #permissionSlip;
    #behaviourFollowUp;
    #workHome;
    #custom;
  };

  public type CommitmentStatus = {
    #open;
    #inProgress;
    #completed;
    #cancelled;
    #overdue;
  };

  public type CommitmentTransitionEvent = {
    fromStatus : CommitmentStatus;
    toStatus   : CommitmentStatus;
    actorId    : StaffId;
    note       : Text;
    timestamp  : Timestamp;
  };

  public type Commitment = {
    id          : CommitmentId;
    commitmentType : CommitmentType;
    ownerId     : StaffId;
    studentId   : StudentId;
    dueDate     : Timestamp;
    description : Text;
    status      : CommitmentStatus;
    notes       : Text;
    transitionLog : [CommitmentTransitionEvent];
    createdAt   : Timestamp;
    completedAt : ?Timestamp;
    isDemoData  : Bool;
  };

  // ── Messaging ──────────────────────────────────────────────────────────
  public type Message = {
    id       : MessageId;
    fromId   : StaffId;
    toId     : StaffId;
    subject  : Text;
    body     : Text;
    sentAt   : Timestamp;
    threadId : ThreadId;
    isRead   : Bool;
    isDemoData : Bool;
  };

  public type Thread = {
    id           : ThreadId;
    subject      : Text;
    participants : [StaffId];
    lastMessageAt : Timestamp;
    isDemoData   : Bool;
  };

  public type AnnouncementId = Nat;

  public type AnnouncementPriority = {
    #info;
    #important;
    #urgent;
  };

  public type Announcement = {
    id          : AnnouncementId;
    authorId    : StaffId;
    title       : Text;
    body        : Text;
    targetRoles : [Role];
    priority    : AnnouncementPriority;
    createdAt   : Timestamp;
    isDemoData  : Bool;
  };

  public type ReadReceiptKey = Text; // "userId:threadId"

  // ── Notifications ──────────────────────────────────────────────────────
  public type NotificationId = Nat;

  public type NotificationTier = {
    #critical;
    #important;
    #informational;
  };

  public type NotificationEventType = {
    #gradePosted;
    #attendanceFlagged;
    #iepDue;
    #incidentRouted;
    #conferenceBooked;
    #commitmentDue;
    #assignmentSubmitted;
    #messageReceived;
    #announcementPosted;
    #behaviourFollowUp;
    #riskSignal;
    #other;
  };

  public type Notification = {
    id          : NotificationId;
    recipientId : StaffId;
    eventType   : NotificationEventType;
    tier        : NotificationTier;
    title       : Text;
    body        : Text;
    isRead      : Bool;
    createdAt   : Timestamp;
    relatedId   : ?Nat;   // e.g. gradeId, messageId, incidentId
    relatedType : ?Text;  // e.g. "grade", "message", "incident"
    isDemoData  : Bool;
  };

  // ── Understanding ──────────────────────────────────────────────────────
  public type SignalType = {
    #opportunity;
    #workload;
    #continuity;
    #commitment;
    #celebration;
    #pattern;
    #risk;
  };

  public type SignalUrgency = {
    #info;
    #important;
    #critical;
  };

  public type UnderstandingSignal = {
    id           : SignalId;
    signalType   : SignalType;
    studentId    : ?StudentId;
    roleTarget   : Role;
    reason       : Text;
    urgency      : SignalUrgency;
    createdAt    : Timestamp;
    commitmentId : ?CommitmentId;
  };

  // ── Trajectory (shared result used by grades and students) ───────────────
  public type TrajectoryResult = {
    studentId      : StudentId;
    courseId       : CourseId;
    direction      : { #Up; #Flat; #Down };
    rolling3Avg    : Float;
    priorTermDelta : ?Float;
    passStatus     : { #Passing; #AtRisk; #Failing };
    lastFiveScores : [Float];
  };

  // ── Aggregate / query result types ────────────────────────────────────
  public type PaginatedStudents = {
    students : [Student];
    total    : Nat;
  };

  public type GradebookSummary = {
    courseId          : CourseId;
    term              : Text;
    grades            : [Grade];
    weightedAverages  : [(StudentId, Float)];
    trajectories      : [(StudentId, Text)];  // e.g. "dropping", "rising", "steady"
    overloadWarning   : Bool;
    overloadWeek      : ?Text;  // ISO week string if overloaded
  };

  public type AttendancePattern = {
    studentId     : StudentId;
    totalDays     : Nat;
    presentDays   : Nat;
    absentDays    : Nat;
    excusedDays   : Nat;
    tardyDays     : Nat;
    percentage    : Float;
    belowThreshold : Bool;
    chronicAbsence : Bool;
    trend         : Text;  // "improving" | "declining" | "steady"
  };

  public type ReportCardData = {
    student       : Student;
    term          : Text;
    courseGrades  : [(Course, Float)]; // (course, weighted average)
    gpa           : Float;
    attendanceSummary : AttendancePattern;
  };

  public type OvernightDelta = {
    metric   : Text;
    previous : Float;
    current  : Float;
    change   : Text; // e.g. "+3", "-2"
  };

  public type DecisionItem = {
    title       : Text;
    description : Text;
    urgency     : SignalUrgency;
  };

  public type UrgentStudent = {
    studentId : StudentId;
    name      : Text;
    reason    : Text;
    urgency   : SignalUrgency;
  };

  public type SignalCard = {
    id         : SignalId;
    signalType : SignalType;
    studentId  : ?StudentId;
    studentName: ?Text;
    reason     : Text;
    urgency    : SignalUrgency;
    createdAt  : Timestamp;
  };

  public type MorningPicture = {
    generatedAt      : Timestamp;
    headline       : Text;
    overnightDeltas: [OvernightDelta];
    whatsWorking   : [Text];
    needsDecision  : [DecisionItem];
    urgentStudents : [UrgentStudent];
  };

  public type RoleContext = {
    role    : Role;
    userId  : StaffId;
  };

  // ── Auth: principal-based RBAC account (Phase 3) ──────────────────────
  // Maps an authenticated Internet Identity principal to a role + the seeded
  // user it represents. The first principal to register becomes the owner.
  public type Account = {
    principalText : Text;
    role          : Role;
    userId        : Nat;
    displayName   : Text;
    isOwner       : Bool;
  };

  // ── Scheduling: enrollment (rosters) + timetable ──────────────────────
  public type MeetingId = Nat;

  // A student's enrollment in a course for a term. Keyed in the map by
  // "studentId-courseId" so it is naturally unique per student/course.
  public type Enrollment = {
    studentId  : StudentId;
    courseId   : CourseId;
    term       : Text;
    isDemoData : Bool;
  };

  // A weekly recurring class meeting (one course, one teacher, one slot).
  // dayOfWeek: 1=Mon … 5=Fri. period: 1…N within the bell schedule.
  public type ClassMeeting = {
    id         : MeetingId;
    courseId   : CourseId;
    teacherId  : StaffId;
    dayOfWeek  : Nat;
    period     : Nat;
    room       : Text;
    term       : Text;
    isDemoData : Bool;
  };

};
