import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import T "../types/staffRoom";

mixin (
  channels     : Map.Map<T.ChannelId,    T.Channel>,
  channelMsgs  : Map.Map<T.ChannelMsgId, T.ChannelMessage>,
  boardItems   : Map.Map<T.BoardItemId,  T.BoardItem>,
  state : {
    var nextChannelId   : Nat;
    var nextChannelMsgId: Nat;
    var nextBoardItemId : Nat;
  },
) {

  public query func getChannels() : async [T.Channel] {
    channels.values().toArray().filter(
      func(c : T.Channel) : Bool { not c.isArchived },
    );
  };

  public func createChannel(
    name        : Text,
    description : ?Text,
    createdBy   : Text,
    scopedRoles : [Text],
  ) : async { #ok : T.Channel; #err : Text } {
    if (name == "") { return #err("Channel name cannot be empty") };
    // Check for duplicate name among non-archived channels
    let duplicate = channels.values().toArray().find(
      func(c : T.Channel) : Bool { c.name == name and not c.isArchived },
    );
    if (duplicate != null) { return #err("A channel with that name already exists") };
    state.nextChannelId += 1;
    let channel : T.Channel = {
      id          = state.nextChannelId;
      name;
      description;
      createdBy;
      createdAt   = Time.now();
      isRoleScoped = scopedRoles.size() > 0;
      scopedRoles;
      isArchived  = false;
    };
    channels.add(state.nextChannelId, channel);
    #ok(channel);
  };

  public query func getChannelMessages(
    channelId : T.ChannelId,
    limit     : Nat,
    offset    : Nat,
  ) : async [T.ChannelMessage] {
    let filtered = channelMsgs.values().toArray().filter(
      func(m : T.ChannelMessage) : Bool { m.channelId == channelId },
    );
    // Sort by sentAt descending
    let sorted = filtered.sort(
      func(a : T.ChannelMessage, b : T.ChannelMessage) : Order.Order {
        if (a.sentAt > b.sentAt) { #less }
        else if (a.sentAt < b.sentAt) { #greater }
        else { #equal };
      },
    );
    let total = sorted.size();
    if (offset >= total) { return [] };
    let end = if (offset + limit > total) { total } else { offset + limit };
    Array.tabulate(end - offset, func(i : Nat) : T.ChannelMessage { sorted[offset + i] });
  };

  public func postMessage(
    channelId      : T.ChannelId,
    authorId       : Text,
    content        : Text,
    mentionedUsers : [Text],
    parentId       : ?T.ChannelMsgId,
  ) : async { #ok : T.ChannelMessage; #err : Text } {
    if (channels.get(channelId) == null) { return #err("Channel not found") };
    if (content == "") { return #err("Message content cannot be empty") };
    state.nextChannelMsgId += 1;
    let msg : T.ChannelMessage = {
      id             = state.nextChannelMsgId;
      channelId;
      authorId;
      content;
      sentAt         = Time.now();
      editedAt       = null;
      isPinned       = false;
      mentionedUsers;
      parentId;
    };
    channelMsgs.add(state.nextChannelMsgId, msg);
    #ok(msg);
  };

  public query func getBoardItems(channelId : ?T.ChannelId) : async [T.BoardItem] {
    let filtered = switch (channelId) {
      case null { boardItems.values().toArray() };
      case (?cid) {
        boardItems.values().toArray().filter(
          func(item : T.BoardItem) : Bool {
            switch (item.channelId) {
              case (?id) { id == cid };
              case null  { false };
            };
          },
        );
      };
    };
    // Pinned items first, then by createdAt descending
    filtered.sort(
      func(a : T.BoardItem, b : T.BoardItem) : Order.Order {
        if (a.isPinned and not b.isPinned)  { #less }
        else if (not a.isPinned and b.isPinned) { #greater }
        else if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal };
      },
    );
  };

  public func createBoardItem(
    title     : Text,
    content   : Text,
    createdBy : Text,
    channelId : ?T.ChannelId,
  ) : async { #ok : T.BoardItem; #err : Text } {
    if (title == "") { return #err("Board item title cannot be empty") };
    state.nextBoardItemId += 1;
    let item : T.BoardItem = {
      id        = state.nextBoardItemId;
      channelId;
      title;
      content;
      createdBy;
      createdAt = Time.now();
      isPinned  = false;
      pinnedAt  = null;
      pinnedBy  = null;
    };
    boardItems.add(state.nextBoardItemId, item);
    #ok(item);
  };

  public func togglePin(
    boardItemId : T.BoardItemId,
    pinnedBy    : Text,
  ) : async { #ok : T.BoardItem; #err : Text } {
    switch (boardItems.get(boardItemId)) {
      case null { #err("Board item not found") };
      case (?item) {
        let nowPinned = not item.isPinned;
        let updated : T.BoardItem = {
          item with
          isPinned = nowPinned;
          pinnedAt = if (nowPinned) { ?Time.now() } else { null };
          pinnedBy = if (nowPinned) { ?pinnedBy }  else { null };
        };
        boardItems.add(boardItemId, updated);
        #ok(updated);
      };
    };
  };

};
