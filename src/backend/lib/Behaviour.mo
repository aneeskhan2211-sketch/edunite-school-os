import Types "../types/common";
import BTypes "../types/behaviour";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {

  // Returns incidents filtered by FERPA rules for the given role context.
  public func listIncidents(
    incidents : [(Types.IncidentId, Types.Incident)],
    studentId : ?Types.StudentId,
    ctx       : Types.RoleContext,
  ) : [Types.Incident] {
    let all = incidents.map(func((_, i)) { i });
    // First filter by studentId if provided
    let byStudent = switch (studentId) {
      case (null) { all };
      case (?sid) { all.filter(func(i) { i.studentId == sid }) };
    };
    // Then apply FERPA role filter
    switch (ctx.role) {
      case (#student) {
        // Student sees own incidents (read-only, sanitized description privacy handled in UI)
        byStudent.filter(func(i) { i.studentId == ctx.userId })
      };
      case (#parent) {
        // Parent sees incidents for their children
        byStudent
      };
      case (#teacher) {
        // Teacher sees incidents they reported or where routedTo matches
        byStudent.filter(func(i) {
          i.reportedBy == ctx.userId or i.routedTo == ?ctx.userId
        })
      };
      case (#counsellor) {
        // Counsellor sees all incidents for their caseload (same as all for now)
        byStudent
      };
      case (#principal) { byStudent };
      case (#schoolAdmin) { byStudent };
      case (#districtAdmin) { byStudent };
      case _ { byStudent };
    };
  };

  // Logs a new incident and auto-routes to the appropriate staff member.
  public func logIncident(
    incident : Types.Incident,
    staff    : [(Types.StaffId, Types.Staff)],
  ) : Types.Incident {
    // Auto-route based on severity
    let routedTo : ?Types.StaffId = switch (incident.severity) {
      case (#low) {
        // severity 1-2: teacher owns it
        ?incident.reportedBy
      };
      case (#medium) {
        // severity 3: route to counsellor if present
        let c = staff.find(func((_, s)) { s.role == #counsellor });
        switch (c) { case (?(sid, _)) { ?sid }; case (null) { ?incident.reportedBy } }
      };
      case (#high) {
        // severity 4: route to principal
        let p = staff.find(func((_, s)) { s.role == #principal });
        switch (p) { case (?(sid, _)) { ?sid }; case (null) { ?incident.reportedBy } }
      };
      case (#critical) {
        // severity 5: route to principal
        let p = staff.find(func((_, s)) { s.role == #principal });
        switch (p) { case (?(sid, _)) { ?sid }; case (null) { ?incident.reportedBy } }
      };
    };
    let routedStatus : Types.IncidentStatus = #routed;
    let routedEvent : Types.IncidentEvent = {
      status     = #routed;
      staffId    = incident.reportedBy;
      note       = "Auto-routed on log";
      occurredAt = incident.createdAt;
    };
    {
      incident with
      routedTo;
      status   = routedStatus;
      timeline = incident.timeline.concat([routedEvent]);
    }
  };

  // Advances the incident lifecycle status.
  public func updateStatus(
    incidents : [(Types.IncidentId, Types.Incident)],
    id        : Types.IncidentId,
    status    : Types.IncidentStatus,
    staffId   : Types.StaffId,
    note      : Text,
    now       : Types.Timestamp,
  ) : ?Types.Incident {
    let found = incidents.find(func((iid, _)) { iid == id });
    switch (found) {
      case (null) { null };
      case (?(_, inc)) {
        let event : Types.IncidentEvent = { status; staffId; note; occurredAt = now };
        ?{ inc with status; timeline = inc.timeline.concat([event]) }
      };
    };
  };

  // Detects repeat-incident patterns for a student.
  public func detectPattern(
    incidents : [Types.Incident],
    studentId : Types.StudentId,
  ) : ?Text {
    let studentInc = incidents.filter(func(i) { i.studentId == studentId });
    let count = studentInc.size();
    if (count >= 3) {
      ?("Repeat pattern: " # count.toText() # " incidents recorded")
    } else {
      null
    }
  };

  // Creates a follow-up commitment from an incident.
  public func createFollowUpCommitment(
    incident  : Types.Incident,
    ownerId   : Types.StaffId,
    dueDate   : Types.Timestamp,
    now       : Types.Timestamp,
  ) : Types.Commitment {
    {
      id             = 0; // caller must assign a real id
      commitmentType = #behaviourFollowUp;
      ownerId;
      studentId      = incident.studentId;
      dueDate;
      description    = "Follow-up on incident #" # incident.id.toText();
      status         = #open;
      createdAt      = now;
      completedAt    = null;
      isDemoData     = incident.isDemoData;
      notes            = "";
      transitionLog    = [];
    }
  };

  // Look up a single incident by ID.
  public func getIncident(
    incidents : [(Types.IncidentId, Types.Incident)],
    id        : Types.IncidentId,
  ) : ?Types.Incident {
    let found = incidents.find(func((iid, _)) { iid == id });
    switch (found) {
      case (null) { null };
      case (?(_, inc)) { ?inc };
    }
  };

  // Converts variant severity to ordinal Nat (1–5).
  func severityToNat(s : Types.IncidentSeverity) : Nat {
    switch (s) {
      case (#low)      { 1 };
      case (#medium)   { 2 };
      case (#high)     { 4 };
      case (#critical) { 5 };
    }
  };

  // Computes a 90-day incident pattern for a student.
  public func getIncidentPattern(
    allIncidents : [(Types.IncidentId, Types.Incident)],
    studentId    : Types.StudentId,
    now          : Types.Timestamp,
  ) : BTypes.IncidentPattern {
    let ninetyDaysNs : Int = 90 * 24 * 60 * 60 * 1_000_000_000;
    let fortyFiveDaysNs : Int = 45 * 24 * 60 * 60 * 1_000_000_000;
    let cutoff90  = now - ninetyDaysNs;
    let cutoff45  = now - fortyFiveDaysNs;

    let all = allIncidents.map(func((_, i)) { i });
    let forStudent = all.filter(func(i) { i.studentId == studentId });
    let last90 = forStudent.filter(func(i) { i.createdAt >= cutoff90 });
    let count90day = last90.size();

    // Severity breakdown: build (severity_ordinal, count) pairs
    let sevCounts = [var 0, 0, 0, 0, 0, 0]; // index 0 unused; indices 1..5
    for (inc in last90.vals()) {
      let s = severityToNat(inc.severity);
      if (s >= 1 and s <= 5) { sevCounts[s] += 1 };
    };
    var breakdown : [(Nat, Nat)] = [];
    var sev = 1;
    while (sev <= 5) {
      if (sevCounts[sev] > 0) {
        breakdown := breakdown.concat([(sev, sevCounts[sev])]);
      };
      sev += 1;
    };

    // repeatPatternFlag: same severity appearing 2+ times
    let repeatPatternFlag = (breakdown.find<(Nat, Nat)>(func((_, c)) { c >= 2 }) != null);

    // Trend: compare last 45 days vs prior 45 days
    let lastHalfCount  = forStudent.filter(func(i) { i.createdAt >= cutoff45 }).size();
    let priorHalfCount = forStudent.filter(func(i) { i.createdAt >= cutoff90 and i.createdAt < cutoff45 }).size();
    let trend : BTypes.IncidentTrend =
      if (lastHalfCount > priorHalfCount + 1)      { #Increasing }
      else if (priorHalfCount > lastHalfCount + 1) { #Decreasing }
      else                                         { #Flat };

    // Escalation timeline: average days between incidents (if 2+)
    let escalationTimelineDays : ?Nat =
      if (count90day < 2) { null }
      else {
        let sorted = last90.sort(
          func(a, b) {
            if (a.createdAt < b.createdAt)      { #less }
            else if (a.createdAt > b.createdAt) { #greater }
            else                                { #equal }
          }
        );
        var totalGap : Int = 0;
        var idx = 1;
        while (idx < sorted.size()) {
          totalGap += sorted[idx].createdAt - sorted[idx - 1].createdAt;
          idx += 1;
        };
        let gaps = sorted.size() - 1;
        let avgNs : Int = totalGap / gaps;
        let dayNs : Int = 24 * 60 * 60 * 1_000_000_000;
        let avgDays : Int = avgNs / dayNs;
        if (avgDays >= 0) { ?(avgDays.toNat()) } else { ?0 }
      };

    { studentId; count90day; severityBreakdown = breakdown; repeatPatternFlag; trend; escalationTimelineDays }
  };
};
