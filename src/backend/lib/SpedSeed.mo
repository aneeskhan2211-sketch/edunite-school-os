import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";
import SpedTypes "../types/sped";

/// Seeds SPED data for coordinator 8: IEP records for the SPED-flagged students
/// (2, 3, 5) and a set of compliance items. Clears prior demo rows; idempotent
/// across postupgrade.
module SpedSeed {

  public type SeedState = {
    iepRecords          : Map.Map<Types.StudentId, SpedTypes.IEPRecord>;
    complianceItems     : Map.Map<SpedTypes.ComplianceItemId, SpedTypes.ComplianceItem>;
    nextComplianceItemId : Nat;
  };

  public func seed(s : SeedState) : () {
    let ieps = s.iepRecords;
    let items = s.complianceItems;
    var cId = s.nextComplianceItemId;

    var iRem : [Types.StudentId] = [];
    for ((id, r) in ieps.entries()) { if (r.isDemoData) { iRem := iRem.concat([id]) } };
    for (id in iRem.vals()) { ieps.remove(id) };
    var cRem : [SpedTypes.ComplianceItemId] = [];
    for ((id, r) in items.entries()) { if (r.isDemoData) { cRem := cRem.concat([id]) } };
    for (id in cRem.vals()) { items.remove(id) };

    let dayNs : Int = 86_400_000_000_000;
    let now : Int = Time.now();

    func mkIEP(studentId : Nat, days : Int, goalDesc : Text, accom : Text, svc : Text) : SpedTypes.IEPRecord {
      {
        studentId;
        renewalDate = now + days * dayNs;
        goals = [{
          id = 1;
          description = goalDesc;
          domain = "Academic";
          targetDate = ?(now + days * dayNs);
          progress = "On track";
        }];
        accommodations = [{ category = "Instruction"; description = accom }];
        services = [{
          serviceType = svc;
          minutesPerWeek = 120;
          provider = "Resource Room";
          startDate = now - 60 * dayNs;
          endDate = null;
        }];
        reviewHistory = [];
        lastUpdatedAt = now - 10 * dayNs;
        lastUpdatedBy = 8;
        isDemoData = true;
      };
    };

    ieps.add(2, mkIEP(2, 12, "Improve reading comprehension to grade level", "Extended time on assessments", "Reading intervention"));
    ieps.add(3, mkIEP(3, 30, "Build English language proficiency (ELL)", "Bilingual glossary + sentence frames", "ELL support"));
    ieps.add(5, mkIEP(5, -3, "Strengthen executive-function & organisation", "Chunked assignments + check-ins", "Counselling minutes"));

    let cRows : [SpedTypes.ComplianceItem] = [
      { id = 0; studentId = 2; ownerId = 8; itemType = #annualReview; dueDate = now - 3 * dayNs; status = #overdue; notes = null; completedAt = null; isDemoData = true },
      { id = 0; studentId = 3; ownerId = 8; itemType = #iepMeeting; dueDate = now + 3 * dayNs; status = #pending; notes = null; completedAt = null; isDemoData = true },
      { id = 0; studentId = 5; ownerId = 8; itemType = #progressReport; dueDate = now + 5 * dayNs; status = #pending; notes = null; completedAt = null; isDemoData = true },
      { id = 0; studentId = 2; ownerId = 8; itemType = #triennial; dueDate = now - 14 * dayNs; status = #complete; notes = ?"Completed and filed"; completedAt = ?(now - 12 * dayNs); isDemoData = true },
    ];
    for (r in cRows.vals()) {
      items.add(cId, { r with id = cId });
      cId += 1;
    };
  };
};
