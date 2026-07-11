// Initial migration — introduces all stable state for EdUnite OS backend.
// OldActor = {} (first migration in the chain).

import Map "mo:core/Map";
import List "mo:core/List";

module {

  // ── Inline types required by migration (must not import project modules) ──

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
  type Assignment = {
    id : AssignmentId; courseId : CourseId; name : Text;
    dueDate : Timestamp; weight : Float; isHighStakes : Bool;
    linkedLessonId : ?Nat; term : Text; isDemoData : Bool;
  };
  type AuditEntry = {
    id : AuditId; entityType : Text; entityId : Nat; action : Text;
    performedBy : StaffId; performedAt : Timestamp;
    previousValue : ?Text; newValue : ?Text;
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

  // ── Migration contract ──

  type OldActor = {};

  type NewActor = {
    students    : Map.Map<StudentId, Student>;
    staff       : Map.Map<StaffId, Staff>;
    courses     : Map.Map<CourseId, Course>;
    assignments : Map.Map<AssignmentId, Assignment>;
    grades      : Map.Map<GradeId, Grade>;
    attendance  : Map.Map<AttendanceId, AttendanceRecord>;
    incidents   : Map.Map<IncidentId, Incident>;
    commitments : Map.Map<CommitmentId, Commitment>;
    messages    : Map.Map<MessageId, Message>;
    threads     : Map.Map<ThreadId, Thread>;
    signals     : Map.Map<SignalId, UnderstandingSignal>;
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

  public func migration(_ : OldActor) : NewActor {
    {
      students    = Map.empty<StudentId, Student>();
      staff       = Map.empty<StaffId, Staff>();
      courses     = Map.empty<CourseId, Course>();
      assignments = Map.empty<AssignmentId, Assignment>();
      grades      = Map.empty<GradeId, Grade>();
      attendance  = Map.empty<AttendanceId, AttendanceRecord>();
      incidents   = Map.empty<IncidentId, Incident>();
      commitments = Map.empty<CommitmentId, Commitment>();
      messages    = Map.empty<MessageId, Message>();
      threads     = Map.empty<ThreadId, Thread>();
      signals     = Map.empty<SignalId, UnderstandingSignal>();
      state = {
        var nextStudentId    = 1;
        var nextStaffId      = 1;
        var nextCourseId     = 1;
        var nextAssignmentId = 1;
        var nextGradeId      = 1;
        var nextAttendanceId = 1;
        var nextIncidentId   = 1;
        var nextCommitmentId = 1;
        var nextMessageId    = 1;
        var nextThreadId     = 1;
        var nextAuditId      = 1;
        var nextSignalId     = 1;
        var isDemoDataLoaded = false;
      };
      devState = { var currentRole = #teacher };
    };
  };

};
