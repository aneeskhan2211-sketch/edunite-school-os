import Common "common";

module {

  // Re-export scalar aliases from common
  public type StaffId      = Common.StaffId;
  public type StudentId    = Common.StudentId;
  public type CommitmentId = Common.CommitmentId;
  public type CourseId     = Common.CourseId;

  // Canonical types — alias to common.mo so CTypes.X == Types.X everywhere
  public type CommitmentType   = Common.CommitmentType;
  public type CommitmentStatus = Common.CommitmentStatus;
  public type Commitment       = Common.Commitment;

  // Surfacing (bucketed by urgency) — kept here as it is commitments-specific
  public type CommitmentSurfacing = {
    overdue    : [Commitment];
    dueToday   : [Commitment];
    thisWeek   : [Commitment];
    comingSoon : [Commitment];
  };

};
