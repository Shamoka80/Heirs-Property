# Design Guardrails

- Homepage hero must remain visually distinct, but controlled in scale and spacing.
- Internal page mastheads must remain smaller than the homepage hero.
- Utility mastheads must remain the most restrained style tier.
- The homepage hero must continue to include `assets/images/HPfamilyland.gif` unless explicitly directed otherwise.
- Search must stay available and keyboard-accessible across desktop, laptop, tablet, and smartphone breakpoints.
- Search dialog behavior must remain accessible (`role="dialog"`, `aria-modal`, labeling, Escape close, focus trap, focus return).
- Footer support and disclaimer content (including urgent help phone numbers) must exist in static HTML and not rely only on JavaScript.
- Social preview metadata must reference deployed assets and stay aligned with `assets/images/social-preview-2.png` checks.
- Future step: add visual regression tests with Playwright (or equivalent) to detect unintended layout drift.
