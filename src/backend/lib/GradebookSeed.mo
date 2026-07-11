import Map "mo:core/Map";
import Types "../types/common";
import GTypes "../types/grades";
import Gradebook "./Gradebook";

module GradebookSeed {

  public type SeedState = {
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>;
    assignmentsV2 : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>;
    scores : Map.Map<Types.ScoreId, GTypes.Score>;
    nextCategoryId : Nat;
    nextAssignmentV2Id : Nat;
    nextScoreId : Nat;
  };

  public func seed(seedState : SeedState, classId : Nat) : () {
    // Build mutable counter objects that Gradebook functions expect
    var nextCatId = seedState.nextCategoryId;
    var nextAsgnId = seedState.nextAssignmentV2Id;
    var nextScId = seedState.nextScoreId;

    let catState = { var nextCategoryId = nextCatId };
    let asgnState = { var nextAssignmentId = nextAsgnId };
    let scoreState = { var nextScoreId = nextScId };

    // Clear existing data for this class first (idempotent)
    Gradebook.clearClassData(classId, seedState.gradeCategories, seedState.assignmentsV2, seedState.scores);

    // Seed categories
    let catHomework = Gradebook.createCategory(classId, "Homework", 20, catState, seedState.gradeCategories);
    let catQuizzes  = Gradebook.createCategory(classId, "Quizzes", 30, catState, seedState.gradeCategories);
    let catTests    = Gradebook.createCategory(classId, "Tests", 50, catState, seedState.gradeCategories);

    // Seed assignments
    let _hw1   = Gradebook.createAssignment(classId, catHomework.id, "HW 1", 10, ?"2026-09-01", asgnState, seedState.assignmentsV2);
    let _quiz1 = Gradebook.createAssignment(classId, catQuizzes.id, "Quiz 1", 20, ?"2026-09-08", asgnState, seedState.assignmentsV2);
    let _test1 = Gradebook.createAssignment(classId, catTests.id, "Test 1", 100, ?"2026-09-15", asgnState, seedState.assignmentsV2);

    // Seed scores for class 1 (Algebra II) — exact existing values
    if (classId == 1) {
      // Jordan Ellis (studentId = 1)
      ignore Gradebook.setScore(1, 1, ?9, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 1, ?18, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 1, ?85, scoreState, seedState.scores);
      // Maya Okonkwo (studentId = 2)
      ignore Gradebook.setScore(1, 2, ?7, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 2, ?12, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 2, ?65, scoreState, seedState.scores);
      // Tyler Reyes (studentId = 3)
      ignore Gradebook.setScore(1, 3, ?8, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 3, ?16, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 3, ?78, scoreState, seedState.scores);
    } else if (classId == 2) {
      // English 10 — students 4, 5, 6 (Priya Sharma, Marcus Brown, Aisha Williams)
      ignore Gradebook.setScore(1, 4, ?8, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 4, ?15, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 4, ?72, scoreState, seedState.scores);
      ignore Gradebook.setScore(1, 5, ?9, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 5, ?17, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 5, ?88, scoreState, seedState.scores);
      ignore Gradebook.setScore(1, 6, ?7, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 6, ?14, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 6, ?68, scoreState, seedState.scores);
    } else if (classId == 3) {
      // Pre-Calculus — students 7, 8, 9
      ignore Gradebook.setScore(1, 7, ?9, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 7, ?16, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 7, ?82, scoreState, seedState.scores);
      ignore Gradebook.setScore(1, 8, ?8, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 8, ?15, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 8, ?75, scoreState, seedState.scores);
      ignore Gradebook.setScore(1, 9, ?10, scoreState, seedState.scores);
      ignore Gradebook.setScore(2, 9, ?18, scoreState, seedState.scores);
      ignore Gradebook.setScore(3, 9, ?91, scoreState, seedState.scores);
    };
  };

  public func seedClasses1To3(seedState : SeedState) : () {
    seed(seedState, 1);
    seed(seedState, 2);
    seed(seedState, 3);
  };
};
