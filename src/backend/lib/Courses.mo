import Types "../types/common";
import Array "mo:core/Array";
import Map "mo:core/Map";

module {

  // Returns courses, optionally filtered by teacher.
  public func listCourses(
    courses   : [(Types.CourseId, Types.Course)],
    teacherId : ?Types.StaffId,
  ) : [Types.Course] {
    let all = courses.map(func((_, c)) { c });
    switch (teacherId) {
      case (null) { all };
      case (?tid) { all.filter<Types.Course>(func(c) { c.teacherId == tid or c.coTeacherId == ?tid }) };
    };
  };

  // Returns a single course.
  public func getCourse(
    courses : [(Types.CourseId, Types.Course)],
    id      : Types.CourseId,
  ) : ?Types.Course {
    let found = courses.find(func((cid, _)) { cid == id });
    switch (found) {
      case (null) { null };
      case (?(_, c)) { ?c };
    };
  };

  // Adds a course.
  public func addCourse(
    course : Types.Course,
  ) : Types.Course {
    course
  };

  // Adds a unit to a course.
  public func addUnit(
    courses : [(Types.CourseId, Types.Course)],
    courseId : Types.CourseId,
    unit     : Types.Unit,
  ) : ?Types.Course {
    let found = courses.find(func((cid, _)) { cid == courseId });
    switch (found) {
      case (null) { null };
      case (?(_, c)) {
        ?{ c with units = c.units.concat([unit]) }
      };
    };
  };

  // Adds a lesson to a unit within a course.
  public func addLesson(
    courses  : [(Types.CourseId, Types.Course)],
    courseId : Types.CourseId,
    unitId   : Types.UnitId,
    lesson   : Types.Lesson,
  ) : ?Types.Course {
    let found = courses.find(func((cid, _)) { cid == courseId });
    switch (found) {
      case (null) { null };
      case (?(_, c)) {
        let updatedUnits = c.units.map(func(u) {
          if (u.id == unitId) {
            { u with lessons = u.lessons.concat([lesson]) }
          } else { u }
        });
        ?{ c with units = updatedUnits }
      };
    };
  };

  // Links an assignment to a lesson.
  public func linkAssignment(
    courses      : [(Types.CourseId, Types.Course)],
    courseId     : Types.CourseId,
    assignmentId : Types.AssignmentId,
    lessonId     : Types.LessonId,
  ) : Bool {
    // Assignment linking is tracked on the Assignment record itself (linkedLessonId);
    // here we just verify the course and lesson exist.
    let found = courses.find(func((cid, _)) { cid == courseId });
    switch (found) {
      case (null) { false };
      case (?(_, c)) {
        let unitWithLesson = c.units.find(func(u) {
          u.lessons.find<Types.Lesson>(func(l) { l.id == lessonId }) != null
        });
        unitWithLesson != null
      };
    };
  };

  // Returns a course with its nested units and lessons.
  public func getCourseWithUnits(
    courses  : Map.Map<Types.CourseId, Types.Course>,
    courseId : Types.CourseId,
  ) : ?Types.Course {
    courses.get(courseId)
  };

  // Updates a course's name and/or description fields.
  public func updateCourse(
    courses     : Map.Map<Types.CourseId, Types.Course>,
    courseId    : Types.CourseId,
    name        : ?Text,
    code        : ?Text,
    department  : ?Text,
  ) : { #ok : Types.Course; #err : Text } {
    switch (courses.get(courseId)) {
      case null { #err("course not found") };
      case (?c) {
        let updated = {
          c with
          name       = switch (name)       { case (?v) v; case null c.name };
          code       = switch (code)       { case (?v) v; case null c.code };
          department = switch (department) { case (?v) v; case null c.department };
        };
        courses.add(courseId, updated);
        #ok(updated)
      };
    }
  };

  // Updates a unit's title.
  public func updateUnit(
    courses : Map.Map<Types.CourseId, Types.Course>,
    unitId  : Types.UnitId,
    name    : ?Text,
  ) : { #ok : Types.Unit; #err : Text } {
    var result : { #ok : Types.Unit; #err : Text } = #err("unit not found");
    for ((cid, c) in courses.entries()) {
      for (u in c.units.vals()) {
        if (u.id == unitId) {
          let updated = { u with name = switch (name) { case (?v) v; case null u.name } };
          let newUnits = c.units.map(func(x : Types.Unit) : Types.Unit {
            if (x.id == unitId) updated else x
          });
          courses.add(cid, { c with units = newUnits });
          result := #ok(updated);
        };
      };
    };
    result
  };

  // Updates a lesson's title and/or description.
  public func updateLesson(
    courses     : Map.Map<Types.CourseId, Types.Course>,
    lessonId    : Types.LessonId,
    name        : ?Text,
    description : ?Text,
  ) : { #ok : Types.Lesson; #err : Text } {
    var result : { #ok : Types.Lesson; #err : Text } = #err("lesson not found");
    for ((cid, c) in courses.entries()) {
      let newUnits = c.units.map(func(u : Types.Unit) : Types.Unit {
        let newLessons = u.lessons.map(func(l : Types.Lesson) : Types.Lesson {
          if (l.id == lessonId) {
            let updated = {
              l with
              name        = switch (name)        { case (?v) v; case null l.name };
              description = switch (description) { case (?v) v; case null l.description };
            };
            result := #ok(updated);
            updated
          } else l
        });
        { u with lessons = newLessons }
      });
      courses.add(cid, { c with units = newUnits });
    };
    result
  };

  // Returns all units for a course.
  public func getUnitsForCourse(
    courses  : Map.Map<Types.CourseId, Types.Course>,
    courseId : Types.CourseId,
  ) : [Types.Unit] {
    switch (courses.get(courseId)) {
      case null { [] };
      case (?c) { c.units };
    }
  };

  // Returns all lessons for a unit.
  public func getLessonsForUnit(
    courses : Map.Map<Types.CourseId, Types.Course>,
    unitId  : Types.UnitId,
  ) : [Types.Lesson] {
    for ((_, c) in courses.entries()) {
      for (u in c.units.vals()) {
        if (u.id == unitId) { return u.lessons };
      };
    };
    []
  };
};
