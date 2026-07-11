import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Types "../types/common";
import DevAuthLib "../lib/DevAuth";

mixin (
  staff       : Map.Map<Types.StaffId, Types.Staff>,
  devState    : { var currentRole : Types.Role },
) {

  public query func getCurrentRole() : async Types.Role {
    devState.currentRole
  };

  public func switchDevRole(
    role : Types.Role,
  ) : async { #ok; #err : Text } {
    devState.currentRole := role;
    #ok
  };

  public query func getDevUser(
    role : Types.Role,
  ) : async ?Types.Staff {
    let pairs = staff.entries().toArray();
    DevAuthLib.getUser(pairs, role)
  };

};
