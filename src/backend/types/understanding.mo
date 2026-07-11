// Re-exports canonical understanding types from common.mo.
// The single source of truth is types/common.mo.
import Common "common";

module {

  public type StudentId         = Common.StudentId;
  public type SignalId          = Common.SignalId;
  public type Role              = Common.Role;
  public type SignalType        = Common.SignalType;
  public type SignalUrgency     = Common.SignalUrgency;
  public type UnderstandingSignal = Common.UnderstandingSignal;

  // ── Role-bucketed surfacing result ────────────────────────────────────
  public type SignalSurfacing = {
    critical  : [UnderstandingSignal];
    important : [UnderstandingSignal];
    info      : [UnderstandingSignal];
  };

};
