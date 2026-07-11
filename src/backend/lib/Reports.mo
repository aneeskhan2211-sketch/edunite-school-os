/// lib/Reports.mo — Pure report-generation functions.
/// All functions receive maps; no actor state here.

import Float  "mo:core/Float";
import List   "mo:core/List";
import Map    "mo:core/Map";
import Types  "../types/common";

module {

  // ── Internal helpers ──────────────────────────────────────────────────────

  func letterGrade(pct : Float) : Text {
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

  func weightedAvg(
    studentId   : Types.StudentId,
    courseId    : Types.CourseId,
    term        : Text,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : Float {
    var totalWeight : Float = 0.0;
    var weightedSum : Float = 0.0;
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId and g.courseId == courseId and g.term == term) {
        switch (assignments.get(g.assignmentId)) {
          case (?_) {
            weightedSum += g.value * g.weight;
            totalWeight += g.weight;
          };
          case null {};
        };
      };
    };
    if (totalWeight > 0.0) (weightedSum / totalWeight) * 100.0 else 0.0
  };

  // ── Public types ──────────────────────────────────────────────────────────

  public type CourseSummary = {
    courseId      : Types.CourseId;
    courseName    : Text;
    finalGrade    : Float;
    letterGrade   : Text;
    teacherComment : Text;
  };

  public type AttendanceSummary = {
    present : Nat;
    absent  : Nat;
    tardy   : Nat;
    rate    : Float;
  };

  public type BehaviourSummary = {
    incidents        : Nat;
    followUpsComplete : Nat;
  };

  public type ReportCard = {
    studentId         : Types.StudentId;
    termId            : Text;
    courseSummaries   : [CourseSummary];
    attendanceSummary : AttendanceSummary;
    behaviourSummary  : BehaviourSummary;
  };

  public type TranscriptTerm = {
    termId  : Text;
    year    : Nat;
    courses : [TranscriptCourse];
    gpa     : Float;
  };

  public type TranscriptCourse = {
    courseId   : Types.CourseId;
    courseName : Text;
    grade      : Float;
    credits    : Float;
  };

  // ── getReportCard ─────────────────────────────────────────────────────────

  public func getReportCard(
    studentId   : Types.StudentId,
    termId      : Text,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
    attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    incidents   : Map.Map<Types.IncidentId, Types.Incident>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
  ) : ReportCard {
    // Collect distinct courseIds for this student / term
    var seenCourses = List.empty<Types.CourseId>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId and g.term == termId) {
        if (seenCourses.find<Types.CourseId>(func cid { cid == g.courseId }) == null) {
          seenCourses.add(g.courseId);
        };
      };
    };

    var summaries = List.empty<CourseSummary>();
    for (cid in seenCourses.values()) {
      let avg = weightedAvg(studentId, cid, termId, grades, assignments);
      let courseName = switch (courses.get(cid)) {
        case (?c) c.name;
        case null "Unknown Course";
      };
      summaries.add({
        courseId      = cid;
        courseName;
        finalGrade    = avg;
        letterGrade   = letterGrade(avg);
        teacherComment = "";
      });
    };

    // Attendance summary
    var present : Nat = 0;
    var absent  : Nat = 0;
    var tardy   : Nat = 0;
    for ((_, r) in attendance.entries()) {
      if (r.studentId == studentId) {
        switch (r.status) {
          case (#present) { present += 1 };
          case (#absent)  { absent  += 1 };
          case (#tardy)   { tardy   += 1 };
          case (#excused) { absent  += 1 };
        };
      };
    };
    let total = present + absent + tardy;
    let rate  = if (total > 0) Float.fromInt(present) / Float.fromInt(total) * 100.0 else 100.0;

    // Behaviour summary
    var incidentCount    : Nat = 0;
    var followUpsComplete : Nat = 0;
    for ((_, i) in incidents.entries()) {
      if (i.studentId == studentId) {
        incidentCount += 1;
        if (i.status == #closed) { followUpsComplete += 1 };
      };
    };

    {
      studentId;
      termId;
      courseSummaries   = summaries.toArray();
      attendanceSummary = { present; absent; tardy; rate };
      behaviourSummary  = { incidents = incidentCount; followUpsComplete };
    }
  };

  // ── getTranscript ─────────────────────────────────────────────────────────

  public func getTranscript(
    studentId   : Types.StudentId,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : [TranscriptTerm] {
    // Collect distinct (termId, courseId) pairs
    var termCourse = List.empty<(Text, Types.CourseId)>();
    for ((_, g) in grades.entries()) {
      if (g.studentId == studentId) {
        let key = (g.term, g.courseId);
        if (termCourse.find<(Text, Types.CourseId)>(
          func p { p.0 == key.0 and p.1 == key.1 }
        ) == null) {
          termCourse.add(key);
        };
      };
    };

    // Collect distinct terms
    var terms = List.empty<Text>();
    for ((t, _) in termCourse.values()) {
      if (terms.find<Text>(func x { x == t }) == null) {
        terms.add(t);
      };
    };

    terms.toArray().map<Text, TranscriptTerm>(func(term) {
      let termCourses = termCourse.toArray().filter(func((t, _)) { t == term });
      var tcList = List.empty<TranscriptCourse>();
      var totalGrade : Float = 0.0;
      var courseCount : Nat  = 0;
      for ((_, cid) in termCourses.vals()) {
        let avg = weightedAvg(studentId, cid, term, grades, assignments);
        let courseName = switch (courses.get(cid)) {
          case (?c) c.name;
          case null "Unknown";
        };
        tcList.add({ courseId = cid; courseName; grade = avg; credits = 1.0 });
        totalGrade  += avg;
        courseCount += 1;
      };
      let gpa = if (courseCount > 0) totalGrade / Float.fromInt(courseCount) else 0.0;
      // Extract year from term string (e.g. "Fall 2026" -> 2026)
      let year : Nat = 2026; // simplified; frontend can parse from termId
      ignore year;
      { termId = term; year = 2026; courses = tcList.toArray(); gpa }
    })
  };

  // ── exportAttendanceCSV ───────────────────────────────────────────────────

  /// dateRange: optional (startDate, endDate) ISO strings. Pass null for all dates.
  public func exportAttendanceCSV(
    courseId   : Types.CourseId,
    dateRange  : ?(Text, Text),
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  ) : Text {
    var rows = List.empty<Text>();
    rows.add("studentId,date,period,status,markedBy");
    for ((_, r) in attendance.entries()) {
      if (r.courseId == courseId) {
        let inRange = switch (dateRange) {
          case (?(startDate, endDate)) { r.date >= startDate and r.date <= endDate };
          case null { true };
        };
        if (inRange) {
          let status = switch (r.status) {
            case (#present) "present";
            case (#absent)  "absent";
            case (#excused) "excused";
            case (#tardy)   "tardy";
          };
          let period = switch (r.period) {
            case (?p) p;
            case null "";
          };
          rows.add(
            r.studentId.toText() # "," # r.date # "," # period # "," #
            status # "," # r.markedBy.toText()
          );
        };
      };
    };
    rows.toArray().foldLeft("", func(acc, row) {
      if (acc == "") row else acc # "\n" # row
    })
  };

  // ── exportGradebookCSV ────────────────────────────────────────────────────

  public func exportGradebookCSV(
    courseId    : Types.CourseId,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : Text {
    var rows = List.empty<Text>();
    rows.add("studentId,assignmentId,assignmentName,value,weight,term,gradedAt");
    for ((_, g) in grades.entries()) {
      if (g.courseId == courseId) {
        let aName = switch (assignments.get(g.assignmentId)) {
          case (?a) a.name;
          case null "";
        };
        rows.add(
          g.studentId.toText() # "," # g.assignmentId.toText() # "," # aName # "," #
          g.value.toText() # "," # g.weight.toText() # "," # g.term # "," # g.gradedAt.toText()
        );
      };
    };
    rows.toArray().foldLeft("", func(acc, row) {
      if (acc == "") row else acc # "\n" # row
    })
  };

  // ── Student summary types ──────────────────────────────────────────────────────

  public type StudentSummary = {
    studentId : Types.StudentId;
    name      : Text;
    grade     : Nat;
    courseIds : [Types.CourseId];
  };

  /// Students for whom the given teacher has entered at least one grade.
  public func listReportableStudents(
    teacherId   : Types.StaffId,
    students    : Map.Map<Types.StudentId, Types.Student>,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
  ) : [StudentSummary] {
    // Collect courseIds taught by this teacher
    var teacherCourses = List.empty<Types.CourseId>();
    for ((_, c) in courses.entries()) {
      if (c.teacherId == teacherId) {
        teacherCourses.add(c.id);
      } else {
        switch (c.coTeacherId) {
          case (?coId) { if (coId == teacherId) teacherCourses.add(c.id) };
          case null {};
        };
      };
    };

    // Map studentId -> list of graded courseIds
    var studentCourseMap = Map.empty<Types.StudentId, List.List<Types.CourseId>>();
    for ((_, g) in grades.entries()) {
      if (teacherCourses.find<Types.CourseId>(func cid { cid == g.courseId }) != null) {
        switch (studentCourseMap.get(g.studentId)) {
          case (?list) {
            if (list.find<Types.CourseId>(func cid { cid == g.courseId }) == null) {
              list.add(g.courseId);
            };
          };
          case null {
            let newList = List.empty<Types.CourseId>();
            newList.add(g.courseId);
            studentCourseMap.add(g.studentId, newList);
          };
        };
      };
    };

    var result = List.empty<StudentSummary>();
    for ((sid, cids) in studentCourseMap.entries()) {
      switch (students.get(sid)) {
        case (?s) {
          result.add({
            studentId = sid;
            name      = s.name;
            grade     = s.grade;
            courseIds = cids.toArray();
          });
        };
        case null {};
      };
    };
    result.toArray()
  };

  // ── Class report types ───────────────────────────────────────────────────────────

  public type StudentGradeSummary = {
    studentId     : Types.StudentId;
    studentName   : Text;
    weightedAvg   : Float;
    letterGrade   : Text;
  };

  public type ClassReport = {
    courseId           : Types.CourseId;
    courseName         : Text;
    teacherName        : Text;
    term               : Text;
    roster             : [StudentGradeSummary];
    classAverage       : Float;
    topStudents        : [StudentGradeSummary];
    strugglingStudents : [StudentGradeSummary];
    totalStudents      : Nat;
  };

  public func exportClassReport(
    courseId    : Types.CourseId,
    term        : Text,
    courses     : Map.Map<Types.CourseId, Types.Course>,
    staff       : Map.Map<Types.StaffId, Types.Staff>,
    students    : Map.Map<Types.StudentId, Types.Student>,
    grades      : Map.Map<Types.GradeId, Types.Grade>,
    assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  ) : ClassReport {
    let courseName = switch (courses.get(courseId)) {
      case (?c) c.name;
      case null "Unknown Course";
    };
    let teacherName = switch (courses.get(courseId)) {
      case (?c) {
        switch (staff.get(c.teacherId)) {
          case (?st) st.name;
          case null "Unknown Teacher";
        };
      };
      case null "Unknown Teacher";
    };

    // Collect distinct student IDs with grades for this course/term
    var seenStudents = List.empty<Types.StudentId>();
    for ((_, g) in grades.entries()) {
      if (g.courseId == courseId and g.term == term) {
        if (seenStudents.find<Types.StudentId>(func sid { sid == g.studentId }) == null) {
          seenStudents.add(g.studentId);
        };
      };
    };

    var roster = List.empty<StudentGradeSummary>();
    for (sid in seenStudents.values()) {
      let avg = weightedAvg(sid, courseId, term, grades, assignments);
      let sName = switch (students.get(sid)) {
        case (?s) s.name;
        case null "Unknown";
      };
      roster.add({
        studentId   = sid;
        studentName = sName;
        weightedAvg = avg;
        letterGrade = letterGrade(avg);
      });
    };

    let rosterArr = roster.toArray();
    let total = rosterArr.size();
    let classAvg = if (total > 0) {
      let s = rosterArr.foldLeft(0.0, func(acc : Float, r) = acc + r.weightedAvg);
      s / Float.fromInt(total)
    } else 0.0;

    let top        = rosterArr.filter(func(r) { r.weightedAvg >= 90.0 });
    let struggling = rosterArr.filter(func(r) { r.weightedAvg < 70.0 });

    {
      courseId;
      courseName;
      teacherName;
      term;
      roster             = rosterArr;
      classAverage       = classAvg;
      topStudents        = top;
      strugglingStudents = struggling;
      totalStudents      = total;
    }
  };
};
