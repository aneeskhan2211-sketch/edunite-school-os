import Types "../types/common";
import Array "mo:core/Array";

module {

  // Returns the seeded mock staff member for the given role.
  public func getUser(
    staff : [(Types.StaffId, Types.Staff)],
    role  : Types.Role,
  ) : ?Types.Staff {
    let found = staff.find(func((_, s)) { s.role == role });
    switch (found) {
      case null { null };
      case (?(_, s)) { ?s };
    }
  };

  // Returns all roles as a list (used by the dev role switcher UI).
  public func allRoles() : [Types.Role] {
    [
      #teacher,
      #coTeacher,
      #student,
      #parent,
      #schoolAdmin,
      #departmentHead,
      #principal,
      #districtAdmin,
      #counsellor,
      #spedCoordinator,
      #curriculumCoordinator,
      #substitute,
    ]
  };

};
