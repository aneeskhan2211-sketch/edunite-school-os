import Types "../types/common";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {

  // ── Private helpers ────────────────────────────────────────────────────

  func weightedAverageAll(grades : [Types.Grade]) : Float {
    if (grades.size() == 0) { return 0.0 };
    var tw : Float = 0.0;
    var tv : Float = 0.0;
    for (g in grades.vals()) { tw += g.weight; tv += g.value * g.weight };
    if (tw == 0.0) { 0.0 } else { tv / tw }
  };

  func computeTrajectory(grades : [Types.Grade]) : Text {
    if (grades.size() < 4) { return "steady" };
    let sorted = grades.sort(func(a, b) { Int.compare(a.gradedAt, b.gradedAt) });
    let len = sorted.size();
    let recentStart = if (len >= 6) { len - 3 } else { len - (len / 2) };
    let priorEnd    = recentStart;
    let priorStart  = if (priorEnd >= 3) { priorEnd - 3 } else { 0 };
    let recent = Array.tabulate(len - recentStart, func i = sorted[recentStart + i]);
    let prior  = Array.tabulate(priorEnd - priorStart, func i = sorted[priorStart + i]);
    let delta  = weightedAverageAll(recent) - weightedAverageAll(prior);
    if (delta < -5.0) { "dropping" } else if (delta > 5.0) { "rising" } else { "steady" }
  };

  func computePattern(
    records   : [(Types.AttendanceId, Types.AttendanceRecord)],
    studentId : Types.StudentId,
  ) : Types.AttendancePattern {
    let all = records.map(func((_, r) : (Types.AttendanceId, Types.AttendanceRecord)) : Types.AttendanceRecord { r });
    let rs = all.filter(func(r) { r.studentId == studentId });
    let total = rs.size();
    var present = 0; var absent = 0; var excused = 0; var tardy = 0;
    for (r in rs.vals()) {
      switch (r.status) {
        case (#present) { present += 1 };
        case (#absent)  { absent  += 1 };
        case (#excused) { excused += 1 };
        case (#tardy)   { tardy   += 1 };
      };
    };
    let pct : Float = if (total == 0) { 100.0 } else {
      Float.fromInt(present + tardy) / Float.fromInt(total) * 100.0
    };
    {
      studentId;
      totalDays      = total;
      presentDays    = present;
      absentDays     = absent;
      excusedDays    = excused;
      tardyDays      = tardy;
      percentage     = pct;
      belowThreshold = pct < 85.0;
      chronicAbsence = pct < 80.0 and total >= 30;
      trend          = "steady";
    }
  };

  func detectOverloadWeek(hs : [Types.Assignment]) : ?Text {
    if (hs.size() < 3) { return null };
    let weekNums = hs.map(func(a : Types.Assignment) : Int {
      (a.dueDate / 86_400_000_000_000 + 3) / 7
    });
    var found : ?Int = null;
    for (w in weekNums.vals()) {
      if (weekNums.filter(func(x) { x == w }).size() >= 3) {
        found := ?w;
      };
    };
    switch (found) {
      case null { null };
      case (?w) { ?("week-" # w.toText()) };
    }
  };

  func urgencyOrder(u : Types.SignalUrgency) : Nat {
    switch (u) {
      case (#critical)  { 3 };
      case (#important) { 2 };
      case (#info)      { 1 };
    }
  };

  func intToDateString(ns : Int) : Text {
    let secs  = ns / 1_000_000_000;
    let days  = secs / 86400;
    // Approximate: epoch 1970-01-01
    let d = days + 719468;
    let era   = (if (d >= 0) { d } else { d - 146096 }) / 146097;
    let doe   = d - era * 146097;
    let yoe   = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y     = yoe + era * 400;
    let doy   = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp    = (5 * doy + 2) / 153;
    let day   = doy - (153 * mp + 2) / 5 + 1;
    let month = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year  = if (month <= 2) { y + 1 } else { y };
    let pad2  = func(n : Int) : Text {
      if (n < 10) { "0" # n.toText() } else { n.toText() }
    };
    year.toText() # "-" # pad2(month) # "-" # pad2(day)
  };

  // Derives understanding signals for a given role context from all domain data.
  public func deriveSignals(
    ctx         : Types.RoleContext,
    students    : [(Types.StudentId, Types.Student)],
    grades      : [(Types.GradeId, Types.Grade)],
    attendance  : [(Types.AttendanceId, Types.AttendanceRecord)],
    incidents   : [(Types.IncidentId, Types.Incident)],
    commitments : [(Types.CommitmentId, Types.Commitment)],
    courses     : [(Types.CourseId, Types.Course)],
    assignments : [(Types.AssignmentId, Types.Assignment)],
    now         : Types.Timestamp,
  ) : [Types.UnderstandingSignal] {
    ignore ctx;
    var signals : [Types.UnderstandingSignal] = [];
    var sigId : Nat = 1;

    let allStudents = students.map(func((_, s) : (Types.StudentId, Types.Student)) : Types.Student { s });
    let allGrades   = grades.map(func((_, g) : (Types.GradeId, Types.Grade)) : Types.Grade { g });
    let allAttend   = attendance.map(func((_, r) : (Types.AttendanceId, Types.AttendanceRecord)) : Types.AttendanceRecord { r });
    let allIncidents = incidents.map(func((_, i) : (Types.IncidentId, Types.Incident)) : Types.Incident { i });
    let allCommitments = commitments.map(func((_, c) : (Types.CommitmentId, Types.Commitment)) : Types.Commitment { c });
    let allAssignments = assignments.map(func((_, a) : (Types.AssignmentId, Types.Assignment)) : Types.Assignment { a });
    let allCourses  = courses.map(func((_, c) : (Types.CourseId, Types.Course)) : Types.Course { c });

    // ── Per-student signals ─────────────────────────────────────────────
    for (s in allStudents.vals()) {
      let sid = s.id;
      let sg  = allGrades.filter(func(g) { g.studentId == sid });
      let sa  = attendance.filter(func((_, r)) { r.studentId == sid });
      let si  = allIncidents.filter(func(i) { i.studentId == sid });

      let pattern = computePattern(sa, sid);

      // RISK: attendance < 80% AND trajectory dropping AND 2+ incidents in last 30 days
      let ns30 : Int = 30 * 86_400_000_000_000;
      let recentInc = si.filter(func(i) { now - i.createdAt <= ns30 });
      if (pattern.percentage < 80.0 and computeTrajectory(sg) == "dropping" and recentInc.size() >= 2) {
        let pctTxt = Float.nearest(pattern.percentage).toText();
        let sig : Types.UnderstandingSignal = {
          id           = sigId;
          signalType   = #risk;
          studentId    = ?sid;
          roleTarget   = #counsellor;
          reason       = "Attendance at " # pctTxt # "%, grades declining, " # recentInc.size().toText() # " incidents in 30 days";
          urgency      = #critical;
          createdAt    = now;
          commitmentId = null;
        };
        signals := signals.concat([sig]);
        sigId += 1;
      };

      // OPPORTUNITY: trajectory rising AND weighted average > 87
      let avgAll = weightedAverageAll(sg);
      if (computeTrajectory(sg) == "rising" and avgAll > 87.0) {
        // Find course with highest avg
        let courseName = switch (sg.find(func(g) = g.studentId == sid)) {
          case null { "a course" };
          case (?g) {
            switch (allCourses.find(func(c) { c.id == g.courseId })) {
              case null { "a course" };
              case (?c) { c.name };
            };
          };
        };
        let sig : Types.UnderstandingSignal = {
          id           = sigId;
          signalType   = #opportunity;
          studentId    = ?sid;
          roleTarget   = #teacher;
          reason       = "Thriving in " # courseName # ", ready to be stretched";
          urgency      = #info;
          createdAt    = now;
          commitmentId = null;
        };
        signals := signals.concat([sig]);
        sigId += 1;
      };

      // CELEBRATION: weighted avg > 90 for any course
      let studentCourseIds : [Types.CourseId] = sg.map<Types.Grade, Types.CourseId>(func(g) = g.courseId);
      var seenCourses : [Types.CourseId] = [];
      for (cid in studentCourseIds.vals()) {
        if (seenCourses.find(func(x) = x == cid) == null) {
          seenCourses := seenCourses.concat([cid]);
          let cg = sg.filter(func(g) { g.courseId == cid });
          let avg = weightedAverageAll(cg);
          if (avg >= 90.0) {
            let courseName2 = switch (allCourses.find(func(c) { c.id == cid })) {
              case null { "a course" };
              case (?c) { c.name };
            };
            let sig : Types.UnderstandingSignal = {
              id           = sigId;
              signalType   = #celebration;
              studentId    = ?sid;
              roleTarget   = #teacher;
              reason       = s.name # " hit 90%+ in " # courseName2 # " — worth celebrating";
              urgency      = #info;
              createdAt    = now;
              commitmentId = null;
            };
            signals := signals.concat([sig]);
            sigId += 1;
          };
        };
      };
    };

    // ── WORKLOAD: overload across courses ───────────────────────────────
    for (c in allCourses.vals()) {
      let ca = allAssignments.filter(func(a) { a.courseId == c.id });
      let hs = ca.filter(func(a) { a.isHighStakes });
      if (hs.size() >= 3) {
        // Check if any 3 land in same 7-day window
        let overloadWeek = detectOverloadWeek(hs);
        switch (overloadWeek) {
          case null {};
          case (?wk) {
            let sig : Types.UnderstandingSignal = {
              id           = sigId;
              signalType   = #workload;
              studentId    = null;
              roleTarget   = #teacher;
              reason       = "3+ major assessments same week: " # wk;
              urgency      = #important;
              createdAt    = now;
              commitmentId = null;
            };
            signals := signals.concat([sig]);
            sigId += 1;
          };
        };
      };
    };

    // ── COMMITMENT signals: due within 48h ──────────────────────────────
    let ns48 : Int = 172_800_000_000_000;
    for (c in allCommitments.vals()) {
      if (c.status == #open and c.dueDate <= now + ns48) {
        let sig : Types.UnderstandingSignal = {
          id           = sigId;
          signalType   = #commitment;
          studentId    = ?c.studentId;
          roleTarget   = #counsellor;
          reason       = "Commitment due soon: " # c.description;
          urgency      = #important;
          createdAt    = now;
          commitmentId = ?c.id;
        };
        signals := signals.concat([sig]);
        sigId += 1;
      };
    };

    signals
  };

  // Computes the principal's morning picture from overnight deltas.
  // Computes the principal's morning picture from overnight deltas.
  public func morningPicture(
    students    : [(Types.StudentId, Types.Student)],
    grades      : [(Types.GradeId, Types.Grade)],
    attendance  : [(Types.AttendanceId, Types.AttendanceRecord)],
    incidents   : [(Types.IncidentId, Types.Incident)],
    commitments : [(Types.CommitmentId, Types.Commitment)],
    assignments : [(Types.AssignmentId, Types.Assignment)],
    now         : Types.Timestamp,
  ) : Types.MorningPicture {
    ignore (grades, assignments);
    let ns24 : Int = 86_400_000_000_000;
    let yesterday  = now - ns24;

    let allIncidents = incidents.map(func((_, i) : (Types.IncidentId, Types.Incident)) : Types.Incident { i });
    let allCommitments = commitments.map(func((_, c) : (Types.CommitmentId, Types.Commitment)) : Types.Commitment { c });
    let allAttend = attendance.map(func((_, r) : (Types.AttendanceId, Types.AttendanceRecord)) : Types.AttendanceRecord { r });

    let newInc = allIncidents.filter(func(i) { now - i.createdAt <= ns24 }).size();

    let todayDate = intToDateString(now);
    let yesterdayDate = intToDateString(yesterday);
    let todayAbsent = allAttend.filter(func(r) {
      r.date == todayDate and (r.status == #absent)
    }).size();
    let yesterdayAbsent = allAttend.filter(func(r) { r.date == yesterdayDate and (r.status == #absent) }).size();
    let delta : Int = todayAbsent - yesterdayAbsent;

    let openComm = allCommitments.filter(func(c) { c.status == #open }).size();

    var urgentStudents : [Types.UrgentStudent] = [];
    let allStudentIdsFromAttend : [Types.StudentId] = allAttend.map<Types.AttendanceRecord, Types.StudentId>(func(r) = r.studentId);
    var seenStudents : [Types.StudentId] = [];
    for (sid in allStudentIdsFromAttend.vals()) {
      if (seenStudents.find(func(x) = x == sid) == null) {
        seenStudents := seenStudents.concat([sid]);
        let sa = attendance.filter(func((_, r)) { r.studentId == sid });
        let pat = computePattern(sa, sid);
        if (pat.chronicAbsence) {
          let studentName = switch (students.find(func((id, _)) { id == sid })) {
            case null { "Unknown" };
            case (?(_, s)) { s.name };
          };
          urgentStudents := urgentStudents.concat([{
            studentId = sid;
            name = studentName;
            reason = "Chronic absence: attendance at " # Float.nearest(pat.percentage).toText() # "%";
            urgency = #critical;
          }]);
        };
      };
    };

    let headline = if (newInc == 0 and urgentStudents.size() == 0 and openComm == 0) {
      "Nothing significant changed overnight"
    } else {
      newInc.toText() # " new incidents, " #
      urgentStudents.size().toText() # " students need attention, " #
      openComm.toText() # " commitments due"
    };

    let overnightDeltas : [Types.OvernightDelta] = [
      { metric = "New incidents"; previous = 0; current = Float.fromInt(newInc); change = "+" # newInc.toText() },
      { metric = "Absences"; previous = 0; current = Float.fromInt(delta); change = (if (delta > 0) "+" else "") # delta.toText() },
    ];

    let whatsWorking : [Text] = if (urgentStudents.size() == 0) {
      ["All students above attendance threshold", "No new incidents overnight"]
    } else {
      ["No new incidents overnight"]
    };

    let needsDecision : [Types.DecisionItem] = if (openComm > 0) {
      [{ title = "Open commitments"; description = openComm.toText() # " commitments need attention"; urgency = #important }]
    } else {
      []
    };

    {
      generatedAt = Time.now();
      headline;
      overnightDeltas;
      whatsWorking;
      needsDecision;
      urgentStudents;
    }
  };

  // Returns the "what needs you today" list for a specific role + user.
  public func whatNeedsYouToday(
    role        : Types.Role,
    userId      : Types.StaffId,
    signals     : [Types.UnderstandingSignal],
    commitments : [(Types.CommitmentId, Types.Commitment)],
    now         : Types.Timestamp,
  ) : [Types.UnderstandingSignal] {
    ignore now;
    let allCommitments = commitments.map(func((_, c) : (Types.CommitmentId, Types.Commitment)) : Types.Commitment { c });
    let myCommitments = allCommitments.filter(func(c) { c.ownerId == userId and c.status == #open });
    // Build commitment signals for this user
    var commSignals : [Types.UnderstandingSignal] = [];
    var i = 900000;
    for (c in myCommitments.vals()) {
      let sig : Types.UnderstandingSignal = {
        id           = i;
        signalType   = #commitment;
        studentId    = ?c.studentId;
        roleTarget   = role;
        reason       = "Commitment due: " # c.description;
        urgency      = #important;
        createdAt    = now;
        commitmentId = ?c.id;
      };
      commSignals := commSignals.concat([sig]);
      i += 1;
    };

    let filtered = switch (role) {
      case (#teacher) {
        signals.filter(func(s) { s.roleTarget == #teacher })
      };
      case (#counsellor) {
        let base = signals.filter(func(s) { s.roleTarget == #counsellor or s.roleTarget == #teacher });
        base.concat(commSignals)
      };
      case (#principal) {
        signals.filter(func(s) { s.signalType == #risk or s.signalType == #pattern or s.urgency == #critical })
      };
      case (#spedCoordinator) {
        signals.filter(func(s) { s.signalType == #commitment and s.roleTarget == #spedCoordinator })
      };
      case (#parent) {
        signals.filter(func(s) { s.signalType == #celebration or s.signalType == #risk })
      };
      case (#student) {
        signals.filter(func(s) { s.signalType == #workload and s.studentId == ?userId })
      };
      case (#districtAdmin) {
        signals.filter(func(s) { s.signalType == #pattern })
      };
      case _ {
        signals.filter(func(s) { s.studentId == ?userId })
      };
    };
    // Sort by urgency: critical > important > info
    filtered.sort(func(a, b) {
      let ua = urgencyOrder(a.urgency);
      let ub = urgencyOrder(b.urgency);
      if (ua > ub) { #less } else if (ua < ub) { #greater } else { #equal }
    })
  };

  // Risk detection: multi-signal (attendance + grades + behaviour together).
  public func detectRisk(
    studentId   : Types.StudentId,
    grades      : [Types.Grade],
    attendance  : Types.AttendancePattern,
    incidents   : [Types.Incident],
  ) : ?Text {
    ignore studentId;
    let ns30 : Int = 30 * 86_400_000_000_000;
    // We approximate recent incidents by checking the full list (caller may pass filtered list)
    let recentInc = incidents.size();
    if (attendance.percentage < 80.0 and computeTrajectory(grades) == "dropping" and recentInc >= 2) {
      let pctTxt = Float.nearest(attendance.percentage).toText();
      ignore ns30;
      ?("Attendance at " # pctTxt # "%, grades declining, " # recentInc.toText() # " incidents")
    } else {
      null
    }
  };

  // Opportunity detection: thriving student ready to be stretched.
  public func detectOpportunity(
    studentId  : Types.StudentId,
    grades     : [Types.Grade],
    attendance : Types.AttendancePattern,
  ) : ?Text {
    ignore (studentId, attendance);
    let avg = weightedAverageAll(grades);
    if (computeTrajectory(grades) == "rising" and avg > 87.0) {
      ?("Thriving — weighted average " # Float.nearest(avg).toText() # "%, ready to be stretched")
    } else {
      null
    }
  };

};
