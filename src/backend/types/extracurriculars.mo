module {

  public type ActivityId      = Nat;
  public type ServiceEntryId  = Nat;
  public type FieldTripId     = Nat;
  public type PermissionSlipId = Nat;

  public type Activity = {
    id                    : ActivityId;
    name                  : Text;
    actType               : { #sport; #club; #fineArts; #serviceHours };
    season                : ?Text;
    coachAdvisorId        : ?Text;
    eligibilityGpaMin     : Float;
    eligibilityAttendanceMin : Float;
    maxRoster             : ?Nat;
  };

  public type ActivityRoster = {
    activityId : ActivityId;
    studentId  : Text;
    role       : { #member; #leader; #captain };
    joinedAt   : Int;
    status     : { #active; #inactive; #waitlisted };
  };

  public type ServiceHoursEntry = {
    id         : ServiceEntryId;
    studentId  : Text;
    activityId : ?ActivityId;
    description: Text;
    hours      : Float;
    loggedAt   : Int;
    approvedBy : ?Text;
  };

  public type FieldTrip = {
    id                    : FieldTripId;
    name                  : Text;
    date                  : Int;
    destination           : Text;
    activityId            : ?ActivityId;
    permissionSlipRequired: Bool;
    cost                  : ?Float;
    approvalStatus        : { #pending; #approved; #cancelled };
  };

  public type PermissionSlip = {
    id        : PermissionSlipId;
    tripId    : FieldTripId;
    studentId : Text;
    status    : { #unsigned; #signed; #declined; #costBarrier };
    signedAt  : ?Int;
    signedBy  : ?Text;
  };

};
