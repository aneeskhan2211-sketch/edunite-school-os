import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";

/// Seeds behaviour incidents for the canonical demo cast (students 1–9) so the
/// behaviour module reads real canister data. Mirrors AttendanceSeed: clears
/// prior demo incidents, then regenerates a deterministic set dated relative to
/// the canister clock. Idempotent across postupgrade.
module BehaviourSeed {

  public type SeedState = {
    incidents      : Map.Map<Types.IncidentId, Types.Incident>;
    nextIncidentId : Nat;
  };

  public func seed(seedState : SeedState) : () {
    var nextId = seedState.nextIncidentId;
    let inc = seedState.incidents;

    // Clear prior demo incidents (idempotent re-seed).
    var toRemove : [Types.IncidentId] = [];
    for ((id, r) in inc.entries()) {
      if (r.isDemoData) { toRemove := toRemove.concat([id]) };
    };
    for (id in toRemove.vals()) { inc.remove(id) };

    let dayNs : Int = 86_400_000_000_000;
    let now : Int = Time.now();

    // id is overwritten with the live counter below.
    let rows : [Types.Incident] = [
      { id = 0; studentId = 2; reportedBy = 1; severity = #medium;
        description = "Verbal altercation in hallway near locker area.";
        routedTo = ?7; status = #routed; createdAt = now - 11 * dayNs;
        timeline = []; commitmentId = null; isDemoData = true },
      { id = 0; studentId = 3; reportedBy = 4; severity = #low;
        description = "Late to class without hall pass, second occurrence this week.";
        routedTo = null; status = #closed; createdAt = now - 9 * dayNs;
        timeline = []; commitmentId = null; isDemoData = true },
      { id = 0; studentId = 2; reportedBy = 1; severity = #low;
        description = "Phone use in class after two warnings.";
        routedTo = ?7; status = #followUp; createdAt = now - 20 * dayNs;
        timeline = []; commitmentId = null; isDemoData = true },
      { id = 0; studentId = 5; reportedBy = 2; severity = #high;
        description = "Disruptive behaviour during lab session.";
        routedTo = ?7; status = #reviewing; createdAt = now - 5 * dayNs;
        timeline = []; commitmentId = null; isDemoData = true },
      { id = 0; studentId = 8; reportedBy = 3; severity = #medium;
        description = "Refusal to participate in group work.";
        routedTo = null; status = #logged; createdAt = now - 3 * dayNs;
        timeline = []; commitmentId = null; isDemoData = true },
      { id = 0; studentId = 3; reportedBy = 1; severity = #low;
        description = "Tardy to class, third offence.";
        routedTo = ?1; status = #closed; createdAt = now - 30 * dayNs;
        timeline = []; commitmentId = null; isDemoData = true },
    ];

    for (r in rows.vals()) {
      let rec = { r with id = nextId };
      inc.add(nextId, rec);
      nextId += 1;
    };
  };
};
