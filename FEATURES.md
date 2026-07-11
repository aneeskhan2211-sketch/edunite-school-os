# EdUnite OS — Feature Inventory

_Last updated: 22 June 2026 · Draft 81 (refreshed in the 22 Jun review — see ROADMAP reality-check)_

Data state legend: ✅ real backend data · ◑ partial (some real, some demo) · ○ demo only

---

## Roles (16)
Teacher, Co-Teacher, Student, Parent, School Admin, Department Head, Principal, District Admin, Counsellor, SPED Coordinator, Curriculum Coordinator, Substitute — plus a public landing page and a (dev) role switcher.

## Core modules — the "six-module spine"
- ⚠️ **Student Profile / SIS** — record, grade, DOB, homeroom, guardians, special-population flags, counsellor/SPED assignment, GPA & trajectory. (9 students seeded on backend, but `useStudents`/`useStudent`/`useStudentProfile` read demo — **no canister call**; `getStudentFullRecord` returns zeroed GPA/attendance. P1 gap.)
- ◑ **Gradebook** — categories & weights, editable score grid, letter grades, GPA flow. (Per-class `useClassGradebook` real; top-level `useGradebook`/`useGradebookSummary` demo.)
- ◑ **Attendance** — records, 30-day pattern, chronic-absence flag, attendance-rate. (`useAttendancePattern` real; `useAttendance`/`useAttendanceRoster` demo.)
- ✅ **Behaviour** — incident logging, severity (1–5), routing, status timeline, incident detail, FERPA role visibility.
- ✅ **Commitments** — owner/student commitments, urgency tiers, create/complete/transition.
- ✅ **Understanding Signals** — opportunity/risk/workload/celebration/pattern/continuity/commitment signals computed server-side; "Morning Picture" and "What needs you today."

## Communication
- ✅ **Messaging** — inbox, thread view, reply (persists), create thread.
- ✅ **Notifications** — bell with per-role unread counts, tiers (critical/important/info), mark-read / mark-all-read.
- ✅ **Announcements** — targeted by role; wired to real `getAnnouncements` + surfaced in the community feed.

## Student services
- ✅ **Counsellor caseload** — real per-counsellor student caseload.
- ◑ **Counsellor interventions & appointments** — UI present; interventions/appointments still demo.
- ◑ **SPED / IEP** — IEP caseload, compliance items, renewals, caseload insight (renewals derived from seeded commitments; full IEP records not yet seeded).
- ◑ **Conferences** — parent-conference slot booking + cancel (partial).

## Curriculum & instruction
- ○ **Curriculum** — courses, units, lessons, standards map (demo).
- ◑ **Co-Teacher** — shared classes, gradebook, handoff log.
- ◑ **Substitute** — today's classes, lesson plans, end-of-day report.
- ◑ **Assignments / submissions** — student assignments view; a `submissions` store exists on the backend but isn't surfaced as a full submit→grade workflow.

## Administration & analytics
- ◑ **Principal** — Morning Picture, Needs-Attention, Behaviour overview, Staff.
- ○ **School Admin** — dashboard, staff, enrolment, timetables, settings, data privacy.
- ○ **Department Head** — dashboard, department, teachers, curriculum alignment.
- ◑ **District Admin** — district dashboard, benchmarks, patterns, schools (health summary wired; rest demo).
- ○ **Extracurriculars** — activities. ○ **Staff Room** — channels & board.

## Output
- ✅ **Reports** — teacher reports + report-card/transcript **PDF** (browser "Save as PDF", print-isolated) from real data.
- ✅ **CSV export** — attendance / gradebook / class report CSV, surfaced in teacher, school-admin, and district pages.

## Platform & infrastructure
Sidebar-led navigation, notification bell, role switcher (dev auth), loading skeletons, root + per-route error boundaries, purple/coral theme, public scroll-snap landing page. Backend: single Motoko actor, 21 domain mixins, 9-step migration chain, re-runnable seeds (students, gradebook, attendance, behaviour, commitments, notifications, messaging, scheduling, counsellor, sped, announcements). Reusable seams: actor bridge, `toNat` ids, `RoleContext` (auth seam), Candid helpers, dev-visible demo-fallback warning.

## Shipped since this doc was first drafted
Scheduling/timetabling + AI auto-scheduler + conflict detector, report-card/transcript **PDFs**, **MTSS/RTI early-warning** (tiers 1/2/3), **CSV export**, curated community feed (announcements + celebrations). (Backend `getTeacherSchedule` is done but no teacher schedule *page* consumes it yet.)

## Latent (built on backend, not yet surfaced)
- **Assignment submissions** (`submissions` store — backend only, no real frontend hook).
- **Student audit log** (`studentAudits` — backend store + migration, zero frontend).

## Not built (verified absent)
School calendar / terms (only a `term` query param today), discipline pipeline + PBIS (marketing copy only), period attendance + excuse workflows, document/file vault, online enrollment & e-sign forms, global search (only the shadcn `command` primitive), email notifications. Real authentication is deliberately last (Phase 3).
