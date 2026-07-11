import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/common";

/// Seeds attendance for the canonical demo cast (students 1–9) so the
/// attendance module reads real canister data. Mirrors the GradebookSeed
/// approach: clears prior demo attendance, then regenerates a deterministic
/// ~30-day window ending "today" (canister clock) so getAttendancePattern's
/// last-30-day window actually contains data.
module AttendanceSeed {

  public type SeedState = {
    attendance       : Map.Map<Types.AttendanceId, Types.AttendanceRecord>;
    nextAttendanceId : Nat;
  };

  // Convert a nanosecond timestamp to an ISO "YYYY-MM-DD" date string.
  func intToDate(ns : Int) : Text {
    let secs  = ns / 1_000_000_000;
    let days  = secs / 86400;
    let d     = days + 719468;
    let era   = (if (d >= 0) { d } else { d - 146096 }) / 146097;
    let doe   = d - era * 146097;
    let yoe   = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y     = yoe + era * 400;
    let doy   = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp    = (5 * doy + 2) / 153;
    let day   = doy - (153 * mp + 2) / 5 + 1;
    let month = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year  = if (month <= 2) { y + 1 } else { y };
    let pad2  = func(n : Int) : Text = if (n < 10) { "0" # n.toText() } else { n.toText() };
    year.toText() # "-" # pad2(month) # "-" # pad2(day);
  };

  // Per-student absence / tardy counts (out of 20 school days) chosen to
  // reproduce the rates the frontend shows. Index 0 unused (ids are 1-based).
  let absentCounts : [Nat] = [0, 1, 4, 2, 0, 3, 0, 2, 2, 1];
  let tardyCounts  : [Nat] = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

  // idx 0 = most-recent school day. Recent absences => "declining" trend.
  func statusFor(sid : Nat, idx : Nat) : Types.AttendanceStatus {
    let a = if (sid < absentCounts.size()) absentCounts[sid] else 2;
    let t = if (sid < tardyCounts.size())  tardyCounts[sid]  else 0;
    if (idx < a) { #absent }
    else if (idx < a + t) { #tardy }
    else { #present };
  };

  public func seed(seedState : SeedState) : () {
    var nextId = seedState.nextAttendanceId;
    let att = seedState.attendance;

    // Clear prior demo attendance (idempotent re-seed).
    let toRemove = do {
      var ids : [Types.AttendanceId] = [];
      for ((id, r) in att.entries()) {
        if (r.isDemoData) { ids := ids.concat([id]) };
      };
      ids;
    };
    for (id in toRemove.vals()) { att.remove(id) };

    let dayNs : Int = 86_400_000_000_000;
    let today : Int = Time.now() / dayNs;

    // Walk backward from today, collecting 20 weekdays (skip Sat/Sun).
    for (sid in [1, 2, 3, 4, 5, 6, 7, 8, 9].vals()) {
      var collected : Nat = 0;
      var offset : Int = 0;
      label days while (collected < 20 and offset < 45) {
        let dayNum = today - offset;
        // 1970-01-01 was a Thursday: dow 0=Sun .. 6=Sat
        let dow = ((dayNum + 4) % 7 + 7) % 7;
        if (dow != 0 and dow != 6) {
          let dateStr = intToDate(dayNum * dayNs);
          let status  = statusFor(sid, collected);
          let rec : Types.AttendanceRecord = {
            id         = nextId;
            studentId  = sid;
            courseId   = 1;
            date       = dateStr;
            period     = ?"1";
            status     = status;
            markedBy   = 1;
            isDemoData = true;
          };
          att.add(nextId, rec);
          nextId += 1;
          collected += 1;
        };
        offset += 1;
      };
    };
  };
};
