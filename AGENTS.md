# Project Guidance

> **Design rules:** follow the canonical ecosystem design doc — `design-system/DESIGN-PREFERENCES.md` (repo root). Applies to all apps; additive, judgment-based (see its "Intelligence — apps should be smart" + Guardrail).

## User Preferences

See `../../WORKING-PREFERENCES.md` for the full canonical working preferences (how Michael works). Key points:

- **Workflow:** develop locally, push with the Caffeine CLI; keep git updated.
- **Communication:** concise; end messages with a short summary + lettered options (a/b/c), one marked Recommended.
- **Operate:** flag refactors proactively; test against the draft URL below and report findings.
- **Publish:** if you can run the Caffeine CLI, publish the change yourself (`caffeine check --fix` then `caffeine preview --build`, using an absolute `--project` path) and notify me when the draft has updated — **always include the draft URL so I can click through and check it**; if you can't run the CLI, paste those commands for me to run.
- **Design system:** build on **shadcn/ui** (Radix + tokens) as the standard -- compose every page from shadcn components + design tokens; never hand-roll page markup with raw divs/ad-hoc Tailwind (importing a component here and there isn't enough; the page must be built from the system).
- **Page layout:** every page sits in one shared layout wrapper (owns padding, rhythm, centering) with width as a few named variants (narrow/default/wide/full); pages don't hardcode their own max-w-* or containers.
- **Source of truth:** `NORTH-STAR.md` = what this app is (direction); the build/status doc = status; audits/reviews are dated, disposable snapshots in `docs/`, never a competing source of truth.

**Draft URL (test target):** https://native-orange-ruk-draft.caffeine.xyz

- **Workflow:** we develop locally on the user's Mac. App lives at `~/Desktop/caffeine-apps/families/edunite/edunite-os` (the EdUnite family hub).
- **Deploy code box (every ready change):** end the message with ONE copy-paste code box that builds + deploys (Caffeine CLI) + saves to git, in as few steps as possible, always including the project path. The code box must be the **very last thing** in the message. Tell the user what to paste back to confirm.
- **Summary + decisions:** end every message with a plain-language summary; list any decisions as a short lettered list (a, b, c…). Put the summary/decisions **just above** the deploy code box so the box stays last.
- **Testing:** periodically open the app in the browser, click through real user flows, take screenshots, and give honest feedback (what works, what's rough, what to fix first).
- **Git:** this project has its own local git repo; commit after each deployed change.

## Session handoff
_Read this first; update it last. One driver per app at a time — don't run another agent on this app while one is active._

**Last session:** 2026-06-22 — full app review + P0/P1 (uncommitted-by-me; folded into the "Move into family folder" reorg commit, tree clean).
- **What changed:**
  - **P0 (docs):** reconciled all docs with a 4-part review — ROADMAP now has a "Reality check" + P0–P4 forward plan; corrected mis-marked status (community feed/CSV/PDF/MTSS shipped; SIS spine reads still demo); fixed dead deploy path, `useBackend.ts` size (4,256), migration count (9); flagged the 16-vs-12 role-count conflict. MVP/FEATURES data-state rows corrected.
  - **P1 (code — make core spine real):** backend `getStudentFullRecord` now calls the real `StudentsLib` fn (real attendance/behaviour/commitments/signals; GPA/trajectory null from unseeded legacy `grades`). Added `Gradebook.computeStudentGPA` (V2 4.0-scale) + `pctToGpaPoints`, a `StudentRosterRow` type, and a new `getStudentRoster(ctx)` query in `gradebook-api.mo` (injected `attendance`). Frontend: `useStudents` → `getStudentRoster`, `useStudent` → real `getStudent`, with full record→`Student` mappers. `caffeine check` passes.
- **Then (verified on draft):** roster shows 9 real students w/ real attendance; profile loads (fixed 404 via roster fallback in `useStudent`); GPA shows "—" when no V2 gradebook data (honest). Diego 3.0 vs Jordan/Maya/Tyler 0.0 = two-casts-collide (P1.3).
- **P2+ (design system + insight layer) — DONE this session, draft 88:** added missing semantic tokens `--success/--warning/--info` (index.css light+dark + tailwind.config — `text-success`/`text-warning` now resolve). New tokenized insight kit `components/ui/insight.tsx` (`InsightBanner`, `MetricCard`, `DistributionBar`, `PriorityList`; never colour alone). Redesigned **teacher Today** + **principal Morning Picture** on real data — the principal page previously had fabricated deltas/sparklines/fake "decisions"; now all figures are computed from roster + incidents + signals.
- **Core-five dashboards all on the insight kit (draft 89):** teacher Today, principal Morning Picture, counsellor Caseload (insight header added above the working follow-up list), student Today (full redesign, real self data — dropped demo `useGradebook` + raw gray palette), parent Children (replaced hardcoded `CHILD_ENRICHMENT` fiction + raw palette with real child GPA/attendance/grades).
- **Shared colour authorities tokenized (draft 90):** `StatusBadge`, `TrendIndicator`, `ui/badge` semantic variants now use `--success/--warning/--info/--destructive` instead of raw palette (emerald/amber/sky/green-600). Propagates consistent dark-mode colour everywhere those are used.
- **Palette sweep complete (draft 91):** ~60 raw-palette usages across ~29 pages converted to semantic tokens (5 parallel agents); LandingPage brand purple hex → named fixed `brand-{deep,darker,mid,light}` tokens (tailwind). Added `scripts/check-tokens.mjs` + `pnpm verify:tokens` guard (bans raw palette/hex in pages/+components/, passes clean; allows the intentional avatar identity arrays in StudentAvatar/StaffRoom). Token system is now genuinely the source of truth.
- **shadcn/ui-throughout migration — DONE (Phases 0–4, drafts 92–95):** (0) `PageLayout` width variants narrow/`default=max-w-6xl`/wide/full + `mx-auto`; `SectionCard` on shadcn `Card`; removed duplicate `components/Button.tsx`+`Badge.tsx`; assigned width=wide/full to ~22 data pages. (1) all native `<input>/<select>/<textarea>/<checkbox>` → shadcn across ~18 files. (2) all 15 raw `<table>` → shadcn `Table`. (3) ~40 bare `<button>` → shadcn `Button` (≈13 whole-card/row buttons left native by design). (4) added `pnpm verify:ui` guard (bans native table/select/input/textarea in pages) + `pnpm verify` (tokens+ui); both pass. Insight kit kept as tokenized system primitives (MetricCard's muted surface is an intentional metric pattern, not a raised Card). Fixed the `text-coral` bare-attribute bug in student/Assignments (still present elsewhere e.g. counsellor/Caseload list link, teacher StudentProfile/ClassDetail — quick follow-up).
- **/code-review fixes (draft 97-99):** fixed status-Select-inside-`<a>` navigation hijack (teacher/Behaviour, wrapped in stopPropagation span), index-as-identity edit bug (sped/Compliance resets editingRow on filter change), lost form validation (counsellor/Interventions guards empty studentId). Tightened both guards (check-ui multiline tag detection; check-tokens 3/8-digit hex + arbitrary literal colours) and **wired `pnpm verify` into `prebuild` so every build gates**. SectionCard restored to block flow + title mb-4 (dropped the Card flex gap-4 spacing change). parent/Attendance calendar now has a non-colour cue (T/A letter + aria-label).
- **P1.3 finding + hardening (draft 100):** GPA is ALREADY real for all 9 (gradebook seeded students 1-9 across classes 1-3 every postupgrade — the early 0.0/— was stale, NOT a cast collision). Removed the 3 unused world-callable seed/reset endpoints (`seedLincolnHighData`/`resetDemoData`/`seedGradebookDemo`) + deleted `lib/SeedData.mo` (conflicting cast). SeedMixin slimmed to `isDemoDataLoaded()`.
- **Phase 3 auth — Increment 1 DONE (draft 101), frontend-only/additive:** real Internet Identity sign-in/out via `components/layout/AuthControl.tsx` (`useInternetIdentity()` from `@caffeineai/core-infrastructure` → `login`/`clear`/`identity`/`isAuthenticated`; shows the authenticated principal), added to the sidebar footer above the role control. Dev role-switcher header reframed `Dev Preview` → `View as · demo`. **No enforcement yet** — the app still uses the client-chosen role (`roleStore`).
  - **Design (named): principal-based RBAC.** II = authentication (principal per user); server-side **principal→account→role registry** = authorization; **first-registered principal = super-admin** bootstrap; admin provisions others (optionally invite codes); the "View as" becomes **admin-only impersonation**.
  - **Increment 2 (the real security work — NOT started; do as a focused pass):** (1) state **migration** adding the principal→account→role stable map (mirror the whole actor state — template `migrations/20260620_140000_AddScheduling.mo`); (2) `auth-api.mo` mixin: `whoami()`/`register`/`getMyContext` deriving from `caller`, first-admin bootstrap, admin `assignRole`; (3) rewrite endpoints to derive ctx from the registry (`caller`) and **drop the trusted client `RoleContext` arg**; close still-open SPED/counsellor/messaging + self-granting `createStudent`/`updateStudent`; (4) flip `lib/roleContext.ts`/`roleStore` to the authenticated identity; gate "View as" to verified admins. The `lib/roleContext.ts` seam is the single frontend flip-point.
- **Where I left off:** Deployed — **draft Version 101**. Tree clean. Run `pnpm verify` before deploys (also auto-runs in prebuild).
- **Other open items:** browser-verify (no browser connected all session): form selects (counsellor Caseload, teacher Behaviour status change), tables (school-admin Timetables, teacher Gradebook), dashboards light+dark, and the Increment-1 sign-in flow. P1.2 (wire `useAttendance`/`useGradebook` top-level hooks); perf (batch profile's ~6 calls); insight kit on district/department dashboards; remaining `text-coral` bare-attribute bugs (counsellor/Caseload list link etc.). GPA is already real for all 9 (not a gap).

## Verified Commands

**Frontend** (run from `src/frontend/`):

- **install**: `pnpm install --prefer-offline`
- **typecheck**: `pnpm typecheck`
- **lint fix**: `pnpm fix`
- **build**: `pnpm build`
- **design guards**: `pnpm verify` (runs `verify:tokens` + `verify:ui`) — fails on raw
  Tailwind palette/hex colours, or native `<table>/<select>/<input>/<textarea>`, in
  `pages/`. Wired into `prebuild`, so **every `pnpm build` (incl. `caffeine preview
  --build`) gates on it** — a guard failure blocks the deploy.

**Backend** (run from `src/backend/`):

- **install**: `mops install`
- **typecheck**: `mops check --fix`
- **build**: `mops build`

**Backend and frontend integration** (run from root):

- **generate bindings**: `pnpm bindgen` This step is necessary to ensure the frontend can call the backend methods.

## Learnings

**Deploy flow:** `caffeine check --project <path>` then `caffeine preview --build --project <path>`. Each push creates a new draft version. Check is local + reliable; the upload step is the flaky part.

**CLI gotchas:**
- `404 Project not found` on upload = the **CLI login expired** → run `caffeine auth login`, then retry the build. (The MCP/account auth is separate and stays valid — don't be misled.)
- Occasional `504` on upload = transient; just retry the build (the build is cached). The server often completes even after the gateway times out — check project status before assuming failure.
- **biome is strict about formatting.** Preferred flow: **`caffeine check --fix`** auto-applies biome's safe fixes (formatting, import order) — use it to avoid manual formatting round-trips. If something isn't auto-fixed, match biome's printed output by hand.

**Backend (Motoko):**
- Single `actor` in `main.mo` + ~20 mixins; real demo data is loaded by **seeds called in `postupgrade()`** (run on every deploy). Canonical cast: students 1–9, staff 1–10.
- **Adding new stable state requires a new migration** in `src/backend/migrations/` that mirrors the entire actor state plus the new fields (template: `20260620_140000_AddScheduling.mo`). Seeds that only populate existing maps need no migration.

**Frontend:** all data access via `src/frontend/src/hooks/useBackend.ts` → `window.__ACTOR__` (raw Candid actor, set by `ActorBridge` in `App.tsx`). Demo-fallback pattern with dev warnings (`lib/devLog.ts`). Use `lib/toNat.ts` for ids, `lib/roleContext.ts` (auth seam) for `RoleContext`, `lib/candid.ts` for optionals/variants.

**Auth status:** not yet wired — role is a client-side toggle (`store/roleStore.ts`); real Internet Identity auth is deliberately the last phase.

See `PROJECT_NOTES.md` for the full onboarding overview and `ROADMAP.md` for status.
