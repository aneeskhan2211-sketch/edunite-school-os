import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/common";
import CTypes "../types/counsellor";
import CLib "../lib/Commitments";

module {

  // ── Nanos constants ─────────────────────────────────────────────────────────
  let NANOS_PER_DAY : Int = 86_400_000_000_000;

  // ── Intervention CRUD ────────────────────────────────────────────────────────

  public func createIntervention(
    store       : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
    commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
    state       : {
      var nextInterventionId : Nat;
      var nextCommitmentId   : Nat;
    },
    counsellorId     : Types.StaffId,
    studentId        : Types.StudentId,
    itype            : CTypes.InterventionType,
    description      : Text,
    planDetails      : Text,
    followUpDate     : Types.Timestamp,
  ) : { #ok : CTypes.Intervention; #err : Text } {
    // Auto-create a follow-up commitment wired to the commitments backend
    let commitmentResult = CLib.createFollowUpCommitment(
      commitments, state, #counsellorFollowUp,
      counsellorId, studentId, followUpDate,
      "Follow-up: " # description,
    );
    let commitmentId : ?Types.CommitmentId = switch (commitmentResult) {
      case (#ok c) { ?c.id };
      case (#err _) { null };
    };

    let id = state.nextInterventionId;
    state.nextInterventionId += 1;

    let intervention : CTypes.Intervention = {
      id;
      studentId;
      counsellorId;
      interventionType = itype;
      description;
      planDetails;
      followUpDate;
      status       = #active;
      outcomes     = [];
      finalOutcome = null;
      commitmentId;
      createdAt    = Time.now();
      isDemoData   = false;
    };
    store.add(id, intervention);
    #ok intervention;
  };

  public func updateInterventionOutcome(
    store         : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
    interventionId : CTypes.InterventionId,
    outcome       : Text,
    notes         : Text,
  ) : { #ok : (); #err : Text } {
    switch (store.get(interventionId)) {
      case null { #err "Intervention not found" };
      case (?existing) {
        let entry : CTypes.InterventionOutcome = {
          outcome;
          notes;
          recordedAt = Time.now();
        };
        let newOutcomes = List.empty<CTypes.InterventionOutcome>();
        for (o in existing.outcomes.vals()) { newOutcomes.add(o) };
        newOutcomes.add(entry);
        let updated : CTypes.Intervention = {
          existing with
          outcomes = newOutcomes.toArray();
        };
        store.add(interventionId, updated);
        #ok ();
      };
    };
  };

  public func closeIntervention(
    store          : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
    interventionId : CTypes.InterventionId,
    finalOutcome   : Text,
  ) : { #ok : (); #err : Text } {
    switch (store.get(interventionId)) {
      case null { #err "Intervention not found" };
      case (?existing) {
        let updated : CTypes.Intervention = {
          existing with
          status       = #closed;
          finalOutcome = ?finalOutcome;
        };
        store.add(interventionId, updated);
        #ok ();
      };
    };
  };

  public func getInterventions(
    store     : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
    studentId : Types.StudentId,
  ) : [CTypes.Intervention] {
    let buf = List.empty<CTypes.Intervention>();
    for ((_, iv) in store.entries()) {
      if (iv.studentId == studentId) { buf.add(iv) };
    };
    buf.toArray();
  };

  public func getInterventionsByOwner(
    store        : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
    counsellorId : Types.StaffId,
  ) : [CTypes.Intervention] {
    let buf = List.empty<CTypes.Intervention>();
    for ((_, iv) in store.entries()) {
      if (iv.counsellorId == counsellorId) { buf.add(iv) };
    };
    buf.toArray();
  };

  // ── Caseload ──────────────────────────────────────────────────────────────────

  public func getCaseload(
    counsellorId : Types.StaffId,
    students     : Map.Map<Types.StudentId, Types.Student>,
    grades       : Map.Map<Types.GradeId, Types.Grade>,
    attendance   : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    incidents    : Map.Map<Types.IncidentId, Types.Incident>,
    commitments  : Map.Map<Types.CommitmentId, Types.Commitment>,
    interventions : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
  ) : [CTypes.CaseloadStudent] {
    let buf = List.empty<CTypes.CaseloadStudent>();
    for ((_, s) in students.entries()) {
      let isMine = switch (s.counsellorId) {
        case (?cid) (cid == counsellorId);
        case null   false;
      };
      if (isMine) {
        buf.add(buildCaseloadStudent(s, grades, attendance, incidents, commitments, interventions));
      };
    };
    buf.toArray();
  };

  public func getCaseloadStudent(
    counsellorId  : Types.StaffId,
    studentId     : Types.StudentId,
    students      : Map.Map<Types.StudentId, Types.Student>,
    grades        : Map.Map<Types.GradeId, Types.Grade>,
    attendance    : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    incidents     : Map.Map<Types.IncidentId, Types.Incident>,
    commitments   : Map.Map<Types.CommitmentId, Types.Commitment>,
    interventions : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
  ) : { #ok : CTypes.CaseloadEntry; #err : Text } {
    switch (students.get(studentId)) {
      case null { #err "Student not found" };
      case (?s) {
        let isMine = switch (s.counsellorId) {
          case (?cid) (cid == counsellorId);
          case null   false;
        };
        if (not isMine) { return #err "Student not on your caseload" };
        let summary = buildCaseloadStudent(s, grades, attendance, incidents, commitments, interventions);
        let studentInterventions = getInterventions(interventions, studentId);
        let openCommitmentsArr = List.empty<Types.Commitment>();
        for ((_, c) in commitments.entries()) {
          if (c.studentId == studentId and c.status == #open) {
            openCommitmentsArr.add(c);
          };
        };
        #ok {
          student             = summary;
          interventions       = studentInterventions;
          upcomingCommitments = openCommitmentsArr.toArray();
        };
      };
    };
  };

  // ── Appointment CRUD ─────────────────────────────────────────────────────────

  public func createAppointment(
    store        : Map.Map<CTypes.AppointmentId, CTypes.Appointment>,
    state        : { var nextAppointmentId : Nat },
    counsellorId : Types.StaffId,
    studentId    : Types.StudentId,
    dateTime     : Types.Timestamp,
    atype        : CTypes.AppointmentType,
    notes        : Text,
  ) : { #ok : CTypes.Appointment; #err : Text } {
    let id = state.nextAppointmentId;
    state.nextAppointmentId += 1;
    let appt : CTypes.Appointment = {
      id;
      counsellorId;
      studentId;
      dateTime;
      appointmentType = atype;
      notes;
      status    = #scheduled;
      createdAt = Time.now();
      isDemoData = false;
    };
    store.add(id, appt);
    #ok appt;
  };

  public func getAppointments(
    store        : Map.Map<CTypes.AppointmentId, CTypes.Appointment>,
    counsellorId : Types.StaffId,
  ) : [CTypes.Appointment] {
    let buf = List.empty<CTypes.Appointment>();
    for ((_, a) in store.entries()) {
      if (a.counsellorId == counsellorId) { buf.add(a) };
    };
    // Sort ascending by dateTime
    buf.toArray().sort<CTypes.Appointment>(func(a, b) {
      if      (a.dateTime < b.dateTime) #less
      else if (a.dateTime > b.dateTime) #greater
      else                               #equal;
    });
  };

  public func cancelAppointment(
    store         : Map.Map<CTypes.AppointmentId, CTypes.Appointment>,
    appointmentId : CTypes.AppointmentId,
  ) : { #ok : (); #err : Text } {
    switch (store.get(appointmentId)) {
      case null { #err "Appointment not found" };
      case (?a) {
        store.add(appointmentId, { a with status = #cancelled });
        #ok ();
      };
    };
  };

  // ── Private helpers ───────────────────────────────────────────────────────────

  func computeAttendancePct(
    studentId  : Types.StudentId,
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  ) : Float {
    var total   : Nat = 0;
    var present : Nat = 0;
    for ((_, r) in attendance.entries()) {
      if (r.studentId == studentId) {
        total += 1;
        if (r.status == #present or r.status == #tardy) { present += 1 };
      };
    };
    if (total == 0) { 100.0 } else {
      present.toFloat() / total.toFloat() * 100.0;
    };
  };

  func computeGradeTrajectory(
    studentId : Types.StudentId,
    grades    : Map.Map<Types.GradeId, Types.Grade>,
  ) : Text {
    // Collect scores sorted by gradedAt
    let buf = List.empty<Types.Grade>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) { buf.add(g) };
    };
    let sorted = buf.toArray().sort(func(a, b) {
      if      (a.gradedAt < b.gradedAt) #less
      else if (a.gradedAt > b.gradedAt) #greater
      else                               #equal;
    });
    let n = sorted.size();
    if (n < 4) { return "steady" };
    let recentAvg  = (sorted[n - 1].value + sorted[n - 2].value) / 2.0;
    let earlierAvg = (sorted[n - 3].value + sorted[n - 4].value) / 2.0;
    if      (recentAvg > earlierAvg + 3.0)  { "rising" }
    else if (recentAvg < earlierAvg - 3.0)  { "dropping" }
    else                                     { "steady" };
  };

  func countRecentIncidents(
    studentId : Types.StudentId,
    incidents : Map.Map<Types.IncidentId, Types.Incident>,
  ) : Nat {
    let cutoff : Int = Time.now() - (30 * 86_400_000_000_000);
    var count  : Nat = 0;
    for ((_, i) in incidents.entries()) {
      if (i.studentId == studentId and i.createdAt >= cutoff) { count += 1 };
    };
    count;
  };

  func countOpenCommitments(
    studentId   : Types.StudentId,
    commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
  ) : Nat {
    var count : Nat = 0;
    for ((_, c) in commitments.entries()) {
      if (c.studentId == studentId and c.status == #open) { count += 1 };
    };
    count;
  };

  func hasActiveIntervention(
    studentId     : Types.StudentId,
    interventions : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
  ) : Bool {
    for ((_, iv) in interventions.entries()) {
      if (iv.studentId == studentId and iv.status == #active) { return true };
    };
    false;
  };

  func buildCaseloadStudent(
    s             : Types.Student,
    grades        : Map.Map<Types.GradeId, Types.Grade>,
    attendance    : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    incidents     : Map.Map<Types.IncidentId, Types.Incident>,
    commitments   : Map.Map<Types.CommitmentId, Types.Commitment>,
    interventions : Map.Map<CTypes.InterventionId, CTypes.Intervention>,
  ) : CTypes.CaseloadStudent {
    {
      studentId       = s.id;
      name            = s.name;
      grade           = s.grade;
      attendancePct   = computeAttendancePct(s.id, attendance);
      gradeTrajectory = computeGradeTrajectory(s.id, grades);
      recentIncidents = countRecentIncidents(s.id, incidents);
      openCommitments = countOpenCommitments(s.id, commitments);
      specialPopFlags = {
        sped        = s.specialPopFlags.sped;
        ell         = s.specialPopFlags.ell;
        medicalAlert = s.specialPopFlags.medicalAlert;
      };
      hasActiveIntervention = hasActiveIntervention(s.id, interventions);
    };
  };

};
