// Migration: Add submissions, announcements, readReceipts stable maps.
// Extend Assignment with description, points, assignmentType fields.
// OldActor = NewActor of 20260613_200000_AddStudentAudits.mo

import Map "mo:core/Map";

module {

  // ── Inline types ────────────────────────────────────────────────────────
  type StudentId    = Nat;
  type StaffId      = Nat;
  type CourseId     = Nat;
  type AssignmentId = Nat;
  type GradeId      = Nat;
  type AttendanceId = Nat;
  type IncidentId   = Nat;
  type CommitmentId = Nat;
  type MessageId    = Nat;
  type ThreadId     = Nat;
  type SignalId     = Nat;
  type AuditId      = Nat;
  type SubmissionId = Nat;
  type AnnouncementId = Nat;
  type Timestamp    = Int;

  type Role = {
    #teacher; #coTeacher; #student; #parent; #schoolAdmin;
    #departmentHead; #principal; #districtAdmin; #counsellor;
    #spedCoordinator; #curriculumCoordinator; #substitute;
  };
  type EnrollmentStatus = { #active; #withdrawn; #graduated; #transferred };
  type SpecialPopFlags  = {
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
  type Lesson = {
    id : Nat; unitId : Nat; name : Text; description : Text; orderIndex : Nat;
  };
  type Unit = {
    id : Nat; courseId : CourseId; name : Text; orderIndex : Nat;
    lessons : [Lesson];
  };
  type Course = {
    id : CourseId; name : Text; code : Text; department : Text;
    teacherId : StaffId; coTeacherId : ?StaffId; grade : Nat;
    units : [Unit]; isDemoData : Bool;
  };

  // Old assignment (no description/points/assignmentType)
  type OldAssignment = {
    id : AssignmentId; courseId : CourseId; name : Text;
    dueDate : Timestamp; weight : Float; isHighStakes : Bool;
    linkedLessonId : ?Nat; term : Text; isDemoData : Bool;
  };

  // New assignment (with description, points, assignmentType)
  type AssignmentType = { #homework; #quiz; #test; #project; #essay };
  type NewAssignment = {
    id : AssignmentId; courseId : CourseId; name : Text;
    description : ?Text; dueDate : Timestamp; points : Float;
    weight : Float; isHighStakes : Bool;
    assignmentType : AssignmentType;
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
  type IncidentEvent    = {
    status : IncidentStatus; staffId : StaffId; note : Text; occurredAt : Timestamp;
  };
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
  type SignalType = {
    #opportunity; #workload; #continuity; #commitment;
    #celebration; #pattern; #risk;
  };
  type SignalUrgency = { #info; #important; #critical };
  type UnderstandingSignal = {
    id : SignalId; signalType : SignalType; studentId : ?StudentId;
    roleTarget : Role; reason : Text; urgency : SignalUrgency;
    createdAt : Timestamp; commitmentId : ?CommitmentId;
  };

  // New types added by this migration
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

  // ── Migration contract ───────────────────────────────────────────────────
  type OldActor = {
    students      : Map.Map<StudentId, Student>;
    staff         : Map.Map<StaffId, Staff>;
    courses       : Map.Map<CourseId, Course>;
    assignments   : Map.Map<AssignmentId, OldAssignment>;
    grades        : Map.Map<GradeId, Grade>;
    attendance    : Map.Map<AttendanceId, AttendanceRecord>;
    incidents     : Map.Map<IncidentId, Incident>;
    commitments   : Map.Map<CommitmentId, Commitment>;
    messages      : Map.Map<MessageId, Message>;
    threads       : Map.Map<ThreadId, Thread>;
    signals       : Map.Map<SignalId, UnderstandingSignal>;
    studentAudits : Map.Map<AuditId, StudentAuditEntry>;
    state : {
      var nextStudentId    : Nat;
      var nextStaffId      : Nat;
      var nextCourseId     : Nat;
      var nextAssignmentId : Nat;
      var nextGradeId      : Nat;
      var nextAttendanceId : Nat;
      var nextIncidentId   : Nat;
      var nextCommitmentId : Nat;
      var nextMessageId    : Nat;
      var nextThreadId     : Nat;
      var nextAuditId      : Nat;
      var nextSignalId     : Nat;
      var isDemoDataLoaded : Bool;
    };
    devState : { var currentRole : Role };
  };

  type NewActor = {
    students        : Map.Map<StudentId, Student>;
    staff           : Map.Map<StaffId, Staff>;
    courses         : Map.Map<CourseId, Course>;
    assignments     : Map.Map<AssignmentId, NewAssignment>;
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
    readReceipts    : Map.Map<Text, Bool>; // "userId:threadId" -> read
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

  public func migration(old : OldActor) : NewActor {
    // Migrate all old assignments: add description=null, points=100, assignmentType inferred from name
    let newAssignments = old.assignments.map<AssignmentId, OldAssignment, NewAssignment>(
      func(_, a) {
        let atype : AssignmentType =
          if (a.weight >= 0.25) { #test }
          else if (a.weight >= 0.20) { #essay }
          else if (a.name.size() > 0 and a.isHighStakes) { #test }
          else { #homework };
        {
          a with
          description    = null : ?Text;
          points         = 100.0;
          assignmentType = atype;
        }
      }
    );
    {
      students        = old.students;
      staff           = old.staff;
      courses         = old.courses;
      assignments     = newAssignments;
      grades          = old.grades;
      attendance      = old.attendance;
      incidents       = old.incidents;
      commitments     = old.commitments;
      messages        = old.messages;
      threads         = old.threads;
      signals         = old.signals;
      studentAudits   = old.studentAudits;
      submissions     = Map.empty<SubmissionId, Submission>();
      announcements   = Map.empty<AnnouncementId, Announcement>();
      readReceipts    = Map.empty<Text, Bool>();
      state = {
        var nextStudentId      = old.state.nextStudentId;
        var nextStaffId        = old.state.nextStaffId;
        var nextCourseId       = old.state.nextCourseId;
        var nextAssignmentId   = old.state.nextAssignmentId;
        var nextGradeId        = old.state.nextGradeId;
        var nextAttendanceId   = old.state.nextAttendanceId;
        var nextIncidentId     = old.state.nextIncidentId;
        var nextCommitmentId   = old.state.nextCommitmentId;
        var nextMessageId      = old.state.nextMessageId;
        var nextThreadId       = old.state.nextThreadId;
        var nextAuditId        = old.state.nextAuditId;
        var nextSignalId       = old.state.nextSignalId;
        var nextSubmissionId   = 1;
        var nextAnnouncementId = 1;
        var isDemoDataLoaded   = old.state.isDemoDataLoaded;
      };
      devState = old.devState;
    }
  };

};
