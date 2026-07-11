import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";

/// Seeds commitments for the canonical demo cast (students 1–9), owned by the
/// staff whose role surfaces them (counsellor=7, sped=8, teacher=1, principal=5,
/// schoolAdmin=3) so each role's commitments view shows real data. Mirrors the
/// other seeds: clears prior demo rows, regenerates relative to the canister
/// clock, idempotent across postupgrade.
module CommitmentSeed {

  public type SeedState = {
    commitments      : Map.Map<Types.CommitmentId, Types.Commitment>;
    nextCommitmentId : Nat;
  };

  public func seed(seedState : SeedState) : () {
    var nextId = seedState.nextCommitmentId;
    let com = seedState.commitments;

    var toRemove : [Types.CommitmentId] = [];
    for ((id, r) in com.entries()) {
      if (r.isDemoData) { toRemove := toRemove.concat([id]) };
    };
    for (id in toRemove.vals()) { com.remove(id) };

    let dayNs : Int = 86_400_000_000_000;
    let now : Int = Time.now();

    let rows : [Types.Commitment] = [
      { id = 0; commitmentType = #parentCall; ownerId = 7; studentId = 2;
        dueDate = now + 2 * dayNs; description = "Call home re: Maya's attendance pattern";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 5 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #counsellorFollowUp; ownerId = 7; studentId = 3;
        dueDate = now + 1 * dayNs; description = "Follow-up check-in with Tyler (attendance)";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 7 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #parentCall; ownerId = 7; studentId = 3;
        dueDate = now - 2 * dayNs; description = "Parent call for Tyler — overdue";
        status = #overdue; notes = ""; transitionLog = []; createdAt = now - 10 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #conferenceBooking; ownerId = 7; studentId = 8;
        dueDate = now + 5 * dayNs; description = "Book parent conference";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 3 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #iepRenewal; ownerId = 8; studentId = 5;
        dueDate = now + 12 * dayNs; description = "IEP renewal — due in 12 days";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 30 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #behaviourFollowUp; ownerId = 1; studentId = 2;
        dueDate = now + 7 * dayNs; description = "Behaviour follow-up — Maya pattern review";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 2 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #permissionSlip; ownerId = 1; studentId = 3;
        dueDate = now + 3 * dayNs; description = "Field trip permission slip — unsigned";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 2 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #custom; ownerId = 5; studentId = 8;
        dueDate = now + 4 * dayNs; description = "Review group-work participation plan";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 1 * dayNs;
        completedAt = null; isDemoData = true },
      { id = 0; commitmentType = #parentCall; ownerId = 3; studentId = 5;
        dueDate = now + 6 * dayNs; description = "Enrolment paperwork follow-up";
        status = #open; notes = ""; transitionLog = []; createdAt = now - 1 * dayNs;
        completedAt = null; isDemoData = true },
    ];

    for (r in rows.vals()) {
      let rec = { r with id = nextId };
      com.add(nextId, rec);
      nextId += 1;
    };
  };
};
