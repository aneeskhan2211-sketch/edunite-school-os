import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/common";
import CTypes "../types/commitments";

module {

  // ── Constants ────────────────────────────────────────────────────────────
  let NANOS_PER_DAY : Int = 86_400_000_000_000;

  // ── Internal helpers ─────────────────────────────────────────────────────

  func todayStart() : Int {
    let now = Time.now();
    now - (now % NANOS_PER_DAY);
  };

  func computeStatus(dueDate : Int, currentStatus : Types.CommitmentStatus) : Types.CommitmentStatus {
    let now = Time.now();
    if (dueDate < now) {
      // Only mark as overdue if still open or in-progress
      switch (currentStatus) {
        case (#open)       { #overdue };
        case (#inProgress) { #overdue };
        case _             { currentStatus };
      };
    } else {
      currentStatus;
    };
  };

  func sortByDueDate(arr : [Types.Commitment]) : [Types.Commitment] {
    arr.sort<Types.Commitment>(func(a, b) {
      if      (a.dueDate < b.dueDate) #less
      else if (a.dueDate > b.dueDate) #greater
      else                            #equal;
    });
  };

  // ── Create ─────────────────────────────────────────────────────────────────

  public func createCommitment(
    store  : Map.Map<Types.CommitmentId, Types.Commitment>,
    state  : { var nextCommitmentId : Nat },
    input  : Types.Commitment,
  ) : { #ok : Types.Commitment; #err : Text } {
    let id = state.nextCommitmentId;
    state.nextCommitmentId += 1;

    let c : Types.Commitment = {
      input with
      id;
      status        = computeStatus(input.dueDate, input.status);
      notes         = input.notes;
      transitionLog = input.transitionLog;
      completedAt   = null;
      createdAt     = Time.now();
    };

    store.add(id, c);
    #ok c;
  };

  // ── Update status ───────────────────────────────────────────────────────────

  public func updateCommitmentStatus(
    store   : Map.Map<Types.CommitmentId, Types.Commitment>,
    id      : Types.CommitmentId,
    status  : Types.CommitmentStatus,
  ) : { #ok : Types.Commitment; #err : Text } {
    switch (store.get(id)) {
      case null { #err "Commitment not found" };
      case (?existing) {
        let updated : Types.Commitment = {
          existing with
          status = computeStatus(existing.dueDate, status);
          completedAt = if (status == #completed) { ?Time.now() } else { existing.completedAt };
        };
        store.add(id, updated);
        #ok updated;
      };
    };
  };

  // ── List by owner ───────────────────────────────────────────────────────────

  public func listCommitmentsByOwner(
    store        : Map.Map<Types.CommitmentId, Types.Commitment>,
    ownerId      : Types.StaffId,
    statusFilter : ?Types.CommitmentStatus,
  ) : [Types.Commitment] {
    let buf = List.empty<Types.Commitment>();
    for ((_, c) in store.entries()) {
      if (c.ownerId == ownerId) {
        let passes = switch (statusFilter) {
          case null  true;
          case (?s) (c.status == s);
        };
        if (passes) { buf.add(c) };
      };
    };
    sortByDueDate(buf.toArray());
  };

  // ── List by student ──────────────────────────────────────────────────────────

  public func listCommitmentsByStudent(
    store     : Map.Map<Types.CommitmentId, Types.Commitment>,
    studentId : Types.StudentId,
  ) : [Types.Commitment] {
    let buf = List.empty<Types.Commitment>();
    for ((_, c) in store.entries()) {
      if (c.studentId == studentId) { buf.add(c) };
    };
    sortByDueDate(buf.toArray());
  };

  // ── Mark complete ───────────────────────────────────────────────────────────

  public func markCommitmentComplete(
    store       : Map.Map<Types.CommitmentId, Types.Commitment>,
    id          : Types.CommitmentId,
  ) : { #ok : Types.Commitment; #err : Text } {
    updateCommitmentStatus(store, id, #completed);
  };

  // ── Surfacing ──────────────────────────────────────────────────────────────

  public func getCommitmentSurfacing(
    store   : Map.Map<Types.CommitmentId, Types.Commitment>,
    ownerId : Types.StaffId,
  ) : CTypes.CommitmentSurfacing {
    let now      = Time.now();
    let today    = todayStart();
    let todayEnd = today + NANOS_PER_DAY;
    let weekEnd  = now + (7  * NANOS_PER_DAY);
    let monthEnd = now + (30 * NANOS_PER_DAY);

    let overdue    = List.empty<Types.Commitment>();
    let dueToday   = List.empty<Types.Commitment>();
    let thisWeek   = List.empty<Types.Commitment>();
    let comingSoon = List.empty<Types.Commitment>();

    for ((_, c) in store.entries()) {
      // Exclude completed and cancelled from surfacing
      if (c.ownerId == ownerId and c.status != #completed and c.status != #cancelled) {
        let effectiveStatus = computeStatus(c.dueDate, c.status);
        let cWithStatus = { c with status = effectiveStatus };
        if (cWithStatus.dueDate < now) {
          overdue.add(cWithStatus);
        } else if (cWithStatus.dueDate < todayEnd) {
          dueToday.add(cWithStatus);
        } else if (cWithStatus.dueDate <= weekEnd) {
          thisWeek.add(cWithStatus);
        } else if (cWithStatus.dueDate <= monthEnd) {
          comingSoon.add(cWithStatus);
        };
      };
    };

    {
      overdue    = sortByDueDate(overdue.toArray());
      dueToday   = sortByDueDate(dueToday.toArray());
      thisWeek   = sortByDueDate(thisWeek.toArray());
      comingSoon = sortByDueDate(comingSoon.toArray());
    };
  };

  // ── Get by ID ─────────────────────────────────────────────────────────────

  public func getCommitmentById(
    store : Map.Map<Types.CommitmentId, Types.Commitment>,
    id    : Types.CommitmentId,
  ) : ?Types.Commitment {
    store.get(id);
  };

  // ── Role-based status transition ───────────────────────────────────────────

  public func transitionCommitmentStatus(
    store   : Map.Map<Types.CommitmentId, Types.Commitment>,
    id      : Types.CommitmentId,
    newStatus : Types.CommitmentStatus,
    actorId : Types.StaffId,
    actorRole : Types.Role,
    note    : Text,
  ) : { #ok : Types.Commitment; #err : Text } {
    switch (store.get(id)) {
      case null { #err "Commitment not found" };
      case (?existing) {
        // Validate transition permissions
        let canTransition = switch (newStatus) {
          case (#inProgress) {
            // Assignee (owner) can mark In Progress
            existing.ownerId == actorId;
          };
          case (#cancelled) {
            // Principal can Cancel
            switch (actorRole) {
              case (#principal) { true };
              case _            { false };
            };
          };
          case (#completed) {
            // Reporter/owner can Close (complete)
            existing.ownerId == actorId;
          };
          case (#open) {
            // Owner can reopen
            existing.ownerId == actorId;
          };
          case (#overdue) {
            // Overdue is computed, not manually set
            false;
          };
        };

        if (not canTransition) {
          return #err "Not authorized for this status transition";
        };

        // Validate state machine: open -> inProgress -> completed
        let validTransition = switch (existing.status, newStatus) {
          case (#open,       #inProgress) { true };
          case (#open,       #completed)  { true };
          case (#open,       #cancelled)  { true };
          case (#inProgress, #completed)  { true };
          case (#inProgress, #cancelled)  { true };
          case (#inProgress, #open)        { true }; // rollback
          case (#completed,  #open)        { true }; // reopen
          case (#overdue,    #inProgress)  { true };
          case (#overdue,    #completed)   { true };
          case (#overdue,    #cancelled)   { true };
          case (#cancelled,  #open)        { true }; // reopen
          case _                           { false };
        };

        if (not validTransition) {
          return #err "Invalid status transition";
        };

        let event : Types.CommitmentTransitionEvent = {
          fromStatus = existing.status;
          toStatus   = newStatus;
          actorId;
          note;
          timestamp  = Time.now();
        };

        let updated : Types.Commitment = {
          existing with
          status        = computeStatus(existing.dueDate, newStatus);
          notes         = if (note == "") { existing.notes } else { existing.notes # "\n" # note };
          transitionLog = existing.transitionLog.concat([event]);
          completedAt   = if (newStatus == #completed) { ?Time.now() } else { existing.completedAt };
        };

        store.add(id, updated);
        #ok updated;
      };
    };
  };

  // ── Follow-up commitment ───────────────────────────────────────────────────

  public func createFollowUpCommitment(
    store          : Map.Map<Types.CommitmentId, Types.Commitment>,
    state          : { var nextCommitmentId : Nat },
    commitmentType : Types.CommitmentType,
    ownerId        : Types.StaffId,
    studentId      : Types.StudentId,
    dueDate        : Types.Timestamp,
    description    : Text,
  ) : { #ok : Types.Commitment; #err : Text } {
    let input : Types.Commitment = {
      id             = 0;
      commitmentType;
      ownerId;
      studentId;
      dueDate;
      description;
      status         = #open;
      notes          = "";
      transitionLog  = [];
      createdAt      = Time.now();
      completedAt    = null;
      isDemoData     = false;
    };
    createCommitment(store, state, input);
  };

  // ── IEP Renewal automation ─────────────────────────────────────────────────

  public type StudentForIEP = {
    id             : Types.StudentId;
    isIEP          : Bool;
    iepRenewalDate : ?Types.Timestamp;
    assignedSpedId : ?Types.StaffId;
  };

  public func checkAndCreateIEPRenewalCommitments(
    store    : Map.Map<Types.CommitmentId, Types.Commitment>,
    state    : { var nextCommitmentId : Nat },
    students : [StudentForIEP],
  ) : [Types.Commitment] {
    let now       = Time.now();
    let sixtyDays = 60 * NANOS_PER_DAY;
    let created   = List.empty<Types.Commitment>();

    for (student in students.vals()) {
      if (student.isIEP) {
        switch (student.iepRenewalDate) {
          case null {};
          case (?renewalDate) {
            let daysUntil = renewalDate - now;
            if (daysUntil >= 0 and daysUntil <= sixtyDays) {
              var alreadyExists = false;
              for ((_, c) in store.entries()) {
                if (c.commitmentType == #iepRenewal and c.status != #completed) {
                  if (c.studentId == student.id) { alreadyExists := true };
                };
              };
              if (not alreadyExists) {
                let ownerId = switch (student.assignedSpedId) {
                  case (?sid) sid;
                  case null   0;
                };
                let input : Types.Commitment = {
                  id             = 0;
                  commitmentType = #iepRenewal;
                  ownerId;
                  studentId      = student.id;
                  dueDate        = renewalDate;
                  description    = "Automatic IEP renewal reminder (60-day window)";
                  status         = #open;
                  notes          = "";
                  transitionLog  = [];
                  completedAt    = null;
                  createdAt      = now;
                  isDemoData     = false;
                };
                switch (createCommitment(store, state, input)) {
                  case (#ok c)  { created.add(c) };
                  case (#err _) {};
                };
              };
            };
          };
        };
      };
    };

    created.toArray();
  };

};
