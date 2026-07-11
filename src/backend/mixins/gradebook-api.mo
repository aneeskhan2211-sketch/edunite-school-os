import Map "mo:core/Map";
import List "mo:core/List";
import Types "../types/common";
import GTypes "../types/grades";
import Gradebook "../lib/Gradebook";
import GradebookSeed "../lib/GradebookSeed";
import StudentsLib "../lib/Students";

mixin (
  courses       : Map.Map<Types.CourseId, Types.Course>,
  gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
  assignments     : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
  scores          : Map.Map<Types.ScoreId, GTypes.Score>,
  students        : Map.Map<Types.StudentId, Types.Student>,
  attendance      : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  state           : { var nextCategoryId : Nat; var nextAssignmentId : Nat; var nextScoreId : Nat },
) {

  // ── Lazy init: auto-seed gradebook if empty ─────────────────────────────

  func isGradebookEmpty() : Bool {
    var count = 0;
    for ((_, _) in gradeCategories.entries()) {
      count += 1;
    };
    count == 0
  };

  func checkAndSeedGradebook() {
    if (isGradebookEmpty()) {
      GradebookSeed.seedClasses1To3({
        gradeCategories = gradeCategories;
        assignmentsV2 = assignments;
        scores = scores;
        nextCategoryId = state.nextCategoryId;
        nextAssignmentV2Id = state.nextAssignmentId;
        nextScoreId = state.nextScoreId;
      });
    };
  };

  // ── GradeCategory endpoints ─────────────────────────────────────────────

  public query func listGradeCategories(classId : Types.CourseId) : async [GTypes.GradeCategory] {
    checkAndSeedGradebook();
    Gradebook.listCategoriesByClass(classId, gradeCategories)
  };

  public func createGradeCategory(
    classId : Types.CourseId,
    name : Text,
    weight : Nat,
  ) : async GTypes.GradeCategory {
    checkAndSeedGradebook();
    Gradebook.createCategory(classId, name, weight, state, gradeCategories)
  };

  public func updateGradeCategory(
    id : Types.CategoryId,
    name : Text,
    weight : Nat,
  ) : async ?GTypes.GradeCategory {
    checkAndSeedGradebook();
    Gradebook.updateCategory(id, name, weight, gradeCategories)
  };

  public func deleteGradeCategory(id : Types.CategoryId) : async Bool {
    checkAndSeedGradebook();
    Gradebook.deleteCategory(id, gradeCategories)
  };

  // ── AssignmentV2 endpoints ──────────────────────────────────────────────

  public query func listGradebookAssignments(classId : Types.CourseId) : async [GTypes.AssignmentV2] {
    checkAndSeedGradebook();
    Gradebook.listAssignmentsByClass(classId, assignments)
  };

  public func createGradebookAssignment(
    classId : Types.CourseId,
    categoryId : Types.CategoryId,
    name : Text,
    pointsPossible : Nat,
    dueDate : ?Text,
  ) : async GTypes.AssignmentV2 {
    checkAndSeedGradebook();
    Gradebook.createAssignment(classId, categoryId, name, pointsPossible, dueDate, state, assignments)
  };

  public func updateGradebookAssignment(
    id : Types.AssignmentId,
    name : Text,
    pointsPossible : Nat,
    dueDate : ?Text,
  ) : async ?GTypes.AssignmentV2 {
    checkAndSeedGradebook();
    Gradebook.updateAssignment(id, name, pointsPossible, dueDate, assignments)
  };

  public func deleteGradebookAssignment(id : Types.AssignmentId) : async Bool {
    checkAndSeedGradebook();
    Gradebook.deleteAssignment(id, assignments)
  };

  // ── Score endpoints ─────────────────────────────────────────────────────

  public query func listScores(assignmentId : Types.AssignmentId) : async [GTypes.Score] {
    checkAndSeedGradebook();
    Gradebook.listScoresByAssignment(assignmentId, scores)
  };

  public query func listScoresByClass(classId : Types.CourseId) : async [GTypes.Score] {
    checkAndSeedGradebook();
    Gradebook.listScoresByClass(classId, assignments, scores)
  };

  public func setScore(
    assignmentId : Types.AssignmentId,
    studentId : Types.StudentId,
    pointsEarned : ?Nat,
  ) : async GTypes.Score {
    checkAndSeedGradebook();
    Gradebook.setScore(assignmentId, studentId, pointsEarned, state, scores)
  };

  public func updateScore(
    id : Types.ScoreId,
    pointsEarned : ?Nat,
  ) : async ?GTypes.Score {
    checkAndSeedGradebook();
    Gradebook.updateScore(id, pointsEarned, scores)
  };

  // ── Computed query ──────────────────────────────────────────────────────

  public query func getStudentGradebookSummary(studentId : Types.StudentId) : async [GTypes.StudentGradebookClassSummary] {
    checkAndSeedGradebook();
    Gradebook.getStudentGradebookSummary(studentId, courses, gradeCategories, assignments, scores, students)
  };

  public query func computeClassWeightedAverages(classId : Types.CourseId) : async [GTypes.StudentWeightedResult] {
    checkAndSeedGradebook();
    Gradebook.computeWeightedAverages(classId, gradeCategories, assignments, scores, students)
  };

  /// Student roster with computed GPA (V2 gradebook) + attendance rate in a
  /// single call. Powers the student-list pages so they show real per-student
  /// figures instead of demo data. FERPA filtering by ctx is a Phase 3 concern.
  public query func getStudentRoster(_ctx : Types.RoleContext) : async [GTypes.StudentRosterRow] {
    checkAndSeedGradebook();
    let rows = List.empty<GTypes.StudentRosterRow>();
    for ((_, s) in students.entries()) {
      rows.add({
        student        = s;
        gpa            = Gradebook.computeStudentGPA(s.id, courses, gradeCategories, assignments, scores, students);
        attendanceRate = StudentsLib.computeAttendanceRate(attendance, s.id);
      });
    };
    rows.toArray()
  };

};
