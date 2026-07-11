/// lib/Gradebook.mo — Domain logic for the gradebook V2 domain (stateless module).
/// All functions receive the stores they need; no actor state here.

import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Types "../types/common";
import GTypes "../types/grades";

module {

  // ── Helpers ─────────────────────────────────────────────────────────────

  /// Convert weighted percentage (0-100) to letter grade (standard scale).
  public func letterGrade(pct : Float) : Text {
    if (pct >= 90.0) "A"
    else if (pct >= 80.0) "B"
    else if (pct >= 70.0) "C"
    else if (pct >= 60.0) "D"
    else "F"
  };

  /// Convert a weighted percentage (0-100) to GPA points on a 4.0 scale.
  public func pctToGpaPoints(pct : Float) : Float {
    if (pct >= 93.0) 4.0
    else if (pct >= 90.0) 3.7
    else if (pct >= 87.0) 3.3
    else if (pct >= 83.0) 3.0
    else if (pct >= 80.0) 2.7
    else if (pct >= 77.0) 2.3
    else if (pct >= 73.0) 2.0
    else if (pct >= 70.0) 1.7
    else if (pct >= 67.0) 1.3
    else if (pct >= 63.0) 1.0
    else if (pct >= 60.0) 0.7
    else 0.0
  };

  // ── GradeCategory CRUD ──────────────────────────────────────────────────

  public func createCategory(
    classId : Types.CourseId,
    name : Text,
    weight : Nat,
    state : { var nextCategoryId : Nat },
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
  ) : GTypes.GradeCategory {
    let id = "cat-" # state.nextCategoryId.toText();
    state.nextCategoryId += 1;
    let category : GTypes.GradeCategory = {
      id;
      classId;
      name;
      weight;
    };
    gradeCategories.add(id, category);
    category
  };

  public func updateCategory(
    id : Types.CategoryId,
    name : Text,
    weight : Nat,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
  ) : ?GTypes.GradeCategory {
    switch (gradeCategories.get(id)) {
      case null null;
      case (?existing) {
        let updated : GTypes.GradeCategory = {
          existing with
          name;
          weight;
        };
        gradeCategories.add(id, updated);
        ?updated
      };
    }
  };

  public func deleteCategory(
    id : Types.CategoryId,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
  ) : Bool {
    switch (gradeCategories.get(id)) {
      case null false;
      case (?_) {
        gradeCategories.remove(id);
        true
      };
    }
  };

  public func clearClassData(
    classId : Types.CourseId,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
  ) {
    // Remove all scores for assignments in this class
    let scoreKeys = scores.entries().toArray();
    for ((sid, sc) in scoreKeys.vals()) {
      switch (assignments.get(sc.assignmentId)) {
        case null {};
        case (?asgn) {
          if (asgn.classId == classId) { scores.remove(sid) };
        };
      };
    };
    // Remove all assignments for this class
    let assignKeys = assignments.entries().toArray();
    for ((aid, asgn) in assignKeys.vals()) {
      if (asgn.classId == classId) { assignments.remove(aid) };
    };
    // Remove all categories for this class
    let catKeys = gradeCategories.entries().toArray();
    for ((cid, cat) in catKeys.vals()) {
      if (cat.classId == classId) { gradeCategories.remove(cid) };
    };
  };

  public func listCategoriesByClass(
    classId : Types.CourseId,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
  ) : [GTypes.GradeCategory] {
    var result = List.empty<GTypes.GradeCategory>();
    for ((_, cat) in gradeCategories.entries()) {
      if (cat.classId == classId) {
        result.add(cat);
      };
    };
    result.toArray()
  };

  // ── AssignmentV2 CRUD ───────────────────────────────────────────────────

  public func createAssignment(
    classId : Types.CourseId,
    categoryId : Types.CategoryId,
    name : Text,
    pointsPossible : Nat,
    dueDate : ?Text,
    state : { var nextAssignmentId : Nat },
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
  ) : GTypes.AssignmentV2 {
    let id = state.nextAssignmentId;
    state.nextAssignmentId += 1;
    let assignment : GTypes.AssignmentV2 = {
      id;
      classId;
      categoryId;
      name;
      pointsPossible;
      dueDate;
    };
    assignments.add(id, assignment);
    assignment
  };

  public func updateAssignment(
    id : Types.AssignmentId,
    name : Text,
    pointsPossible : Nat,
    dueDate : ?Text,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
  ) : ?GTypes.AssignmentV2 {
    switch (assignments.get(id)) {
      case null null;
      case (?existing) {
        let updated : GTypes.AssignmentV2 = {
          existing with
          name;
          pointsPossible;
          dueDate;
        };
        assignments.add(id, updated);
        ?updated
      };
    }
  };

  public func deleteAssignment(
    id : Types.AssignmentId,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
  ) : Bool {
    switch (assignments.get(id)) {
      case null false;
      case (?_) {
        assignments.remove(id);
        true
      };
    }
  };

  public func listAssignmentsByClass(
    classId : Types.CourseId,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
  ) : [GTypes.AssignmentV2] {
    var result = List.empty<GTypes.AssignmentV2>();
    for ((_, asgn) in assignments.entries()) {
      if (asgn.classId == classId) {
        result.add(asgn);
      };
    };
    result.toArray()
  };

  // ── Score CRUD ────────────────────────────────────────────────────────────

  public func setScore(
    assignmentId : Types.AssignmentId,
    studentId : Types.StudentId,
    pointsEarned : ?Nat,
    state : { var nextScoreId : Nat },
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
  ) : GTypes.Score {
    // Check if a score already exists for this (assignment, student) pair
    var existingId : ?Types.ScoreId = null;
    for ((sid, sc) in scores.entries()) {
      if (sc.assignmentId == assignmentId and sc.studentId == studentId) {
        existingId := ?sid;
      };
    };

    switch (existingId) {
      case (?sid) {
        let updated : GTypes.Score = {
          id = sid;
          assignmentId;
          studentId;
          pointsEarned;
        };
        scores.add(sid, updated);
        updated
      };
      case null {
        let id = "sc-" # state.nextScoreId.toText();
        state.nextScoreId += 1;
        let newScore : GTypes.Score = {
          id;
          assignmentId;
          studentId;
          pointsEarned;
        };
        scores.add(id, newScore);
        newScore
      };
    }
  };

  public func updateScore(
    id : Types.ScoreId,
    pointsEarned : ?Nat,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
  ) : ?GTypes.Score {
    switch (scores.get(id)) {
      case null null;
      case (?existing) {
        let updated : GTypes.Score = {
          existing with
          pointsEarned;
        };
        scores.add(id, updated);
        ?updated
      };
    }
  };

  public func listScoresByAssignment(
    assignmentId : Types.AssignmentId,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
  ) : [GTypes.Score] {
    var result = List.empty<GTypes.Score>();
    for ((_, sc) in scores.entries()) {
      if (sc.assignmentId == assignmentId) {
        result.add(sc);
      };
    };
    result.toArray()
  };

  public func listScoresByClass(
    classId : Types.CourseId,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
  ) : [GTypes.Score] {
    // Collect assignment IDs for this class
    var classAssignmentIds = List.empty<Types.AssignmentId>();
    for ((_, asgn) in assignments.entries()) {
      if (asgn.classId == classId) {
        classAssignmentIds.add(asgn.id);
      };
    };
    let classAssignments = classAssignmentIds.toArray();

    var result = List.empty<GTypes.Score>();
    for ((_, sc) in scores.entries()) {
      if (classAssignments.find<Types.AssignmentId>(func aid { aid == sc.assignmentId }) != null) {
        result.add(sc);
      };
    };
    result.toArray()
  };

  // ── Weighted average computation ────────────────────────────────────────

  public func getStudentGradebookSummary(
    studentId : Types.StudentId,
    courses : Map.Map<Types.CourseId, Types.Course>,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
    students : Map.Map<Types.StudentId, Types.Student>,
  ) : [GTypes.StudentGradebookClassSummary] {
    // Find all classes this student has scores in (new gradebook system)
    var enrolledClassIds = List.empty<Types.CourseId>();
    for ((_, sc) in scores.entries()) {
      if (sc.studentId == studentId) {
        switch (assignments.get(sc.assignmentId)) {
          case null {};
          case (?asgn) {
            if (enrolledClassIds.find<Types.CourseId>(func cid { cid == asgn.classId }) == null) {
              enrolledClassIds.add(asgn.classId);
            };
          };
        };
      };
    };

    var result = List.empty<GTypes.StudentGradebookClassSummary>();

    for (classId in enrolledClassIds.values()) {
      // Check if this class has gradebook categories
      var hasCategories = false;
      for ((_, cat) in gradeCategories.entries()) {
        if (cat.classId == classId) {
          hasCategories := true;
        };
      };

      if (hasCategories) {
        let averages = computeWeightedAverages(classId, gradeCategories, assignments, scores, students);
        let className : Text = switch (courses.get(classId)) {
          case null {
            if (classId == 1) "Algebra II"
            else if (classId == 2) "Biology"
            else if (classId == 3) "English Literature"
            else "Class " # classId.toText()
          };
          case (?c) { c.name };
        };

        for (avg in averages.vals()) {
          if (avg.studentId == studentId) {
            result.add({
              classId;
              className;
              weightedPercentage = avg.overallPercent;
              letterGrade = avg.letterGrade;
            });
          };
        };
      };
    };

    result.toArray()
  };

  /// Overall GPA (4.0 scale) averaged across a student's gradebook classes.
  /// Returns null when the student has no graded V2 classes.
  public func computeStudentGPA(
    studentId : Types.StudentId,
    courses : Map.Map<Types.CourseId, Types.Course>,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
    students : Map.Map<Types.StudentId, Types.Student>,
  ) : ?Float {
    let summaries = getStudentGradebookSummary(studentId, courses, gradeCategories, assignments, scores, students);
    if (summaries.size() == 0) return null;
    var sum : Float = 0.0;
    var n : Float = 0.0;
    for (s in summaries.vals()) {
      sum += pctToGpaPoints(s.weightedPercentage);
      n += 1.0;
    };
    if (n == 0.0) null else ?(sum / n)
  };

  public func computeWeightedAverages(
    classId : Types.CourseId,
    gradeCategories : Map.Map<Types.CategoryId, GTypes.GradeCategory>,
    assignments : Map.Map<Types.AssignmentId, GTypes.AssignmentV2>,
    scores : Map.Map<Types.ScoreId, GTypes.Score>,
    students : Map.Map<Types.StudentId, Types.Student>,
  ) : [GTypes.StudentWeightedResult] {

    // Collect categories for this class
    var categoriesList = List.empty<GTypes.GradeCategory>();
    for ((_, cat) in gradeCategories.entries()) {
      if (cat.classId == classId) {
        categoriesList.add(cat);
      };
    };
    let categories = categoriesList.toArray();

    // Collect assignments for this class
    var classAssignmentsList = List.empty<GTypes.AssignmentV2>();
    for ((_, asgn) in assignments.entries()) {
      if (asgn.classId == classId) {
        classAssignmentsList.add(asgn);
      };
    };
    let classAssignments = classAssignmentsList.toArray();

    // Collect student IDs enrolled in this class (from scores + existing roster)
    var studentIdsList = List.empty<Types.StudentId>();
    for ((_, sc) in scores.entries()) {
      for (asgn in classAssignmentsList.values()) {
        if (asgn.id == sc.assignmentId) {
          if (studentIdsList.find<Types.StudentId>(func sid { sid == sc.studentId }) == null) {
            studentIdsList.add(sc.studentId);
          };
        };
      };
    };

    // Also include students who have grades in the old system for this class
    // (This ensures roster completeness during transition)
    // Note: We don't have access to old grades map here, so we rely on scores

    let studentIds = studentIdsList.toArray();

    var results = List.empty<GTypes.StudentWeightedResult>();

    for (studentId in studentIds.vals()) {
      var totalWeight : Float = 0.0;
      var weightedSum : Float = 0.0;

      for (cat in categories.vals()) {
        var catScoreSum : Float = 0.0;
        var catPointsSum : Float = 0.0;
        var catCount : Nat = 0;

        for (asgn in classAssignments.vals()) {
          if (asgn.categoryId == cat.id) {
            // Find score for this student + assignment
            for ((_, sc) in scores.entries()) {
              if (sc.assignmentId == asgn.id and sc.studentId == studentId) {
                switch (sc.pointsEarned) {
                  case (?points) {
                    catScoreSum += Float.fromInt(points);
                    catPointsSum += Float.fromInt(asgn.pointsPossible);
                    catCount += 1;
                  };
                  case null {};
                };
              };
            };
          };
        };

        if (catPointsSum > 0.0) {
          let catAverage = catScoreSum / catPointsSum;
          let catWeightFloat = Float.fromInt(cat.weight) / 100.0;
          weightedSum += catAverage * catWeightFloat * 100.0;
          totalWeight += catWeightFloat * 100.0;
        };
      };

      let overallPercent = if (totalWeight > 0.0) (weightedSum / totalWeight) * 100.0 else 0.0;

      results.add({
        studentId;
        overallPercent;
        letterGrade = letterGrade(overallPercent);
      });
    };

    results.toArray()
  };

};
