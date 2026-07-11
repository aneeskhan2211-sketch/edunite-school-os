// Migration: Add SPED maps (iepRecords, iepNotes, complianceItems),
// notifications, interventions, appointments maps,
// and corresponding counters.
// OldActor = NewActor of 20260615_120000_AddSubmissionsAnnouncements.mo
// (the last successfully deployed version)

import Map "mo:core/Map";

module {

  // ── Inlined scalar types ─────────────────────────────────────────────
  type StudentId        = Nat;
  type StaffId          = Nat;
  type CourseId         = Nat;
  type AssignmentId     = Nat;
  type GradeId          = Nat;
  type AttendanceId     = Nat;
  type IncidentId       = Nat;
  type CommitmentId     = Nat;
  type MessageId        = Nat;
  type ThreadId         = Nat;
  type SignalId         = Nat;
  type AuditId          = Nat;
  type SubmissionId     = Nat;
  type AnnouncementId   = Nat;
  type IEPNoteId        = Nat;
  type ComplianceItemId = Nat;
  type NotificationId   = Nat;
  type InterventionId   = Nat;
  type AppointmentId    = Nat;
  type Timestamp        = Int;

  // ── Shared types (inlined — no project imports) ────────────────────────
  type Role = {
    #teacher; #coTeacher; #student; #parent; #schoolAdmin;
    #departmentHead; #principal; #districtAdmin; #counsellor;
    #spedCoordinator; #curriculumCoordinator; #substitute;
  };
  type EnrollmentStatus = { #active; #withdrawn; #graduated; #transferred };
  type SpecialPopFlags = {
    sped : Bool; ell : Bool; wida : ?Text; mcKinneyVento : Bool;
    fosterYouth : Bool; gifted : Bool; medicalAlert : ?Text;
  };
  type Guardian = {
    name : Text; relationship : Text; homeLanguage : Text;
    phone : ?Text; email : ?Text; isEmergency : Bool;
  };
  type Student = {
    id : StudentId; name : Text; preferredName : ?Text; grade : Nat;
    dob : Text; homeroom : Text; photo : ?Text; guardians : [Guardian];
    counsellorId : ?StaffId; spedCoordinatorId : ?StaffId;
    enrollmentStatus : EnrollmentStatus; specialPopFlags : SpecialPopFlags;
    isDemoData : Bool;
  };
  type Staff = {
    id : StaffId; name : Text; role : Role; email : Text;
    departments : [Text]; assignedClasses : [CourseId]; isDemoData : Bool;
  };
  type Lesson = { id : Nat; unitId : Nat; name : Text; description : Text; orderIndex : Nat };
  type Unit = { id : Nat; courseId : CourseId; name : Text; orderIndex : Nat; lessons : [Lesson] };
  type Course = {
    id : CourseId; name : Text; code : Text; department : Text;
    teacherId : StaffId; coTeacherId : ?StaffId; grade : Nat;
    units : [Unit]; isDemoData : Bool;
  };
  type AssignmentType = { #homework; #quiz; #test; #project; #essay };
  type Assignment = {
    id : AssignmentId; courseId : CourseId; name : Text;
    description : ?Text; dueDate : Timestamp; points : Float;
    weight : Float; isHighStakes : Bool; assignmentType : AssignmentType;
    linkedLessonId : ?Nat; term : Text; isDemoData : Bool;
  };
  type AuditEntry = {
    id : AuditId; entityType : Text; entityId : Nat; action : Text;
    performedBy : StaffId; performedAt : Timestamp;
    previousValue : ?Text; newValue : ?Text;
  };
  type StudentAuditEntry = {
    id : AuditId; entityType : Text; entityId : Text;
    action : Text; actorId : Text; actorRole : Role;
    timestamp : Int; delta : ?Text;
  };
  type Grade = {
    id : GradeId; studentId : StudentId; courseId : CourseId;
    assignmentId : AssignmentId; value : Float; weight : Float;
    isHighStakes : Bool; gradedAt : Timestamp; gradedBy : StaffId;
    term : Text; auditLog : [AuditEntry]; isDemoData : Bool;
  };
  type AttendanceStatus = { #present; #absent; #excused; #tardy };
  type AttendanceRecord = {
    id : AttendanceId; studentId : StudentId; courseId : CourseId;
    date : Text; period : ?Text; status : AttendanceStatus;
    markedBy : StaffId; isDemoData : Bool;
  };
  type IncidentSeverity = { #low; #medium; #high; #critical };
  type IncidentStatus   = { #logged; #routed; #reviewing; #followUp; #closed };
  type IncidentEvent    = { status : IncidentStatus; staffId : StaffId; note : Text; occurredAt : Timestamp };
  type Incident = {
    id : IncidentId; studentId : StudentId; reportedBy : StaffId;
    severity : IncidentSeverity; description : Text; routedTo : ?StaffId;
    status : IncidentStatus; createdAt : Timestamp; timeline : [IncidentEvent];
    commitmentId : ?CommitmentId; isDemoData : Bool;
  };
  type CommitmentType = {
    #counsellorFollowUp; #iepRenewal; #conferenceBooking; #parentCall;
    #permissionSlip; #behaviourFollowUp; #workHome; #custom;
  };
  type CommitmentStatus = { #open; #completed; #overdue };
  type Commitment = {
    id : CommitmentId; commitmentType : CommitmentType; ownerId : StaffId;
    studentId : StudentId; dueDate : Timestamp; description : Text;
    status : CommitmentStatus; createdAt : Timestamp;
    completedAt : ?Timestamp; isDemoData : Bool;
  };
  type Message = {
    id : MessageId; fromId : StaffId; toId : StaffId; subject : Text;
    body : Text; sentAt : Timestamp; threadId : ThreadId;
    isRead : Bool; isDemoData : Bool;
  };
  type Thread = {
    id : ThreadId; subject : Text; participants : [StaffId];
    lastMessageAt : Timestamp; isDemoData : Bool;
  };
  type SignalType = { #opportunity; #workload; #continuity; #commitment; #celebration; #pattern; #risk };
  type SignalUrgency = { #info; #important; #critical };
  type UnderstandingSignal = {
    id : SignalId; signalType : SignalType; studentId : ?StudentId;
    roleTarget : Role; reason : Text; urgency : SignalUrgency;
    createdAt : Timestamp; commitmentId : ?CommitmentId;
  };
  type SubmissionStatus = { #notSubmitted; #submitted; #graded };
  type Submission = {
    id : SubmissionId; assignmentId : AssignmentId; studentId : StudentId;
    submittedAt : Timestamp; submissionText : Text;
    status : SubmissionStatus; earnedPoints : ?Float; isDemoData : Bool;
  };
  type AnnouncementPriority = { #info; #important; #urgent };
  type Announcement = {
    id : AnnouncementId; authorId : StaffId; title : Text; body : Text;
    targetRoles : [Role]; priority : AnnouncementPriority;
    createdAt : Timestamp; isDemoData : Bool;
  };

  // ── New SPED types ────────────────────────────────────────────────────
  type IEPNoteType = { #general; #goal; #accommodation; #service; #meeting; #review };
  type IEPNote = {
    id : IEPNoteId; studentId : StudentId; authorId : StaffId;
    noteType : IEPNoteType; body : Text; createdAt : Timestamp;
    isDemoData : Bool;
  };
  type IEPGoal = {
    id : Nat; description : Text; domain : Text;
    targetDate : ?Timestamp; progress : Text;
  };
  type IEPAccommodation = { category : Text; description : Text };
  type IEPService = {
    serviceType : Text; minutesPerWeek : Nat; provider : Text;
    startDate : Timestamp; endDate : ?Timestamp;
  };
  type IEPReviewEntry = { reviewedAt : Timestamp; reviewedBy : StaffId; notes : Text };
  type IEPRecord = {
    studentId : StudentId; renewalDate : Timestamp;
    goals : [IEPGoal]; accommodations : [IEPAccommodation];
    services : [IEPService]; reviewHistory : [IEPReviewEntry];
    lastUpdatedAt : Timestamp; lastUpdatedBy : StaffId; isDemoData : Bool;
  };
  type ComplianceItemType = { #annualReview; #triennial; #iepMeeting; #progressReport };
  type ComplianceStatus = { #complete; #pending; #overdue };
  type ComplianceItem = {
    id : ComplianceItemId; studentId : StudentId; ownerId : StaffId;
    itemType : ComplianceItemType; dueDate : Timestamp;
    status : ComplianceStatus; notes : ?Text;
    completedAt : ?Timestamp; isDemoData : Bool;
  };

  // ── New Notification types ────────────────────────────────────────────
  type NotificationTier = { #critical; #important; #informational };
  type NotificationEventType = {
    #gradePosted; #attendanceFlagged; #iepDue; #incidentRouted;
    #conferenceBooked; #commitmentDue; #assignmentSubmitted;
    #messageReceived; #announcementPosted; #behaviourFollowUp;
    #riskSignal; #other;
  };
  type Notification = {
    id : NotificationId; recipientId : StaffId;
    eventType : NotificationEventType; tier : NotificationTier;
    title : Text; body : Text; isRead : Bool; createdAt : Timestamp;
    relatedId : ?Nat; relatedType : ?Text; isDemoData : Bool;
  };

  // ── New Counsellor types ──────────────────────────────────────────────
  type InterventionType = {
    #academic; #behavioural; #socialEmotional; #attendance; #family; #custom;
  };
  type InterventionStatus = { #active; #completed; #closed };
  type InterventionOutcome = { outcome : Text; notes : Text; recordedAt : Timestamp };
  type Intervention = {
    id : InterventionId; studentId : StudentId; counsellorId : StaffId;
    interventionType : InterventionType; description : Text; planDetails : Text;
    followUpDate : Timestamp; status : InterventionStatus;
    outcomes : [InterventionOutcome]; finalOutcome : ?Text;
    commitmentId : ?CommitmentId; createdAt : Timestamp; isDemoData : Bool;
  };
  type AppointmentType = {
    #checkIn; #intervention; #groupSession; #parentConference;
    #referralFollowUp; #custom;
  };
  type AppointmentStatus = { #scheduled; #completed; #cancelled };
  type Appointment = {
    id : AppointmentId; counsellorId : StaffId; studentId : StudentId;
    dateTime : Timestamp; appointmentType : AppointmentType;
    notes : Text; status : AppointmentStatus;
    createdAt : Timestamp; isDemoData : Bool;
  };

  // ── Migration contract ─────────────────────────────────────────────────
  // OldActor = AddSubmissionsAnnouncements.NewActor (last successfully deployed)
  type OldActor = {
    students        : Map.Map<StudentId, Student>;
    staff           : Map.Map<StaffId, Staff>;
    courses         : Map.Map<CourseId, Course>;
    assignments     : Map.Map<AssignmentId, Assignment>;
    grades          : Map.Map<GradeId, Grade>;
    attendance      : Map.Map<AttendanceId, AttendanceRecord>;
    incidents       : Map.Map<IncidentId, Incident>;
    commitments     : Map.Map<CommitmentId, Commitment>;
    messages        : Map.Map<MessageId, Message>;
    threads         : Map.Map<ThreadId, Thread>;
    signals         : Map.Map<SignalId, UnderstandingSignal>;
    studentAudits   : Map.Map<AuditId, StudentAuditEntry>;
    submissions     : Map.Map<SubmissionId, Submission>;
    announcements   : Map.Map<AnnouncementId, Announcement>;
    readReceipts    : Map.Map<Text, Bool>;
    state : {
      var nextStudentId      : Nat;
      var nextStaffId        : Nat;
      var nextCourseId       : Nat;
      var nextAssignmentId   : Nat;
      var nextGradeId        : Nat;
      var nextAttendanceId   : Nat;
      var nextIncidentId     : Nat;
      var nextCommitmentId   : Nat;
      var nextMessageId      : Nat;
      var nextThreadId       : Nat;
      var nextAuditId        : Nat;
      var nextSignalId       : Nat;
      var nextSubmissionId   : Nat;
      var nextAnnouncementId : Nat;
      var isDemoDataLoaded   : Bool;
    };
    devState : { var currentRole : Role };
  };

  // NewActor = current main.mo full state shape
  type NewActor = {
    students        : Map.Map<StudentId, Student>;
    staff           : Map.Map<StaffId, Staff>;
    courses         : Map.Map<CourseId, Course>;
    assignments     : Map.Map<AssignmentId, Assignment>;
    grades          : Map.Map<GradeId, Grade>;
    attendance      : Map.Map<AttendanceId, AttendanceRecord>;
    incidents       : Map.Map<IncidentId, Incident>;
    commitments     : Map.Map<CommitmentId, Commitment>;
    messages        : Map.Map<MessageId, Message>;
    threads         : Map.Map<ThreadId, Thread>;
    signals         : Map.Map<SignalId, UnderstandingSignal>;
    studentAudits   : Map.Map<AuditId, StudentAuditEntry>;
    submissions     : Map.Map<SubmissionId, Submission>;
    announcements   : Map.Map<AnnouncementId, Announcement>;
    readReceipts    : Map.Map<Text, Bool>;
    iepRecords      : Map.Map<StudentId, IEPRecord>;
    iepNotes        : Map.Map<IEPNoteId, IEPNote>;
    complianceItems : Map.Map<ComplianceItemId, ComplianceItem>;
    notifications   : Map.Map<NotificationId, Notification>;
    interventions   : Map.Map<InterventionId, Intervention>;
    appointments    : Map.Map<AppointmentId, Appointment>;
    state : {
      var nextStudentId        : Nat;
      var nextStaffId          : Nat;
      var nextCourseId         : Nat;
      var nextAssignmentId     : Nat;
      var nextGradeId          : Nat;
      var nextAttendanceId     : Nat;
      var nextIncidentId       : Nat;
      var nextCommitmentId     : Nat;
      var nextMessageId        : Nat;
      var nextThreadId         : Nat;
      var nextAuditId          : Nat;
      var nextSignalId         : Nat;
      var nextSubmissionId     : Nat;
      var nextAnnouncementId   : Nat;
      var nextIEPNoteId        : Nat;
      var nextComplianceItemId : Nat;
      var nextNotificationId   : Nat;
      var nextInterventionId   : Nat;
      var nextAppointmentId    : Nat;
      var isDemoDataLoaded     : Bool;
    };
    devState : { var currentRole : Role };
  };

  public func migration(old : OldActor) : NewActor {
    {
      students        = old.students;
      staff           = old.staff;
      courses         = old.courses;
      assignments     = old.assignments;
      grades          = old.grades;
      attendance      = old.attendance;
      incidents       = old.incidents;
      commitments     = old.commitments;
      messages        = old.messages;
      threads         = old.threads;
      signals         = old.signals;
      studentAudits   = old.studentAudits;
      submissions     = old.submissions;
      announcements   = old.announcements;
      readReceipts    = old.readReceipts;
      iepRecords      = Map.empty<StudentId, IEPRecord>();
      iepNotes        = Map.empty<IEPNoteId, IEPNote>();
      complianceItems = Map.empty<ComplianceItemId, ComplianceItem>();
      notifications   = Map.empty<NotificationId, Notification>();
      interventions   = Map.empty<InterventionId, Intervention>();
      appointments    = Map.empty<AppointmentId, Appointment>();
      state = {
        var nextStudentId        = old.state.nextStudentId;
        var nextStaffId          = old.state.nextStaffId;
        var nextCourseId         = old.state.nextCourseId;
        var nextAssignmentId     = old.state.nextAssignmentId;
        var nextGradeId          = old.state.nextGradeId;
        var nextAttendanceId     = old.state.nextAttendanceId;
        var nextIncidentId       = old.state.nextIncidentId;
        var nextCommitmentId     = old.state.nextCommitmentId;
        var nextMessageId        = old.state.nextMessageId;
        var nextThreadId         = old.state.nextThreadId;
        var nextAuditId          = old.state.nextAuditId;
        var nextSignalId         = old.state.nextSignalId;
        var nextSubmissionId     = old.state.nextSubmissionId;
        var nextAnnouncementId   = old.state.nextAnnouncementId;
        var nextIEPNoteId        = 1;
        var nextComplianceItemId = 1;
        var nextNotificationId   = 1;
        var nextInterventionId   = 1;
        var nextAppointmentId    = 1;
        var isDemoDataLoaded     = old.state.isDemoDataLoaded;
      };
      devState = old.devState;
    }
  };

};
