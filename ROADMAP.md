# EdUnite OS — Roadmap

_Last updated: 22 June 2026 · Draft 81 · Status doc (canonical for status + forward plan)_

Phased plan from current state to a trustworthy product. See `MVP.md` for the MVP definition, `FEATURES.md` for the inventory, `DESIGN.md` for the design brief. Legend: ✅ done · 🔄 in progress · ⏳ pending · ⚠️ marked done but not actually real.

---

## ⚠️ Reality check (22 June 2026 full-app review)

A four-part review (backend / data-layer / UI / docs-vs-reality) found the app is **broader than the docs claimed but weaker at its foundation**:

- **The core SIS spine reads demo data, not the backend.** `useStudents`, `useStudent`, `useStudentProfile`, `useAttendance`, `useGradebook`, `useGradebookSummary`, `useAttendanceRoster` return hard-coded `DEMO_*` constants via a `makeQuery` helper (`hooks/useBackend.ts:2072-2189`) — **no actor call, no loading/error state** — even though real backend methods exist. The MVP promise ("six modules real for five core roles") and the "trustworthy or honest about it" principle are **not** met at the foundation.
- **`getStudentFullRecord` returns zeroed cross-domain data** (GPA `null`, attendanceRate `0.0`, empty signals) because the gradebook/attendance maps aren't injected into `students-api.mo:64-83` — it *looks* real but isn't.
- **Two canonical student casts collide.** `StudentSeed.mo` (ids 1–9, authoritative, runs every postupgrade) vs `SeedData.mo` (ids 1–20+, different cast/staff) reachable via the **public unauthenticated** `seedLincolnHighData()`.
- **The design token system is entirely unused.** ~70 OKLCH tokens + ~50 CSS classes in `index.css` are referenced by **zero** app files; ~190 raw Tailwind palette colors are scattered across pages and even the shared color components. The owner's #1 design rule is violated at the root.
- **The "single-file auth flip" is optimistic.** Real auth touches `roleContext.ts` + `roleStore` source + ctx-threading through ~30 hooks + closing wide-open SPED/counsellor/messaging endpoints.
- **Several "done" items are mis-marked both ways** — see corrections below.

The forward plan (P0–P4) at the bottom supersedes the old phase ordering.

---

## Phase 0 — Foundations & UX ✅
- Sidebar-led navigation; roles / pages (count under review — see open item)
- Student detail view + sub-tabs
- Dashboard information-density pass
- Loading skeletons + root/route error boundaries
- Public scroll-snap landing page
- Purple/coral theme system

## Phase 1 — Core data spine (the six modules)
Backend + UI built; **front-end wiring of the core reads is the open MVP gap** (see Reality check).
- ✅ Gradebook backend (categories/weights → letter grades & GPA) — real per-class hooks (`useClassGradebook`) wired
- ⚠️ Student records / SIS — backend real, but `useStudents`/`useStudent`/`useStudentProfile` read demo
- ⚠️ Attendance — backend real, `useAttendancePattern` wired, but `useAttendance`/`useAttendanceRoster` read demo
- ✅ Behaviour (incidents, severity, routing, FERPA visibility)
- ✅ Commitments (urgency tiers, create/complete)
- ✅ Understanding signals (computed server-side; wired via `listSignalsByRole`)
- ✅ Reusable seams: actor bridge, `toNat` ids, `RoleContext`, Candid helpers, dev fallback warning
- ✅ Performance + scroll fixes

## Phase 2 — Breadth + new features 🔄

### 2A — wire existing modules to real data
- ✅ Messaging + notifications
- ✅ Staff / courses / students seeded on backend
- ✅ Counsellor (caseload + interventions + appointments)
- ✅ SPED compliance
- ✅ District KPIs
- ⏳ Extracurriculars · staff room · conferences · curriculum · IEP-caseload page
- 🔄 Finish id-conversion sweep + crash hardening

### 2B — new features
- ✅ Scheduling: rosters + timetable (via migration)
- ✅ Student + admin schedule views
- ✅ Conflict detector ("Schedule Health")
- ✅ AI-aided auto-scheduler + room assignment
- ✅ Report-card / transcript PDFs (real data, Save-as-PDF)
- ✅ MTSS / early-warning (tiers 1/2/3 from attendance + behaviour + grades)
- ✅ Curated community feed (announcements + celebrations) — *was 🔄; wired to real `getAnnouncements` + celebration signals*
- ✅ CSV exports — *was ⏳; `exportAttendanceCSV`/`exportGradebookCSV`/`exportClassReport` real and surfaced in teacher/admin/district pages*
- 🔄 Teacher schedule view — *backend `getTeacherSchedule` + `useTeacherSchedule` done; no page consumes it yet*
- ⏳ School calendar / terms (not started — `term` is only a query param today)
- ⏳ Surface latent backends: student audit log + assignment submissions (both backend-only, no frontend)
- ⏳ Document vault + global search (not started; only the shadcn `command` primitive exists)
- ⏳ Behaviour depth: discipline pipeline + PBIS (marketing copy only, no workflow)
- ⏳ Email notifications (in-app notifications are real; no email sending)

