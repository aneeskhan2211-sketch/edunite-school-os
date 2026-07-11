import Map "mo:core/Map";
import Types "../types/common";
import CTypes "../types/commitments";
import Lib "../lib/Commitments";

mixin (
  commitments : Map.Map<Types.CommitmentId, Types.Commitment>,
  state       : { var nextCommitmentId : Nat },
) {

  /// Create any typed commitment. Returns persisted record with assigned id.
  public func createCommitment(
    commitment : Types.Commitment,
  ) : async { #ok : Types.Commitment; #err : Text } {
    Lib.createCommitment(commitments, state, commitment);
  };

  /// Update status (#open, #completed, #overdue).
  public func updateCommitmentStatus(
    id     : Types.CommitmentId,
    status : Types.CommitmentStatus,
  ) : async { #ok : Types.Commitment; #err : Text } {
    Lib.updateCommitmentStatus(commitments, id, status);
  };

  /// All commitments owned by a staff member (optionally filtered by status).
  public query func listCommitmentsByOwner(
    ownerId : Types.StaffId,
    status  : ?Types.CommitmentStatus,
  ) : async [Types.Commitment] {
    Lib.listCommitmentsByOwner(commitments, ownerId, status);
  };

  /// All commitments attached to a student.
  public query func listCommitmentsByStudent(
    studentId : Types.StudentId,
  ) : async [Types.Commitment] {
    Lib.listCommitmentsByStudent(commitments, studentId);
  };

  /// Mark a commitment complete (sets completedAt).
  public func markCommitmentComplete(
    id : Types.CommitmentId,
  ) : async { #ok : Types.Commitment; #err : Text } {
    Lib.markCommitmentComplete(commitments, id);
  };

  /// Bucketed surfacing: overdue / due-today / this-week / coming-soon.
  public query func getCommitmentSurfacing(
    ownerId : Types.StaffId,
  ) : async CTypes.CommitmentSurfacing {
    Lib.getCommitmentSurfacing(commitments, ownerId);
  };

  /// Get a single commitment by ID.
  public query func getCommitmentById(
    id : Types.CommitmentId,
  ) : async ?Types.Commitment {
    Lib.getCommitmentById(commitments, id);
  };

  /// Role-based status transition with note.
  public func transitionCommitmentStatus(
    id        : Types.CommitmentId,
    newStatus : Types.CommitmentStatus,
    note      : Text,
    ctx       : Types.RoleContext,
  ) : async { #ok : Types.Commitment; #err : Text } {
    Lib.transitionCommitmentStatus(commitments, id, newStatus, ctx.userId, ctx.role, note);
  };

  /// Convenience: create a typed follow-up commitment from context.
  public func createFollowUpCommitment(
    commitmentType : Types.CommitmentType,
    ownerId        : Types.StaffId,
    studentId      : Types.StudentId,
    dueDate        : Types.Timestamp,
    description    : Text,
  ) : async { #ok : Types.Commitment; #err : Text } {
    Lib.createFollowUpCommitment(
      commitments, state, commitmentType, ownerId,
      studentId, dueDate, description,
    );
  };

};

