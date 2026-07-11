import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";
import BTypes "../types/behaviour";
import BehaviourLib "../lib/Behaviour";

mixin (
  incidents   : Map.Map<Types.IncidentId, Types.Incident>,
  commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
  staff       : Map.Map<Types.StaffId, Types.Staff>,
  state       : { var nextIncidentId : Nat; var nextCommitmentId : Nat },
) {

  /// Log a new incident (auto-routes on creation).
  public func logIncident(
    incident : Types.Incident,
    ctx      : Types.RoleContext,
  ) : async { #ok : Types.Incident; #err : Text } {
    // Validate required fields
    if (incident.description == "") {
      return #err("description is required");
    };
    // Assign a unique id
    let id = state.nextIncidentId;
    state.nextIncidentId += 1;
    let withId : Types.Incident = { incident with id };
    // Auto-route via lib
    let staffPairs = staff.entries().toArray();
    let routed = BehaviourLib.logIncident(withId, staffPairs);
    // Persist
    incidents.add(id, routed);
    #ok(routed)
  };

  /// Advance the incident lifecycle (status + note appended to timeline).
  public func updateIncidentStatus(
    id     : Types.IncidentId,
    status : Types.IncidentStatus,
    note   : Text,
    ctx    : Types.RoleContext,
  ) : async { #ok : Types.Incident; #err : Text } {
    let now = Time.now();
    let incPairs = incidents.entries().toArray();
    switch (BehaviourLib.updateStatus(incPairs, id, status, ctx.userId, note, now)) {
      case (null) { #err("Incident not found: " # id.toText()) };
      case (?updated) {
        incidents.add(id, updated);
        // If resolved, create a 30-day follow-up commitment
        if (status == #closed) {
          let dueDate = now + (30 * 24 * 60 * 60 * 1_000_000_000);
          let owner : Types.StaffId = switch (updated.routedTo) {
            case (?rid) { rid };
            case (null)  { ctx.userId };
          };
          let cid = state.nextCommitmentId;
          state.nextCommitmentId += 1;
          let c = BehaviourLib.createFollowUpCommitment(updated, owner, dueDate, now);
          let withCid : Types.Commitment = { c with id = cid };
          commitments.add(cid, withCid);
          let withCommit : Types.Incident = { updated with commitmentId = ?cid };
          incidents.add(id, withCommit);
          #ok(withCommit)
        } else {
          #ok(updated)
        }
      };
    }
  };

  /// Assign an incident to a staff member for review.
  public func routeIncident(
    id       : Types.IncidentId,
    routedTo : Text,
    ctx      : Types.RoleContext,
  ) : async { #ok : Types.Incident; #err : Text } {
    switch (incidents.get(id)) {
      case (null) { #err("Incident not found: " # id.toText()) };
      case (?inc) {
        // Only staff with authority can route (principal, admin, counsellor)
        let authorized = switch (ctx.role) {
          case (#principal)       { true };
          case (#schoolAdmin)     { true };
          case (#counsellor)      { true };
          case (#departmentHead)  { true };
          case _                  { false };
        };
        if (not authorized) {
          return #err("Not authorized to route incidents");
        };
        // Find the staff member by name or parse as StaffId
        let staffPairs = staff.entries().toArray();
        let found = staffPairs.find(func((_, s)) { s.name == routedTo });
        let routedToId : ?Types.StaffId = switch (found) {
          case (?(sid, _)) { ?sid };
          case (null)       { null };
        };
        let now = Time.now();
        let routeEvent : Types.IncidentEvent = {
          status     = #routed;
          staffId    = ctx.userId;
          note       = "Re-routed to " # routedTo;
          occurredAt = now;
        };
        let updated : Types.Incident = {
          inc with
          routedTo = routedToId;
          status   = #routed;
          timeline = inc.timeline.concat([routeEvent]);
        };
        incidents.add(id, updated);
        #ok(updated)
      };
    }
  };

  /// All incidents for a student (FERPA-filtered to role-permitted fields).
  public query func listIncidentsByStudent(
    studentId : Types.StudentId,
    ctx       : Types.RoleContext,
  ) : async [Types.Incident] {
    let incPairs = incidents.entries().toArray();
    let filtered = BehaviourLib.listIncidents(incPairs, ?studentId, ctx);
    // Sort by createdAt DESC
    let sorted = filtered.sort(func(a, b) {
      if (a.createdAt > b.createdAt)      { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else                                { #equal }
    });
    sorted
  };

  /// Incidents routed to the caller's role/queue.
  public query func listIncidentsForRole(
    ctx : Types.RoleContext,
  ) : async [Types.Incident] {
    let incPairs = incidents.entries().toArray();
    let all = BehaviourLib.listIncidents(incPairs, null, ctx);
    // For queues, only Open and UnderReview (logged/routed/reviewing)
    let active = all.filter(func(i) {
      switch (i.status) {
        case (#logged)    { true };
        case (#routed)    { true };
        case (#reviewing) { true };
        case _            { false };
      }
    });
    // Sort by createdAt DESC
    active.sort(func(a, b) {
      if (a.createdAt > b.createdAt)      { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else                                { #equal }
    })
  };

  /// Get a single incident by ID.
  public query func getIncident(
    id : Types.IncidentId,
  ) : async ?Types.Incident {
    incidents.get(id)
  };

  /// Computed 90-day pattern with severity breakdown and trend.
  public query func getIncidentPattern(
    studentId : Types.StudentId,
  ) : async BTypes.IncidentPattern {
    let incPairs = incidents.entries().toArray();
    let now = Time.now();
    BehaviourLib.getIncidentPattern(incPairs, studentId, now)
  };

  /// Attach a follow-up commitment to an existing incident.
  public func addFollowUpToIncident(
    incidentId : Types.IncidentId,
    dueDate    : Int,
    note       : Text,
    ctx        : Types.RoleContext,
  ) : async { #ok : Types.Commitment; #err : Text } {
    switch (incidents.get(incidentId)) {
      case (null) { #err("Incident not found: " # incidentId.toText()) };
      case (?inc) {
        let now = Time.now();
        let cid = state.nextCommitmentId;
        state.nextCommitmentId += 1;
        let c : Types.Commitment = {
          id             = cid;
          commitmentType = #behaviourFollowUp;
          ownerId        = ctx.userId;
          studentId      = inc.studentId;
          dueDate;
          description    = if (note == "") { "Behaviour follow-up for incident #" # incidentId.toText() } else { note };
          status         = #open;
          createdAt      = now;
          completedAt    = null;
          isDemoData     = false;
          notes            = note;
          transitionLog    = [];
        };
        commitments.add(cid, c);
        // Link the commitment to the incident
        let updatedInc : Types.Incident = { inc with commitmentId = ?cid };
        incidents.add(incidentId, updatedInc);
        #ok(c)
      };
    }
  };

};

