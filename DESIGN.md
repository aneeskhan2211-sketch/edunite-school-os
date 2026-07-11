# Design Brief

## Direction
EdUnite OS — K-12 school management platform where every fact about a student is held in one connected, self-aware model, surfaced role by role with calm confidence.

## Tone
Purposeful, trustworthy, restrained — a well-run school at the end of a productive day. Deep purple sidebar anchors trust; near-white content breathes clarity. The interface lowers shoulders, not raises them.

## Differentiation
Sidebar-led layout with no top header means one home for orientation; school crest in sidebar header signals institutional ownership. Six module surfaces designed for visual distinction: understood summaries atop layered records, trajectory indicators, overload warnings, behaviour timelines, commitment urgency tiers, and understanding signals — all on one connected truth.

## Color Palette

| Token | OKLCH (Light/Dark) | Role |
|-------|------|------|
| primary | 35/0.18/285 : 72/0.16/285 | Brand, links, active states |
| success | 65/0.22/140 : 75/0.22/140 | Passing grades, resolved states |
| warning | 70/0.15/85 : 75/0.15/85 | Caution, due items, incident open |
| destructive | 55/0.22/25 : 65/0.22/25 | Errors, failures, overdue |
| grade-a | 65/0.22/140 : 75/0.22/140 | Excellent (green) |
| grade-b | 75/0.18/140 : 80/0.18/140 | Good (light green) |
| grade-c | 70/0.15/85 : 75/0.15/85 | Average (amber) |
| grade-d | 65/0.19/22 : 72/0.19/22 | Below average (orange-red) |
| grade-f | 55/0.22/25 : 65/0.22/25 | Failing (red) |
| trajectory-up | 65/0.22/140 : 75/0.22/140 | Student improving |
| trajectory-down | 65/0.19/22 : 72/0.19/22 | Student slipping |
| overload | 70/0.15/85 : 75/0.15/85 | Multiple majors this week |
| high-stakes | 65/0.19/34 : 72/0.19/34 | Assignment >15% weight |
| attendance-threshold | 65/0.22/140 : 75/0.22/140 | 85% attendance reference |
| chronic-absence | 55/0.22/25 : 65/0.22/25 | Below 85%, urgent |
| severity-1 | 78/0.12/85 : 82/0.12/85 | Minor behaviour |
| severity-2 | 72/0.15/85 : 78/0.15/85 | Moderate behaviour |
| severity-3 | 68/0.16/34 : 72/0.16/34 | Notable behaviour |
| severity-4 | 62/0.18/22 : 68/0.18/22 | Serious behaviour |
| severity-5 | 52/0.22/18 : 58/0.22/18 | Critical behaviour |
| incident-open | 72/0.15/85 : 78/0.15/85 | Awaiting review |
| incident-review | 65/0.19/34 : 72/0.19/34 | Under review |
| incident-resolved | 65/0.22/140 : 75/0.22/140 | Closed |
| incident-follow-up | 65/0.19/22 : 65/0.19/22 | Follow-up pending |
| commitment-overdue | 55/0.22/25 : 65/0.22/25 | Past due |
| commitment-due-today | 70/0.15/85 : 75/0.15/85 | Due today |
| commitment-this-week | 75/0.14/102 : 80/0.14/102 | Pending this week |
| commitment-coming-soon | 50/0.01/260 : 40/0.01/260 | Future commitment |
| signal-opportunity | 65/0.22/140 : 75/0.22/140 | Student ready to stretch |
| signal-workload | 70/0.15/85 : 75/0.15/85 | Assessment/schedule clash |
| signal-risk | 55/0.22/25 : 65/0.22/25 | Student needs support |
| signal-celebration | 65/0.18/185 : 75/0.18/185 | Achievement worth noting |
| signal-pattern | 60/0.12/250 : 70/0.12/250 | Cross-school trend |
| signal-continuity | 55/0.16/285 : 65/0.16/285 | History/relationship context |
| signal-commitment | 65/0.19/34 : 72/0.19/34 | Promise coming due |
| sidebar | 14/0.02/285 : 12/0.02/285 | Deep purple/off-black |
| background | 99/0.005/260 : 14.5/0.01/260 | Content area (light/dark) |
| card | 100/0/0 : 18/0.01/260 | White/near-white elevated |
| sped-overdue | 55/0.22/25 : 65/0.22/25 | IEP renewal overdue |
| sped-due-soon | 70/0.15/85 : 75/0.15/85 | IEP renewal due soon |
| sped-upcoming | 50/0.01/260 : 40/0.01/260 | IEP renewal upcoming |
| message-bubble-sent | 72/0.16/285 : 78/0.18/285 | Sent message bubble tint |
| message-bubble-received | 95/0.005/260 : 22/0.01/260 | Received message bubble |
| notification-critical | 55/0.22/25 : 65/0.22/25 | Critical notification tier |
| notification-important | 70/0.15/85 : 75/0.15/85 | Important notification tier |
| notification-info | 50/0.01/260 : 40/0.01/260 | Info notification tier |
| pdf-frame | 95/0.005/260 : 22/0.01/260 | PDF preview frame bg |
| export-btn | 35/0.18/285 : 72/0.16/285 | Export button primary |
| intervention-open | 72/0.15/85 : 78/0.15/85 | Intervention awaiting start |
| intervention-review | 65/0.19/34 : 72/0.19/34 | Intervention under review |
| intervention-resolved | 65/0.22/140 : 75/0.22/140 | Intervention completed |
| intervention-follow-up | 65/0.19/22 : 72/0.19/22 | Intervention follow-up pending |
| outcome-positive | 65/0.22/140 : 75/0.22/140 | Positive outcome badge |
| outcome-neutral | 50/0.01/260 : 40/0.01/260 | Neutral outcome badge |
| outcome-negative | 55/0.22/25 : 65/0.22/25 | Negative outcome badge |

