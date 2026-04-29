# Government-Style Color Scheme Revision Plan

## Objective
Shift the current warm, heritage-forward palette to a more formal civic/government visual language while preserving readability and trust.

## Current Theme Assessment
The current `:root` palette uses warm parchment and copper tones (`--bg`, `--secondary`, `--accent`) that read as editorial/cultural rather than institutional.

## Recommended Direction
Use a restrained triad:
- Deep navy for authority and structure.
- Cool gray neutrals for surfaces and dividers.
- Muted civic gold only as a minor accent.

This reduces visual noise and aligns with common U.S. public-sector patterns (formal blue + neutral grayscale + limited warm accent).

## Proposed Token Revisions
Update only design tokens first (low-risk). Keep existing variable names for minimal refactoring.

```css
:root {
  --bg: #F3F5F7;            /* cool neutral background */
  --surface: #FFFFFF;
  --surface-alt: #EEF1F4;
  --surface-strong: #0F2A43; /* government navy */
  --surface-strong-2: #0A2135;

  --text: #15202B;
  --text-soft: #27384A;
  --muted: #4D5E70;

  --line: #CDD6DF;
  --line-strong: #AAB8C6;

  --primary: #0F2A43;
  --secondary: #1F4E79;      /* restrained action blue */

  --accent: #8B7A4A;         /* muted civic gold */
  --accent-soft: #E8E2D4;
  --accent-ink: #3F3621;

  --link: #0F3D63;
  --link-hover: #0A2C47;
  --focus: #0E5A8A;          /* blue focus instead of orange */

  --hero-rule: #516A83;
  --danger: #8A1F1F;
  --danger-bg: #FDEEEE;
  --success-bg: #ECF4EE;
}
```

## Component-Level Recommendations
1. **Header + nav**
   - Keep white header, but strengthen hierarchy with navy text and cooler borders.
   - Limit pill highlights in nav; use subtle gray hover for non-active links.

2. **Buttons**
   - Primary CTA: solid `--primary` background, white text.
   - Secondary CTA: white background + navy border.
   - Reserve gold (`--accent`) for only one context (e.g., “Get Help” emphasis), not system-wide.

3. **Links + focus states**
   - Use blue-only interaction system for consistency.
   - Ensure focus ring contrasts against both white and gray surfaces.

4. **Hero and section backgrounds**
   - Replace warm gradient mixes with cool blue-gray blends.
   - Reduce decorative texture opacity to keep a formal tone.

## Accessibility Verification Targets
Before release, verify:
- Body text contrast >= 4.5:1.
- Large headings/UI controls >= 3:1.
- Focus indicator contrast >= 3:1 against adjacent colors.
- Link color distinguishable from surrounding text without relying on color alone.

Suggested checks:
- Run existing QA scripts.
- Spot-check contrast for token pairs (text/bg, link/bg, focus/bg) with a WCAG calculator.

## Rollout Strategy
1. **Phase 1 (safe):** token swap only in `:root`.
2. **Phase 2 (refinement):** tighten nav/button hover states to reduce warmth bleed-through.
3. **Phase 3 (validation):** run responsive + accessibility audits and capture screenshots for stakeholder sign-off.

## Trade-offs
- **Pros:** stronger institutional trust signal, cleaner hierarchy, better consistency.
- **Cons:** less warmth/personality; may feel less community-centered if over-neutralized.
- **Mitigation:** keep muted gold as a limited heritage accent in key storytelling areas.
