import Map "mo:core/Map";
import Types "../types/common";

/// Seeds the school's staff (ids 1–10) matching the role switcher's demo users,
/// so teacher/staff names resolve on the backend across schedules, class lists,
/// timetables, etc. Clears prior demo staff first; idempotent across postupgrade.
module StaffSeed {

  public type SeedState = {
    staff : Map.Map<Types.StaffId, Types.Staff>;
  };

  func mk(
    id : Nat,
    name : Text,
    role : Types.Role,
    email : Text,
    dept : Text,
    classes : [Types.CourseId],
  ) : Types.Staff {
    {
      id;
      name;
      role;
      email;
      departments = [dept];
      assignedClasses = classes;
      isDemoData = true;
    };
  };

  public func seed(s : SeedState) : () {
    let staff = s.staff;

    var toRemove : [Types.StaffId] = [];
    for ((id, r) in staff.entries()) {
      if (r.isDemoData) { toRemove := toRemove.concat([id]) };
    };
    for (id in toRemove.vals()) { staff.remove(id) };

    let rows : [Types.Staff] = [
      mk(1, "Maria Chen", #teacher, "mchen@lincoln.edu", "Math", [1, 3]),
      mk(2, "James Okafor", #coTeacher, "jokafor@lincoln.edu", "English", [2, 5]),
      mk(3, "Patricia Nguyen", #schoolAdmin, "pnguyen@lincoln.edu", "Administration", []),
      mk(4, "Robert Kim", #departmentHead, "rkim@lincoln.edu", "Science", [4, 6]),
      mk(5, "Diana Walsh", #principal, "dwalsh@lincoln.edu", "Administration", []),
      mk(6, "Marcus Thompson", #districtAdmin, "mthompson@district.edu", "District", []),
      mk(7, "Sophia Martinez", #counsellor, "smartinez@lincoln.edu", "Counselling", []),
      mk(8, "David Patel", #spedCoordinator, "dpatel@lincoln.edu", "Special Education", []),
      mk(9, "Laura Johnson", #curriculumCoordinator, "ljohnson@lincoln.edu", "Curriculum", []),
      mk(10, "Kevin Brooks", #substitute, "kbrooks@lincoln.edu", "Substitute", []),
    ];
    for (r in rows.vals()) { staff.add(r.id, r) };
  };
};
