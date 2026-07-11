import Debug "mo:core/Debug";
import Common "common";

module {

  // Re-export spine aliases for convenience
  public type StudentId   = Common.StudentId;
  public type StaffId     = Common.StaffId;
  public type CourseId    = Common.CourseId;
  public type CommitmentId = Common.CommitmentId;
  public type SignalId    = Common.SignalId;
  public type AuditId     = Common.AuditId;
  public type Timestamp   = Common.Timestamp;
  public type Role        = Common.Role;

  // ── Rich contact record (spec §1) ─────────────────────────────────────
  public type StudentContact = {
    name              : Text;
    relationship      : Text;
    email             : ?Text;
    phone             : ?Text;
    homeLanguage      : ?Text;
    emergencyPriority : Nat;
  };

  // ── Special-population flags (spec §1) ────────────────────────────────
  public type SpecialPopFlags = {
    isIEP          : Bool;
    iepStartDate   : ?Int;
    iepRenewalDate : ?Int;
    isELL          : Bool;
    widaLevel      : ?Nat;
    isMcKinneyVento : Bool;
    isFosterYouth  : Bool;
    isGifted       : Bool;
    medicalAlerts  : [Text];
  };

  // ── Demographics sub-record ────────────────────────────────────────────
  public type Demographics = {
    race         : ?Text;
    ethnicity    : ?Text;
    frl          : Bool;       // free/reduced lunch
    districtCode : ?Text;
  };

  // ── Student (canonical rich record) ───────────────────────────────────
  public type Student = {
    id                : StudentId;
    name              : Text;
    preferredName     : ?Text;
    dob               : ?Text;
    grade             : Nat;
    homeroom          : ?Text;
    photo             : ?Text;
    code              : Text;
    enrolmentStatus   : { #Active; #Inactive; #Transferred };
    enrolmentDate     : Int;
    contacts          : [StudentContact];
    assignedCounsellorId : ?Text;
    assignedSpedId    : ?Text;
    specialPop        : SpecialPopFlags;
    demographics      : Demographics;
    isDemoData        : Bool;
  };

  // ── Trajectory (per-course) ────────────────────────────────────────────
  public type TrajectoryResult = {
    studentId      : Text;
    courseId       : Text;
    direction      : { #Up; #Flat; #Down };
    rolling3Avg    : Float;
    priorTermDelta : ?Float;
    passStatus     : { #Passing; #AtRisk; #Failing };
    lastFiveScores : [Float];
  };

  // ── Audit entry ────────────────────────────────────────────────────────
  public type AuditEntry = {
    id         : AuditId;
    entityType : Text;
    entityId   : Text;
    action     : Text;
    actorId    : Text;
    actorRole  : Role;
    timestamp  : Int;
    delta      : ?Text;
  };

  // ── Full record returned to authorised viewers ─────────────────────────
  public type StudentFullRecord = {
    student              : Student;
    currentGPA           : ?Float;
    attendanceRate       : Float;
    behaviourPatternFlag : Bool;
    trajectory           : [TrajectoryResult];
    commitments          : [Common.Commitment];
    signals              : [Common.UnderstandingSignal];
    auditTrail           : [AuditEntry];
  };

};
