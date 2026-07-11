import Map "mo:core/Map";
import Common "../types/common";
import SpedTypes "../types/sped";
import SpedLib "../lib/Sped";

mixin (
  students        : Map.Map<Common.StudentId, Common.Student>,
  iepRecords      : Map.Map<Common.StudentId, SpedTypes.IEPRecord>,
  iepNotes        : Map.Map<SpedTypes.IEPNoteId, SpedTypes.IEPNote>,
  complianceItems : Map.Map<SpedTypes.ComplianceItemId, SpedTypes.ComplianceItem>,
  grades          : Map.Map<Common.GradeId, Common.Grade>,
  attendance      : Map.Map<Common.AttendanceId, Common.AttendanceRecord>,
  commitments     : Map.Map<Common.CommitmentId, Common.Commitment>,
  state : {
    var nextIEPNoteId        : Nat;
    var nextComplianceItemId : Nat;
  },
) {

  // ── IEP Caseload ──────────────────────────────────────────────────────

  public query func getIEPCaseload(
    spedCoordId : Common.StaffId,
  ) : async [SpedTypes.IEPStudent] {
    let unsorted = SpedLib.getIEPCaseload(spedCoordId, students, iepRecords);
    SpedLib.sortCaseload(unsorted)
  };

  // ── IEP Management ────────────────────────────────────────────────────

  public query func getIEP(
    studentId : Common.StudentId,
  ) : async ?SpedTypes.IEPDetail {
    SpedLib.getIEP(studentId, iepRecords, iepNotes)
  };

  public shared ({ caller = _ }) func updateIEPRenewalDate(
    studentId : Common.StudentId,
    newDate   : Common.Timestamp,
    updatedBy : Common.StaffId,
  ) : async SpedTypes.UpdateResult {
    SpedLib.updateIEPRenewalDate(studentId, newDate, updatedBy, iepRecords)
  };

  public shared ({ caller = _ }) func addIEPNote(
    studentId : Common.StudentId,
    body      : Text,
    noteType  : SpedTypes.IEPNoteType,
    authorId  : Common.StaffId,
  ) : async SpedTypes.UpdateResult {
    SpedLib.addIEPNote(studentId, authorId, body, noteType, iepNotes, state)
  };

  public shared ({ caller = _ }) func markIEPRenewed(
    studentId   : Common.StudentId,
    renewedDate : Common.Timestamp,
    reviewedBy  : Common.StaffId,
  ) : async SpedTypes.UpdateResult {
    SpedLib.markIEPRenewed(studentId, renewedDate, reviewedBy, iepRecords)
  };

  // ── Compliance Tracker ────────────────────────────────────────────────

  public query func getComplianceItems(
    spedCoordId : Common.StaffId,
  ) : async [SpedTypes.ComplianceItem] {
    SpedLib.getComplianceItems(spedCoordId, complianceItems)
  };

  public shared ({ caller = _ }) func updateComplianceItem(
    itemId  : SpedTypes.ComplianceItemId,
    status  : SpedTypes.ComplianceStatus,
    notes   : ?Text,
  ) : async SpedTypes.UpdateResult {
    SpedLib.updateComplianceItem(itemId, status, notes, complianceItems)
  };

  // ── Caseload Insight ──────────────────────────────────────────────────

  public query func getCaseloadInsight(
    spedCoordId : Common.StaffId,
  ) : async SpedTypes.CaseloadSummary {
    SpedLib.getCaseloadInsight(
      spedCoordId,
      students,
      iepRecords,
      grades,
      attendance,
      commitments,
    )
  };

};
