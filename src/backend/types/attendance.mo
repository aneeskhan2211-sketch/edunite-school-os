import Common "common";

module {

  public type StudentId    = Common.StudentId;
  public type AttendanceId = Common.AttendanceId;
  public type CourseId     = Common.CourseId;
  public type StaffId      = Common.StaffId;

  // ── Attendance status ─────────────────────────────────────────────────
  public type AttendanceStatus = { #Present; #Absent; #Tardy; #Excused };

  // ── Single attendance record ──────────────────────────────────────────
  public type AttendanceRecord = {
    id        : AttendanceId;
    studentId : StudentId;
    date      : Text;
    status    : AttendanceStatus;
    classId   : ?Text;
    notes     : ?Text;
    enteredBy : Text;
    enteredAt : Int;
    isDemoData : Bool;
  };

  // ── Computed pattern ──────────────────────────────────────────────────
  public type AttendanceTrend = { #Improving; #Flat; #Declining };

  public type AttendancePattern = {
    studentId         : StudentId;
    attendanceRate    : Float;
    thresholdFlag     : Bool;
    trend             : AttendanceTrend;
    chronicAbsenceFlag : Bool;
    lastFiveEntries   : [AttendanceRecord];
  };

  // ── Batch input ───────────────────────────────────────────────────────
  public type BatchAttendanceInput = {
    courseId  : Text;
    date      : Text;
    records   : [AttendanceRecord];
  };

};
