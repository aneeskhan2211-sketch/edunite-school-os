// Demo data is seeded server-side in main.mo's postupgrade() on every deploy.
// The previously-public seedLincolnHighData / resetDemoData / seedGradebookDemo
// endpoints were removed: they were world-callable, unauthenticated mutations
// that could wipe or overwrite the canonical dataset (and seedLincolnHighData
// injected a conflicting alternate cast). Only the read-only flag remains.

mixin (
  state : { var isDemoDataLoaded : Bool },
) {

  public query func isDemoDataLoaded() : async Bool {
    state.isDemoDataLoaded
  };

};
