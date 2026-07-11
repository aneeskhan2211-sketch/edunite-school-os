import Map "mo:core/Map";
import Types "../types/common";

// Principal-based RBAC (Phase 3). Authentication is Internet Identity (the
// `caller` is the authenticated principal); authorization is this server-side
// principal -> account -> role registry. The first principal to register
// becomes the owner. The frontend derives the signed-in user's role from
// getMyAccount() (i.e. from `caller`), not from a client-supplied argument.
mixin (
  accounts : Map.Map<Text, Types.Account>,
) {

  /// The authenticated principal of the caller (anonymous if not signed in).
  public shared query ({ caller }) func whoami() : async Principal {
    caller
  };

  /// The caller's account, or null if this principal hasn't registered yet.
  public shared query ({ caller }) func getMyAccount() : async ?Types.Account {
    accounts.get(caller.toText())
  };

  /// Self-claim: an authenticated principal binds itself to a role + the
  /// seeded user it represents. The first registrant becomes the owner.
  public shared ({ caller }) func register(
    role : Types.Role,
    userId : Nat,
    displayName : Text,
  ) : async { #ok : Types.Account; #err : Text } {
    if (caller.isAnonymous()) {
      return #err "Sign in with Internet Identity first";
    };
    let key = caller.toText();
    switch (accounts.get(key)) {
      case (?_) { return #err "This identity is already registered" };
      case null {};
    };
    var hasOwner = false;
    for ((_, a) in accounts.entries()) {
      if (a.isOwner) { hasOwner := true };
    };
    let acct : Types.Account = {
      principalText = key;
      role;
      userId;
      displayName;
      isOwner = not hasOwner;
    };
    accounts.add(key, acct);
    #ok acct
  };

};
