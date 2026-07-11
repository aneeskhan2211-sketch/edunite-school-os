import Map "mo:core/Map";
import Time "mo:core/Time";
import CTypes "../types/counsellor";

/// Seeds counsellor interventions + appointments for counsellor 7 across the demo
/// students, so the caseload's intervention/appointment views read real data.
/// Clears prior demo rows; idempotent across postupgrade.
module CounsellorSeed {

  public type SeedState = {
    interventions      : Map.Map<CTypes.InterventionId, CTypes.Intervention>;
    appointments       : Map.Map<CTypes.AppointmentId, CTypes.Appointment>;
    nextInterventionId : Nat;
    nextAppointmentId  : Nat;
  };

  public func seed(s : SeedState) : () {
    let interventions = s.interventions;
    let appointments = s.appointments;
    var iId = s.nextInterventionId;
    var aId = s.nextAppointmentId;

    var iRem : [CTypes.InterventionId] = [];
    for ((id, r) in interventions.entries()) {
      if (r.isDemoData) { iRem := iRem.concat([id]) };
    };
    for (id in iRem.vals()) { interventions.remove(id) };
    var aRem : [CTypes.AppointmentId] = [];
    for ((id, r) in appointments.entries()) {
      if (r.isDemoData) { aRem := aRem.concat([id]) };
    };
    for (id in aRem.vals()) { appointments.remove(id) };

    let dayNs : Int = 86_400_000_000_000;
    let now : Int = Time.now();

    let iRows : [CTypes.Intervention] = [
      { id = 0; studentId = 2; counsellorId = 7; interventionType = #attendance;
        description = "Attendance Support"; planDetails = "Daily check-in + family contact to lift attendance above 85%.";
        followUpDate = now + 10 * dayNs; status = #active; outcomes = []; finalOutcome = null;
        commitmentId = null; createdAt = now - 30 * dayNs; isDemoData = true },
      { id = 0; studentId = 5; counsellorId = 7; interventionType = #academic;
        description = "Academic Coaching"; planDetails = "Weekly coaching on study skills and organisation.";
        followUpDate = now + 12 * dayNs; status = #active; outcomes = []; finalOutcome = null;
        commitmentId = null; createdAt = now - 20 * dayNs; isDemoData = true },
      { id = 0; studentId = 3; counsellorId = 7; interventionType = #socialEmotional;
        description = "ELL Peer Tutoring"; planDetails = "Pair with peer tutor; monitor language confidence.";
        followUpDate = now + 14 * dayNs; status = #active; outcomes = []; finalOutcome = null;
        commitmentId = null; createdAt = now - 40 * dayNs; isDemoData = true },
    ];
    for (r in iRows.vals()) {
      interventions.add(iId, { r with id = iId });
      iId += 1;
    };

    let aRows : [CTypes.Appointment] = [
      { id = 0; counsellorId = 7; studentId = 2; dateTime = now + 1 * dayNs;
        appointmentType = #checkIn; notes = "Attendance check-in"; status = #scheduled;
        createdAt = now - 2 * dayNs; isDemoData = true },
      { id = 0; counsellorId = 7; studentId = 5; dateTime = now + 1 * dayNs;
        appointmentType = #intervention; notes = "Academic coaching session"; status = #scheduled;
        createdAt = now - 2 * dayNs; isDemoData = true },
      { id = 0; counsellorId = 7; studentId = 3; dateTime = now + 3 * dayNs;
        appointmentType = #referralFollowUp; notes = "ELL progress review"; status = #scheduled;
        createdAt = now - 1 * dayNs; isDemoData = true },
      { id = 0; counsellorId = 7; studentId = 1; dateTime = now + 5 * dayNs;
        appointmentType = #checkIn; notes = "Goal setting"; status = #scheduled;
        createdAt = now - 1 * dayNs; isDemoData = true },
    ];
    for (r in aRows.vals()) {
      appointments.add(aId, { r with id = aId });
      aId += 1;
    };
  };
};