## Typography
- Display: Plus Jakarta Sans — headings, labels, navigation (confident, geometric, served from Google Fonts CDN)
- Body: Inter — body copy, inputs, lists (neutral, readable)
- Mono: JetBrains Mono — code, timestamps, IDs (bundled woff2)
- Scale: h1 28px/700, h2 22px/600, label 14px/600, body 16px/400

## Iconography
- **Library:** `lucide-react` across every family app — one icon vocabulary, no mixing sets.
- **Icons aid recognition, never replace it.** Always pair an icon with a visible label or an accessible name; never icon-alone for meaning (mirrors the "never colour alone" rule). Decorative icons carry `aria-hidden`.
- **Sizing:** 16px inline/in-button, 18–20px in a tinted badge tile, 14px micro. Stroke inherits text colour or the relevant semantic token.
- **Subject / department signature icons** — every subject carries a fixed icon **+** its domain colour, used wherever a subject appears (sidebar, cards, headers, reports, mastheads):

| Subject | Icon (lucide) |
|---------|---------------|
| Mathematics | `Sigma` |
| English / Language Arts | `BookOpen` |
| Science | `FlaskConical` |
| Social Studies | `Landmark` |
| Physical Education & Health | `HeartPulse` |
| Career & Technical Education | `Briefcase` |
| World Languages | `Languages` |
| Arts & Music | `Palette` |

- **App-specific semantic icons** (e.g. an LMS's objective types, a gradebook's status glyphs) live in the owning app, following the same rules — lucide, icon + label, semantic mapping. They are not promoted to this shared standard unless the concept is genuinely cross-app.

## Six Core Modules

| Module | Key Surfaces | Color Strategy |
|--------|--------------|----------------|
| Student Profile | Understood-summary card (flags, trajectory) + deep-record toggle | Primary accent + sidebar secondary |
| Gradebook | Grid with trajectory badges, overload banner, high-stakes labels, grade tiers | Grade colors (a/b/c/d/f) + trajectory-up/down + overload |
| Attendance | Pattern sparkline with 85% threshold line, chronic-absence badge | Attendance-threshold + chronic-absence |
| Behaviour | Status timeline (open/review/resolved/follow-up), severity 1-5 scale | Severity colors (1-5) + incident-status colors |
| Commitments | Urgency-tier badges (overdue/due-today/this-week/coming-soon) | Commitment colors per tier |
| Understanding Signals | Distinct badges for opportunity/workload/risk/celebration/pattern/continuity/commitment | Signal colors (7 distinct semantic pairs) |

