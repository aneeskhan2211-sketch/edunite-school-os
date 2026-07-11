import Common "common";

module {

  public type StudentId    = Common.StudentId;
  public type StaffId      = Common.StaffId;
  public type CommitmentId = Common.CommitmentId;
  public type Timestamp    = Common.Timestamp;

  // ── IEP Note ──────────────────────────────────────────────────────────
  public type IEPNoteId = Nat;

  public type IEPNoteType = {
    #general;
    #goal;
    #accommodation;
    #service;
    #meeting;
    #review;
  };

  public type IEPNote = {
    id          : IEPNoteId;
    studentId   : StudentId;
    authorId    : StaffId;
    noteType    : IEPNoteType;
    body        : Text;
    createdAt   : Timestamp;
    isDemoData  : Bool;
  };

  // ── IEP Record ─────────────────────────────────────────────────────────
  public type IEPGoal = {
    id          : Nat;
    description : Text;
    domain      : Text;  // e.g. "Reading", "Math", "Social/Emotional"
    targetDate  : ?Timestamp;
    progress    : Text;  // "on-track" | "behind" | "met"
  };

  public type IEPAccommodation = {
    category    : Text;  // e.g. "Testing", "Instruction", "Environment"
    description : Text;
  };

  public type IEPService = {
    serviceType  : Text;  // e.g. "Speech", "OT", "Resource Room"
    minutesPerWeek : Nat;
    provider     : Text;
    startDate    : Timestamp;
    endDate      : ?Timestamp;
  };

  public type IEPReviewEntry = {
    reviewedAt  : Timestamp;
    reviewedBy  : StaffId;
    notes       : Text;
  };

  public type IEPRecord = {
    studentId        : StudentId;
    renewalDate      : Timestamp;
    goals            : [IEPGoal];
    accommodations   : [IEPAccommodation];
    services         : [IEPService];
    reviewHistory    : [IEPReviewEntry];
    lastUpdatedAt    : Timestamp;
    lastUpdatedBy    : StaffId;
    isDemoData       : Bool;
  };

  // ── Compliance ─────────────────────────────────────────────────────────
  public type ComplianceItemId = Nat;

  public type ComplianceItemType = {
    #annualReview;
    #triennial;
    #iepMeeting;
    #progressReport;
  };

  public type ComplianceStatus = {
    #complete;
    #pending;
    #overdue;
  };

  public type ComplianceItem = {
    id          : ComplianceItemId;
    studentId   : StudentId;
    ownerId     : StaffId;
    itemType    : ComplianceItemType;
    dueDate     : Timestamp;
    status      : ComplianceStatus;
    notes       : ?Text;
    completedAt : ?Timestamp;
    isDemoData  : Bool;
  };

  // ── IEPStudent (caseload row) ──────────────────────────────────────────
  public type IEPStudent = {
    studentId          : StudentId;
    name               : Text;
    grade              : Nat;
    renewalDate        : Timestamp;
    daysToRenewal      : Int;       // negative = overdue
    contextualNextStep : Text;
    urgencyTier        : { #overdue; #danger; #warning; #info; #future };
    spedFlags          : Common.SpecialPopFlags;
  };

  // ── Caseload summary ──────────────────────────────────────────────────
  public type CaseloadSummary = {
    totalStudents              : Nat;
    dueThisWeek                : Nat;
    overdueRenewals            : Nat;
    studentsWithGradeConcerns  : Nat;
    studentsWithAttendanceConcerns : Nat;
    openCommitments            : Nat;
  };

  // ── IEP public API record (returned to callers) ────────────────────────
  public type IEPDetail = {
    record       : IEPRecord;
    notes        : [IEPNote];
  };

  // ── Result helpers ────────────────────────────────────────────────────
  public type UpdateResult = { #ok; #err : Text };

};
