/// lib/Grades.mo — Domain logic for the grades domain (stateless module).
/// All functions receive the stores they need; no actor state here.

import Array   "mo:core/Array";
import Float   "mo:core/Float";
import Int     "mo:core/Int";
import List    "mo:core/List";
import Map     "mo:core/Map";
import Order   "mo:core/Order";
import Time    "mo:core/Time";
import Types   "../types/common";
import GTypes  "../types/grades";

module {

  // ── Constants ────────────────────────────────────────────────────────────
  let PASSING_THRESHOLD     : Float = 60.0;
  let AT_RISK_OFFSET        : Float = 10.0;
  let TRAJECTORY_DELTA_PCT  : Float = 0.05; // 5% delta to count as Up/Down
  let HIGH_STAKES_THRESHOLD : Float = 0.15;
  let OVERLOAD_MIN_COUNT    : Nat   = 3;

  // ── Internal helpers ─────────────────────────────────────────────────────

  /// Safe average of a Float slice (returns 0.0 on empty).
  func avg(vals : [Float]) : Float {
    if (vals.size() == 0) return 0.0;
    var sum = 0.0;
    for (v in vals.vals()) { sum += v };
    sum / Float.fromInt(vals.size())
  };

  /// Convert weighted percentage (0-100) to letter grade.
  public func letterGrade(pct : Float) : Text {
    if      (pct >= 93.0) "A+"
    else if (pct >= 90.0) "A"
    else if (pct >= 87.0) "B+"
    else if (pct >= 83.0) "B"
    else if (pct >= 80.0) "B-"
    else if (pct >= 77.0) "C+"
    else if (pct >= 73.0) "C"
    else if (pct >= 70.0) "C-"
    else if (pct >= 67.0) "D+"
    else if (pct >= 63.0) "D"
    else if (pct >= 60.0) "D-"
    else "F"
  };

  // ── createAssignment ──────────────────────────────────────────────────────

  /// Validate and insert an assignment. Returns #err when validation fails.
  public func createAssignment(
    data        : Types.Assignment,
    actorId     : Types.StaffId,
    state       : { var nextAssignmentId : Nat },
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : { #ok : Types.Assignment; #err : Text } {

    ignore actorId; // audited at the mixin layer if needed

    if (data.weight < 0.05 or data.weight > 0.50) {
      return #err("weight must be between 0.05 and 0.50")
    };

    let id = state.nextAssignmentId;
    state.nextAssignmentId += 1;

    let assignment : Types.Assignment = {
      data with
      id           = id;
      isHighStakes = data.weight > HIGH_STAKES_THRESHOLD;
    };

    assignments.add(id, assignment);
    #ok(assignment)
  };

  // ── updateGrade ───────────────────────────────────────────────────────────

  /// Insert or update a grade record. FERPA role check enforced.
  public func updateGrade(
    incoming  : Types.Grade,
    ctx       : Types.RoleContext,
    state     : { var nextGradeId : Nat; var nextAuditId : Nat },
    grades    : Map.Map<Types.GradeId, Types.Grade>,
  ) : { #ok : Types.Grade; #err : Text } {

    switch (ctx.role) {
      case (#teacher or #coTeacher or #schoolAdmin) {};
      case (_) {
        return #err("permission denied: only Teacher, CoTeacher, or SchoolAdmin may enter grades")
      };
    };

    let now = Time.now();

    var existing : ?Types.Grade = null;
    for ((_, g) in grades.entries()) {
      if (g.studentId == incoming.studentId and g.assignmentId == incoming.assignmentId) {
        existing := ?g;
      };
    };

    let auditId = state.nextAuditId;
    state.nextAuditId += 1;

    let grade : Types.Grade = switch (existing) {
      case (?prev) {
        let entry : Types.AuditEntry = {
          id            = auditId;
          entityType    = "Grade";
          entityId      = prev.id;
          action        = "update";
          performedBy   = ctx.userId;
          performedAt   = now;
          previousValue = ?(prev.value.toText());
          newValue      = ?(incoming.value.toText());
        };
        let updated : Types.Grade = {
          prev with
          value        = incoming.value;
          weight       = incoming.weight;
          isHighStakes = incoming.isHighStakes;
          gradedAt     = now;
          gradedBy     = ctx.userId;
          term         = incoming.term;
        auditLog     = Array.tabulate<Types.AuditEntry>(prev.auditLog.size() + 1, func i { if (i < prev.auditLog.size()) prev.auditLog[i] else entry });
        };
        grades.add(prev.id, updated);
        updated
      };
      case null {
        let id = state.nextGradeId;
        state.nextGradeId += 1;
        let entry : Types.AuditEntry = {
          id            = auditId;
          entityType    = "Grade";
          entityId      = id;
          action        = "create";
          performedBy   = ctx.userId;
          performedAt   = now;
          previousValue = null;
          newValue      = ?(incoming.value.toText());
        };
        let newGrade : Types.Grade = {
          incoming with
          id       = id;
          gradedAt = now;
          gradedBy = ctx.userId;
          auditLog = [entry];
        };
        grades.add(id, newGrade);
        newGrade
      };
    };

    #ok(grade)
  };

  // ── listGradesByCourse ────────────────────────────────────────────────────

  /// Return grades for a course filtered by term, role-scoped per FERPA.
  /// Sorted by studentId asc, then assignment dueDate asc.
  public func listGradesByCourse(
    courseId    : Types.CourseId,
    term        : Text,
    role        : Types.Role,
    callerId    : Types.StaffId,
    childIds    : [Types.StudentId],
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : [Types.Grade] {

    var result = List.empty<Types.Grade>();

    for ((_, g) in grades.entries()) {
      if (g.courseId == courseId and g.term == term) {
        let visible = switch (role) {
          case (#teacher or #coTeacher or #schoolAdmin or #departmentHead or
               #principal or #counsellor or #spedCoordinator or
               #curriculumCoordinator or #districtAdmin) { true };
          case (#student) { g.studentId == callerId };
          case (#parent) {
            childIds.find(func id { id == g.studentId }) != null
          };
          case (#substitute) { false };
        };
        if (visible) { result.add(g) };
      };
    };

    let arr = result.toArray();
    arr.sort(func(a : Types.Grade, b : Types.Grade) : Order.Order {
        if (a.studentId != b.studentId) {
          Int.compare(a.studentId, b.studentId)
        } else {
          let aDate = switch (assignments.get(a.assignmentId)) {
            case (?asgn) asgn.dueDate;
            case null 0;
          };
          let bDate = switch (assignments.get(b.assignmentId)) {
            case (?asgn) asgn.dueDate;
            case null 0;
          };
          Int.compare(aDate, bDate)
        }
      }
    )
  };

  // ── listGradesByStudent ───────────────────────────────────────────────────

  /// Return all grades for a student, optionally filtered by course and/or term.
  public func listGradesByStudent(
    studentId : Types.StudentId,
    courseId  : ?Types.CourseId,
    term      : ?Text,
    role      : Types.Role,
    callerId  : Types.StaffId,
    childIds  : [Types.StudentId],
    grades    : Map.Map<Types.GradeId, Types.Grade>,
  ) : [Types.Grade] {

    let allowed = switch (role) {
      case (#teacher or #coTeacher or #schoolAdmin or #departmentHead or
           #principal or #counsellor or #spedCoordinator or
           #curriculumCoordinator or #districtAdmin) { true };
      case (#student) { callerId == studentId };
      case (#parent) {
        childIds.find(func id { id == studentId }) != null
      };
      case (#substitute) { false };
    };

    if (not allowed) { return [] };

    var result = List.empty<Types.Grade>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        let matchesCourse = switch (courseId) {
          case null true;
          case (?cid) g.courseId == cid;
        };
        let matchesTerm = switch (term) {
          case null true;
          case (?t) g.term == t;
        };
        if (matchesCourse and matchesTerm) {
          result.add(g);
        };
      };
    };

    result.toArray()
  };

  // ── getWeightedAverage ────────────────────────────────────────────────────

  /// Compute weighted percentage (0-100) for a student in one course/term.
  public func getWeightedAverage(
    studentId   : Types.StudentId,
    courseId    : Types.CourseId,
    term        : Text,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : GTypes.WeightedAverageResult {

    var totalWeight : Float = 0.0;
    var weightedSum : Float = 0.0;
    var count       : Nat   = 0;

    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId and g.courseId == courseId and g.term == term) {
        switch (assignments.get(g.assignmentId)) {
          case (?_) {
            weightedSum += g.value * g.weight;
            totalWeight += g.weight;
            count       += 1;
          };
          case null {};
        };
      };
    };

    let average = if (totalWeight > 0.0) (weightedSum / totalWeight) * 100.0 else 0.0;
    let trajectory = computeTrajectory(studentId, courseId, term, grades, assignments);

    { studentId; courseId; average; count; trajectory }
  };

  // ── computeTrajectory (internal + public) ─────────────────────────────────

  /// Trajectory for one student in one course/term.
  public func computeTrajectory(
    studentId   : Types.StudentId,
    courseId    : Types.CourseId,
    term        : Text,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : Types.TrajectoryResult {

    // Collect (dueDate, score%) for graded assignments
    var dated = List.empty<(Int, Float)>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId and g.courseId == courseId and g.term == term) {
        switch (assignments.get(g.assignmentId)) {
          case (?asgn) {
            dated.add((asgn.dueDate, g.value * 100.0));
          };
          case null {};
        };
      };
    };

    let sorted = dated.toArray().sort(func(a : (Int, Float), b : (Int, Float)) : Order.Order { Int.compare(a.0, b.0) });
    let scores = sorted.map(func(pair) { pair.1 });
    let n = scores.size();

    // Last 5 scores
    let start5 = if (n > 5) n - 5 else 0;
    let lastFiveScores = scores.sliceToArray(start5, n);

    // Rolling 3-assignment average (last 3)
    let start3 = if (n > 3) n - 3 else 0;
    let last3 = scores.sliceToArray(start3, n);
    let rolling3Avg = avg(last3);

    // Direction: compare last-3 to prior-3
    let direction : { #Up; #Flat; #Down } = if (n >= 4) {
      let priorEnd   = start3;
      let priorStart = if (priorEnd > 3) priorEnd - 3 else 0;
      let prior3     = scores.sliceToArray(priorStart, priorEnd);
      let prior3Avg  = avg(prior3);
      if      (prior3Avg == 0.0) #Flat
      else if (rolling3Avg > prior3Avg * (1.0 + TRAJECTORY_DELTA_PCT)) #Up
      else if (rolling3Avg < prior3Avg * (1.0 - TRAJECTORY_DELTA_PCT)) #Down
      else #Flat
    } else #Flat;

    let passStatus : { #Passing; #AtRisk; #Failing } =
      if      (rolling3Avg >= PASSING_THRESHOLD)                   #Passing
      else if (rolling3Avg >= (PASSING_THRESHOLD - AT_RISK_OFFSET)) #AtRisk
      else                                                          #Failing;

    {
      studentId;
      courseId;
      direction;
      rolling3Avg;
      priorTermDelta = null;  // cross-term data not stored; frontend handles gracefully
      passStatus;
      lastFiveScores;
    }
  };

  // ── getOverloadFlags ──────────────────────────────────────────────────────

  /// Cross-teacher humane overload check: one flag per course with
  /// >= OVERLOAD_MIN_COUNT high-stakes assignments due in the given ISO week.
  public func getOverloadFlags(
    week        : Text,
    courseIds   : [Types.CourseId],
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
  ) : [GTypes.OverloadFlag] {

    var flags = List.empty<GTypes.OverloadFlag>();

    for (courseId in courseIds.vals()) {
      var hsIds = List.empty<Types.AssignmentId>();

      for ((_, asgn) in assignments.entries()) {
        if (
          asgn.courseId == courseId and
          asgn.term == week and
          (asgn.isHighStakes or asgn.weight > HIGH_STAKES_THRESHOLD)
        ) {
          hsIds.add(asgn.id);
        };
      };

      if (hsIds.size() >= OVERLOAD_MIN_COUNT) {
        // Collect affected student ids
        var studentSet = List.empty<Types.StudentId>();
        for (aid in hsIds.values()) {
          for ((_, g) in grades.entries()) {
            if (g.assignmentId == aid and g.courseId == courseId) {
              if (not studentSet.contains(g.studentId)) {
                studentSet.add(g.studentId);
              };
            };
          };
        };

        flags.add({
          courseId           = courseId.toText();
          week               = week;
          affectedStudentIds = studentSet.map<Types.StudentId, Text>(func(id) { id.toText() }).toArray();
          assignmentIds      = hsIds.map<Types.AssignmentId, Text>(func(id) { id.toText() }).toArray();
          reason             = "3 or more high-stakes assignments due in the same week";
        });
      };
    };

    flags.toArray()
  };

  // ── generateReportCardData ────────────────────────────────────────────────

  /// Assemble full report-card data for one student/term.
  /// attendance is passed in from the attendance domain (null yields zeros).
  public func generateReportCardData(
    studentId   : Types.StudentId,
    term        : Text,
    students    : Map.Map<Types.StudentId, Types.Student>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    attendance  : ?Types.AttendancePattern,
  ) : { #ok : GTypes.ReportCardData; #err : Text } {

    let student = switch (students.get(studentId)) {
      case (?s) s;
      case null { return #err("student not found: " # studentId.toText()) };
    };

    // Collect distinct courseIds for this student in this term
    var seenCourseIds = List.empty<Types.CourseId>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId and g.term == term) {
        if (not seenCourseIds.contains(g.courseId)) {
          seenCourseIds.add(g.courseId);
        };
      };
    };

    var courseGrades = List.empty<(Types.Course, Float)>();
    var totalGpa    : Float = 0.0;
    var courseCount : Nat   = 0;

    for (cid in seenCourseIds.values()) {
      switch (courses.get(cid)) {
        case (?course) {
          let waResult = getWeightedAverage(studentId, cid, term, grades, assignments);
          courseGrades.add((course, waResult.average));
          totalGpa    += waResult.average;
          courseCount += 1;
        };
        case null {};
      };
    };

    let gpa = if (courseCount > 0) totalGpa / Float.fromInt(courseCount) else 0.0;

    let attendanceSummary : Types.AttendancePattern = switch (attendance) {
      case (?a) a;
      case null {
        {
          studentId;
          totalDays      = 0;
          presentDays    = 0;
          absentDays     = 0;
          excusedDays    = 0;
          tardyDays      = 0;
          percentage     = 0.0;
          belowThreshold = false;
          chronicAbsence = false;
          trend          = "steady";
        }
      };
    };

    #ok({ student; term; courseGrades = courseGrades.toArray(); gpa; attendanceSummary })
  };

  // ── submitAssignment ──────────────────────────────────────────────────────

  /// Create a submission record for a student.
  public func submitAssignment(
    submissions  : Map.Map<Types.SubmissionId, Types.Submission>,
    state        : { var nextSubmissionId : Nat },
    studentId    : Types.StudentId,
    assignmentId : Types.AssignmentId,
    submissionText : Text,
    assignments  : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : { #ok : Types.Submission; #err : Text } {
    switch (assignments.get(assignmentId)) {
      case null { #err("assignment not found: " # assignmentId.toText()) };
      case (?_) {
        let id = state.nextSubmissionId;
        state.nextSubmissionId += 1;
        let sub : Types.Submission = {
          id;
          assignmentId;
          studentId;
          submittedAt    = Time.now();
          submissionText;
          status         = #submitted;
          earnedPoints   = null;
          isDemoData     = false;
        };
        submissions.add(id, sub);
        #ok(sub)
      };
    }
  };

  // ── getStudentAssignments ─────────────────────────────────────────────────

  /// All assignments for courses a student is enrolled in, with submission status.
  public func getStudentAssignments(
    studentId   : Types.StudentId,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    submissions : Map.Map<Types.SubmissionId, Types.Submission>,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
  ) : [Types.AssignmentWithStatus] {
    // Determine enrolled courseIds from grades
    var enrolledCourses = List.empty<Types.CourseId>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        if (enrolledCourses.find<Types.CourseId>(func cid { cid == g.courseId }) == null) {
          enrolledCourses.add(g.courseId);
        };
      };
    };
    // Also check course teacherAssignedClasses via student grade = course grade
    for ((_, c) in courses.entries()) {
      if (enrolledCourses.find<Types.CourseId>(func cid { cid == c.id }) == null) {
        // Student is in a course if any assignment exists for their grade
        ignore c;
      };
    };

    var result = List.empty<Types.AssignmentWithStatus>();
    for ((_, asgn) in assignments.entries()) {
      if (enrolledCourses.find<Types.CourseId>(func cid { cid == asgn.courseId }) != null) {
        // Look for submission
        var subStatus : Types.SubmissionStatus = #notSubmitted;
        var earnedPoints : ?Float = null;
        for ((_, sub) in submissions.entries()) {
          if (sub.assignmentId == asgn.id and sub.studentId == studentId) {
            subStatus    := sub.status;
            earnedPoints := sub.earnedPoints;
          };
        };
        // If graded, override status
        for ((_, g) in grades.entries()) {
          if (g.assignmentId == asgn.id and g.studentId == studentId) {
            subStatus    := #graded;
            earnedPoints := ?(g.value / 100.0 * asgn.points);
          };
        };
        result.add({ assignment = asgn; submissionStatus = subStatus; earnedPoints });
      };
    };
    result.toArray()
  };

  // ── getAssignmentsForCourse ────────────────────────────────────────────────

  /// All assignments for a given course.
  public func getAssignmentsForCourse(
    courseId    : Types.CourseId,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : [Types.Assignment] {
    var result = List.empty<Types.Assignment>();
    for ((_, a) in assignments.entries()) {
      if (a.courseId == courseId) { result.add(a) };
    };
    result.toArray()
  };

  // ── updateAssignment ──────────────────────────────────────────────────────

  /// Update assignment metadata (name, description, dueDate, weight, points).
  public func updateAssignment(
    assignmentId : Types.AssignmentId,
    assignments  : Map.Map<Types.AssignmentId, Types.Assignment>,
    name         : ?Text,
    description  : ?Text,
    dueDate      : ?Types.Timestamp,
    weight       : ?Float,
    points       : ?Float,
  ) : { #ok : Types.Assignment; #err : Text } {
    switch (assignments.get(assignmentId)) {
      case null { #err("assignment not found: " # assignmentId.toText()) };
      case (?a) {
        let newWeight = switch (weight) { case (?w) w; case null a.weight };
        let updated : Types.Assignment = {
          a with
          name        = switch (name)        { case (?v) v; case null a.name };
          description = switch (description) { case (?v) ?v; case null a.description };
          dueDate     = switch (dueDate)     { case (?v) v; case null a.dueDate };
          weight      = newWeight;
          points      = switch (points)      { case (?v) v; case null a.points };
          isHighStakes = newWeight > HIGH_STAKES_THRESHOLD;
        };
        assignments.add(assignmentId, updated);
        #ok(updated)
      };
    }
  };

  // ── getStudentGrades ──────────────────────────────────────────────────────

  /// Return all grades for a student with course name, term, score, weight.
  public func getStudentGrades(
    studentId   : Types.StudentId,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
  ) : [GTypes.StudentGradeView] {
    var result = List.empty<GTypes.StudentGradeView>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        switch (assignments.get(g.assignmentId)) {
          case (?asgn) {
            let courseName = switch (courses.get(g.courseId)) {
              case (?c) c.name;
              case null "Unknown";
            };
            result.add({
              courseId     = g.courseId;
              courseName   = courseName;
              term         = g.term;
              score        = g.value;
              weight       = g.weight;
              letterGrade  = letterGrade(g.value);
              assignmentName = asgn.name;
            });
          };
          case null {};
        };
      };
    };
    result.toArray()
  };

  // ── getClassGradebook ─────────────────────────────────────────────────────

  /// Return all students in a course with their grades and assignments.
  public func getClassGradebook(
    courseId    : Types.CourseId,
    term        : Text,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    students    : Map.Map<Types.StudentId, Types.Student>,
  ) : [GTypes.ClassGradebookEntry] {
    // Collect all assignments for this course/term
    var courseAssignments = List.empty<(Types.AssignmentId, Types.Assignment)>();
    for ((_, a) in assignments.entries()) {
      if (a.courseId == courseId and a.term == term) {
        courseAssignments.add((a.id, a));
      };
    };
    let asgnArray = courseAssignments.toArray();

    // Collect all student IDs with grades in this course/term
    var studentIds = List.empty<Types.StudentId>();
    for ((_, g) in grades.entries()) {
      if (g.courseId == courseId and g.term == term) {
        if (studentIds.find<Types.StudentId>(func id { id == g.studentId }) == null) {
          studentIds.add(g.studentId);
        };
      };
    };

    var result = List.empty<GTypes.ClassGradebookEntry>();
    for (sid in studentIds.values()) {
      let studentName = switch (students.get(sid)) {
        case (?s) s.name;
        case null "Unknown";
      };

      var gradeEntries = List.empty<{ assignmentId : Types.AssignmentId; assignmentName : Text; score : ?Float; maxScore : Float; weight : Float }>();
      var totalWeight : Float = 0.0;
      var weightedSum : Float = 0.0;

      for ((aid, asgn) in asgnArray.vals()) {
        var score : ?Float = null;
        for ((_, g) in grades.entries()) {
          if (g.studentId == sid and g.assignmentId == aid) {
            score := ?g.value;
            weightedSum += g.value * g.weight;
            totalWeight += g.weight;
          };
        };
        gradeEntries.add({
          assignmentId   = aid;
          assignmentName = asgn.name;
          score          = score;
          maxScore       = asgn.points;
          weight         = asgn.weight;
        });
      };

      let average = if (totalWeight > 0.0) (weightedSum / totalWeight) * 100.0 else 0.0;
      result.add({
        studentId   = sid;
        studentName = studentName;
        grades      = gradeEntries.toArray();
        average     = average;
      });
    };

    result.toArray()
  };

  // ── getAssignmentsByCourse ────────────────────────────────────────────────

  /// Return assignments for a course with dueDate, weight, highStakes flag.
  public func getAssignmentsByCourse(
    courseId    : Types.CourseId,
    term        : Text,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : [Types.Assignment] {
    var result = List.empty<Types.Assignment>();
    for ((_, a) in assignments.entries()) {
      if (a.courseId == courseId and a.term == term) {
        result.add(a);
      };
    };
    result.toArray()
  };

  // ── getStudentTranscript ──────────────────────────────────────────────────

  /// Return all terms with courses, grades, GPA per term, cumulative GPA.
  public func getStudentTranscript(
    studentId   : Types.StudentId,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    students    : Map.Map<Types.StudentId, Types.Student>,
  ) : GTypes.StudentTranscript {
    let studentName = switch (students.get(studentId)) {
      case (?s) s.name;
      case null "Unknown";
    };

    // Collect all distinct (courseId, term) pairs for this student
    var pairs = List.empty<(Types.CourseId, Text)>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        let key = (g.courseId, g.term);
        if (pairs.find<(Types.CourseId, Text)>(func p { p.0 == key.0 and p.1 == key.1 }) == null) {
          pairs.add(key);
        };
      };
    };

    // Group by term
    var termMap = Map.empty<Text, List.List<GTypes.TranscriptCourse>>();
    for ((cid, term) in pairs.values()) {
      let wa = getWeightedAverage(studentId, cid, term, grades, assignments);
      let courseName = switch (courses.get(cid)) {
        case (?c) c.name;
        case null "Unknown";
      };
      let tc : GTypes.TranscriptCourse = {
        courseId    = cid;
        courseName  = courseName;
        term        = term;
        grade       = wa.average;
        letterGrade = letterGrade(wa.average);
        credits     = 1.0; // default credit per course
      };
      switch (termMap.get(term)) {
        case (?list) { list.add(tc) };
        case null {
          let newList = List.empty<GTypes.TranscriptCourse>();
          newList.add(tc);
          termMap.add(term, newList);
        };
      };
    };

    var terms = List.empty<GTypes.TranscriptTerm>();
    var cumulativeGpa : Float = 0.0;
    var totalCredits : Float = 0.0;

    for ((term, courseList) in termMap.entries()) {
      let courseArray = courseList.toArray();
      var termGpa : Float = 0.0;
      var termCredits : Float = 0.0;
      for (tc in courseArray.vals()) {
        termGpa += tc.grade * tc.credits;
        termCredits += tc.credits;
      };
      let termGpaValue = if (termCredits > 0.0) termGpa / termCredits else 0.0;
      terms.add({
        term        = term;
        courses     = courseArray;
        termGpa     = termGpaValue;
        termCredits = termCredits;
      });
      cumulativeGpa += termGpa;
      totalCredits += termCredits;
    };

    let finalCumulativeGpa = if (totalCredits > 0.0) cumulativeGpa / totalCredits else 0.0;

    {
      studentId     = studentId;
      studentName   = studentName;
      terms         = terms.toArray();
      cumulativeGpa = finalCumulativeGpa;
      totalCredits  = totalCredits;
    }
  };

  // ── getReportCard ─────────────────────────────────────────────────────────

  /// Return term courses, grades, attendance summary, behaviour summary.
  public func getReportCard(
    studentId   : Types.StudentId,
    term        : Text,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    students    : Map.Map<Types.StudentId, Types.Student>,
    attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    incidents   : Map.Map<Types.IncidentId, Types.Incident>,
  ) : { #ok : GTypes.ReportCardResult; #err : Text } {
    let student = switch (students.get(studentId)) {
      case (?s) s;
      case null { return #err("student not found") };
    };

    // Course grades
    var courseGrades = List.empty<(Types.Course, Float, Text)>();
    var seenCourseIds = List.empty<Types.CourseId>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId and g.term == term) {
        if (not seenCourseIds.contains(g.courseId)) {
          seenCourseIds.add(g.courseId);
          switch (courses.get(g.courseId)) {
            case (?course) {
              let wa = getWeightedAverage(studentId, g.courseId, term, grades, assignments);
              courseGrades.add((course, wa.average, letterGrade(wa.average)));
            };
            case null {};
          };
        };
      };
    };

    // GPA
    var totalGpa : Float = 0.0;
    var count : Nat = 0;
    for ((_, avg, _) in courseGrades.values()) {
      totalGpa += avg;
      count += 1;
    };
    let gpa = if (count > 0) totalGpa / Float.fromInt(count) else 0.0;

    // Attendance summary for this term
    var totalDays : Nat = 0;
    var presentDays : Nat = 0;
    var absentDays : Nat = 0;
    var excusedDays : Nat = 0;
    var tardyDays : Nat = 0;
    for ((_, rec) in attendance.entries()) {
      if (rec.studentId == studentId) {
        totalDays += 1;
        switch (rec.status) {
          case (#present) { presentDays += 1 };
          case (#absent)  { absentDays += 1 };
          case (#excused) { excusedDays += 1 };
          case (#tardy)   { tardyDays += 1 };
        };
      };
    };
    let attPct = if (totalDays > 0) Float.fromInt(presentDays + excusedDays) / Float.fromInt(totalDays) * 100.0 else 0.0;

    // Behaviour summary
    var incidentCount : Nat = 0;
    var openIncidents : Nat = 0;
    var lastIncident : ?Types.Timestamp = null;
    for ((_, inc) in incidents.entries()) {
      if (inc.studentId == studentId) {
        incidentCount += 1;
        switch (inc.status) {
          case (#logged or #routed or #reviewing or #followUp) { openIncidents += 1 };
          case (#closed) {};
        };
        lastIncident := ?inc.createdAt;
      };
    };

    #ok({
      student           = student;
      term              = term;
      courseGrades      = courseGrades.toArray();
      gpa               = gpa;
      attendanceSummary = {
        totalDays   = totalDays;
        presentDays = presentDays;
        absentDays  = absentDays;
        excusedDays = excusedDays;
        tardyDays   = tardyDays;
        percentage  = attPct;
      };
      behaviourSummary  = {
        incidentCount = incidentCount;
        openIncidents = openIncidents;
        lastIncident  = lastIncident;
      };
    })
  };

};
