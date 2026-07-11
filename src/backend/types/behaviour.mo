import Common "common";

module {

  public type StudentId   = Common.StudentId;
  public type StaffId     = Common.StaffId;
  public type IncidentId  = Common.IncidentId;
  public type CommitmentId = Common.CommitmentId;
  public type Role        = Common.Role;

  // ── Severity (1-5 ordinal) ────────────────────────────────────────────
  public type IncidentSeverity = Nat; // 1 = minor .. 5 = critical

  // ── Lifecycle status ──────────────────────────────────────────────────
  public type IncidentStatus = { #Open; #UnderReview; #Resolved; #FollowUpDue };

  // ── Single event in the status timeline ───────────────────────────────
  public type IncidentEvent = {
    status     : IncidentStatus;
    staffId    : Text;
    note       : Text;
    occurredAt : Int;
  };

  // ── Canonical incident record ─────────────────────────────────────────
  public type Incident = {
    id                   : IncidentId;
    studentId            : StudentId;
    date                 : Text;
    severity             : IncidentSeverity;
    description          : Text;
    enteredBy            : Text;
    enteredAt            : Int;
    routedTo             : ?Text;
    status               : IncidentStatus;
    resolutionNotes      : ?Text;
    resolvedAt           : ?Int;
    resolvedBy           : ?Text;
    followUpCommitmentId : ?Text;
    readableByRoles      : [Role];
    timeline             : [IncidentEvent];
    isDemoData           : Bool;
  };

  // ── Computed pattern ──────────────────────────────────────────────────
  public type IncidentTrend = { #Increasing; #Flat; #Decreasing };

  public type IncidentPattern = {
    studentId              : StudentId;
    count90day             : Nat;
    severityBreakdown      : [(Nat, Nat)]; // (severity, count)
    repeatPatternFlag      : Bool;
    trend                  : IncidentTrend;
    escalationTimelineDays : ?Nat;
  };

};
