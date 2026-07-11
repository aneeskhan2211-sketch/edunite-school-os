# EdUnite OS — North Star

**Type:** market  

EdUnite OS is a K-12 school operating system: a Student Information System plus a light LMS, built on the thesis that **every fact about a student lives in one connected, self-aware model, surfaced role by role**. On top of the records sits an "understanding layer" — computed signals, commitments, and MTSS early-warning tiers — that tells each role what needs them today rather than making them dig. It is for the people who run a school day: teachers, counsellors, principals, parents, and students at the core, with eleven further administrative and specialist roles supported around them. A public scroll-snap marketing landing page fronts the role-based dashboard app. Built and hosted on Caffeine (Internet Computer): a single Motoko backend canister plus a React/TypeScript frontend canister.

## Core principles
- **One connected truth.** A single canonical student model (canonical cast: students 1–9, staff 1–10) feeds every module and role; no module invents its own version of a student.
- **Trustworthy or honest about it.** Every figure shown is real canister data or an explicit empty/loading/error state — never silent demo data masking a failure.
- **Role-by-role, calm presentation.** Sidebar-led, no top header; each role sees a frequency-ordered surface of only what concerns it.
- **Understanding over raw records.** Layered "understood summaries," trajectory indicators, urgency tiers, severity gradients, signal semantics — always legible at a glance, never colour alone (WCAG 2.1 AA).
- **One data seam, one auth seam.** All frontend data flows through `useBackend.ts`; all identity flows through `lib/roleContext.ts`, so real auth is a near-single-file flip.
- **Calm, restrained design.** Deep purple sidebar, near-white content, minimal shadows, opacity-only motion, no modals/overlays/horizontal-scroll.

## User roles (16)
Core five (end-to-end on real data): **Teacher, Counsellor, Principal, Parent, Student.**
Supporting eleven: Co-Teacher, School Admin, Department Head, District Admin, SPED Coordinator, Curriculum Coordinator, Substitute — plus Staff Room / Extracurriculars surfaces. A public landing page and a dev role-switcher sit outside the role set.

## Scope — the six-module spine (the product core)
1. **Student Profile / SIS** — record, GPA, trajectory, special-population flags, guardians, counsellor/SPED assignment.
2. **Gradebook** — categories & weights, editable score grid, letter grades, GPA flow.
3. **Attendance** — records, 30-day pattern, chronic-absence flag, attendance rate.
4. **Behaviour** — incident logging, severity 1–5, routing, status timeline, FERPA role visibility.
5. **Commitments** — owner/student commitments with urgency tiers, create/complete/transition.
6. **Understanding Signals** — opportunity/risk/workload/celebration/pattern/continuity/commitment, computed server-side ("Morning Picture," "What needs you today").

## Built beyond the spine (live on real data per latest notes)
Messaging + notifications; full scheduling (rosters + timetable via migration) with an AI auto-scheduler, room assignment, and conflict detector ("Schedule Health"); report-card / transcript PDFs (browser Save-as-PDF); MTSS / early-warning tiers 1/2/3; curated community feed (announcements + celebrations); counsellor caseload/interventions/appointments; SPED compliance; district KPIs.

## Settled product direction
- **Sequencing:** Phase 0 (UX foundations) and Phase 1 (six-module spine) complete. Phase 2 (breadth + new features) active and well advanced. Phases 3–5 ahead.
- **Authentication is deliberately built last** (Phase 3): real Internet Identity login, principal→user→role mapping, and server-side least-access enforcement, replacing the current client-side `roleStore` toggle and client-supplied `RoleContext`. Highest-value remaining gap.
- **MVP target:** the six core modules, real and secure, for the five core roles, on one canonical dataset, with honest states and PDF report output. The other 11 roles stay available but are explicitly post-MVP.
- **Phase 4 hardening (deferred, non-blocking):** backend secondary indexes, splitting the 4,256-line `useBackend.ts`, pagination/virtualization, unit tests, a11y + Spanish localization, one-canonical-dataset cleanup, dead-dependency removal.

## Open items & decisions (for the owner)
- **Folder version drift is now resolved** by the June cleanup: the canonical app is this folder (`edunite-os`, formerly `edunite-os-latest`); the older copy was archived. If any doc still pins `@caffeineai/core-infrastructure ^0.3.0`, treat `^1.0.0` here as correct.
- Stale-doc lag: `FEATURES.md` and `MVP.md` are one draft cycle behind the roadmap on PDFs, scheduling, and MTSS (all now shipped) — refresh those rows when convenient.

## Doc map (canonical references)
- **PROJECT_NOTES.md** — onboarding overview, stack, data-layer mechanics, conventions, current checkpoint. (Primary.)
- **ROADMAP.md** — phased plan and status (newest planning doc).
- **FEATURES.md** — full feature inventory with data-state legend (refresh stale rows).
- **MVP.md** — MVP definition, acceptance criteria, out-of-scope.
- **DESIGN.md** — design brief: tone, colour tokens, typography, module surfaces, component patterns.
- **AGENTS.md** — agent workflow, verified commands, deploy learnings.

---
_Created 2026-06-22 by consolidating the docs. Stale-vs-current conflicts resolved toward ROADMAP/PROJECT_NOTES; the two `*_AUDIT.md` snapshots + stray `_tmp_10_*` artifacts removed (recoverable via git)._
