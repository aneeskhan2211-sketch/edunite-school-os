import Map "mo:core/Map";
import Types "../types/common";

/// Seeds 6 courses with names, codes, departments and teachers so course names
/// resolve on the backend (schedules, gradebook, class lists). Clears prior demo
/// courses first; idempotent across postupgrade.
module CourseSeed {

  public type SeedState = {
    courses : Map.Map<Types.CourseId, Types.Course>;
  };

  func mk(
    id : Nat,
    name : Text,
    code : Text,
    dept : Text,
    teacherId : Nat,
    grade : Nat,
  ) : Types.Course {
    {
      id;
      name;
      code;
      department = dept;
      teacherId;
      coTeacherId = null;
      grade;
      units = [];
      isDemoData = true;
    };
  };

  public func seed(s : SeedState) : () {
    let courses = s.courses;

    var toRemove : [Types.CourseId] = [];
    for ((id, r) in courses.entries()) {
      if (r.isDemoData) { toRemove := toRemove.concat([id]) };
    };
    for (id in toRemove.vals()) { courses.remove(id) };

    let rows : [Types.Course] = [
      mk(1, "Algebra II", "MATH201", "Math", 1, 10),
      mk(2, "English 10", "ENG210", "English", 2, 10),
      mk(3, "Pre-Calculus", "MATH301", "Math", 1, 11),
      mk(4, "Biology Honors", "SCI115", "Science", 4, 10),
      mk(5, "US History", "HIS220", "Social Studies", 2, 10),
      mk(6, "Spanish III", "SPN300", "World Languages", 4, 11),
    ];
    for (r in rows.vals()) { courses.add(r.id, r) };
  };
};
