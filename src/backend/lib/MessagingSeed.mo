import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";

/// Seeds message threads + messages among distinct demo staff (teacher=1,
/// principal=5, counsellor=7, sped=8) so the inbox shows real conversations.
/// Distinct staff numbers avoid the staff/parent toNat id-collision. Mirrors
/// the other seeds: clears prior demo rows, regenerates relative to the
/// canister clock, idempotent across postupgrade.
module MessagingSeed {

  public type SeedState = {
    threads      : Map.Map<Types.ThreadId, Types.Thread>;
    messages     : Map.Map<Types.MessageId, Types.Message>;
    nextThreadId  : Nat;
    nextMessageId : Nat;
  };

  public func seed(s : SeedState) : () {
    var tId = s.nextThreadId;
    var mId = s.nextMessageId;
    let threads = s.threads;
    let messages = s.messages;

    var tRem : [Types.ThreadId] = [];
    for ((id, r) in threads.entries()) {
      if (r.isDemoData) { tRem := tRem.concat([id]) };
    };
    for (id in tRem.vals()) { threads.remove(id) };

    var mRem : [Types.MessageId] = [];
    for ((id, r) in messages.entries()) {
      if (r.isDemoData) { mRem := mRem.concat([id]) };
    };
    for (id in mRem.vals()) { messages.remove(id) };

    let hourNs : Int = 3_600_000_000_000;
    let now : Int = Time.now();

    // Thread A — teacher(1) ↔ counsellor(7)
    let tA = tId; tId += 1;
    threads.add(tA, { id = tA; subject = "Maya progress update"; participants = [1, 7]; lastMessageAt = now - 1 * hourNs; isDemoData = true });
    messages.add(mId, { id = mId; fromId = 7; toId = 1; subject = "Maya progress update"; body = "Can we sync on Maya's attendance this week?"; sentAt = now - 3 * hourNs; threadId = tA; isRead = true; isDemoData = true }); mId += 1;
    messages.add(mId, { id = mId; fromId = 1; toId = 7; subject = "Maya progress update"; body = "Yes — she's dropped below 85%, I've flagged it."; sentAt = now - 1 * hourNs; threadId = tA; isRead = false; isDemoData = true }); mId += 1;

    // Thread B — teacher(1) ↔ principal(5)
    let tB = tId; tId += 1;
    threads.add(tB, { id = tB; subject = "Algebra II pacing"; participants = [1, 5]; lastMessageAt = now - 5 * hourNs; isDemoData = true });
    messages.add(mId, { id = mId; fromId = 5; toId = 1; subject = "Algebra II pacing"; body = "How's the Algebra II cohort tracking?"; sentAt = now - 6 * hourNs; threadId = tB; isRead = true; isDemoData = true }); mId += 1;
    messages.add(mId, { id = mId; fromId = 1; toId = 5; subject = "Algebra II pacing"; body = "Most on track; two students need support."; sentAt = now - 5 * hourNs; threadId = tB; isRead = false; isDemoData = true }); mId += 1;

    // Thread C — counsellor(7) ↔ sped(8)
    let tC = tId; tId += 1;
    threads.add(tC, { id = tC; subject = "IEP coordination"; participants = [7, 8]; lastMessageAt = now - 2 * hourNs; isDemoData = true });
    messages.add(mId, { id = mId; fromId = 8; toId = 7; subject = "IEP coordination"; body = "Renewal due in 12 days for a shared student."; sentAt = now - 2 * hourNs; threadId = tC; isRead = false; isDemoData = true }); mId += 1;
  };
};
