import Map    "mo:core/Map";
import List   "mo:core/List";
import Array  "mo:core/Array";
import Int    "mo:core/Int";
import Float  "mo:core/Float";
import Time   "mo:core/Time";
import Types  "../types/common";
import ATypes "../types/attendance";

module {

  // ── Helpers ────────────────────────────────────────────────────────────

  /// Convert a common AttendanceRecord to ATypes.AttendanceRecord
  /// (used for ATypes.AttendancePattern.lastFiveEntries).
  func toARecord(r : Types.AttendanceRecord) : ATypes.AttendanceRecord {
    let aStatus : ATypes.AttendanceStatus = switch (r.status) {
      case (#present) { #Present };
      case (#absent)  { #Absent  };
      case (#excused) { #Excused };
      case (#tardy)   { #Tardy   };
    };
    {
      id        = r.id;
      studentId = r.studentId;
      date      = r.date;
      status    = aStatus;
      classId   = r.period;
      notes     = null;
      enteredBy = r.markedBy.toText();
      enteredAt = Time.now();
      isDemoData = r.isDemoData;
    };
  };

  /// Parse "YYYY-MM-DD" into an integer day count (days since 1970-01-01).
  /// Returns 0 on any parse failure.
  func dateToDays(d : Text) : Int {
    let chars = d.chars();
    var seg  = 0;
    var cur  = 0;
    var year = 0;
    var mon  = 0;
    var day  = 0;
    for (c in chars) {
      if (c == '-') {
        switch seg {
          case 0 { year := cur };
          case 1 { mon  := cur };
          case _ {};
        };
        seg += 1;
        cur := 0;
      } else {
        let digit = switch c {
          case '0' 0; case '1' 1; case '2' 2; case '3' 3; case '4' 4;
          case '5' 5; case '6' 6; case '7' 7; case '8' 8; case '9' 9;
          case _   0;
        };
        cur := cur * 10 + digit;
      };
    };
    day := cur;
    if (year == 0) return 0;
    let y = year - 1970;
    let leaps = y / 4;
    let mDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let mIdx  = if (mon >= 1 and mon <= 12) mon - 1 else 0;
    y * 365 + leaps + mDays[mIdx] + (day - 1);
  };

  /// Current day as integer (days since 1970-01-01).
  func todayDays() : Int { Time.now() / 86_400_000_000_000 };

  func isPresent(s : Types.AttendanceStatus) : Bool {
    s == #present or s == #excused;
  };

  func countPresent(lst : [Types.AttendanceRecord]) : Nat {
    var n = 0;
    for (r in lst.vals()) { if (isPresent(r.status)) n += 1 };
    n;
  };

  // ── recordAttendance ───────────────────────────────────────────────────

  /// Upsert: if a record for (studentId, courseId, date) exists, update it;
  /// otherwise create a new one.  Returns the persisted record.
  public func recordAttendance(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    state      : { var nextAttendanceId : Nat },
    record     : Types.AttendanceRecord,
  ) : { #ok : Types.AttendanceRecord; #err : Text } {
    var existingId : ?Types.AttendanceId = null;
    for ((id, r) in attendance.entries()) {
      if (r.studentId == record.studentId
          and r.courseId == record.courseId
          and r.date    == record.date) {
        existingId := ?id;
      };
    };
    let (finalId, isNew) = switch existingId {
      case (?eid) (eid, false);
      case null {
        let newId = state.nextAttendanceId;
        state.nextAttendanceId += 1;
        (newId, true);
      };
    };
    ignore isNew;
    let persisted = { record with id = finalId };
    attendance.add(finalId, persisted);
    #ok(persisted);
  };

  // ── batchRecordAttendance ──────────────────────────────────────────────

  /// Call recordAttendance for each entry.  Returns count on full success
  /// or an error listing failures.
  public func batchRecordAttendance(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    state      : { var nextAttendanceId : Nat },
    records    : [Types.AttendanceRecord],
  ) : { #ok : Nat; #err : Text } {
    var failed = List.empty<Text>();
    var count  = 0;
    for (r in records.vals()) {
      switch (recordAttendance(attendance, state, r)) {
        case (#ok _)  { count += 1 };
        case (#err e) { failed.add(e) };
      };
    };
    if (failed.size() > 0) {
      let msgs = failed.toArray();
      let joined = msgs.foldLeft("", func(acc, m) {
        if (acc == "") m else acc # "; " # m
      });
      #err("Failed entries: " # joined);
    } else {
      #ok(count);
    };
  };

  // ── listAttendanceByStudent ────────────────────────────────────────────

  /// Return records for a student optionally filtered by date range,
  /// ordered by date DESC.
  public func listAttendanceByStudent(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    studentId  : Types.StudentId,
    fromDate   : ?Text,
    toDate     : ?Text,
  ) : [Types.AttendanceRecord] {
    var results = List.empty<Types.AttendanceRecord>();
    for ((_, r) in attendance.entries()) {
      if (r.studentId == studentId) {
        let afterFrom = switch fromDate { case null true; case (?f) r.date >= f };
        let beforeTo  = switch toDate   { case null true; case (?t) r.date <= t };
        if (afterFrom and beforeTo) results.add(r);
      };
    };
    let arr = results.toArray().sort(func(a, b) {
      if      (a.date > b.date) #less
      else if (a.date < b.date) #greater
      else                      #equal;
    });
    arr;
  };

  // ── getAttendancePattern ───────────────────────────────────────────────

  /// Compute attendance pattern over the last 30 days for a student.
  /// attendanceRate = (present + excused) / totalDays * 100.
  /// trend = compare last-15-day rate to prior-15-day rate.
  /// chronicAbsenceFlag = rate over last 14 days < 80%.
  public func getAttendancePattern(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    studentId  : Types.StudentId,
  ) : ATypes.AttendancePattern {
    let today    = todayDays();
    let cut30    = today - 30;
    let cut14    = today - 14;
    let cut15    = today - 15;

    var all30    = List.empty<Types.AttendanceRecord>();
    var all14    = List.empty<Types.AttendanceRecord>();
    var prior15  = List.empty<Types.AttendanceRecord>(); // days 30..16 ago
    var recent15 = List.empty<Types.AttendanceRecord>(); // days 15..0 ago

    for ((_, r) in attendance.entries()) {
      if (r.studentId == studentId) {
        let d = dateToDays(r.date);
        if (d >= cut30 and d <= today) {
          all30.add(r);
          if (d >= cut14)  all14.add(r);
          if (d >= cut15)  recent15.add(r)
          else             prior15.add(r);
        };
      };
    };

    let total30 = all30.size();
    let arr30   = all30.toArray();

    let rate30 : Float =
      if (total30 == 0) 100.0
      else Float.fromInt(countPresent(arr30)) / Float.fromInt(total30) * 100.0;

    let sz15a = prior15.size();
    let sz15b = recent15.size();
    let r15a  = prior15.toArray();
    let r15b  = recent15.toArray();
    let rate15a : Float =
      if (sz15a == 0) 100.0
      else Float.fromInt(countPresent(r15a)) / Float.fromInt(sz15a) * 100.0;
    let rate15b : Float =
      if (sz15b == 0) 100.0
      else Float.fromInt(countPresent(r15b)) / Float.fromInt(sz15b) * 100.0;
    let diff = rate15b - rate15a;
    let trend : ATypes.AttendanceTrend =
      if      (diff >  5.0) #Improving
      else if (diff < -5.0) #Declining
      else                  #Flat;

    let sz14   = all14.size();
    let arr14  = all14.toArray();
    let rate14 : Float =
      if (sz14 == 0) 100.0
      else Float.fromInt(countPresent(arr14)) / Float.fromInt(sz14) * 100.0;

    // Last 5 entries DESC
    let arr30sorted = arr30.sort(func(a, b) {
      if      (a.date > b.date) #less
      else if (a.date < b.date) #greater
      else                      #equal;
    });
    let last5 = if (arr30sorted.size() <= 5) arr30sorted
                else Array.tabulate(5, func(i) { arr30sorted[i] });

    {
      studentId;
      attendanceRate     = rate30;
      thresholdFlag      = rate30 < 85.0;
      trend;
      chronicAbsenceFlag = rate14 < 80.0;
      lastFiveEntries    = last5.map<Types.AttendanceRecord, ATypes.AttendanceRecord>(toARecord);
    };
  };

  // ── getThresholdViolations ─────────────────────────────────────────────

  /// Return patterns for all students whose attendanceRate < 85%.
  public func getThresholdViolations(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    _ctx       : Types.RoleContext,
  ) : [ATypes.AttendancePattern] {
    // Collect unique student IDs
    var seen       = Map.empty<Types.StudentId, Bool>();
    var studentIds = List.empty<Types.StudentId>();
    for ((_, r) in attendance.entries()) {
      if (seen.get(r.studentId) == null) {
        seen.add(r.studentId, true);
        studentIds.add(r.studentId);
      };
    };
    var results = List.empty<ATypes.AttendancePattern>();
    for (sid in studentIds.toArray().vals()) {
      let p = getAttendancePattern(attendance, sid);
      if (p.thresholdFlag) results.add(p);
    };
    results.toArray();
  };

  // ── getSmartPreFill ────────────────────────────────────────────────────

  /// Return yesterday's records for each student in the course as pre-fill.
  /// If a student's last 3+ records share the same status, that record is
  /// returned (cutting entry time for recurring patterns).
  public func getSmartPreFill(
    attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
    courseId   : Types.CourseId,
    date       : Text,
  ) : [Types.AttendanceRecord] {
    let targetDays = dateToDays(date);

    // Collect records for this course prior to targetDate
    var courseRecords = List.empty<Types.AttendanceRecord>();
    for ((_, r) in attendance.entries()) {
      if (r.courseId == courseId and dateToDays(r.date) < targetDays) {
        courseRecords.add(r);
      };
    };
    // Sort by (studentId ASC, date DESC)
    let arr = courseRecords.toArray().sort(func(a, b) {
      if      (a.studentId < b.studentId) #less
      else if (a.studentId > b.studentId) #greater
      else if (a.date > b.date)           #less
      else if (a.date < b.date)           #greater
      else                                #equal;
    });

    var results = List.empty<Types.AttendanceRecord>();
    var seen    = Map.empty<Types.StudentId, Bool>();
    var i = 0;
    let n = arr.size();
    while (i < n) {
      let r = arr[i];
      if (seen.get(r.studentId) == null) {
        seen.add(r.studentId, true);
        // Collect this student's prior records (arr is sorted student-grouped, date DESC)
        var j = i;
        var prior = List.empty<Types.AttendanceRecord>();
        while (j < n and arr[j].studentId == r.studentId) {
          prior.add(arr[j]);
          j += 1;
        };
        let priorArr = prior.toArray();
        if (priorArr.size() > 0) {
          let checkCount = if (priorArr.size() >= 3) 3 else priorArr.size();
          let firstStatus = priorArr[0].status;
          var same = true;
          var k = 1;
          while (k < checkCount) {
            if (priorArr[k].status != firstStatus) same := false;
            k += 1;
          };
          if (same) results.add(priorArr[0]);
        };
      };
      i += 1;
    };
    results.toArray();
  };

};
