import Map "mo:core/Map";
import Types "../types/common";
import CTypes "../types/counsellor";
import Lib "../lib/Counsellor";

mixin (
  students      : Map.Map<Types.StudentId, Types.Student>,
  grades        : Map.Map<Types.GradeId, Types.Grade>,
  attendance    : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  incidents     : Map.Map<Types.IncidentId, Types.Incident>,
  commitments   : Map.Map<Types.CommitmentId, Types.Commitment>,
  interventions : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
  appointments  : Map.Map<CTypes.AppointmentId, CTypes.Appointment>,
  state         : {
    var nextInterventionId : Nat;
    var nextAppointmentId  : Nat;
    var nextCommitmentId   : Nat;
  },
) {

  // ── Interventions ─────────────────────────────────────────────────────────

  /// Create an intervention and auto-wire a follow-up commitment.
  public func createIntervention(
    studentId    : Types.StudentId,
    itype        : CTypes.InterventionType,
    description  : Text,
    planDetails  : Text,
    followUpDate : Types.Timestamp,
  ) : async { #ok : CTypes.Intervention; #err : Text } {
    Lib.createIntervention(
      interventions, commitments, state,
      1, // counsellorId: caller-based in prod; use 1 for dev-mock (first counsellor)
      studentId, itype, description, planDetails, followUpDate,
    );
  };

  /// Create an intervention on behalf of a specific counsellor.
  public func createInterventionForCounsellor(
    counsellorId : Types.StaffId,
    studentId    : Types.StudentId,
    itype        : CTypes.InterventionType,
    description  : Text,
    planDetails  : Text,
    followUpDate : Types.Timestamp,
  ) : async { #ok : CTypes.Intervention; #err : Text } {
    Lib.createIntervention(
      interventions, commitments, state,
      counsellorId, studentId, itype, description, planDetails, followUpDate,
    );
  };

  /// Record an outcome note on an active intervention.
  public func updateInterventionOutcome(
    interventionId : CTypes.InterventionId,
    outcome        : Text,
    notes          : Text,
  ) : async { #ok : (); #err : Text } {
    Lib.updateInterventionOutcome(interventions, interventionId, outcome, notes);
  };

  /// Close an intervention with a final outcome.
  public func closeIntervention(
    interventionId : CTypes.InterventionId,
    finalOutcome   : Text,
  ) : async { #ok : (); #err : Text } {
    Lib.closeIntervention(interventions, interventionId, finalOutcome);
  };

  /// All interventions for a student (active, completed, closed).
  public query func getInterventions(
    studentId : Types.StudentId,
  ) : async [CTypes.Intervention] {
    Lib.getInterventions(interventions, studentId);
  };

  /// All interventions owned by a counsellor (caseload view).
  public query func getInterventionsByOwner(
    counsellorId : Types.StaffId,
  ) : async [CTypes.Intervention] {
    Lib.getInterventionsByOwner(interventions, counsellorId);
  };

  // ── Caseload ─────────────────────────────────────────────────────────────

  /// Caseload summary: all students assigned to a counsellor with live SIS signals.
  public query func getCaseload(
    counsellorId : Types.StaffId,
  ) : async [CTypes.CaseloadStudent] {
    Lib.getCaseload(
      counsellorId, students, grades, attendance,
      incidents, commitments, interventions,
    );
  };

  /// Detailed caseload entry for one student.
  public query func getCaseloadStudent(
    counsellorId : Types.StaffId,
    studentId    : Types.StudentId,
  ) : async { #ok : CTypes.CaseloadEntry; #err : Text } {
    Lib.getCaseloadStudent(
      counsellorId, studentId, students, grades,
      attendance, incidents, commitments, interventions,
    );
  };

  // ── Appointments ─────────────────────────────────────────────────────────

  /// Schedule an appointment.
  public func createAppointment(
    studentId    : Types.StudentId,
    dateTime     : Types.Timestamp,
    atype        : CTypes.AppointmentType,
    notes        : Text,
  ) : async { #ok : CTypes.Appointment; #err : Text } {
    Lib.createAppointment(
      appointments, state,
      1, // counsellorId: caller-based in prod; dev mock uses 1
      studentId, dateTime, atype, notes,
    );
  };

  /// Schedule an appointment for a specific counsellor.
  public func createAppointmentForCounsellor(
    counsellorId : Types.StaffId,
    studentId    : Types.StudentId,
    dateTime     : Types.Timestamp,
    atype        : CTypes.AppointmentType,
    notes        : Text,
  ) : async { #ok : CTypes.Appointment; #err : Text } {
    Lib.createAppointment(
      appointments, state,
      counsellorId, studentId, dateTime, atype, notes,
    );
  };

  /// All appointments for a counsellor, ascending by date.
  public query func getAppointments(
    counsellorId : Types.StaffId,
  ) : async [CTypes.Appointment] {
    Lib.getAppointments(appointments, counsellorId);
  };

  /// Cancel an appointment.
  public func cancelAppointment(
    appointmentId : CTypes.AppointmentId,
  ) : async { #ok : (); #err : Text } {
    Lib.cancelAppointment(appointments, appointmentId);
  };

};
