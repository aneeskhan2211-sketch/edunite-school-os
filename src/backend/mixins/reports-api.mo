import Map   "mo:core/Map";
import Types "../types/common";
import ReportsLib "../lib/Reports";

mixin (
  students    : Map.Map<Types.StudentId, Types.Student>,
  staff       : Map.Map<Types.StaffId, Types.Staff>,
  courses     : Map.Map<Types.CourseId, Types.Course>,
  grades      : Map.Map<Types.GradeId, Types.Grade>,
  assignments : Map.Map<Types.AssignmentId, Types.Assignment>,
  attendance  : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  incidents   : Map.Map<Types.IncidentId, Types.Incident>,
) {

  /// Full report card for a student in a given term.
  public query func getReportCard(
    studentId : Types.StudentId,
    termId    : Text,
  ) : async ReportsLib.ReportCard {
    ReportsLib.getReportCard(
      studentId, termId,
      grades, assignments, attendance,
      incidents,
      courses,
    )
  };

  /// Full academic transcript for a student across all terms.
  public query func getTranscript(
    studentId : Types.StudentId,
  ) : async [ReportsLib.TranscriptTerm] {
    ReportsLib.getTranscript(studentId, grades, courses, assignments)
  };

  /// Students the given teacher has graded (for report-card selection).
  public query func listReportableStudents(
    teacherId : Types.StaffId,
  ) : async [ReportsLib.StudentSummary] {
    ReportsLib.listReportableStudents(teacherId, students, courses, grades)
  };

  /// Attendance CSV export for a course, optionally filtered by date range.
  /// dateRange: ?("YYYY-MM-DD", "YYYY-MM-DD") or null for all dates.
  public query func exportAttendanceCSV(
    courseId  : Types.CourseId,
    dateRange : ?(Text, Text),
  ) : async Text {
    ReportsLib.exportAttendanceCSV(courseId, dateRange, attendance)
  };

  /// Gradebook CSV export for a course and term.
  public query func exportGradebookCSV(
    courseId : Types.CourseId,
    term     : Text,
  ) : async Text {
    ignore term;
    ReportsLib.exportGradebookCSV(courseId, grades, assignments)
  };

  /// Full class report: roster grades, class average, top/struggling students.
  public query func exportClassReport(
    courseId : Types.CourseId,
    term     : Text,
  ) : async ReportsLib.ClassReport {
    ReportsLib.exportClassReport(
      courseId, term,
      courses, staff, students, grades, assignments,
    )
  };

};
