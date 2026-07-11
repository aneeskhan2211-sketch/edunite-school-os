import Map "mo:core/Map";
import Types "../types/common";
import ATypes "../types/attendance";
import Attendance "../lib/Attendance";

mixin (
  attendance : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  state      : { var nextAttendanceId : Nat },
) {

  /// Record one attendance event. Returns the persisted record.
  public func recordAttendance(
    record : Types.AttendanceRecord,
  ) : async { #ok : Types.AttendanceRecord; #err : Text } {
    Attendance.recordAttendance(attendance, state, record);
  };

  /// Batch-record attendance for a full class roster on a date.
  public func batchRecordAttendance(
    records : [Types.AttendanceRecord],
  ) : async { #ok : Nat; #err : Text } {
    Attendance.batchRecordAttendance(attendance, state, records);
  };

  /// Full attendance history for one student (optionally bounded by date range).
  public query func listAttendanceByStudent(
    studentId : Types.StudentId,
    fromDate  : ?Text,
    toDate    : ?Text,
  ) : async [Types.AttendanceRecord] {
    Attendance.listAttendanceByStudent(attendance, studentId, fromDate, toDate);
  };

  /// Computed pattern: rate, trend, chronic-absence flag, last-5.
  public query func getAttendancePattern(
    studentId : Types.StudentId,
  ) : async ATypes.AttendancePattern {
    Attendance.getAttendancePattern(attendance, studentId);
  };

  /// Students whose attendance rate is below the 85% threshold.
  public query func getThresholdViolations(
    ctx : Types.RoleContext,
  ) : async [ATypes.AttendancePattern] {
    Attendance.getThresholdViolations(attendance, ctx);
  };

  /// Smart pre-fill: yesterday's status for each student in the class.
  public query func getSmartPreFill(
    courseId : Types.CourseId,
    date     : Text,
  ) : async [Types.AttendanceRecord] {
    Attendance.getSmartPreFill(attendance, courseId, date);
  };

};

