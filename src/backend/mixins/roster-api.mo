/// mixins/roster-api.mo — Read-only query methods for counsellor caseload,
/// SPED/IEP caseload, substitute day, district health, curriculum overview,
/// co-teacher classes, and grade handoff log.
/// All methods are public query funcs.
import Map   "mo:core/Map";
import List  "mo:core/List";
import Float "mo:core/Float";
import Time  "mo:core/Time";
import Types "../types/common";

mixin (
  students    : Map.Map<Types.StudentId, Types.Student>,
  staff       : Map.Map<Types.StaffId, Types.Staff>,
  courses     : Map.Map<Types.CourseId, Types.Course>,
  assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  grades      : Map.Map<Types.GradeId, Types.Grade>,
  attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  incidents   : Map.Map<Types.IncidentId, Types.Incident>,
  commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
) {

  // ── 1. getCounsellorCaseload ─────────────────────────────────────────────

  /// Return the list of student IDs whose counsellorId matches the given
  /// counsellor's numeric ID.  The counsellorId parameter is the Text
  /// representation of the StaffId (e.g. "8" or "9").
  public query func getCounsellorCaseload(
    counsellorId : Text,
  ) : async [Types.StudentId] {
    var result = List.empty<Types.StudentId>();
    for ((_, s) in students.entries()) {
      switch (s.counsellorId) {
        case (null) {};
        case (?cid) {
          if (cid.toText() == counsellorId) {
            result.add(s.id);
          };
        };
      };
    };
    result.toArray()
  };

  // ── 2. getSubstituteDayClasses ───────────────────────────────────────────

  public type SubstituteClass = {
    classId      : Text;
    className    : Text;
    room         : Text;
    period       : Text;
    studentCount : Nat;
    lessonPlan   : Text;
    mustKnows    : [Text];
  };

  /// Return the classes a substitute should cover today.
  /// Uses the substitute's assigned classes from the staff record;
  /// falls back to all courses for the demo substitute (staff 16).
  public query func getSubstituteDayClasses(
    date         : Int,
    substituteId : Text,
  ) : async [SubstituteClass] {
    ignore date;

    // Find the substitute staff member
    let subStaff : ?Types.Staff = staff.values().toArray().find(
      func(m : Types.Staff) : Bool { m.id.toText() == substituteId }
    );

    // Collect the course IDs assigned to this substitute.
    // Demo sub (Kevin Martinez, id=16) has no assignedClasses, so we pick
    // a representative set: English 9 (id=1) and Biology (id=8).
    let targetCourseIds : [Types.CourseId] = switch (subStaff) {
      case (null) { [1, 8] };
      case (?sub) {
        if (sub.assignedClasses.size() == 0) { [1, 8] }
        else { sub.assignedClasses }
      };
    };

    var result = List.empty<SubstituteClass>();

    for (courseId in targetCourseIds.vals()) {
      switch (courses.get(courseId)) {
        case (null) {};
        case (?course) {
          // Count students: students whose grade is for this course
          var seen = Map.empty<Types.StudentId, Bool>();
          for ((_, g) in grades.entries()) {
            if (g.courseId == courseId) {
              seen.add(g.studentId, true);
            };
          };

          // Collect must-knows: students in this course with a medical alert
          var mustKnows = List.empty<Text>();
          for ((_, st) in students.entries()) {
            switch (st.specialPopFlags.medicalAlert) {
              case (null) {};
              case (?alert) {
                // Check if this student has grades in this course
                if (seen.get(st.id) != null) {
                  mustKnows.add(st.name # ": " # alert);
                };
              };
            };
          };

          // Find first lesson plan text from units
          let lessonPlan : Text =
            if (course.units.size() > 0) {
              let unit = course.units[0];
              if (unit.lessons.size() > 0) {
                "Unit " # unit.name # " — " # unit.lessons[0].name # ": " # unit.lessons[0].description
              } else {
                "Unit " # unit.name # " — no lessons defined"
              }
            } else {
              "No lesson plan available"
            };

          result.add({
            classId      = courseId.toText();
            className    = course.name;
            room         = "Room " # courseId.toText() # "01";
            period       = courseId.toText();
            studentCount = seen.size();
            lessonPlan;
            mustKnows    = mustKnows.toArray();
          });
        };
      };
    };
    result.toArray()
  };

  // ── 4. getSubstituteEndOfDay ─────────────────────────────────────────────

  public type SubstituteEndOfDay = {
    attendanceTaken       : Bool;
    presentCount          : Nat;
    absentCount           : Nat;
    incidentCount         : Nat;
    lessonCompletionNotes : Text;
  };

  /// Derive today's end-of-day summary for a substitute from attendance records.
  public query func getSubstituteEndOfDay(
    date         : Int,
    substituteId : Text,
  ) : async SubstituteEndOfDay {
    ignore substituteId;

    // Convert nanosecond timestamp to ISO date string for comparison
    let secs  = date / 1_000_000_000;
    let days  = secs / 86400;
    let d     = days + 719468;
    let era   = (if (d >= 0) { d } else { d - 146096 }) / 146097;
    let doe   = d - era * 146097;
    let yoe   = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y     = yoe + era * 400;
    let doy   = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp    = (5 * doy + 2) / 153;
    let day2  = doy - (153 * mp + 2) / 5 + 1;
    let month = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year  = if (month <= 2) { y + 1 } else { y };
    let pad2  = func(n : Int) : Text = if (n < 10) { "0" # n.toText() } else { n.toText() };
    let dateStr = year.toText() # "-" # pad2(month) # "-" # pad2(day2);

    var presentCount : Nat = 0;
    var absentCount  : Nat = 0;
    var attendanceTaken = false;

    for ((_, r) in attendance.entries()) {
      if (r.date == dateStr) {
        attendanceTaken := true;
        switch (r.status) {
          case (#present or #tardy) { presentCount += 1 };
          case (#absent or #excused) { absentCount += 1 };
        };
      };
    };

    // Count incidents today
    let dayStart = date - (date % 86_400_000_000_000);
    let dayEnd   = dayStart + 86_400_000_000_000;
    var incidentCount : Nat = 0;
    for ((_, inc) in incidents.entries()) {
      if (inc.createdAt >= dayStart and inc.createdAt < dayEnd) {
        incidentCount += 1;
      };
    };

    {
      attendanceTaken;
      presentCount;
      absentCount;
      incidentCount;
      lessonCompletionNotes = if (attendanceTaken) {
        "Classes covered. Attendance recorded."
      } else {
        "No attendance recorded yet for today."
      };
    }
  };

  // ── 5. getDistrictHealthSummary ──────────────────────────────────────────

  public type DistrictHealthSummary = {
    attendanceRate  : Float;
    averageGPA      : Float;
    incidentCount   : Nat;
    enrollmentCount : Nat;
    staffCount      : Nat;
    schoolName      : Text;
  };

  /// Compute school-wide health metrics from all Lincoln High data.
  public query func getDistrictHealthSummary() : async DistrictHealthSummary {
    // Enrollment count
    var enrollmentCount : Nat = 0;
    for ((_, s) in students.entries()) {
      switch (s.enrollmentStatus) {
        case (#active) { enrollmentCount += 1 };
        case _ {};
      };
    };

    // Staff count
    let staffCount = staff.size();

    // Attendance rate: present / total across all records
    var attTotal : Nat = 0;
    var attPresent : Nat = 0;
    for ((_, r) in attendance.entries()) {
      attTotal += 1;
      switch (r.status) {
        case (#present or #tardy) { attPresent += 1 };
        case _ {};
      };
    };
    let attendanceRate : Float =
      if (attTotal == 0) 100.0
      else Float.fromInt(attPresent) / Float.fromInt(attTotal) * 100.0;

    // Average GPA: weighted average across all grades
    var gpaWeightedSum : Float = 0.0;
    var gpaWeightTotal : Float = 0.0;
    for ((_, g) in grades.entries()) {
      gpaWeightedSum += g.value * g.weight;
      gpaWeightTotal += g.weight;
    };
    let averageGPA : Float =
      if (gpaWeightTotal == 0.0) 0.0
      else (gpaWeightedSum / gpaWeightTotal) / 25.0; // convert 0-100 pct to 0-4.0 scale

    // Incident count: all active (non-closed) incidents
    var incidentCount : Nat = 0;
    for ((_, inc) in incidents.entries()) {
      switch (inc.status) {
        case (#closed) {};
        case _ { incidentCount += 1 };
      };
    };

    {
      attendanceRate;
      averageGPA;
      incidentCount;
      enrollmentCount;
      staffCount;
      schoolName    = "Lincoln High School";
    }
  };

  // ── 6. getCurriculumOverview ─────────────────────────────────────────────

  public type CurriculumCourseRow = {
    courseId        : Text;
    courseName      : Text;
    unitCount       : Nat;
    lessonCount     : Nat;
    assignmentCount : Nat;
  };

  /// Aggregate curriculum statistics per course.
  public query func getCurriculumOverview() : async [CurriculumCourseRow] {
    var result = List.empty<CurriculumCourseRow>();

    for ((_, course) in courses.entries()) {
      let unitCount = course.units.size();
      var lessonCount : Nat = 0;
      for (unit in course.units.vals()) {
        lessonCount += unit.lessons.size();
      };
      // Count assignments for this course
      var assignmentCount : Nat = 0;
      for ((_, a) in assignments.entries()) {
        if (a.courseId == course.id) {
          assignmentCount += 1;
        };
      };
      result.add({
        courseId        = course.id.toText();
        courseName      = course.name;
        unitCount;
        lessonCount;
        assignmentCount;
      });
    };
    result.toArray()
  };

  // ── 7. getCoTeacherClasses ───────────────────────────────────────────────

  public type CoTeacherClassRow = {
    classId      : Text;
    className    : Text;
    leadTeacher  : Text;
    coTeacher    : Text;
    studentCount : Nat;
  };

  /// Return courses where the given teacher is either lead or co-teacher.
  public query func getCoTeacherClasses(
    teacherId : Text,
  ) : async [CoTeacherClassRow] {
    var result = List.empty<CoTeacherClassRow>();

    for ((_, course) in courses.entries()) {
      // Check if this teacher is the co-teacher or the lead of a co-taught course
      let isLead   = course.teacherId.toText() == teacherId;
      let isCoTeach = switch (course.coTeacherId) {
        case (null)   { false };
        case (?ctid) { ctid.toText() == teacherId };
      };

      if (isLead or isCoTeach) {
        switch (course.coTeacherId) {
          case (null) {}; // skip solo courses
          case (?ctid) {
            // Resolve names
            let leadName : Text = switch (staff.get(course.teacherId)) {
              case (null) { "Staff #" # course.teacherId.toText() };
              case (?sm)  { sm.name };
            };
            let coName : Text = switch (staff.get(ctid)) {
              case (null) { "Staff #" # ctid.toText() };
              case (?sm)  { sm.name };
            };

            // Count enrolled students (those with grades in this course)
            var seen = Map.empty<Types.StudentId, Bool>();
            for ((_, g) in grades.entries()) {
              if (g.courseId == course.id) {
                seen.add(g.studentId, true);
              };
            };

            result.add({
              classId      = course.id.toText();
              className    = course.name;
              leadTeacher  = leadName;
              coTeacher    = coName;
              studentCount = seen.size();
            });
          };
        };
      };
    };
    result.toArray()
  };

  // ── 8. getHandoffLog ─────────────────────────────────────────────────────

  public type HandoffLogEntry = {
    timestamp   : Int;
    teacherId   : Text;
    teacherName : Text;
    action      : Text;
    gradeId     : Text;
    studentName : Text;
    oldValue    : ?Text;
    newValue    : Text;
  };

  /// Return the grade audit trail for a class, shaped as a handoff log.
  /// Each entry in Types.Grade.auditLog maps to one HandoffLogEntry.
  public query func getHandoffLog(
    classId : Text,
  ) : async [HandoffLogEntry] {
    var result = List.empty<HandoffLogEntry>();

    for ((_, g) in grades.entries()) {
      if (g.courseId.toText() == classId) {
        // Resolve the student name once
        let studentName : Text = switch (students.get(g.studentId)) {
          case (null) { "Student #" # g.studentId.toText() };
          case (?st)  { st.name };
        };

        for (entry in g.auditLog.vals()) {
          // Resolve the teacher name
          let teacherName : Text = switch (staff.get(entry.performedBy)) {
            case (null) { "Staff #" # entry.performedBy.toText() };
            case (?sm)  { sm.name };
          };
          result.add({
            timestamp   = entry.performedAt;
            teacherId   = entry.performedBy.toText();
            teacherName;
            action      = entry.action;
            gradeId     = g.id.toText();
            studentName;
            oldValue    = entry.previousValue;
            newValue    = switch (entry.newValue) {
              case (null) { "" };
              case (?v)   { v };
            };
          });
        };
      };
    };

    // Sort descending by timestamp
    let arr = result.toArray();
    arr.sort(func(a : HandoffLogEntry, b : HandoffLogEntry) : { #less; #equal; #greater } {
      if (a.timestamp > b.timestamp)      { #less }
      else if (a.timestamp < b.timestamp) { #greater }
      else                                { #equal }
    })
  };

};
