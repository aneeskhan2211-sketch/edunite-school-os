import Map "mo:core/Map";
import Types "../types/common";

/// Seeds enrollment (rosters) + a full weekly timetable. Every student takes all
/// 6 courses, one per period (1–6), Mon–Fri — a believable full day, conflict-free
/// (each course owns a distinct period). Mirrors the other seeds: clears prior
/// demo rows, idempotent across postupgrade.
module ScheduleSeed {

  public type SeedState = {
    enrollments   : Map.Map<Text, Types.Enrollment>;
    classMeetings : Map.Map<Types.MeetingId, Types.ClassMeeting>;
    nextMeetingId : Nat;
  };

  let TERM : Text = "Spring 2026";

  public func seed(s : SeedState) : () {
    let enr = s.enrollments;
    let meet = s.classMeetings;
    var mId = s.nextMeetingId;

    // Clear prior demo rows.
    var eRem : [Text] = [];
    for ((k, e) in enr.entries()) { if (e.isDemoData) { eRem := eRem.concat([k]) } };
    for (k in eRem.vals()) { enr.remove(k) };
    var mRem : [Types.MeetingId] = [];
    for ((id, m) in meet.entries()) { if (m.isDemoData) { mRem := mRem.concat([id]) } };
    for (id in mRem.vals()) { meet.remove(id) };

    // Enroll every student (1–9) in every course (1–6) for a full day.
    var courseId = 1;
    while (courseId <= 6) {
      var sid = 1;
      while (sid <= 9) {
        let key = sid.toText() # "-" # courseId.toText();
        enr.add(key, { studentId = sid; courseId = courseId; term = TERM; isDemoData = true });
        sid += 1;
      };
      courseId += 1;
    };

    // Timetable: (courseId, teacherId, period, room) — each meets Mon–Fri.
    // Distinct period per course ⇒ conflict-free for shared teachers/rooms.
    let sections : [(Nat, Nat, Nat, Text)] = [
      (1, 1, 1, "201"),
      (2, 2, 2, "210"),
      (3, 1, 3, "201"),
      (4, 4, 4, "Lab 3"),
      (5, 2, 5, "112"),
      (6, 4, 6, "118"),
    ];
    for ((cId, teacherId, period, room) in sections.vals()) {
      var day = 1;
      while (day <= 5) {
        meet.add(mId, {
          id = mId;
          courseId = cId;
          teacherId;
          dayOfWeek = day;
          period;
          room;
          term = TERM;
          isDemoData = true;
        });
        mId += 1;
        day += 1;
      };
    };
  };
};
