import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/common";

mixin (
  notifications : Map.Map<Types.NotificationId, Types.Notification>,
  state         : { var nextNotificationId : Nat },
) {

  // ── Queries ───────────────────────────────────────────────────────────────

  /// All notifications for a recipient, newest first.
  public query func getNotifications(
    userId : Types.StaffId,
  ) : async [Types.Notification] {
    var result = List.empty<Types.Notification>();
    for ((_, n) in notifications.entries()) {
      if (n.recipientId == userId) { result.add(n) };
    };
    // Sort newest first by createdAt
    let arr = result.toArray();
    arr.sort(func(a, b) {
      if (a.createdAt > b.createdAt) { #less }
      else if (a.createdAt < b.createdAt) { #greater }
      else { #equal }
    })
  };

  /// Count of unread notifications for a recipient.
  public query func getUnreadNotificationCount(
    userId : Types.StaffId,
  ) : async Nat {
    var count : Nat = 0;
    for ((_, n) in notifications.entries()) {
      if (n.recipientId == userId and not n.isRead) {
        count += 1;
      };
    };
    count
  };

  // ── Updates ─────────────────────────────────────────────────────────────

  /// Mark a notification as read.
  public func markNotificationRead(
    notificationId : Types.NotificationId,
  ) : async { #ok; #err : Text } {
    switch (notifications.get(notificationId)) {
      case null { #err "Notification not found" };
      case (?n) {
        notifications.add(notificationId, { n with isRead = true });
        #ok
      };
    }
  };

  /// Mark all notifications as read for a user.
  public func markAllNotificationsRead(
    userId : Types.StaffId,
  ) : async { #ok; #err : Text } {
    let keys = notifications.entries().toArray();
    for ((k, n) in keys.vals()) {
      if (n.recipientId == userId and not n.isRead) {
        notifications.add(k, { n with isRead = true });
      };
    };
    #ok
  };

  /// Internal helper: emit a notification (called by domain logic).
  public func emitNotification(
    recipientId : Types.StaffId,
    eventType   : Types.NotificationEventType,
    tier        : Types.NotificationTier,
    title       : Text,
    body        : Text,
    relatedId   : ?Nat,
    relatedType : ?Text,
  ) : async Types.NotificationId {
    let id = state.nextNotificationId;
    state.nextNotificationId += 1;
    notifications.add(id, {
      id;
      recipientId;
      eventType;
      tier;
      title;
      body;
      isRead      = false;
      createdAt   = Time.now();
      relatedId;
      relatedType;
      isDemoData  = false;
    });
    id
  };

};
