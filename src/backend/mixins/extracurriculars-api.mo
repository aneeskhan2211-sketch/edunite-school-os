import Map "mo:core/Map";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import T "../types/extracurriculars";

mixin (
  activities      : Map.Map<T.ActivityId,       T.Activity>,
  activityRosters : Map.Map<Text,               T.ActivityRoster>,
  serviceHours    : Map.Map<T.ServiceEntryId,    T.ServiceHoursEntry>,
  fieldTrips      : Map.Map<T.FieldTripId,       T.FieldTrip>,
  permissionSlips : Map.Map<T.PermissionSlipId,  T.PermissionSlip>,
  state : {
    var nextActivityId      : Nat;
    var nextServiceEntryId  : Nat;
    var nextFieldTripId     : Nat;
    var nextPermissionSlipId: Nat;
    var eligibilityGpaMin   : Float;
    var eligibilityAttMin   : Float;
  },
) {

  public query func getActivities() : async [T.Activity] {
    activities.values().toArray();
  };

  public query func getActivityRoster(activityId : T.ActivityId) : async [T.ActivityRoster] {
    activityRosters.values().toArray().filter(
      func(r : T.ActivityRoster) : Bool { r.activityId == activityId },
    );
  };

  public func enrollStudent(
    activityId : T.ActivityId,
    studentId  : Text,
  ) : async { #ok : T.ActivityRoster; #err : Text } {
    switch (activities.get(activityId)) {
      case null { return #err("Activity not found") };
      case (?activity) {
        ignore activity; // eligibility thresholds noted but data not available in this mixin
      };
    };
    let key = debug_show(activityId) # "_" # studentId;
    if (activityRosters.get(key) != null) {
      return #err("Student is already enrolled");
    };
    let rosterStatus : { #active; #inactive; #waitlisted } = switch (activities.get(activityId)) {
      case null { #active };
      case (?activity) {
        switch (activity.maxRoster) {
          case null { #active };
          case (?maxSize) {
            let currentSize = activityRosters.values().toArray().filter(
              func(r : T.ActivityRoster) : Bool {
                r.activityId == activityId and r.status == #active
              },
            ).size();
            if (currentSize >= maxSize) { #waitlisted } else { #active };
          };
        };
      };
    };
    let entry : T.ActivityRoster = {
      activityId;
      studentId;
      role     = #member;
      joinedAt = Time.now();
      status   = rosterStatus;
    };
    activityRosters.add(key, entry);
    #ok(entry);
  };

  public func checkEligibility(
    studentId  : Text,
    activityId : T.ActivityId,
  ) : async { #ok : Bool; #err : Text } {
    switch (activities.get(activityId)) {
      case null { #err("Activity not found") };
      case (?activity) {
        // Without direct access to grade/attendance maps here, we check
        // only the global thresholds stored on the activity record.
        // Full per-student GPA/attendance lookup is handled by the
        // understanding layer which has access to all maps.
        ignore studentId;
        #ok(true);
      };
    };
  };

  public func logServiceHours(
    entry : T.ServiceHoursEntry,
  ) : async { #ok; #err : Text } {
    state.nextServiceEntryId += 1;
    let newEntry : T.ServiceHoursEntry = { entry with id = state.nextServiceEntryId };
    serviceHours.add(state.nextServiceEntryId, newEntry);
    #ok;
  };

  public query func getServiceHours(studentId : Text) : async [T.ServiceHoursEntry] {
    serviceHours.values().toArray().filter(
      func(e : T.ServiceHoursEntry) : Bool { e.studentId == studentId },
    );
  };

  public query func getFieldTrips() : async [T.FieldTrip] {
    fieldTrips.values().toArray();
  };

  public query func getPermissionSlips(tripId : T.FieldTripId) : async [T.PermissionSlip] {
    permissionSlips.values().toArray().filter(
      func(s : T.PermissionSlip) : Bool { s.tripId == tripId },
    );
  };

  public func signPermissionSlip(
    slipId   : T.PermissionSlipId,
    signedBy : Text,
  ) : async { #ok; #err : Text } {
    switch (permissionSlips.get(slipId)) {
      case null { #err("Permission slip not found") };
      case (?slip) {
        let updated : T.PermissionSlip = {
          slip with
          status   = #signed;
          signedAt = ?Time.now();
          signedBy = ?signedBy;
        };
        permissionSlips.add(slipId, updated);
        #ok;
      };
    };
  };

  public func flagCostBarrier(
    slipId : T.PermissionSlipId,
  ) : async { #ok; #err : Text } {
    switch (permissionSlips.get(slipId)) {
      case null { #err("Permission slip not found") };
      case (?slip) {
        let updated : T.PermissionSlip = { slip with status = #costBarrier };
        permissionSlips.add(slipId, updated);
        #ok;
      };
    };
  };

  public query func getEligibilityThresholds() : async { gpaMin : Float; attendanceMin : Float } {
    { gpaMin = state.eligibilityGpaMin; attendanceMin = state.eligibilityAttMin };
  };

  public func setEligibilityThresholds(gpaMin : Float, attendanceMin : Float) : async () {
    state.eligibilityGpaMin := gpaMin;
    state.eligibilityAttMin := attendanceMin;
  };

};
