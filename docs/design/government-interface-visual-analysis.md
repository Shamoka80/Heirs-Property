# Government-Style Interface Visual Analysis

## Scope

This review evaluates the current static site interface for the Heirs’ Property Guide and identifies visual, structural, and trust-signaling changes needed to move the experience toward a formal public-service website pattern. The analysis covers color, typography, header hierarchy, navigation, content organization, calls to action, trust language, responsive behavior, and accessibility preservation.

## Current interface assessment

The site already has several strong foundations: semantic page structure, skip-link support, a persistent header, a primary navigation model, a mobile help strip, responsive grids, fallback footer content, print support, local notes tooling, and guardrail checks for search, footer, hero imagery, and brand visibility. These are appropriate for a public-facing educational resource and should be preserved.

The principal visual issue is that the current palette reads as editorial and community-guide oriented rather than official. The warm tan background, brown-orange action color, rounded pill controls, soft card shadows, emoji icons, and decorative image overlay create an approachable tone, but they do not consistently communicate institutional authority. For a government-style interface, the visual system should emphasize restraint, strong contrast, clear hierarchy, stable navigation, and neutral documentation-oriented surfaces.

## Key findings

### 1. Palette and surface treatment

The current palette uses warm paper tones, muted navy, clay-orange accents, and parchment-like surfaces. This is readable, but it lacks the cooler, more formal visual language usually associated with official service portals. The orange primary action color also competes with warning semantics, making the interface feel less standardized.

Recommended direction: use a civic navy primary, slate text, white and cool-gray surfaces, restrained gold accents, clear red only for warnings, and blue-focused links/actions. Reduce decorative warmth and reserve accent colors for status, emphasis, and official dividers.

### 2. Header and navigation

The existing header is functional but visually soft. The brand is prominent, but the header lacks an official-service tier or agency-style identity band. Navigation items are pill-shaped and friendly, which is less aligned with government navigation systems that typically rely on rectangular tabs, strong rules, and service-oriented grouping.

Recommended direction: add a slim official banner, convert navigation toward a structured service-directory model, and make the header feel like an institutional masthead rather than a marketing header.

### 3. Homepage information architecture

The homepage currently begins with a confidence-oriented hero and a triage grid titled “What do you need right now?” This is useful, but the layout could better mirror government websites by presenting clear service categories, eligibility/scope notes, official guidance pathways, and prominent help channels.

Recommended direction: restructure the homepage around public-service tasks: urgent protection, understand ownership, prepare documents, get legal/community help, use printable materials, and record notes. This aligns better with task-based government design systems.

### 4. Component language

Cards, panels, and timelines are effective, but current visual treatments rely heavily on rounded corners, shadows, emoji icons, and warm accent borders. Government-style interfaces should minimize decorative iconography and prefer explicit labels, ordered service cards, strong section headers, and practical metadata.

Recommended direction: introduce labeled service cards, official notices, action rows, rectangular button language, and more subdued elevation.

### 5. Trust and compliance signals

The site already states that it is educational information and not legal advice. That message should be more prominent and placed in a banner or notice pattern that resembles official guidance pages. Scope statements should appear near the top, not only in footer and later content.

Recommended direction: add a formal “Official guidance notice” pattern in the hero area and a structured trust/scope panel near high-intent calls to action.

### 6. Accessibility and responsive behavior

Existing guardrails preserve critical accessibility features such as the skip link, search accessible naming, mobile hero order, and footer fallback. Any redesign should avoid reducing contrast, hiding the brand mark, weakening focus states, or moving the hero image ahead of primary actions on small screens.

Recommended direction: preserve the current accessibility model while increasing contrast, maintaining visible focus rings, and avoiding purely visual status indicators.

## Proposed redesign principles

1. Establish a formal civic color system based on navy, slate, white, cool gray, restrained gold, and status-specific red/green.
2. Add an official-service banner and masthead pattern to communicate public-service orientation.
3. Replace the homepage’s consumer-style hero rhythm with a task-oriented civic service layout.
4. Reduce decorative warmth, heavy pill shapes, and soft editorial styling.
5. Preserve local privacy, legal-scope warnings, South Carolina context, and support-contact prominence.
6. Keep the full redesign reviewable as one atomic pull request and do not merge directly into `main`.

## Implementation plan

This atomic pull request contains the complete review package:

1. A design-analysis document explaining the visual and structural rationale.
2. A formal government-style theme stylesheet layered over the existing core stylesheet.
3. A shared theme-loader hook so the new visual system applies across static pages without editing every HTML file.
4. A homepage restructuring pass that moves the landing page toward a service-pathway model.

## Acceptance checklist

- The site presents a more formal government-style visual tone.
- Primary navigation remains accessible and usable on desktop and mobile.
- The homepage still includes the required family-land hero image.
- The site preserves the educational-not-legal-advice scope statement.
- High-risk actions remain prominent: pause before signing, organize documents, seek legal/community help.
- Search, notes, printable guide, footer fallback, and mobile help strip remain intact.
- No pull request is merged automatically.