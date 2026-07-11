import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";

/// Seeds notifications for the demo staff (teacher=1, principal=5, counsellor=7,
/// sped=8) so the notification bell shows real data. Mirrors the other seeds:
/// clears prior demo rows, regenerates relative to the canister clock,
/// idempotent across postupgrade.
module NotificationSeed {

  public type SeedState = {
    notifications      : Map.Map<Types.NotificationId, Types.Notification>;
    nextNotificationId : Nat;
  };

  public func seed(seedState : SeedState) : () {
    var nextId = seedState.nextNotificationId;
    let notif = seedState.notifications;

    var toRemove : [Types.NotificationId] = [];
    for ((id, r) in notif.entries()) {
      if (r.isDemoData) { toRemove := toRemove.concat([id]) };
    };
    for (id in toRemove.vals()) { notif.remove(id) };

    let hourNs : Int = 3_600_000_000_000;
    let now : Int = Time.now();

    let rows : [Types.Notification] = [
      { id = 0; recipientId = 1; eventType = #attendanceFlagged; tier = #critical;
        title = "Attendance alert"; body = "Maya Okonkwo's attendance has dropped below 85%.";
        isRead = false; createdAt = now - 2 * hourNs; relatedId = ?2; relatedType = ?"student"; isDemoData = true },
      { id = 0; recipientId = 1; eventType = #messageReceived; tier = #important;
        title = "New message"; body = "A parent replied about a progress update.";
        isRead = false; createdAt = now - 5 * hourNs; relatedId = null; relatedType = ?"message"; isDemoData = true },
      { id = 0; recipientId = 1; eventType = #gradePosted; tier = #informational;
        title = "Grades synced"; body = "Algebra II grades posted to the gradebook.";
        isRead = true; createdAt = now - 26 * hourNs; relatedId = ?1; relatedType = ?"course"; isDemoData = true },
      { id = 0; recipientId = 7; eventType = #riskSignal; tier = #critical;
        title = "Student flagged at risk"; body = "Maya Okonkwo: attendance + behaviour pattern needs review.";
        isRead = false; createdAt = now - 1 * hourNs; relatedId = ?2; relatedType = ?"student"; isDemoData = true },
      { id = 0; recipientId = 7; eventType = #commitmentDue; tier = #important;
        title = "Commitment due"; body = "Parent call for Tyler Reyes is overdue.";
        isRead = false; createdAt = now - 8 * hourNs; relatedId = ?3; relatedType = ?"commitment"; isDemoData = true },
      { id = 0; recipientId = 5; eventType = #incidentRouted; tier = #important;
        title = "Incident routed"; body = "A behaviour incident was routed for review.";
        isRead = false; createdAt = now - 4 * hourNs; relatedId = null; relatedType = ?"incident"; isDemoData = true },
      { id = 0; recipientId = 8; eventType = #iepDue; tier = #critical;
        title = "IEP renewal due"; body = "IEP renewal is due in 12 days.";
        isRead = false; createdAt = now - 12 * hourNs; relatedId = ?5; relatedType = ?"student"; isDemoData = true },
    ];

    for (r in rows.vals()) {
      let rec = { r with id = nextId };
      notif.add(nextId, rec);
      nextId += 1;
    };
  };
};
