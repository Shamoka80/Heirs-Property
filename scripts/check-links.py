#!/usr/bin/env python3
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
EXISTING_HTML = {p.name for p in HTML_FILES}
BROCHURE_PDF = "assets/downloads/protecting-family-land-trifold.pdf"
REMOVED_LIVE_ROUTE = "printable-guide.html"
LOCAL_REF_RE = re.compile(r'\b(?:href|src)="([^"]+)"')

errors = []


def is_external(ref):
    return ref.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:"))


def clean_target(ref):
    return ref.split("#", 1)[0].split("?", 1)[0]


for file_path in HTML_FILES:
    text = file_path.read_text(encoding="utf-8")

    if 'class="skip-link"' in text and 'id="main"' not in text:
        errors.append(f"{file_path.name}: skip link exists but #main anchor is missing")

    if REMOVED_LIVE_ROUTE in text:
        errors.append(f"{file_path.name}: active HTML must not route to removed live page -> {REMOVED_LIVE_ROUTE}")

    for match in LOCAL_REF_RE.finditer(text):
        ref = match.group(1)
        if is_external(ref):
            continue

        target = clean_target(ref)
        if not target:
            continue

        if target == REMOVED_LIVE_ROUTE:
            errors.append(f"{file_path.name}: forbidden removed live brochure target -> {target}")
            continue

        if target.startswith("assets/"):
            if not (ROOT / target).is_file():
                errors.append(f"{file_path.name}: missing local asset target -> {target}")
            continue

        if target.endswith(".html"):
            if Path(target).name not in EXISTING_HTML:
                errors.append(f"{file_path.name}: missing local HTML target -> {target}")
            continue

        if "/" not in target and "." not in target:
            continue

        if not (ROOT / target).exists():
            errors.append(f"{file_path.name}: missing local target -> {target}")

pdf_path = ROOT / BROCHURE_PDF
if not pdf_path.is_file():
    errors.append(f"Required brochure PDF is missing: {BROCHURE_PDF}")
elif not pdf_path.read_bytes().startswith(b"%PDF"):
    errors.append(f"Required brochure asset is not a PDF: {BROCHURE_PDF}")

if errors:
    print("Link/anchor checks FAILED:")
    for err in errors:
        print(f"- {err}")
    sys.exit(1)

print(f"OK: checked {len(HTML_FILES)} HTML files with no missing local targets.")
print(f"OK: brochure download target exists and is a PDF: {BROCHURE_PDF}")
