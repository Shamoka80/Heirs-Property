# Responsive Acceptance QA Artifact Process

## Purpose
Establish a repeatable QA artifact workflow for responsive layout acceptance across key templates, with objective pass/fail criteria and screenshot evidence.

## Required viewport set
Run every check at these viewport widths (CSS px):

- **375** (small mobile)
- **390** (mobile baseline)
- **480** (large mobile)
- **700** (small tablet / large mobile landscape)
- **899** (tablet/desktop breakpoint edge below)
- **900** (tablet/desktop breakpoint edge above)
- **1024** (small desktop / landscape tablet)
- **1280** (desktop baseline)
- **1440** (large desktop)

Use full-height browser windows so first-screen observations are accurate.

## Pages/templates in scope
Capture artifacts for the following pages each cycle:

1. `index.html` (home template)
2. **Long-form content page** (representative content template; use `what-is-heirs-property.html` unless release scope specifies a different long-form page)
3. `notes.html`
4. `printable-guide.html`

## Artifact storage convention
Store screenshots under:

`docs/qa/screenshots/YYYY-MM-DD/`

Where `YYYY-MM-DD` is the test execution date (UTC or project-local date; keep consistent within the run).

### Naming convention
Use:

`<page>-<viewport>-<check>.png`

Examples:

- `index-1440-hero-balance.png`
- `what-is-heirs-property-768-cta-alignment.png`
- `notes-390-tap-targets.png`
- `printable-guide-1024-first-screen.png`

## Concrete acceptance checks (pass/fail)
For each page and each required viewport, verify all checks below.

### 1) Hero height and first-screen balance
**Pass if all are true:**
- `.home-hero .page-head-inner` does **not** show an internal scrollbar.
- Hero section does **not** dominate the first viewport (target: hero consumes no more than ~65% of first viewport height before meaningful body content appears).
- Within first screen, users can see at least one meaningful non-hero content cue (e.g., intro paragraph, section heading, or primary next-step content).
- No clipped headline/subhead text in hero area.

**Fail if any are true:**
- Internal hero scrollbar appears in `.home-hero .page-head-inner`.
- Hero visually fills nearly the full first viewport with no downstream content cue visible.
- Hero media/text overlaps, clips, or causes horizontal scrolling.
- First screen appears unbalanced (e.g., excessive top padding or dead space pushing content below fold).

### 1b) Horizontal overflow guard
**Pass if all are true:**
- No horizontal document scrollbar appears on tested viewports.
- Hero image, panel cards, and CTA group fit within viewport without clipping.

**Fail if any are true:**
- Any page-level horizontal scrollbar appears at a required viewport.
- Hero content extends beyond viewport width.

### 2) CTA/button sizing and alignment
**Pass if all are true:**
- CTA groups do not create oversized visual clusters; primary action area is prominent but not overwhelming relative to surrounding text.
- Button labels remain fully readable without truncation/wrapping that harms comprehension.
- Buttons in a group align consistently (shared baseline/edge alignment expected by layout).
- CTA spacing avoids collision/overlap with nearby text, cards, or media.

**Fail if any are true:**
- CTA block is visually oversized compared with nearby content and dominates section hierarchy.
- Label text is clipped, illegible, or wraps awkwardly in a way that obscures action intent.
- Misaligned buttons suggest broken layout (inconsistent heights or broken columns not intended by design).

### 3) Tap target comfort on mobile (430 and 390 required; verify on 768 when touch-first)
**Pass if all are true:**
- Primary interactive controls are comfortably reachable and not edge-clipped.
- Touch targets are large enough for reliable tapping (minimum ~44x44 CSS px target area for key actions).
- Adjacent interactive elements have enough spacing to avoid accidental taps.
- Key interactions in first screen are reachable without precision zoom.

**Fail if any are true:**
- Tap targets are too small/crowded for confident one-thumb use.
- Primary actions are too close together, causing likely mis-taps.
- Interactive controls are partially off-screen or obscured by sticky UI.

## Execution procedure
1. Create today’s artifact folder: `docs/qa/screenshots/YYYY-MM-DD/`.
2. Open each in-scope page.
3. For each required viewport, capture screenshots for:
   - hero/first-screen balance,
   - hero nested-scroll + horizontal-overflow confirmation,
   - CTA/button sizing/alignment,
   - mobile tap targets (required at 480, 390, and 375).
4. Record result per check as **Pass** or **Fail** in the run log.
5. For every **Fail**, include:
   - screenshot filename,
   - concise defect note,
   - severity (High/Medium/Low),
   - link to follow-up issue/PR.

## Run log template
Use this table in PR descriptions or QA notes.

| Date | Page | Viewport | Check | Result | Evidence | Notes |
|---|---|---:|---|---|---|---|
| YYYY-MM-DD | index.html | 1440 | Hero + first-screen balance | Pass/Fail | `docs/qa/screenshots/YYYY-MM-DD/...png` |  |
| YYYY-MM-DD | index.html | 1440 | CTA sizing/alignment | Pass/Fail | `docs/qa/screenshots/YYYY-MM-DD/...png` |  |
| YYYY-MM-DD | notes.html | 390 | Tap target comfort | Pass/Fail | `docs/qa/screenshots/YYYY-MM-DD/...png` |  |

## Sign-off rule
Responsive acceptance is complete only when:
- All in-scope pages were reviewed at all required viewports,
- All required checks have screenshot evidence,
- No unresolved **High** severity failures remain.
