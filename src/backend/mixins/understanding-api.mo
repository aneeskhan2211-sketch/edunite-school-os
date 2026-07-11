import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";
import Understanding "../lib/Understanding";
import Order "mo:core/Order";
import Float "mo:core/Float";

mixin (
  students    : Map.Map<Types.StudentId, Types.Student>,
  grades      : Map.Map<Types.GradeId, Types.Grade>,
  attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  incidents   : Map.Map<Types.IncidentId, Types.Incident>,
  commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
  courses     : Map.Map<Types.CourseId, Types.Course>,
  assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  signals     : Map.Map<Types.SignalId, Types.UnderstandingSignal>,
  state       : { var nextSignalId : Nat },
) {

  // ── Internal helper: snapshot maps as entry arrays for the lib layer ──
  func snapshotAll() : (
    [(Types.StudentId,    Types.Student)],
    [(Types.GradeId,      Types.Grade)],
    [(Types.AttendanceId, Types.AttendanceRecord)],
    [(Types.IncidentId,   Types.Incident)],
    [(Types.CommitmentId, Types.Commitment)],
    [(Types.CourseId,     Types.Course)],
    [(Types.AssignmentId, Types.Assignment)],
  ) {
    (
      students.entries().toArray(),
      grades.entries().toArray(),
      attendance.entries().toArray(),
      incidents.entries().toArray(),
      commitments.entries().toArray(),
      courses.entries().toArray(),
      assignments.entries().toArray(),
    )
  };

  /// Compute + return all live signals relevant to the caller's role.
  public query func surfaceSignalsForRole(
    ctx : Types.RoleContext,
  ) : async [Types.UnderstandingSignal] {
    let (ss, gs, att, inc, comm, cos, asgn) = snapshotAll();
    let derived = Understanding.deriveSignals(
      ctx, ss, gs, att, inc, comm, cos, asgn, Time.now(),
    );
    // Merge with persisted signals visible to this role
    let persisted = signals.values().toArray().filter(
      func(s : Types.UnderstandingSignal) : Bool { s.roleTarget == ctx.role }
    );
    derived.concat(persisted)
  };

  /// Persist a manually-created signal (e.g. counsellor flags an opportunity).
  public func createSignal(
    signal : Types.UnderstandingSignal,
  ) : async { #ok : Types.UnderstandingSignal; #err : Text } {
    let id = state.nextSignalId;
    state.nextSignalId += 1;
    let stored = { signal with id };
    signals.add(id, stored);
    #ok stored
  };

  /// Dismiss a signal by id.
  public func dismissSignal(
    id  : Types.SignalId,
    ctx : Types.RoleContext,
  ) : async { #ok; #err : Text } {
    ignore ctx;
    switch (signals.get(id)) {
      case null { #err "Signal not found" };
      case (?_) { signals.remove(id); #ok };
    }
  };

  /// Compute a risk signal for one student from the connected model.
  public query func computeRiskSignal(
    studentId : Types.StudentId,
  ) : async ?Types.UnderstandingSignal {
    let sg = grades.values().toArray().filter(func(g : Types.Grade) : Bool { g.studentId == studentId });
    let sa = attendance.entries().toArray().filter(
      func((_, r) : (Types.AttendanceId, Types.AttendanceRecord)) : Bool { r.studentId == studentId }
    );
    let si = incidents.values().toArray().filter(func(i : Types.Incident) : Bool { i.studentId == studentId });
    let now = Time.now();
    let ctx : Types.RoleContext = { role = #counsellor; userId = 0 };
    let (ss, _, att, inc, comm, cos, asgn) = snapshotAll();
    ignore (ss, att, inc, comm, cos, asgn, sa);
    // Use deriveSignals with a single-student filter
    let studs : [(Types.StudentId, Types.Student)] = switch (students.get(studentId)) {
      case null { [] };
      case (?s)  { [(studentId, s)] };
    };
    let allGrades   = grades.entries().toArray();
    let allAttend   = attendance.entries().toArray();
    let allInc      = incidents.entries().toArray();
    let allComm     = commitments.entries().toArray();
    let allCourses  = courses.entries().toArray();
    let allAsgn     = assignments.entries().toArray();
    let derived = Understanding.deriveSignals(
      ctx, studs, allGrades, allAttend, allInc, allComm, allCourses, allAsgn, now,
    );
    ignore (sg, si);
    derived.find(func(s : Types.UnderstandingSignal) : Bool {
      s.signalType == #risk and s.studentId == ?studentId
    })
  };

  /// Compute opportunity signals (e.g. thriving, can stretch).
  public query func computeOpportunitySignals(
    ctx : Types.RoleContext,
  ) : async [Types.UnderstandingSignal] {
    let (ss, gs, att, inc, comm, cos, asgn) = snapshotAll();
    let derived = Understanding.deriveSignals(
      ctx, ss, gs, att, inc, comm, cos, asgn, Time.now(),
    );
    derived.filter(func(s : Types.UnderstandingSignal) : Bool { s.signalType == #opportunity })
  };

  /// Retrieve signals visible to the given role.
  public query func listSignalsByRole(
    ctx : Types.RoleContext,
  ) : async [Types.UnderstandingSignal] {
    let (ss, gs, att, inc, comm, cos, asgn) = snapshotAll();
    let derived = Understanding.deriveSignals(
      ctx, ss, gs, att, inc, comm, cos, asgn, Time.now(),
    );
    let persisted = signals.values().toArray().filter(
      func(s : Types.UnderstandingSignal) : Bool { s.roleTarget == ctx.role }
    );
    let all = derived.concat(persisted);
    all.sort(func(a : Types.UnderstandingSignal, b : Types.UnderstandingSignal) : Order.Order {
      let ua = switch (a.urgency) { case (#critical) 3; case (#important) 2; case (#info) 1 };
      let ub = switch (b.urgency) { case (#critical) 3; case (#important) 2; case (#info) 1 };
      if (ua > ub) { #less } else if (ua < ub) { #greater } else { #equal }
    })
  };

  /// Full context for one signal.
  public query func getSignalContext(
    id : Types.SignalId,
  ) : async ?Types.UnderstandingSignal {
    signals.get(id)
  };

  /// Principal's morning picture: overnight deltas + top signals.
  public query func getMorningPicture() : async Types.MorningPicture {
    let now = Time.now();
    Understanding.morningPicture(
      students.entries().toArray(),
      grades.entries().toArray(),
      attendance.entries().toArray(),
      incidents.entries().toArray(),
      commitments.entries().toArray(),
      assignments.entries().toArray(),
      now,
    )
  };

  /// Understanding signals for a role, with student names resolved.
  public query func getUnderstandingSignals(
    role   : Types.Role,
    userId : Types.StaffId,
  ) : async [Types.SignalCard] {
    let ctx : Types.RoleContext = { role; userId };
    let (ss, gs, att, inc, comm, cos, asgn) = snapshotAll();
    let now = Time.now();
    let derived = Understanding.deriveSignals(
      ctx, ss, gs, att, inc, comm, cos, asgn, now,
    );
    let filtered = switch (role) {
      case (#counsellor) {
        derived.filter(func(s : Types.UnderstandingSignal) : Bool {
          s.roleTarget == #counsellor or s.roleTarget == #teacher
        })
      };
      case _ { derived };
    };
    filtered.map<Types.UnderstandingSignal, Types.SignalCard>(func(s : Types.UnderstandingSignal) : Types.SignalCard {
      let studentName = switch (s.studentId) {
        case null null;
        case (?sid) {
          switch (students.get(sid)) {
            case null null;
            case (?st) ?st.name;
          };
        };
      };
      {
        id = s.id;
        signalType = s.signalType;
        studentId = s.studentId;
        studentName = studentName;
        reason = s.reason;
        urgency = s.urgency;
        createdAt = s.createdAt;
      };
    })
  };

  /// Per-role "what needs you today" digest.
  public query func getWhatNeedsYouToday(
    role   : Types.Role,
    userId : Types.StaffId,
  ) : async [Types.UnderstandingSignal] {
    let ctx : Types.RoleContext = { role; userId };
    let (ss, gs, att, inc, comm, cos, asgn) = snapshotAll();
    let now = Time.now();
    let derived = Understanding.deriveSignals(
      ctx, ss, gs, att, inc, comm, cos, asgn, now,
    );
    Understanding.whatNeedsYouToday(
      role, userId, derived, commitments.entries().toArray(), now,
    )
  };

  // ── MTSS / early-warning roster ───────────────────────────────────────
  // Computes each student's support tier from the real ABC indicators
  // (Attendance, Behaviour, Course performance). Tier 3 = 2+ flags
  // (intensive), Tier 2 = 1 flag (targeted), Tier 1 = none (universal).
  public query func getEarlyWarningRoster() : async [{
    studentId      : Types.StudentId;
    name           : Text;
    grade          : Nat;
    tier           : Nat;
    attendanceRate : Float;
    incidentCount  : Nat;
    avgGrade       : Float;
    flags          : [Text];
  }] {
    var out : [{
      studentId : Types.StudentId; name : Text; grade : Nat; tier : Nat;
      attendanceRate : Float; incidentCount : Nat; avgGrade : Float; flags : [Text];
    }] = [];

    for ((_, s) in students.entries()) {
      var present = 0;
      var total = 0;
      for ((_, a) in attendance.entries()) {
        if (a.studentId == s.id) {
          total += 1;
          switch (a.status) {
            case (#present) { present += 1 };
            case (#excused) { present += 1 };
            case (_) {};
          };
        };
      };
      let attRate = if (total == 0) 100.0 else Float.fromInt(present) / Float.fromInt(total) * 100.0;

      var inc = 0;
      for ((_, i) in incidents.entries()) { if (i.studentId == s.id) { inc += 1 } };

      var gSum = 0.0;
      var gN = 0;
      for ((_, g) in grades.entries()) {
        if (g.studentId == s.id) { gSum += g.value; gN += 1 };
      };
      let avgG = if (gN == 0) 0.0 else gSum / Float.fromInt(gN);

      var flags : [Text] = [];
      if (attRate < 85.0) { flags := flags.concat(["Attendance below 85%"]) };
      if (inc >= 2) { flags := flags.concat(["Repeated behaviour incidents"]) };
      if (gN > 0 and avgG < 70.0) { flags := flags.concat(["Course grade below 70%"]) };

      let tier = if (flags.size() >= 2) 3 else if (flags.size() == 1) 2 else 1;

      out := out.concat([{
        studentId = s.id;
        name = s.name;
        grade = s.grade;
        tier;
        attendanceRate = attRate;
        incidentCount = inc;
        avgGrade = avgG;
        flags;
      }]);
    };
    out;
  };

};

