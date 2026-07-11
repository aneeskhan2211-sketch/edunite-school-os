import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Types "../types/common";
import StaffLib "../lib/Staff";

mixin (
  staff : Map.Map<Types.StaffId, Types.Staff>,
  state : { var nextStaffId : Nat },
) {

  public query func getStaffMembers() : async [Types.Staff] {
    staff.values().toArray()
  };

  public query func getStaffMember(
    id : Types.StaffId,
  ) : async ?Types.Staff {
    staff.get(id)
  };

};
