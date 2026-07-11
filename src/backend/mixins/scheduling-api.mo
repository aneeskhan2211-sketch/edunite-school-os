import Map "mo:core/Map";
import Types "../types/common";

// Scheduling read API: rosters, per-student / per-teacher schedules, the master
// timetable, and a conflict detector (first "smart" layer — flags teacher/room
// double-bookings). The auto-scheduler/solver builds on these in a later step.
mixin (
  enrollments   : Map.Map<Text, Types.Enrollment>,
  classMeetings : Map.Map<Types.MeetingId, Types.ClassMeeting>,
  courses       : Map.Map<Types.CourseId, Types.Course>,
  state         : { var nextMeetingId : Nat },
) {

  func contains(arr : [Types.CourseId], x : Types.CourseId) : Bool {
    for (y in arr.vals()) { if (y == x) return true };
    false;
  };

  func teacherBusy(slots : [(Nat, Nat)], period : Nat, teacherId : Nat) : Bool {
    for ((p, t) in slots.vals()) { if (p == period and t == teacherId) return true };
    false;
  };

  func roomBusy(slots : [(Nat, Text)], period : Nat, room : Text) : Bool {
    for ((p, r) in slots.vals()) { if (p == period and r == room) return true };
    false;
  };

  /// Courses a student is enrolled in.
  public query func getStudentCourses(studentId : Types.StudentId) : async [Types.CourseId] {
    var out : [Types.CourseId] = [];
    for ((_, e) in enrollments.entries()) {
      if (e.studentId == studentId) { out := out.concat([e.courseId]) };
    };
    out;
  };

  /// Weekly class meetings for a student (joined through enrollment).
  public query func getStudentSchedule(studentId : Types.StudentId) : async [Types.ClassMeeting] {
    var courseIds : [Types.CourseId] = [];
    for ((_, e) in enrollments.entries()) {
      if (e.studentId == studentId) { courseIds := courseIds.concat([e.courseId]) };
    };
    var out : [Types.ClassMeeting] = [];
    for ((_, m) in classMeetings.entries()) {
      if (contains(courseIds, m.courseId)) { out := out.concat([m]) };
    };
    out;
  };

  /// Weekly class meetings a teacher runs.
  public query func getTeacherSchedule(teacherId : Types.StaffId) : async [Types.ClassMeeting] {
    var out : [Types.ClassMeeting] = [];
    for ((_, m) in classMeetings.entries()) {
      if (m.teacherId == teacherId) { out := out.concat([m]) };
    };
    out;
  };

  /// Student roster for a course.
  public query func getCourseRoster(courseId : Types.CourseId) : async [Types.StudentId] {
    var out : [Types.StudentId] = [];
    for ((_, e) in enrollments.entries()) {
      if (e.courseId == courseId) { out := out.concat([e.studentId]) };
    };
    out;
  };

  /// All class meetings (admin master timetable).
  public query func getMasterTimetable() : async [Types.ClassMeeting] {
    classMeetings.values().toArray();
  };

  /// Conflict detector: flags teacher or room double-booked in the same slot.
  public query func detectScheduleConflicts() : async [Text] {
    let all = classMeetings.values().toArray();
    var conflicts : [Text] = [];
    let n = all.size();
    var i = 0;
    while (i < n) {
      var j = i + 1;
      while (j < n) {
        let a = all[i];
        let b = all[j];
        if (a.dayOfWeek == b.dayOfWeek and a.period == b.period) {
          if (a.teacherId == b.teacherId) {
            conflicts := conflicts.concat([
              "Teacher " # a.teacherId.toText() # " double-booked (day " # a.dayOfWeek.toText() # ", period " # a.period.toText() # ")"
            ]);
          };
          if (a.room == b.room) {
            conflicts := conflicts.concat([
              "Room " # a.room # " double-booked (day " # a.dayOfWeek.toText() # ", period " # a.period.toText() # ")"
            ]);
          };
        };
        j += 1;
      };
      i += 1;
    };
    conflicts;
  };

  /// AI-aided auto-scheduler: greedily assigns every course a conflict-free
  /// (period, room) slot — no teacher teaches two courses in the same period and
  /// no room is double-booked — then lays each course across Mon–Fri. Rebuilds
  /// the whole timetable. Returns the number of courses placed, or an error if a
  /// course could not be fit.
  public func generateTimetable() : async { #ok : Nat; #err : Text } {
    // Clear the existing timetable.
    let existing = classMeetings.entries().toArray();
    for ((id, _) in existing.vals()) { classMeetings.remove(id) };

    let rooms : [Text] = ["201", "210", "112", "118", "Lab 3", "Gym", "Library", "204"];
    let numPeriods : Nat = 6;
    var mId = state.nextMeetingId;
    var teacherSlots : [(Nat, Nat)] = [];
    var roomSlots : [(Nat, Text)] = [];
    var count = 0;

    for (c in courses.values().toArray().vals()) {
      var placed = false;
      var p = 1;
      while (p <= numPeriods and not placed) {
        if (not teacherBusy(teacherSlots, p, c.teacherId)) {
          var ri = 0;
          while (ri < rooms.size() and not placed) {
            let room = rooms[ri];
            if (not roomBusy(roomSlots, p, room)) {
              teacherSlots := teacherSlots.concat([(p, c.teacherId)]);
              roomSlots := roomSlots.concat([(p, room)]);
              var day = 1;
              while (day <= 5) {
                classMeetings.add(mId, {
                  id = mId;
                  courseId = c.id;
                  teacherId = c.teacherId;
                  dayOfWeek = day;
                  period = p;
                  room;
                  term = "Spring 2026";
                  isDemoData = true;
                });
                mId += 1;
                day += 1;
              };
              count += 1;
              placed := true;
            };
            ri += 1;
          };
        };
        p += 1;
      };
      if (not placed) {
        return #err("Could not place course " # c.id.toText() # " — no free slot");
      };
    };
    state.nextMeetingId := mId;
    #ok(count);
  };
};
