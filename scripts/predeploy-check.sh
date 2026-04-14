#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required_files=(
  "assets/css/site.css"
  "assets/icons/apple-touch-icon.png"
  "assets/images/social-preview.png"
  "assets/images/HPfamilyland.gif"
)

required_patterns=(
  "assets/css/site.css?v=20260414"
  "assets/icons/apple-touch-icon.png?v=20260414"
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

echo "[predeploy] Checking required HTML references..."
for p in "${required_patterns[@]}"; do
  if rg -n -F --glob '*.html' "$p" >/dev/null; then
    echo "  ✓ pattern found: $p"
  else
    echo "  ✗ MISSING pattern in HTML: $p"
    missing=1
  fi
done

# Homepage-specific hero requirements
if rg -n "assets/images/HPfamilyland\.gif\?v=20260414" index.html >/dev/null; then
  echo "  ✓ index hero points to HPfamilyland.gif"
else
  echo "  ✗ index hero is not pointing to HPfamilyland.gif"
  missing=1
fi

if rg -n "onerror=\"this.onerror=null;this.src='assets/images/social-preview\.png\?v=20260414';\"" index.html >/dev/null; then
  echo "  ✓ index hero has social-preview fallback"
else
  echo "  ✗ index hero fallback missing"
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  echo "[predeploy] FAILED: Required assets/references are missing. Block deployment."
  exit 1
fi

echo "[predeploy] PASSED: All required assets/references are present."
