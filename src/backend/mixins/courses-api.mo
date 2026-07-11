import Map "mo:core/Map";
import Types "../types/common";
import CoursesLib "../lib/Courses";

mixin (
  courses     : Map.Map<Types.CourseId, Types.Course>,
  assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  state       : { var nextCourseId : Nat; var nextAssignmentId : Nat },
) {

  public query func getCourses(
    teacherId : ?Types.StaffId,
  ) : async [Types.Course] {
    let pairs = courses.entries().toArray();
    CoursesLib.listCourses(pairs, teacherId)
  };

  public query func getCourse(
    id : Types.CourseId,
  ) : async ?Types.Course {
    let pairs = courses.entries().toArray();
    CoursesLib.getCourse(pairs, id)
  };

  public query func getCourseWithUnits(
    courseId : Types.CourseId,
  ) : async ?Types.Course {
    CoursesLib.getCourseWithUnits(courses, courseId)
  };

  public func updateCourse(
    courseId   : Types.CourseId,
    name       : ?Text,
    code       : ?Text,
    department : ?Text,
  ) : async { #ok : Types.Course; #err : Text } {
    CoursesLib.updateCourse(courses, courseId, name, code, department)
  };

  public func updateUnit(
    unitId : Types.UnitId,
    name   : ?Text,
  ) : async { #ok : Types.Unit; #err : Text } {
    CoursesLib.updateUnit(courses, unitId, name)
  };

  public func updateLesson(
    lessonId    : Types.LessonId,
    name        : ?Text,
    description : ?Text,
  ) : async { #ok : Types.Lesson; #err : Text } {
    CoursesLib.updateLesson(courses, lessonId, name, description)
  };

  public query func getUnitsForCourse(
    courseId : Types.CourseId,
  ) : async [Types.Unit] {
    CoursesLib.getUnitsForCourse(courses, courseId)
  };

  public query func getLessonsForUnit(
    unitId : Types.UnitId,
  ) : async [Types.Lesson] {
    CoursesLib.getLessonsForUnit(courses, unitId)
  };

};
