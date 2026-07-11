import Map "mo:core/Map";
import Types "../types/common";

/// Seeds the canonical 9 students (ids 1–9) into the backend SIS so caseloads,
/// IEP, signals and the student list all read from one real source. Matches the
/// frontend demo cast (Jordan/Maya/Tyler…) with counsellor (6/7) and SPED (8)
/// assignments. Clears prior demo students first; idempotent across postupgrade.
module StudentSeed {

  public type SeedState = {
    students : Map.Map<Types.StudentId, Types.Student>;
  };

  func flags(sped : Bool, ell : Bool, wida : ?Text, gifted : Bool) : Types.SpecialPopFlags {
    {
      sped;
      ell;
      wida;
      mcKinneyVento = false;
      fosterYouth = false;
      gifted;
      medicalAlert = null;
    };
  };

  func mk(
    id : Nat,
    name : Text,
    grade : Nat,
    dob : Text,
    homeroom : Text,
    counsellor : Nat,
    sped : ?Nat,
    f : Types.SpecialPopFlags,
  ) : Types.Student {
    {
      id;
      name;
      preferredName = null;
      grade;
      dob;
      homeroom;
      photo = null;
      guardians = [];
      counsellorId = ?counsellor;
      spedCoordinatorId = sped;
      enrollmentStatus = #active;
      specialPopFlags = f;
      isDemoData = true;
    };
  };

  public func seed(s : SeedState) : () {
    let students = s.students;

    var toRemove : [Types.StudentId] = [];
    for ((id, r) in students.entries()) {
      if (r.isDemoData) { toRemove := toRemove.concat([id]) };
    };
    for (id in toRemove.vals()) { students.remove(id) };

    let rows : [Types.Student] = [
      mk(1, "Jordan Ellis", 10, "2008-03-14", "101A", 6, null, flags(false, false, null, false)),
      mk(2, "Maya Okonkwo", 10, "2008-07-22", "101A", 7, ?8, flags(true, false, null, false)),
      mk(3, "Tyler Reyes", 10, "2008-11-05", "102B", 6, ?8, flags(true, true, ?"3", false)),
      mk(4, "Priya Sharma", 10, "2008-05-18", "102B", 7, null, flags(false, false, null, false)),
      mk(5, "Marcus Brown", 10, "2008-09-30", "101A", 7, ?8, flags(true, false, null, false)),
      mk(6, "Aisha Williams", 10, "2008-02-11", "103C", 6, null, flags(false, false, null, true)),
      mk(7, "Diego Martinez", 11, "2007-06-21", "201A", 7, null, flags(false, false, null, false)),
      mk(8, "Hannah Kim", 11, "2007-12-03", "201A", 6, null, flags(false, false, null, false)),
      mk(9, "Liam O'Brien", 11, "2007-08-15", "202B", 7, null, flags(false, false, null, false)),
    ];
    for (r in rows.vals()) { students.add(r.id, r) };
  };
};
