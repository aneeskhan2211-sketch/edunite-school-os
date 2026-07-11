import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";

/// Seeds school announcements (targeted by role) that feed the community feed.
/// Clears prior demo announcements; idempotent across postupgrade.
module AnnouncementSeed {

  public type SeedState = {
    announcements      : Map.Map<Types.AnnouncementId, Types.Announcement>;
    nextAnnouncementId : Nat;
  };

  public func seed(s : SeedState) : () {
    let anns = s.announcements;
    var aId = s.nextAnnouncementId;

    var rem : [Types.AnnouncementId] = [];
    for ((id, r) in anns.entries()) { if (r.isDemoData) { rem := rem.concat([id]) } };
    for (id in rem.vals()) { anns.remove(id) };

    let dayNs : Int = 86_400_000_000_000;
    let now : Int = Time.now();

    let everyone : [Types.Role] = [
      #teacher, #coTeacher, #student, #parent, #schoolAdmin,
      #departmentHead, #principal, #districtAdmin, #counsellor,
      #spedCoordinator, #curriculumCoordinator, #substitute,
    ];

    let rows : [Types.Announcement] = [
      { id = 0; authorId = 5; title = "Spring Concert this Friday";
        body = "Join us in the auditorium at 7pm to celebrate our music students. All families welcome.";
        targetRoles = everyone; priority = #info; createdAt = now - 1 * dayNs; isDemoData = true },
      { id = 0; authorId = 3; title = "Report Cards Published";
        body = "Spring 2026 report cards are now available. Parents and students can view them from their dashboard.";
        targetRoles = [#parent, #student, #teacher]; priority = #important; createdAt = now - 2 * dayNs; isDemoData = true },
      { id = 0; authorId = 5; title = "Congratulations to the Debate Team";
        body = "Our debate team placed first at the regional tournament. A wonderful achievement for Lincoln High!";
        targetRoles = everyone; priority = #info; createdAt = now - 3 * dayNs; isDemoData = true },
      { id = 0; authorId = 7; title = "Attendance Initiative Kickoff";
        body = "We're launching a school-wide push to lift attendance above 90%. Staff briefing notes attached.";
        targetRoles = [#teacher, #counsellor, #principal, #schoolAdmin]; priority = #important; createdAt = now - 4 * dayNs; isDemoData = true },
      { id = 0; authorId = 5; title = "Professional Development Day — Monday";
        body = "No classes Monday. Staff PD on differentiated instruction in the library, 9am.";
        targetRoles = [#teacher, #coTeacher, #departmentHead, #curriculumCoordinator]; priority = #info; createdAt = now - 5 * dayNs; isDemoData = true },
    ];
    for (r in rows.vals()) {
      anns.add(aId, { r with id = aId });
      aId += 1;
    };
  };
};
