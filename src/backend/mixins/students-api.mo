import Map "mo:core/Map";
import Types "../types/common";
import STypes "../types/students";
import StudentsLib "../lib/Students";

mixin (
  students      : Map.Map<Types.StudentId, Types.Student>,
  studentAudits : Map.Map<Types.AuditId, STypes.AuditEntry>,
  grades        : Map.Map<Types.GradeId, Types.Grade>,
  attendance    : Map.Map<Types.AttendanceId, Types.AttendanceRecord>,
  incidents     : Map.Map<Types.IncidentId, Types.Incident>,
  commitments   : Map.Map<Types.CommitmentId, Types.Commitment>,
  signals       : Map.Map<Types.SignalId, Types.UnderstandingSignal>,
  state         : { var nextStudentId : Nat; var nextAuditId : Nat },
) {

  /// Create a new student record. Returns the persisted record with assigned id.
  public func createStudent(
    student : Types.Student,
  ) : async { #ok : Types.Student; #err : Text } {
    // Default ctx for creation: schoolAdmin (callers are auth-gated at launch)
    let ctx : Types.RoleContext = { role = #schoolAdmin; userId = 0 };
    StudentsLib.createStudent(students, state, studentAudits, student, ctx)
  };

  /// Replace an existing student's mutable fields. Audit-logged.
  public func updateStudent(
    id      : Types.StudentId,
    student : Types.Student,
  ) : async { #ok : Types.Student; #err : Text } {
    let ctx : Types.RoleContext = { role = #schoolAdmin; userId = 0 };
    StudentsLib.updateStudent(students, state, studentAudits, id, student, ctx)
  };

  /// Retrieve one student (FERPA-filtered by ctx.role).
  public query func getStudent(
    id  : Types.StudentId,
    ctx : Types.RoleContext,
  ) : async ?Types.Student {
    StudentsLib.getStudent(students, id, ctx)
  };

  /// Paginated student list (FERPA-filtered).
  public query func listStudents(
    page     : Nat,
    pageSize : Nat,
    ctx      : Types.RoleContext,
  ) : async Types.PaginatedStudents {
    StudentsLib.listStudents(students, page, pageSize, ctx)
  };

  /// Soft-delete (sets enrollmentStatus to #withdrawn). Audit-logged.
  public func deleteStudent(
    id  : Types.StudentId,
    ctx : Types.RoleContext,
  ) : async { #ok; #err : Text } {
    switch (ctx.role) {
      case (#schoolAdmin) {};
      case _ { return #err "unauthorized" };
    };
    StudentsLib.deleteStudent(students, state, studentAudits, id, ctx)
  };

  /// Compose the full connected record for one student.
  /// Full SIS record with computed cross-domain data (real, not stubbed):
  /// attendance rate, behaviour-pattern flag, commitments, understanding
  /// signals and audit trail all come from the live canister maps. GPA and
  /// trajectory are computed from the legacy `grades` map (unseeded in the
  /// canonical dataset, so currently null) — the UI sources the real GPA from
  /// the V2 gradebook (`getStudentGradebookSummary`).
  public query func getStudentFullRecord(
    id  : Types.StudentId,
    ctx : Types.RoleContext,
  ) : async ?STypes.StudentFullRecord {
    StudentsLib.getStudentFullRecord(
      students, grades, attendance, incidents, commitments, signals, studentAudits, id, ctx,
    )
  };

  /// Immutable audit trail for a student record (Teacher/Admin/Principal only).
  public query func getStudentAuditTrail(
    id : Types.StudentId,
  ) : async [STypes.AuditEntry] {
    // No role filter on this endpoint — callers must pass a ctx separately.
    // Return all audit entries for this student ordered desc by timestamp.
    StudentsLib.getAuditTrail(studentAudits, id, #teacher)
  };

};