## Phase 3 — Security ⏳ (deliberately last, but scoped bigger than "one file")
- Real Internet Identity login
- Map principal → user + role **server-side**; stop trusting client-supplied `RoleContext`
- Close currently-open endpoints: SPED/counsellor have zero role gating; messaging inboxes readable by anyone; `createStudent`/`updateStudent` self-grant `#schoolAdmin`; `getStudentAuditTrail` hardcodes `#teacher`
- Swap `roleStore` data source from the dev toggle to the authenticated identity
- Thread ctx through the ~30 hooks that need it (only 3 do today); fix the hardcoded `role:"teacher"` in `useLogIncident` and the inconsistent ctx encoding

## Phase 4 — Hardening & scale ⏳
- Backend secondary indexes / date-bounded queries (reads are uniformly O(n) full-map scans; conflict detector is O(n²))
- Split the **4,256-line** `useBackend.ts` by domain (extract `_demo/` + `_shared.ts` first — removes ~2,000 lines with zero logic change)
- Pagination / virtualization for large lists
- Unit tests for `lib/*` + frontend mappers
- Accessibility (fix colour-only signals) + Spanish localization
- One canonical dataset (delete/subsume `SeedData.mo`; gate seeding behind `isDemoDataLoaded`)
- Remove dead deps: `three` + `@react-three/*` and `react-quill-new` (zero imports)
- Unify the conference/extracurricular/staffroom `Text` ids onto the canonical `Nat` ids

## Phase 5 — Go-live ⏳
- Promote draft → live + custom domain
- Full cross-role end-to-end verification
- Production seed / backup strategy

---

## Forward plan (P0–P4) — supersedes the old ordering

Derived from the 22 June review. Rationale: make the core **real** before adding breadth or wiring auth.

### P0 — Reconcile the truth ✅ (this pass)
Fixed the dead deploy path (`edunite-os-latest` → `market/edunite-os`), corrected `useBackend.ts` line count (4,256), migration count (9), stale "done"/"not done" rows, and dangling `*_AUDIT.md` references. Flagged the role-count conflict (see open item).

### P1 — Make the core spine real (the actual MVP gap)
1. Make `getStudentFullRecord` compute real GPA / attendance / signals (inject gradebook + attendance + behaviour maps into the mixin, or assemble in a mixin that already has them).
2. Optionally add a real roster endpoint that returns students with computed GPA + attendance in one call (the per-student-call fan-out is too heavy — see PROJECT_NOTES known issue).
3. Wire `useStudents` → `listStudents`, `useStudent`/`useStudentProfile` → `getStudentFullRecord`, `useAttendance`/`useGradebook` → their real endpoints.
4. Make failures honest: stop `demoFallback` (and "empty array → demo") from masking real errors/empties on core-role core modules; expose real loading/empty/error states.
5. Collapse to one canonical cast: delete or subsume `SeedData.mo`; secure/remove the public `seedLincolnHighData`/`seedGradebookDemo` endpoints; fix the `nextAssignmentV2Id` mis-wiring.

### P2 — Revive or kill the design token layer
Fix the three colour authorities (`StatusBadge`, `Badge`, `TrendIndicator`) to use tokens; sweep ~190 raw palette colours in pages onto tokens; add a lint guard banning bare `*-{color}-NNN` in `pages/`; fix colour-only a11y signals; reconcile `DESIGN.md` (coral accent, message-bubble tokens, no-horizontal-scroll) with reality.

### P3 — Auth (Phase 3), correctly scoped
As Phase 3 above — now that there's real data to protect.

### P4 — Cleanup / hardening
As Phase 4 above — dead deps, `useBackend.ts` split, secondary indexes, latent-backend surfacing.

---

## Open items for the owner
- **Role count conflict (16 vs 12):** NORTH-STAR/PROJECT_NOTES/FEATURES/MVP say "16 roles"; `project.json` and `config/navigation.ts` (`ROLE_LABELS`) define **12**. The "16" appears to count the public landing page + dev switcher + Staff Room / Extracurriculars surfaces as pseudo-roles. **Decide the canonical number** and align all docs — not silently resolved.

---
**Status:** Phases 0–1 mostly built but the **core SIS reads are still demo** (the real MVP gap). Phase 2 breadth is well advanced (scheduling + auto-scheduler, PDFs, MTSS, community feed, CSV all shipped). Forward plan: P1 (make core real) → P2 (design tokens) → P3 (auth) → P4 (hardening).
