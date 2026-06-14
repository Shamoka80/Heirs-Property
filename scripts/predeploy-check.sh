#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required_files=(
  "assets/css/site.css"
  "assets/icons/apple-touch-icon.png"
  "assets/images/social-preview-2.png"
  "assets/images/HPfamilyland.gif"
  "assets/downloads/heirs-property-trifold-brochure.pdf"
)

removed_files=(
  "printable-guide.html"
  "assets/css/brochure.css"
  "assets/images/qr-heirs-property-home.svg"
)

required_html_patterns=(
  "assets/css/site.css?v=20260414"
  "assets/icons/apple-touch-icon.png"
  "assets/downloads/heirs-property-trifold-brochure.pdf"
  "Download brochure"
)

missing=0

echo "[predeploy] Checking required files..."
for f in "${required_files[@]}"; do
  if [[ -f "$f" ]]; then
    echo "  ✓ $f"
  else
    echo "  ✗ MISSING: $f"
    missing=1
  fi
done

echo "[predeploy] Checking removed live-brochure artifacts stay absent..."
for f in "${removed_files[@]}"; do
  if [[ -e "$f" ]]; then
    echo "  ✗ FORBIDDEN PATH EXISTS: $f"
    missing=1
  else
    echo "  ✓ absent: $f"
  fi
done

if [[ -f "assets/downloads/heirs-property-trifold-brochure.pdf" ]]; then
  if python3 - <<'PY'
from pathlib import Path
p = Path('assets/downloads/heirs-property-trifold-brochure.pdf')
raise SystemExit(0 if p.read_bytes().startswith(b'%PDF') else 1)
PY
  then
    echo "  ✓ PDF header verified: assets/downloads/heirs-property-trifold-brochure.pdf"
  else
    echo "  ✗ PDF header check failed: assets/downloads/heirs-property-trifold-brochure.pdf"
    missing=1
  fi
fi

echo "[predeploy] Checking required HTML references..."
for p in "${required_html_patterns[@]}"; do
  if grep -R -n -F --include='*.html' "$p" . >/dev/null; then
    echo "  ✓ pattern found in HTML: $p"
  else
    echo "  ✗ MISSING pattern in HTML: $p"
    missing=1
  fi
done

if grep -R -n -F --include='*.html' "printable-guide.html" . >/dev/null; then
  echo "  ✗ active HTML still references removed printable-guide.html"
  missing=1
else
  echo "  ✓ active HTML does not reference printable-guide.html"
fi

# Homepage-specific hero requirements
if grep -nE '<img[^>]+src="assets/images/HPfamilyland\.gif"' index.html >/dev/null; then
  echo "  ✓ index hero points to HPfamilyland.gif"
else
  echo "  ✗ index hero is not pointing to HPfamilyland.gif"
  missing=1
fi

echo "[predeploy] Running JavaScript syntax check..."
node --check assets/js/site.js

echo "[predeploy] Running interaction verification..."
python3 scripts/check-interactions.py

echo "[predeploy] Running local link checks..."
python3 scripts/check-links.py

echo "[predeploy] Running guardrail verification..."
python3 scripts/check-guardrails.py

if [[ "$missing" -ne 0 ]]; then
  echo "[predeploy] FAILED: Required assets/references are missing or forbidden artifacts returned. Block deployment."
  exit 1
fi

echo "[predeploy] PASSED: Required assets, routing, JavaScript syntax, and guardrails are valid."
