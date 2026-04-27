#!/usr/bin/env python3
"""Static + runtime interaction verification.

Checks:
1) Inventories interactive elements in HTML:
   - <a> tags with button-like classes
   - <button> tags with required data-* actions
2) Verifies runtime bindings exist in JS for each required data-* selector.
"""

from __future__ import annotations

from pathlib import Path
import re
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))

BUTTON_DATA_ATTRS = [
    "data-print",
    "data-print-section",
    "data-save-notes",
    "data-reset-notes",
    "data-export-notes",
    "data-nav-toggle",
    "data-search-close",
]
RUNTIME_INJECTED_ONLY = {"data-print-section", "data-search-close"}

# Runtime expectations keep checks explicit and maintainable.
RUNTIME_EXPECTATIONS = {
    "data-print": {
        "files": ["assets/js/site.js"],
        "must_contain": [
            'querySelectorAll("[data-print]")',
            'addEventListener("click"',
            "window.print()",
        ],
    },
    "data-print-section": {
        "files": ["assets/js/site.js"],
        "must_contain": [
            'querySelectorAll("[data-print-section]")',
            'addEventListener("click"',
            "window.print()",
        ],
    },
    "data-save-notes": {
        "files": ["assets/js/notes.js"],
        "must_contain": [
            'querySelector("[data-save-notes]")',
            'addEventListener("click"',
            "writeNotes(collectNotes())",
        ],
    },
    "data-reset-notes": {
        "files": ["assets/js/notes.js"],
        "must_contain": [
            'querySelector("[data-reset-notes]")',
            'addEventListener("click"',
            "storage.remove(storage.keys.notes)",
        ],
    },
    "data-export-notes": {
        "files": ["assets/js/notes.js"],
        "must_contain": [
            "[data-export-notes='text']",
            "[data-export-notes='json']",
            "downloadBlob(",
        ],
    },
    "data-nav-toggle": {
        "files": ["assets/js/site.js"],
        "must_contain": [
            'querySelector("[data-nav-toggle]")',
            "navToggle.addEventListener(\"click\"",
            "event.key === \"Escape\"",
        ],
    },
    "data-search-close": {
        "files": ["assets/js/site.js"],
        "must_contain": [
            "[data-search-close]",
            "searchCloseButton.addEventListener(\"click\"",
            "closeSearchDialog",
        ],
    },
}

ANCHOR_RE = re.compile(r"<a\b[^>]*>", re.IGNORECASE)
BUTTON_RE = re.compile(r"<button\b[^>]*>", re.IGNORECASE)
CLASS_ATTR_RE = re.compile(r'class\s*=\s*(["\'])(.*?)\1', re.IGNORECASE | re.DOTALL)
BUTTON_CLASS_RE = re.compile(r"^button(?:-|$)", re.IGNORECASE)


def parse_counts() -> tuple[dict[str, int], dict[str, list[str]], dict[str, int], dict[str, list[str]]]:
    anchor_button_counts: dict[str, int] = defaultdict(int)
    anchor_button_files: dict[str, list[str]] = defaultdict(list)
    data_button_counts: dict[str, int] = defaultdict(int)
    data_button_files: dict[str, list[str]] = defaultdict(list)

    for html_file in HTML_FILES:
        text = html_file.read_text(encoding="utf-8")

        for tag_match in ANCHOR_RE.finditer(text):
            tag = tag_match.group(0)
            class_match = CLASS_ATTR_RE.search(tag)
            if not class_match:
                continue

            class_tokens = re.split(r"\s+", class_match.group(2).strip())
            matched = [c for c in class_tokens if BUTTON_CLASS_RE.match(c)]
            for class_name in matched:
                anchor_button_counts[class_name] += 1
                if html_file.name not in anchor_button_files[class_name]:
                    anchor_button_files[class_name].append(html_file.name)

        for tag_match in BUTTON_RE.finditer(text):
            tag = tag_match.group(0)
            for data_attr in BUTTON_DATA_ATTRS:
                attr_pattern = re.compile(rf"\b{re.escape(data_attr)}(?:\s*=|\s|>|$)", re.IGNORECASE)
                if attr_pattern.search(tag):
                    data_button_counts[data_attr] += 1
                    if html_file.name not in data_button_files[data_attr]:
                        data_button_files[data_attr].append(html_file.name)

    return anchor_button_counts, anchor_button_files, data_button_counts, data_button_files


def verify_runtime() -> list[str]:
    errors: list[str] = []
    for data_attr, rule in RUNTIME_EXPECTATIONS.items():
        blobs = []
        for relative in rule["files"]:
            path = ROOT / relative
            if not path.exists():
                errors.append(f"{data_attr}: runtime file missing -> {relative}")
                continue
            blobs.append(path.read_text(encoding="utf-8"))

        joined = "\n".join(blobs)
        for snippet in rule["must_contain"]:
            if snippet not in joined:
                errors.append(
                    f"{data_attr}: runtime binding snippet not found -> {snippet!r} in {', '.join(rule['files'])}"
                )
    return errors


def main() -> int:
    anchor_button_counts, anchor_button_files, data_button_counts, data_button_files = parse_counts()

    errors: list[str] = []
    for required_attr in BUTTON_DATA_ATTRS:
        if data_button_counts.get(required_attr, 0) == 0 and required_attr not in RUNTIME_INJECTED_ONLY:
            errors.append(f"No HTML <button> found with required attribute [{required_attr}].")

    errors.extend(verify_runtime())

    print("Interactive inventory report")
    print("=" * 28)
    print(f"HTML files scanned: {len(HTML_FILES)}")

    print("\n<a> elements with button classes")
    if anchor_button_counts:
        for class_name in sorted(anchor_button_counts):
            files = ", ".join(sorted(anchor_button_files[class_name]))
            print(f"- .{class_name}: {anchor_button_counts[class_name]} (files: {files})")
    else:
        print("- none found")

    print("\n<button> elements with audited data-* actions")
    for data_attr in BUTTON_DATA_ATTRS:
        count = data_button_counts.get(data_attr, 0)
        files = ", ".join(sorted(data_button_files.get(data_attr, []))) or "n/a"
        print(f"- [{data_attr}]: {count} (files: {files})")

    if errors:
        print("\nInteraction checks failed:")
        for err in errors:
            print(f"- {err}")
        return 1

    print("\nOK: static inventory and runtime selector bindings verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
