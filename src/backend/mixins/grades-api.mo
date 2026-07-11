import Map    "mo:core/Map";
import Array  "mo:core/Array";
import List   "mo:core/List";
import Types  "../types/common";
import GTypes "../types/grades";
import Grades "../lib/Grades";

mixin (
  grades      : Map.Map<Types.GradeId, Types.Grade>,
  assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  students    : Map.Map<Types.StudentId, Types.Student>,
  courses     : Map.Map<Types.CourseId, Types.Course>,
  submissions : Map.Map<Types.SubmissionId, Types.Submission>,
  attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  incidents   : Map.Map<Types.IncidentId, Types.Incident>,
  state       : { var nextGradeId : Nat; var nextAssignmentId : Nat; var nextAuditId : Nat; var nextSubmissionId : Nat },
) {

  /// Create an assignment for a course. Validates weight; auto-sets isHighStakes.
  public func createAssignment(
    assignment : Types.Assignment,
    ctx        : Types.RoleContext,
  ) : async { #ok : Types.Assignment; #err : Text } {
    Grades.createAssignment(assignment, ctx.userId, state, assignments)
  };

  /// Enter or update a single grade. Audit-logged inline per grade.
  public func updateGrade(
    grade : Types.Grade,
    ctx   : Types.RoleContext,
  ) : async { #ok : Types.Grade; #err : Text } {
    Grades.updateGrade(grade, ctx, state, grades)
  };

  /// All grades for every student in a course (gradebook grid data).
  /// Caller context controls FERPA filtering; returns all for teacher-level callers.
  public query func listGradesByCourse(
    courseId : Types.CourseId,
    term     : Text,
  ) : async [Types.Grade] {
    Grades.listGradesByCourse(
      courseId, term,
      #teacher, 0, [],
      grades, assignments,
    )
  };

  /// All grades for one student, optionally filtered by course and/or term.
  public query func listGradesByStudent(
    studentId : Types.StudentId,
    courseId  : ?Types.CourseId,
    term      : ?Text,
  ) : async [Types.Grade] {
    Grades.listGradesByStudent(
      studentId, courseId, term,
      #teacher, studentId, [],
      grades,
    )
  };

  /// Weighted average + trajectory for one student in one course.
  public query func getWeightedAverage(
    studentId : Types.StudentId,
    courseId  : Types.CourseId,
    term      : Text,
  ) : async GTypes.WeightedAverageResult {
    Grades.getWeightedAverage(studentId, courseId, term, grades, assignments)
  };

  /// Trajectory for a student. If courseId is null, computes across all enrolled courses.
  public query func getTrajectory(
    studentId : Types.StudentId,
    courseId  : ?Types.CourseId,
  ) : async [Types.TrajectoryResult] {
    switch (courseId) {
      case (?cid) {
        let termsList = List.empty<Text>();
        for ((_, g) in grades.entries()) {
          if (g.studentId == studentId and g.courseId == cid) {
            if (termsList.find<Text>(func t { t == g.term }) == null) {
              termsList.add(g.term);
            };
          };
        };
        let terms = termsList.toArray();
        terms.map<Text, Types.TrajectoryResult>(func(t) {
          Grades.computeTrajectory(studentId, cid, t, grades, assignments)
        })
      };
      case null {
        let pairsList = List.empty<(Types.CourseId, Text)>();
        for ((_, g) in grades.entries()) {
          if (g.studentId == studentId) {
            let key = (g.courseId, g.term);
            if (pairsList.find<(Types.CourseId, Text)>(func p { p.0 == key.0 and p.1 == key.1 }) == null) {
              pairsList.add(key);
            };
          };
        };
        let pairs = pairsList.toArray();
        pairs.map<(Types.CourseId, Text), Types.TrajectoryResult>(func((cid, t)) {
          Grades.computeTrajectory(studentId, cid, t, grades, assignments)
        })
      };
    }
  };

  /// Assessment-clash detection: returns one flag per course with 3+ high-stakes items in the given ISO week.
  /// Pass courseId = null to check all courses.
  public query func getOverloadFlags(
    courseId : ?Types.CourseId,
    term     : ?Text,
  ) : async [GTypes.OverloadFlag] {
    let week = switch (term) { case (?t) t; case null "" };
    let courseIds : [Types.CourseId] = switch (courseId) {
      case (?cid) [cid];
      case null {
        let idsList = List.empty<Types.CourseId>();
        for ((_, c) in courses.entries()) {
          idsList.add(c.id);
        };
        idsList.toArray()
      };
    };
    Grades.getOverloadFlags(week, courseIds, assignments, grades)
  };

  /// Assemble full report-card data for one student/term (frontend renders to PDF).
  public query func generateReportCardData(
    studentId : Types.StudentId,
    term      : Text,
  ) : async GTypes.ReportCardData {
    switch (Grades.generateReportCardData(
      studentId, term, students, courses, grades, assignments, null
    )) {
      case (#ok(data)) data;
      case (#err(_)) {
        let emptyStudent : Types.Student = {
          id                = studentId;
          name              = "Unknown";
          preferredName     = null;
          grade             = 0;
          dob               = "";
          homeroom          = "";
          photo             = null;
          guardians         = [];
          counsellorId      = null;
          spedCoordinatorId = null;
          enrollmentStatus  = #active;
          specialPopFlags   = {
            sped = false; ell = false; wida = null;
            mcKinneyVento = false; fosterYouth = false;
            gifted = false; medicalAlert = null;
          };
          isDemoData = false;
        };
        {
          student           = emptyStudent;
          term              = term;
          courseGrades      = [];
          gpa               = 0.0;
          attendanceSummary = {
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
          };
        }
      };
    }
  };


  /// Submit an assignment for a student.
  public func submitAssignment(
    studentId      : Types.StudentId,
    assignmentId   : Types.AssignmentId,
    submissionText : Text,
  ) : async { #ok : Types.Submission; #err : Text } {
    Grades.submitAssignment(submissions, state, studentId, assignmentId, submissionText, assignments)
  };

  /// All assignments for a student's enrolled courses with submission status.
  public query func getStudentAssignments(
    studentId : Types.StudentId,
  ) : async [Types.AssignmentWithStatus] {
    Grades.getStudentAssignments(studentId, courses, assignments, submissions, grades)
  };

  /// All assignments for a given course.
  public query func getAssignmentsForCourse(
    courseId : Types.CourseId,
  ) : async [Types.Assignment] {
    Grades.getAssignmentsForCourse(courseId, assignments)
  };

  /// Update assignment metadata.
  public func updateAssignment(
    assignmentId : Types.AssignmentId,
    name         : ?Text,
    description  : ?Text,
    dueDate      : ?Types.Timestamp,
    weight       : ?Float,
    points       : ?Float,
  ) : async { #ok : Types.Assignment; #err : Text } {
    Grades.updateAssignment(assignmentId, assignments, name, description, dueDate, weight, points)
  };

  /// Return all grades for a student with course name, term, score, weight.
  public query func getStudentGrades(
    studentId : Types.StudentId,
  ) : async [GTypes.StudentGradeView] {
    Grades.getStudentGrades(studentId, grades, assignments, courses)
  };

  /// Return all students in a course with their grades and assignments.
  public query func getClassGradebook(
    courseId : Types.CourseId,
    term     : Text,
  ) : async [GTypes.ClassGradebookEntry] {
    Grades.getClassGradebook(courseId, term, grades, assignments, students)
  };

  /// Return assignments for a course with dueDate, weight, highStakes flag.
  public query func getAssignmentsByCourse(
    courseId : Types.CourseId,
    term     : Text,
  ) : async [Types.Assignment] {
    Grades.getAssignmentsByCourse(courseId, term, assignments)
  };

  /// Return all terms with courses, grades, GPA per term, cumulative GPA.
  public query func getStudentTranscript(
    studentId : Types.StudentId,
  ) : async GTypes.StudentTranscript {
    Grades.getStudentTranscript(studentId, grades, assignments, courses, students)
  };

};

