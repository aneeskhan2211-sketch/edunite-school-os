# EdUnite OS — Project Notes

_Onboarding notes so any Claude account (or person) can get up to speed fast. Last updated: 21 June 2026._

## What this app is
**EdUnite OS** — a K-12 school management platform (a Student Information System + light LMS). Its thesis: *one connected model of each student, surfaced role-by-role*, with an "understanding layer" (signals, commitments, MTSS early-warning) on top. 16 roles (teacher, counsellor, principal, parent, student, SPED, district admin, etc.), ~66 pages.

## Where it lives & how it's hosted
- **Local folder:** `~/Desktop/caffeine-apps/market/edunite-os`
- **Platform:** [Caffeine](https://caffeine.ai) → hosts the app on the **Internet Computer**.
- **Caffeine project:** id `019eb489-5e65-728a-bba5-e912ba51e302`, name "EdUnite OS" (see `caffeine.toml`).
- **Live draft URL:** https://native-orange-ruk-draft.caffeine.xyz
- We edit code locally; `caffeine preview --build` pushes a new **draft** to Caffeine. There is no plain `localhost` run (it needs the IC backend) — "running it" means opening the deployed draft URL.

## Stack
- **Backend:** Motoko — a single `actor` (`src/backend/main.mo`) composed of ~20 domain **mixins** (`src/backend/mixins/*-api.mo`), domain logic in `src/backend/lib/`, types in `src/backend/types/` (`common.mo` is the main one), and a **migration chain** in `src/backend/migrations/`.
- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui, **TanStack Router** + **TanStack Query**. Formatter/linter: **biome** (strict).
- **Package manager:** pnpm (driven by the Caffeine CLI).

## How the data layer works (important)
- All frontend data access goes through **`src/frontend/src/hooks/useBackend.ts`** (4,256 lines).
- ⚠️ **The core SIS read hooks are NOT wired to the backend.** `useStudents`, `useStudent`, `useStudentProfile`, `useAttendance`, `useGradebook`, `useGradebookSummary`, `useAttendanceRoster` return hard-coded demo via a `makeQuery` helper (no actor call). Real backend methods exist (`listStudents`, `getStudentFullRecord`, …). Wiring these is the open MVP gap (P1 in ROADMAP).
- `App.tsx`'s `ActorBridge` puts the **raw Candid actor** on `window.__ACTOR__`; every hook reads it via `getActor()`.
- **Demo-fallback pattern:** each wired hook tries the canister and falls back to hard-coded demo data on error (with a dev-only warning via `lib/devLog.ts` `demoFallback`). So a broken call shows plausible demo data — use the dev console to spot fallbacks.
- **Real data comes from seeds** that run in `main.mo`'s `postupgrade()` on every deploy: `StudentSeed, StaffSeed, CourseSeed, GradebookSeed, AttendanceSeed, BehaviourSeed, CommitmentSeed, NotificationSeed, MessagingSeed, ScheduleSeed, CounsellorSeed, SpedSeed, AnnouncementSeed`.
- **Canonical demo cast:** students `1–9` (Jordan, Maya, Tyler, …), staff `1–10` (teacher=1, principal=5, counsellor=7, sped=8). Keep new data consistent with these.

## Key conventions / seams
- `lib/toNat.ts` — converts string ids ("s2","c1","staff-7") → backend `Nat`. Always use it for ids.
- `lib/roleContext.ts` — **the auth seam**. Builds the backend `RoleContext`. When real auth lands, only this file changes.
- `lib/candid.ts` — `opt()` / `unwrapOpt()` / `variantKey()` / `nsToISODate()` for the raw Candid actor (optionals are `[]`/`[v]`, not `null`).
- `config/navigation.ts` — per-role sidebar items. `router/index.tsx` — routes (lazy-loaded; `makeRoute` helper).

## Build / deploy / quirks
- Deploy = `caffeine check` then `caffeine preview --build` (always with `--project ~/Desktop/caffeine-apps/market/edunite-os`). Each push creates a new draft version.
- **biome is strict about formatting.** Standard flow is **`caffeine check --fix`** — it auto-applies biome's safe formatting + import-order fixes, avoiding manual nits. If a check error isn't auto-fixed, match biome's printed output by hand.
- **`404 Project not found` on upload = the CLI login expired.** Run `caffeine auth login`, then retry the build. (Separate from the occasional transient `504`, which you just retry.)
- **Adding new stable backend state requires a new migration** in `src/backend/migrations/` that mirrors the *entire* actor state plus the new fields (see `20260620_140000_AddScheduling.mo` as the template). Seeds (populating existing maps) do **not** need a migration.

## Where things stand (checkpoint: 21 Jun 2026, ~draft 83)
See **`ROADMAP.md`** (phases + milestones + the 22 Jun review reality-check and P0–P4 forward plan) and **`FEATURES.md`** (full inventory). _(The two `*_AUDIT.md` snapshots were folded into the docs and removed in the June cleanup.)_

**Built & live on real data:**
- Behaviour, commitments, understanding signals (wired to real backend); gradebook per-class hooks. ⚠️ **Caveat:** the SIS student list/profile and top-level attendance/gradebook *read hooks* still return demo (see "How the data layer works" and Known issues) — the backend is real, the frontend wiring is the gap.
- Messaging + notifications; staff/courses/students seeded on backend.
- Full **scheduling** (rosters + timetable via migration) + **AI auto-scheduler** (conflict-free period+room assignment) + conflict detector.
- **Report-card / transcript PDFs** (browser "Save as PDF", print-isolated).
- **MTSS / early-warning** (tier 1/2/3 per student from attendance+behaviour+grades).
- **Curated community feed** (announcements + celebrations).
- Counsellor (caseload + interventions + appointments), SPED compliance, district KPIs.

**What's left, in priority order:**
1. **Make the core SIS spine real (P1, the actual MVP gap)** — make `getStudentFullRecord` compute real GPA/attendance/signals (inject the gradebook+attendance maps), optionally add a roster endpoint, and wire `useStudents`/`useStudent`/`useStudentProfile`/`useAttendance`/`useGradebook` to the backend. Make failures honest (no silent demo masking).
2. **Auth + server-side authorization (P3)** — `store/roleStore.ts` is a client toggle and the backend trusts a client-supplied `RoleContext`; SPED/counsellor/messaging endpoints have no role gating. Not secure; blocks a real pilot. Bigger than "one file" (see Known issues).
3. **Finish breadth wiring:** extracurriculars, staff room, conferences, curriculum, IEP-caseload page.
4. **Surface latent backends:** student audit/access log + assignment submissions (both exist on backend).
5. **Depth:** gradebook category UI; attendance-taking/behaviour/commitment write workflows; behaviour discipline pipeline + PBIS; document vault; global search; CSV export + email.
6. **Hardening/scale:** backend indexes (reads currently scan whole maps); split `useBackend.ts`; pagination; tests; a11y + Spanish; remove dead deps; one-canonical-dataset cleanup.
7. **Go-live:** promote draft → live, custom domain, cross-role end-to-end verification.

**Known issues / tricky bits:**
- **Whole SIS spine reads demo, not just the list.** `useStudents`/`useStudent`/`useStudentProfile`/`useAttendance`/`useGradebook`/`useGradebookSummary`/`useAttendanceRoster` return demo via `makeQuery` — no canister call at all. `listStudents` returns real `Student` records (no GPA/attendance fields); `getStudentFullRecord` has the right shape but returns GPA `null` / attendanceRate `0.0` because the gradebook+attendance maps aren't injected into `students-api.mo`. This is the P1 gap.
- **No single mixin has both gradebook-V2 (scores) AND attendance maps**, which is why a one-call roster endpoint (per-student GPA+attendance) isn't trivial — it needs a mixin/include wired with both (per-student calls would fire ~10 canister calls per list page — too heavy).
- **Auth deferred last** by choice. The `lib/roleContext.ts` seam is the design intent, but the flip is NOT one file: it also swaps `roleStore`'s data source, threads ctx through ~30 hooks (only 3 do today), and requires server-side enforcement on currently-open endpoints.
- Deploy quirks: `404` on upload = `caffeine auth login`; `504` = retry; use `caffeine check --fix` for auto-formatting.

## Other docs in this folder
`NORTH-STAR.md` (what the app is — direction), `ROADMAP.md` (status + forward plan), `FEATURES.md`, `MVP.md`, `DESIGN.md`, `AGENTS.md` (agent guidance + verified commands + learnings).