## Messaging Surfaces
- Conversation bubbles: sent uses message-bubble-sent (purple tint, rounded-2xl rounded-tr-sm); received uses message-bubble-received (muted grey, rounded-2xl rounded-tl-sm)
- Unread badges: red dot with count on conversation list items
- Notification tiers: critical (red border-left), important (amber border-left), info (grey border-left)

## Reports Surfaces
- PDF preview frame: pdf-frame background with subtle border and shadow-subtle
- Export buttons: export-btn primary solid with white text, hover opacity-90

## Counsellor Surfaces
- Intervention timeline: vertical steps using intervention-open/review/resolved/follow-up colors
- Outcome badges: outcome-positive/neutral/negative rounded-full pills

## SPED Surfaces
- IEP urgency tiers: sped-overdue (danger red), sped-due-soon (warning amber), sped-upcoming (info grey)
- Each tier uses bg-opacity-10 with matching text and optional border

## Elevation & Depth
Minimal shadows; layering via background color shifts. Sidebar is darkest; content area shifts to light; cards elevate with white background and subtle 1px border. No blur, no glow—clarity through contrast.

## Structural Zones

| Zone | Background | Border | Notes |
|------|-----------|--------|-------|
| Sidebar (fixed) | oklch(12/0.02/285) | None | Dark purple/off-black, white text/icons |
| Content (main) | oklch(99/0.005/260) | None | Near-white, full width from top |
| Page title row | oklch(99/0.005/260) | 1px bottom, muted | Inline, no header duplication |
| Cards | oklch(100/0/0) | 1px, muted | White, elevated, subtle border |
| Tables/Grids | Alternating card + muted/30 | 1px per cell | Striped rows for rhythm |
| Modals | N/A | N/A | Never used; all inline or dedicated pages |

## Spacing & Rhythm
Spacious density: 24px section gaps, 16px component grouping, 8px micro-spacing. Card padding 20px. Table padding 12px. Sidebar items 12px tall, 8px gaps. Rhythm via alternating surfaces and whitespace, never crowding.

## Component Patterns
- Buttons: rounded-md (8px), solid primary/secondary/destructive, hover via opacity
- Cards: rounded-lg (10px), white bg, 1px border, 20px padding
- Badges: rounded-full, semantic color + text + icon (never color alone)
- Inputs: rounded-md, light border, focus ring in primary
- Tables: sticky header, striped rows (muted/5%), sortable columns
- Status timeline: left-border accent color + icon, status label
- Message bubbles: rounded-2xl with asymmetric corner (tr-sm sent, tl-sm received), 16px padding
- Notification cards: left-border 4px accent, muted bg, calm layout
- PDF frame: rounded-lg, subtle border, shadow-subtle, generous padding
- Intervention timeline: vertical connector line, color-coded step dots, outcome badges inline

## Motion
- Entrance: fade-in 150ms cubic-bezier(0.4, 0, 0.2, 1) on load
- Interactions: opacity transitions only, ~150ms, no scale/bounce/spring/rotate
- Status changes: height+opacity fade for inline detail reveal
- prefers-reduced-motion: all motion → instant

## Constraints
- No modals, overlays, or slide-in panels
- No horizontal scrolling; tables use sticky headers and responsive reflow
- No global top header; content starts at viewport top
- No footers except pinned sidebar footer
- No card-in-card nesting
- Accessibility: WCAG 2.1 AA in light & dark, 44×44px touch targets, semantic HTML, ARIA

## Signature Detail
Deep purple sidebar with school crest header and frequency-ordered role-specific navigation signals institutional ownership and calm competence. Six module surfaces each have a distinct visual language — trajectory indicators, urgency tiers, severity gradients, signal semantics — all readable at a glance, never color alone. New messaging, reports, counsellor, and SPED surfaces extend the same token discipline with semantic color pairs and calm, inline presentation.
