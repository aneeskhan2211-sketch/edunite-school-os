# EdUnite OS — MVP Definition

_Last updated: 22 June 2026 · Draft 81 (data-state table corrected in the 22 Jun review)_

## What the MVP is

A **trustworthy, real-data** version of EdUnite OS's product spine — the **six core modules** — for the **five core roles**, backed by real authentication and a single source of truth. "Trustworthy" is the operative word: every figure shown is real canister data (or an honest empty state), not demo data silently standing in for a failure.

The app already spans 16 roles and ~66 pages. The MVP is **not** about building fewer screens — most exist. It's about making a coherent core **real, secure, and honest**, and explicitly parking the long tail as post-MVP so it isn't mistaken for finished.

## The product spine — six core modules

| Module | MVP data state |
|---|---|
| Student Profile (SIS: record, GPA, trajectory) | ⚠️ Demo — `useStudents`/`useStudent`/`useStudentProfile` don't call the backend (backend is real) |
| Gradebook (categories, weights, scores → letter/GPA) | ⚠️ Mixed — per-class `useClassGradebook` real; top-level `useGradebook`/`useGradebookSummary` demo |
| Attendance (records + 30-day pattern) | ⚠️ Mixed — `useAttendancePattern` real; `useAttendance`/`useAttendanceRoster` demo |
| Behaviour (incidents, severity, routing, FERPA visibility) | ✅ Real |
| Commitments (owner/student, urgency tiers) | ✅ Real |
| Understanding Signals (opportunity/risk/etc. computed from the above) | ✅ Real — wired via `listSignalsByRole` |

> **Reality check (22 Jun 2026 review):** the table above was previously over-optimistic. Signals are now real; the SIS/attendance/gradebook *top-level read hooks* are still demo and are the open MVP gap (P1 in `ROADMAP.md`). This is the work that actually unblocks the MVP.

## Core roles in MVP

Teacher, Counsellor, Principal, Parent, Student. These five consume the six core modules end to end. The other 11 roles (District Admin, School Admin, Department Head, SPED Coordinator, Curriculum Coordinator, Co-Teacher, Substitute, plus Staff Room / Extracurriculars surfaces) remain available but are **post-MVP** for real-data + hardening.

## Definition of done (MVP acceptance criteria)

1. **Six core modules on real data** for the five core roles — reads and the primary writes (enter grades, take attendance, log/route incidents, create/complete commitments) all hit the canister.
2. **Real authentication** — Internet Identity login; the backend derives the user's identity and role from the authenticated principal, not from a client-supplied argument. Least-access enforced server-side.
3. **One canonical dataset** — students 1–9 everywhere; the unused `SeedData.mo` ("Lincoln High" cast) removed/quarantined; seeding runs once (behind `isDemoDataLoaded`), not on every upgrade.
4. **Honest states** — no silent demo fallback in dev (✅ done via `demoFallback`); every list/detail has a real loading, empty, and error state.
5. **Report output** — report cards and transcripts export to PDF from real data (the one "output" users expect to take out of the system).
6. **Stable & calm** — no refetch storms (✅ done), no console errors on the core flows, pages scroll (✅ done).

## Explicitly out of scope for MVP (post-MVP)

Curriculum authoring, full messaging threads, SPED full workflows (keep IEP read-only), extracurriculars, conference booking depth, staff-room, district analytics/benchmarks, CSV export + email notifications, Spanish localization, list pagination/virtualization at scale. These stay in the app (often as demo) but are not part of the MVP's "real & trustworthy" guarantee.

## Gap list to reach MVP (from today)

- Understanding signals computed from real data (#37).
- Real Internet Identity auth + server-derived roles/least-access (#42, #43).
- Report cards & transcripts PDF from real data (#47).
- Core-role workflow depth: gradebook category/weight UI (#44); attendance-taking, behaviour, commitment workflows (#45).
- One canonical dataset: delete/quarantine `SeedData.mo`; secure the public `seedLincolnHighData`; gate seeding behind `isDemoDataLoaded`.
- Loading/empty/error states across the core flows (#49).

Everything else (backend indexes, splitting `useBackend.ts`, dependency cleanup, tests, pagination, localization) is **post-MVP hardening** — important, but not blocking a first trustworthy release. (See `ROADMAP.md` Phase 4 / P4.)
