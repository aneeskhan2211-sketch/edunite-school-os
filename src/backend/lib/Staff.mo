import Types "../types/common";
import Array "mo:core/Array";

module {

  // Returns all staff members.
  public func listStaff(
    staff : [(Types.StaffId, Types.Staff)],
  ) : [Types.Staff] {
    staff.map(func((_, s)) { s })
  };

  // Returns a single staff member.
  public func getStaffMember(
    staff : [(Types.StaffId, Types.Staff)],
    id    : Types.StaffId,
  ) : ?Types.Staff {
    let found = staff.find(func((sid, _)) { sid == id });
    switch (found) {
      case (null) { null };
      case (?(_, s)) { ?s };
    };
  };

  // Adds a staff member.
  public func addStaff(
    member : Types.Staff,
  ) : Types.Staff {
    member
  };

  // Assigns a class to a staff member.
  public func assignClass(
    staff    : [(Types.StaffId, Types.Staff)],
    staffId  : Types.StaffId,
    courseId : Types.CourseId,
  ) : ?Types.Staff {
    let found = staff.find(func((sid, _)) { sid == staffId });
    switch (found) {
      case (null) { null };
      case (?(_, s)) {
        if (s.assignedClasses.find(func(c) { c == courseId }) != null) {
          ?s
        } else {
          let old = s.assignedClasses;
          let updated = Array.tabulate(old.size() + 1, func(i) { if (i < old.size()) old[i] else courseId });
          ?{ s with assignedClasses = updated }
        };
      };
    };
  };

};
