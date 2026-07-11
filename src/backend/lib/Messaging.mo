/// lib/Messaging.mo — Domain logic for the messaging domain.
import Types "../types/common";
import List  "mo:core/List";
import Map   "mo:core/Map";
import Time  "mo:core/Time";
import Text  "mo:core/Text";

module {

  // Returns all threads for a user (inbox view).
  public func listThreads(
    threads  : [(Types.ThreadId, Types.Thread)],
    messages : [(Types.MessageId, Types.Message)],
    userId   : Types.StaffId,
  ) : [Types.Thread] {
    let all = threads.map(func((_, t)) { t });
    all.filter(func(t) {
      t.participants.find(func(p) { p == userId }) != null
    })
  };

  // getInbox: threads with their latest message, for a user.
  public func getInbox(
    threads  : Map.Map<Types.ThreadId, Types.Thread>,
    messages : Map.Map<Types.MessageId, Types.Message>,
    userId   : Types.StaffId,
  ) : [Types.Thread] {
    var result = List.empty<Types.Thread>();
    for ((_, t) in threads.entries()) {
      if (t.participants.find(func(p) { p == userId }) != null) {
        result.add(t);
      };
    };
    result.toArray()
  };

  // getThread: single thread record (messages fetched separately).
  public func getThread(
    threads  : Map.Map<Types.ThreadId, Types.Thread>,
    threadId : Types.ThreadId,
  ) : ?Types.Thread {
    threads.get(threadId)
  };

  // sendMessage: creates a new thread if threadId is null, else appends.
  // Returns #ok MessageId or #err.
  public func sendDirectMessage(
    threads  : Map.Map<Types.ThreadId, Types.Thread>,
    messages : Map.Map<Types.MessageId, Types.Message>,
    state    : { var nextMessageId : Nat; var nextThreadId : Nat },
    fromId   : Types.StaffId,
    toId     : Types.StaffId,
    subject  : Text,
    body     : Text,
    existingThreadId : ?Types.ThreadId,
  ) : { #ok : Types.MessageId; #err : Text } {
    let now = Time.now();
    let threadId : Types.ThreadId = switch (existingThreadId) {
      case (?tid) {
        switch (threads.get(tid)) {
          case null { return #err "Thread not found" };
          case (?t)  {
            threads.add(tid, { t with lastMessageAt = now });
            tid
          };
        }
      };
      case null {
        let tid = state.nextThreadId;
        state.nextThreadId += 1;
        threads.add(tid, {
          id           = tid;
          subject;
          participants = [fromId, toId];
          lastMessageAt = now;
          isDemoData   = false;
        });
        tid
      };
    };
    let msgId = state.nextMessageId;
    state.nextMessageId += 1;
    let msg : Types.Message = {
      id       = msgId;
      fromId;
      toId;
      subject;
      body;
      sentAt   = now;
      threadId;
      isRead   = false;
      isDemoData = false;
    };
    messages.add(msgId, msg);
    #ok msgId
  };

  // replyToThread: append a message to an existing thread.
  public func replyToThread(
    threads  : Map.Map<Types.ThreadId, Types.Thread>,
    messages : Map.Map<Types.MessageId, Types.Message>,
    state    : { var nextMessageId : Nat },
    threadId : Types.ThreadId,
    fromId   : Types.StaffId,
    body     : Text,
  ) : { #ok : Types.MessageId; #err : Text } {
    switch (threads.get(threadId)) {
      case null { #err "Thread not found" };
      case (?t)  {
        let now = Time.now();
        threads.add(threadId, { t with lastMessageAt = now });
        let toId : Types.StaffId = switch (t.participants.find(func(p) { p != fromId })) {
          case (?other) other;
          case null     fromId;
        };
        let msgId = state.nextMessageId;
        state.nextMessageId += 1;
        let msg : Types.Message = {
          id       = msgId;
          fromId;
          toId;
          subject  = t.subject;
          body;
          sentAt   = now;
          threadId;
          isRead   = false;
          isDemoData = false;
        };
        messages.add(msgId, msg);
        #ok msgId
      };
    }
  };

  // markRead: mark a specific message as read.
  public func markMessageRead(
    messages  : Map.Map<Types.MessageId, Types.Message>,
    messageId : Types.MessageId,
  ) : { #ok; #err : Text } {
    switch (messages.get(messageId)) {
      case null { #err "Message not found" };
      case (?m)  {
        messages.add(messageId, { m with isRead = true });
        #ok
      };
    }
  };

  // createAnnouncement with optional staff-only flag.
  public func createAnnouncement(
    announcements : Map.Map<Types.AnnouncementId, Types.Announcement>,
    state         : { var nextAnnouncementId : Nat },
    authorId      : Types.StaffId,
    title         : Text,
    body          : Text,
    targetRoles   : [Types.Role],
    staffOnly     : Bool,
  ) : Types.AnnouncementId {
    let id = state.nextAnnouncementId;
    state.nextAnnouncementId += 1;
    let priority : Types.AnnouncementPriority = if (staffOnly) { #important } else { #info };
    announcements.add(id, {
      id;
      authorId;
      title;
      body;
      targetRoles;
      priority;
      createdAt  = Time.now();
      isDemoData = false;
    });
    id
  };

  // replyToAnnouncement: append a reply message to the announcement thread.
  // Implemented as a direct message from authorId back to announcement author.
  public func replyToAnnouncement(
    announcements : Map.Map<Types.AnnouncementId, Types.Announcement>,
    threads       : Map.Map<Types.ThreadId, Types.Thread>,
    messages      : Map.Map<Types.MessageId, Types.Message>,
    state         : { var nextMessageId : Nat; var nextThreadId : Nat },
    announcementId : Types.AnnouncementId,
    replierId      : Types.StaffId,
    body           : Text,
  ) : { #ok : Types.MessageId; #err : Text } {
    switch (announcements.get(announcementId)) {
      case null { #err "Announcement not found" };
      case (?ann) {
        // Reply as a direct message to the announcement author
        sendDirectMessage(
          threads, messages, state,
          replierId, ann.authorId,
          "Re: " # ann.title,
          body,
          null,
        )
      };
    }
  };

  // Returns all messages in a thread.
  public func getMessages(
    messages : [(Types.MessageId, Types.Message)],
    threadId : Types.ThreadId,
  ) : [Types.Message] {
    let all = messages.map(func((_, m)) { m });
    all.filter(func(m) { m.threadId == threadId })
  };

  // Sends a message, creating or joining a thread.
  public func sendMessage(
    message : Types.Message,
  ) : Types.Message {
    message
  };

  // Create a new thread with a first message.
  public func createThread(
    threads        : Map.Map<Types.ThreadId, Types.Thread>,
    messages       : Map.Map<Types.MessageId, Types.Message>,
    state          : { var nextThreadId : Nat; var nextMessageId : Nat },
    participantIds : [Types.StaffId],
    subject        : Text,
    firstMessage   : Text,
    authorId       : Types.StaffId,
  ) : Types.ThreadId {
    let threadId = state.nextThreadId;
    state.nextThreadId += 1;
    let now = Time.now();
    let thread : Types.Thread = {
      id           = threadId;
      subject;
      participants = participantIds;
      lastMessageAt = now;
      isDemoData   = false;
    };
    threads.add(threadId, thread);
    let msgId = state.nextMessageId;
    state.nextMessageId += 1;
    let msg : Types.Message = {
      id       = msgId;
      fromId   = authorId;
      toId     = switch (participantIds.find(func(p) { p != authorId })) {
        case (?other) other;
        case null     authorId;
      };
      subject;
      body     = firstMessage;
      sentAt   = now;
      threadId;
      isRead   = false;
      isDemoData = false;
    };
    messages.add(msgId, msg);
    threadId
  };

  // Returns announcements filtered by target role.
  public func getAnnouncements(
    announcements : Map.Map<Types.AnnouncementId, Types.Announcement>,
    targetRole    : Types.Role,
  ) : [Types.Announcement] {
    var result = List.empty<Types.Announcement>();
    for ((_, ann) in announcements.entries()) {
      // Empty targetRoles means broadcast to all
      let targeted = ann.targetRoles.size() == 0 or
        ann.targetRoles.find(func(r) { r == targetRole }) != null;
      if (targeted) { result.add(ann) };
    };
    result.toArray()
  };

  // Post a new announcement.
  public func postAnnouncement(
    announcements : Map.Map<Types.AnnouncementId, Types.Announcement>,
    state         : { var nextAnnouncementId : Nat },
    authorId      : Types.StaffId,
    title         : Text,
    body          : Text,
    targetRoles   : [Types.Role],
    priority      : Types.AnnouncementPriority,
  ) : Types.AnnouncementId {
    let id = state.nextAnnouncementId;
    state.nextAnnouncementId += 1;
    let ann : Types.Announcement = {
      id;
      authorId;
      title;
      body;
      targetRoles;
      priority;
      createdAt  = Time.now();
      isDemoData = false;
    };
    announcements.add(id, ann);
    id
  };

  // Returns the count of unread threads for a user.
  public func getUnreadCount(
    threads      : Map.Map<Types.ThreadId, Types.Thread>,
    readReceipts : Map.Map<Text, Bool>,
    userId       : Types.StaffId,
  ) : Nat {
    var count : Nat = 0;
    for ((tid, t) in threads.entries()) {
      if (t.participants.find(func(p) { p == userId }) != null) {
        let key = userId.toText() # ":" # tid.toText();
        let isRead = switch (readReceipts.get(key)) {
          case (?v) v;
          case null  false;
        };
        if (not isRead) { count += 1 };
      };
    };
    count
  };

  // Mark a thread as read for a user.
  public func markThreadRead(
    readReceipts : Map.Map<Text, Bool>,
    userId       : Types.StaffId,
    threadId     : Types.ThreadId,
  ) : { #ok; #err : Text } {
    let key = userId.toText() # ":" # threadId.toText();
    readReceipts.add(key, true);
    #ok
  };

};

