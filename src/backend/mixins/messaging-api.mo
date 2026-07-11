import Map "mo:core/Map";
import Types "../types/common";
import MessagingLib "../lib/Messaging";

mixin (
  threads       : Map.Map<Types.ThreadId, Types.Thread>,
  messages      : Map.Map<Types.MessageId, Types.Message>,
  announcements : Map.Map<Types.AnnouncementId, Types.Announcement>,
  readReceipts  : Map.Map<Text, Bool>,
  state         : { var nextMessageId : Nat; var nextThreadId : Nat; var nextAnnouncementId : Nat },
) {

  // ── Thread / inbox queries ───────────────────────────────────────────────

  /// All threads the user participates in (inbox view).
  public query func getInbox(
    userId : Types.StaffId,
  ) : async [Types.Thread] {
    MessagingLib.getInbox(threads, messages, userId)
  };

  /// Single thread record.
  public query func getThread(
    threadId : Types.ThreadId,
  ) : async ?Types.Thread {
    MessagingLib.getThread(threads, threadId)
  };

  /// All messages belonging to a thread.
  public query func getMessages(
    threadId : Types.ThreadId,
  ) : async [Types.Message] {
    let pairs = messages.entries().toArray();
    MessagingLib.getMessages(pairs, threadId)
  };

  /// Legacy alias — returns same as getInbox.
  public query func getThreads(
    userId : Types.StaffId,
  ) : async [Types.Thread] {
    MessagingLib.getInbox(threads, messages, userId)
  };

  // ── Message updates ──────────────────────────────────────────────────────

  /// Send a new direct message. Pass threadId=null to create a new thread.
  public func sendMessage(
    toUserId : Types.StaffId,
    subject  : Text,
    body     : Text,
    threadId : ?Types.ThreadId,
    fromId   : Types.StaffId,
  ) : async { #ok : Types.MessageId; #err : Text } {
    MessagingLib.sendDirectMessage(
      threads, messages, state,
      fromId, toUserId, subject, body, threadId,
    )
  };

  /// Append a reply to an existing thread.
  public func replyToThread(
    threadId : Types.ThreadId,
    body     : Text,
    fromId   : Types.StaffId,
  ) : async { #ok : Types.MessageId; #err : Text } {
    MessagingLib.replyToThread(threads, messages, state, threadId, fromId, body)
  };

  /// Mark a specific message as read.
  public func markRead(
    messageId : Types.MessageId,
  ) : async { #ok; #err : Text } {
    MessagingLib.markMessageRead(messages, messageId)
  };

  /// Mark an entire thread as read for a user.
  public func markThreadRead(
    userId   : Types.StaffId,
    threadId : Types.ThreadId,
  ) : async { #ok; #err : Text } {
    MessagingLib.markThreadRead(readReceipts, userId, threadId)
  };

  /// Number of unread threads for a user.
  public query func getUnreadCount(
    userId : Types.StaffId,
  ) : async Nat {
    MessagingLib.getUnreadCount(threads, readReceipts, userId)
  };

  // ── Thread creation (legacy) ─────────────────────────────────────────────

  public func createThread(
    participantIds : [Types.StaffId],
    subject        : Text,
    firstMessage   : Text,
    authorId       : Types.StaffId,
  ) : async Types.ThreadId {
    MessagingLib.createThread(threads, messages, state, participantIds, subject, firstMessage, authorId)
  };

  // ── Announcements ────────────────────────────────────────────────────────

  /// Create a new announcement. staffOnly=true sets priority to #important.
  public func createAnnouncement(
    title       : Text,
    body        : Text,
    targetRoles : [Types.Role],
    staffOnly   : Bool,
    authorId    : Types.StaffId,
  ) : async { #ok : Types.AnnouncementId; #err : Text } {
    let id = MessagingLib.createAnnouncement(
      announcements, state, authorId, title, body, targetRoles, staffOnly,
    );
    #ok id
  };

  /// Reply to an announcement (creates a direct message to the author).
  public func replyToAnnouncement(
    announcementId : Types.AnnouncementId,
    body           : Text,
    replierId      : Types.StaffId,
  ) : async { #ok : Types.MessageId; #err : Text } {
    MessagingLib.replyToAnnouncement(
      announcements, threads, messages, state,
      announcementId, replierId, body,
    )
  };

  /// Announcements visible to a role. Pass null to get all.
  public query func getAnnouncements(
    roleFilter : ?Types.Role,
  ) : async [Types.Announcement] {
    switch (roleFilter) {
      case (?role) MessagingLib.getAnnouncements(announcements, role);
      case null {
        announcements.entries().toArray().map(func((_, a)) { a })
      };
    }
  };

  /// Legacy: post announcement with an explicit priority.
  public func postAnnouncement(
    authorId    : Types.StaffId,
    title       : Text,
    body        : Text,
    targetRoles : [Types.Role],
    priority    : Types.AnnouncementPriority,
  ) : async Types.AnnouncementId {
    MessagingLib.postAnnouncement(announcements, state, authorId, title, body, targetRoles, priority)
  };

};
