#!/usr/bin/env python3
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
EXISTING = {p.name for p in HTML_FILES}
HREF_RE = re.compile(r'href="([^"]+)"')

errors = []

for file_path in HTML_FILES:
    text = file_path.read_text(encoding="utf-8")

    if 'class="skip-link"' in text and 'id="main"' not in text:
        errors.append(f"{file_path.name}: skip link exists but #main anchor is missing")

    for match in HREF_RE.finditer(text):
        href = match.group(1)
        if href.startswith(("http://", "https://", "mailto:", "tel:", "#", "javascript:")):
            continue

        target = href.split("#", 1)[0].split("?", 1)[0]
        if not target or target.startswith("assets/"):
            continue

        if Path(target).name not in EXISTING:
            errors.append(f"{file_path.name}: missing local target -> {target}")

if errors:
    print("Link/anchor checks failed:")
    for err in errors:
        print(f"- {err}")
    sys.exit(1)

print(f"OK: checked {len(HTML_FILES)} HTML files with no missing local targets.")
