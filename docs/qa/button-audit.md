# Button & Interaction Audit Checklist

## Scope
This checklist verifies static inventory and runtime behavior for button-like interactions that are critical to navigation, search, print, and local data workflows.

## 1) Interaction map (button type → expected behavior)

| Interaction type | Selector | Expected behavior | Expected destination/result |
|---|---|---|---|
| Button-style anchor | `a.button`, `a.button-*` | Navigates to linked guide page | Browser navigates to `href` target page in same tab |
| Global page print | `button[data-print]` | Opens print dialog for current page | OS/browser print dialog is shown |
| Section print | `button[data-print-section]` | Marks section for print and opens print dialog | Print preview contains current section emphasis (`print-section-mode`) |
| Save notes | `button[data-save-notes]` | Persists notes to local storage and updates status text | Status includes save confirmation timestamp |
| Reset notes | `button[data-reset-notes]` | Confirm prompt, then clear all notes and saved payload | Empty fields + status says notes were cleared |
| Export notes (text/json) | `button[data-export-notes]` | Downloads current note snapshot | Downloaded `.txt` and `.json` files |
| Nav toggle | `button[data-nav-toggle]` | Opens/closes mobile nav; updates `aria-expanded` | Focus moves into nav on open; toggle regains focus on close when applicable |
| Search close | `button[data-search-close]` | Closes search modal | Modal hidden + focus returns to Search trigger |
| Checklist reset | `button[data-reset-checklist]` | Confirm prompt, clear all checked boxes, clear stored checklist state | All checklist boxes unchecked + status message updated |

---

## 2) Static + runtime verification workflow

### Static inventory
Run:

```bash
python3 scripts/check-interactions.py
```

This must:
- inventory `<a>` elements with button classes,
- inventory `<button>` elements with required `data-*` actions,
- fail if required HTML interaction selectors are missing.

### Runtime binding verification
The same command also validates expected runtime bindings in JS:
- `assets/js/site.js` for nav/search/print interactions,
- `assets/js/notes.js` for notes save/export/reset interactions.

If any required selector binding snippet is missing, the check fails.

---

## 3) Manual cross-device QA matrix

Test each flow on:
- Desktop (≥ 1200px)
- Tablet (~768px)
- Mobile (≤ 480px)

| Flow | Desktop | Tablet | Mobile | Pass criteria |
|---|---:|---:|---:|---|
| Nav toggle open/close | ☐ | ☐ | ☐ | Toggle opens/closes nav, `aria-expanded` updates, outside click closes on mobile/tablet collapse mode |
| Nav escape behavior | ☐ | ☐ | ☐ | `Esc` closes open nav; when focus is in nav on mobile, focus returns to toggle |
| Search modal open/close | ☐ | ☐ | ☐ | Search button opens modal, cursor lands in search input, close button hides modal |
| Search modal escape + focus return | ☐ | ☐ | ☐ | `Esc` closes modal and returns focus to Search trigger |
| Page print | ☐ | ☐ | ☐ | `data-print` opens print dialog without JS errors |
| Section print | ☐ | ☐ | ☐ | `data-print-section` opens print dialog and section-target styling is applied/cleared |
| Notes save | ☐ | ☐ | ☐ | Typing or Save updates local storage and status messaging |
| Notes export text/json | ☐ | ☐ | ☐ | Both file types download successfully with current content |
| Notes reset | ☐ | ☐ | ☐ | Confirm dialog appears; on confirm all fields clear and status updates |
| Checklist persistence/status | ☐ | ☐ | ☐ | Checkbox changes persist after reload and status message reflects save state |
| Checklist reset | ☐ | ☐ | ☐ | Confirm dialog appears; all boxes clear and reset status message displays |

---

## 4) Remediation checklist

Use this when fixing regressions before sign-off.

- [ ] R1: All required selectors exist in markup (`data-print`, `data-print-section`, `data-save-notes`, `data-reset-notes`, `data-export-notes`, `data-nav-toggle`, `data-search-close`).
- [ ] R2: `python3 scripts/check-interactions.py` passes with no errors.
- [ ] R3: Nav toggle + escape behavior passes on desktop/tablet/mobile.
- [ ] R4: Search modal open/close + focus return passes on desktop/tablet/mobile.
- [ ] R5: Print + section print pass on desktop/tablet/mobile.
- [ ] R6: Notes save/export/reset pass on desktop/tablet/mobile.
- [ ] R7: Checklist reset + persistence status messaging pass on desktop/tablet/mobile.

## 5) Done criteria (sign-off table)

| Done criterion ID | Must match remediation item | Evidence required | Status |
|---|---|---|---|
| D1 | R1 | Interaction inventory output with selector counts | ☐ Done |
| D2 | R2 | CI/local output from `python3 scripts/check-interactions.py` (pass) | ☐ Done |
| D3 | R3 | QA matrix rows for nav toggle + escape fully checked | ☐ Done |
| D4 | R4 | QA matrix rows for search open/close + focus return fully checked | ☐ Done |
| D5 | R5 | QA matrix rows for print + section print fully checked | ☐ Done |
| D6 | R6 | QA matrix rows for notes save/export/reset fully checked | ☐ Done |
| D7 | R7 | QA matrix rows for checklist persistence/reset/status fully checked | ☐ Done |

A release is ready only when **D1–D7 are all marked Done**.
