module {

  public type ChannelId     = Nat;
  public type ChannelMsgId  = Nat;
  public type BoardItemId   = Nat;

  public type Channel = {
    id          : ChannelId;
    name        : Text;
    description : ?Text;
    createdBy   : Text;
    createdAt   : Int;
    isRoleScoped: Bool;
    scopedRoles : [Text];
    isArchived  : Bool;
  };

  public type ChannelMessage = {
    id            : ChannelMsgId;
    channelId     : ChannelId;
    authorId      : Text;
    content       : Text;
    sentAt        : Int;
    editedAt      : ?Int;
    isPinned      : Bool;
    mentionedUsers: [Text];
    parentId      : ?ChannelMsgId;
  };

  public type BoardItem = {
    id        : BoardItemId;
    channelId : ?ChannelId;
    title     : Text;
    content   : Text;
    createdBy : Text;
    createdAt : Int;
    isPinned  : Bool;
    pinnedAt  : ?Int;
    pinnedBy  : ?Text;
  };

};
