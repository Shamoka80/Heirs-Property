# Search Refinement Validation

## Scope

This note documents the validation performed for the embedded site-search refinement branch.

## Local checks

- `node --check /mnt/data/site.js`
- Static contract check for required interaction and brochure-routing snippets in `assets/js/site.js`
- Ranked search expectations using a DOM-stubbed Node harness

## Representative ranked-query expectations

| Query | Expected top result |
| --- | --- |
| `partition court rights` | `south-carolina-legal-protections.html` |
| `timber income` | `economic-opportunities.html` |
| `family legacy` | `history-culture-legacy.html` |
| `tax sale warning` | `how-families-lose-land.html` |
| `download pdf` | `assets/downloads/heirs-property-trifold-brochure.pdf` |
| `screen reader keyboard` | `accessibility.html` |
| `save questions deadline` | `notes.html` |

## Result

All local checks passed before the branch was updated through the GitHub connector.
