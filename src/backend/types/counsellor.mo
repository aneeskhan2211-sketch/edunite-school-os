import Common "common";

module {

  // Re-export shared scalars
  public type StudentId    = Common.StudentId;
  public type StaffId      = Common.StaffId;
  public type Timestamp    = Common.Timestamp;
  public type CommitmentId = Common.CommitmentId;

  // ── Intervention ───────────────────────────────────────────────────────────
  public type InterventionId = Nat;

  public type InterventionType = {
    #academic;
    #behavioural;
    #socialEmotional;
    #attendance;
    #family;
    #custom;
  };

  public type InterventionStatus = {
    #active;
    #completed;
    #closed;
  };

  public type InterventionOutcome = {
    outcome   : Text;  // plain-language result
    notes     : Text;
    recordedAt : Timestamp;
  };

  public type Intervention = {
    id             : InterventionId;
    studentId      : StudentId;
    counsellorId   : StaffId;
    interventionType : InterventionType;
    description    : Text;
    planDetails    : Text;
    followUpDate   : Timestamp;
    status         : InterventionStatus;
    outcomes       : [InterventionOutcome];
    finalOutcome   : ?Text;
    commitmentId   : ?CommitmentId;
    createdAt      : Timestamp;
    isDemoData     : Bool;
  };

  // ── Caseload ────────────────────────────────────────────────────────────────
  public type CaseloadStudent = {
    studentId          : StudentId;
    name               : Text;
    grade              : Nat;
    attendancePct      : Float;
    gradeTrajectory    : Text;   // "rising" | "steady" | "dropping"
    recentIncidents    : Nat;
    openCommitments    : Nat;
    specialPopFlags    : {
      sped        : Bool;
      ell         : Bool;
      medicalAlert : ?Text;
    };
    hasActiveIntervention : Bool;
  };

  public type CaseloadEntry = {
    student              : CaseloadStudent;
    interventions        : [Intervention];
    upcomingCommitments  : [Common.Commitment];
  };

  // ── Appointment ─────────────────────────────────────────────────────────────
  public type AppointmentId = Nat;

  public type AppointmentType = {
    #checkIn;
    #intervention;
    #groupSession;
    #parentConference;
    #referralFollowUp;
    #custom;
  };

  public type AppointmentStatus = {
    #scheduled;
    #completed;
    #cancelled;
  };

  public type Appointment = {
    id            : AppointmentId;
    counsellorId  : StaffId;
    studentId     : StudentId;
    dateTime      : Timestamp;
    appointmentType : AppointmentType;
    notes         : Text;
    status        : AppointmentStatus;
    createdAt     : Timestamp;
    isDemoData    : Bool;
  };

};
