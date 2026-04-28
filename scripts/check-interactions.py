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
HERO_CTA_EXPECTATIONS = {
    "Start here now": "start-here.html",
    "See the action timeline": "what-to-do-first.html",
    "Open printable guide": "printable-guide.html",
}
KEY_PAGES = [
    "index.html",
    "start-here.html",
    "what-to-do-first.html",
    "printable-guide.html",
    "notes.html",
    "resources-get-help.html",
]

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
HERO_INNER_RULE_RE = re.compile(
    r"\.home-hero\s+\.page-head-inner\s*\{(?P<body>.*?)\}",
    re.IGNORECASE | re.DOTALL,
)
ROOT_VAR_RE = re.compile(r"--(?P<name>[a-z0-9-]+)\s*:\s*(?P<value>[^;]+);", re.IGNORECASE)


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


def verify_hero_css() -> list[str]:
    errors: list[str] = []
    css_path = ROOT / "assets/css/site.css"
    css = css_path.read_text(encoding="utf-8")
    match = HERO_INNER_RULE_RE.search(css)
    if not match:
        return ["Missing .home-hero .page-head-inner rule in assets/css/site.css."]

    body = match.group("body")
    normalized = " ".join(body.split()).lower()
    if "overflow: visible" not in normalized:
        errors.append("Hero inner rule must set overflow: visible.")
    if "overflow: auto" in normalized or "overflow: scroll" in normalized:
        errors.append("Hero inner rule must not use overflow: auto/scroll.")
    if "max-block-size:" in normalized and "max-block-size: none" not in normalized:
        errors.append("Hero inner rule must not cap max-block-size.")
    if "max-block-size: none" not in normalized:
        errors.append("Hero inner rule should explicitly set max-block-size: none.")
    if "overflow-x: hidden" not in css.lower():
        errors.append("Document-level horizontal overflow guard missing (overflow-x: hidden).")
    return errors


def verify_home_ctas() -> list[str]:
    errors: list[str] = []
    index_path = ROOT / "index.html"
    text = index_path.read_text(encoding="utf-8")
    hero_match = re.search(
        r'<div class="hero-actions no-print">(?P<body>.*?)</div>',
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if not hero_match:
        return ["index.html missing .hero-actions block for homepage CTAs."]

    hero_html = hero_match.group("body")
    for label, href in HERO_CTA_EXPECTATIONS.items():
        cta_pattern = re.compile(
            rf'<a\b[^>]*href="{re.escape(href)}"[^>]*>\s*{re.escape(label)}\s*</a>',
            re.IGNORECASE,
        )
        if not cta_pattern.search(hero_html):
            errors.append(f'Homepage CTA missing or changed: "{label}" -> {href}')
        if not (ROOT / href).exists():
            errors.append(f'Homepage CTA target file missing: "{href}"')
    return errors


def parse_clamp_max(value: str) -> float | None:
    match = re.search(r"clamp\([^,]+,[^,]+,\s*([0-9.]+)rem\)", value)
    if not match:
        return None
    return float(match.group(1))


def verify_masthead_hierarchy() -> list[str]:
    errors: list[str] = []
    css = (ROOT / "assets/css/site.css").read_text(encoding="utf-8")
    variables = {m.group("name"): m.group("value").strip() for m in ROOT_VAR_RE.finditer(css)}

    home_size = parse_clamp_max(variables.get("home-hero-title-size", ""))
    page_size = parse_clamp_max(variables.get("page-masthead-title-size", ""))
    utility_size = parse_clamp_max(variables.get("utility-masthead-title-size", ""))
    if home_size is None or page_size is None or utility_size is None:
        errors.append("Masthead scale tokens must define clamp() values for home/page/utility title sizes.")
    elif not (home_size > page_size > utility_size):
        errors.append("Masthead hierarchy invalid: expected home hero title > internal page title > utility title.")

    utility_pages = ["notes.html", "printable-guide.html", "about-this-guide.html", "accessibility.html", "404.html"]
    for page in utility_pages:
        text = (ROOT / page).read_text(encoding="utf-8")
        if '<header class="page-head masthead-utility">' not in text:
            errors.append(f"{page}: missing masthead-utility header class.")

    return errors


def verify_print_css_presence() -> list[str]:
    errors: list[str] = []
    for html_file in HTML_FILES:
        text = html_file.read_text(encoding="utf-8")
        if 'assets/css/print.css" media="print"' not in text:
            errors.append(f"{html_file.name}: missing print.css print stylesheet link.")
    return errors


def verify_key_pages_exist() -> list[str]:
    errors: list[str] = []
    for page in KEY_PAGES:
        if not (ROOT / page).exists():
            errors.append(f"Key page missing: {page}")
    return errors


def main() -> int:
    anchor_button_counts, anchor_button_files, data_button_counts, data_button_files = parse_counts()

    errors: list[str] = []
    for required_attr in BUTTON_DATA_ATTRS:
        if data_button_counts.get(required_attr, 0) == 0 and required_attr not in RUNTIME_INJECTED_ONLY:
            errors.append(f"No HTML <button> found with required attribute [{required_attr}].")

    errors.extend(verify_runtime())
    errors.extend(verify_hero_css())
    errors.extend(verify_home_ctas())
    errors.extend(verify_key_pages_exist())
    errors.extend(verify_masthead_hierarchy())
    errors.extend(verify_print_css_presence())

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
    print("\nHomepage hero CTA expectations")
    for label, href in HERO_CTA_EXPECTATIONS.items():
        print(f'- "{label}" -> {href}')

    if errors:
        print("\nInteraction checks failed:")
        for err in errors:
            print(f"- {err}")
        return 1

    print("\nOK: static inventory and runtime selector bindings verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
