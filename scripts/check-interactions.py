#!/usr/bin/env python3
"""Static interaction verification for the guide."""
from pathlib import Path
import re
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
BROCHURE_PDF = "assets/downloads/protecting-family-land-trifold.pdf"
REMOVED_LIVE_ARTIFACTS = [
    "printable-guide.html",
    "assets/css/brochure.css",
    "assets/images/qr-heirs-property-home.svg",
]
BUTTON_DATA_ATTRS = [
    "data-print",
    "data-save-notes",
    "data-reset-notes",
    "data-export-notes",
    "data-nav-toggle",
]
HERO_CTA_EXPECTATIONS = {"Start here": "start-here.html"}
KEY_PAGES = [
    "index.html",
    "start-here.html",
    "what-to-do-first.html",
    "notes.html",
    "resources-get-help.html",
]
RUNTIME_EXPECTATIONS = {
    "data-print": {"files": ["assets/js/site.js"], "must_contain": ["querySelectorAll(\"[data-print]\")", "addEventListener(\"click\"", "window.print()"]},
    "data-save-notes": {"files": ["assets/js/notes.js"], "must_contain": ["querySelector(\"[data-save-notes]\")", "addEventListener(\"click\"", "writeNotes(collectNotes())"]},
    "data-reset-notes": {"files": ["assets/js/notes.js"], "must_contain": ["querySelector(\"[data-reset-notes]\")", "addEventListener(\"click\"", "storage.remove(storage.keys.notes)"]},
    "data-export-notes": {"files": ["assets/js/notes.js"], "must_contain": ["[data-export-notes='text']", "[data-export-notes='json']", "downloadBlob("]},
    "data-nav-toggle": {"files": ["assets/js/site.js"], "must_contain": ["querySelector(\"[data-nav-toggle]\")", "navToggle.addEventListener(\"click\"", "event.key === \"Escape\""]},
    "embedded search": {"files": ["assets/js/site.js"], "must_contain": ["className = \"site-search no-print\"", "data-site-search", "role\", \"search\"", "renderSearchResults", "event.key === \"Escape\""]},
}
ANCHOR_RE = re.compile(r"<a\b[^>]*>", re.I)
BUTTON_RE = re.compile(r"<button\b[^>]*>", re.I)
CLASS_ATTR_RE = re.compile(r"class\s*=\s*([\"'])(.*?)\1", re.I | re.S)
BUTTON_CLASS_RE = re.compile(r"^button(?:-|$)", re.I)


def parse_counts():
    anchor_button_counts = defaultdict(int)
    anchor_button_files = defaultdict(list)
    data_button_counts = defaultdict(int)
    data_button_files = defaultdict(list)
    for html_file in HTML_FILES:
        text = html_file.read_text(encoding="utf-8")
        for tag_match in ANCHOR_RE.finditer(text):
            tag = tag_match.group(0)
            class_match = CLASS_ATTR_RE.search(tag)
            if not class_match:
                continue
            for class_name in re.split(r"\s+", class_match.group(2).strip()):
                if BUTTON_CLASS_RE.match(class_name):
                    anchor_button_counts[class_name] += 1
                    if html_file.name not in anchor_button_files[class_name]:
                        anchor_button_files[class_name].append(html_file.name)
        for tag_match in BUTTON_RE.finditer(text):
            tag = tag_match.group(0)
            for data_attr in BUTTON_DATA_ATTRS:
                if re.search(rf"\b{re.escape(data_attr)}(?:\s*=|\s|>|$)", tag, re.I):
                    data_button_counts[data_attr] += 1
                    if html_file.name not in data_button_files[data_attr]:
                        data_button_files[data_attr].append(html_file.name)
    return anchor_button_counts, anchor_button_files, data_button_counts, data_button_files


def verify_runtime():
    errors = []
    for data_attr, rule in RUNTIME_EXPECTATIONS.items():
        joined = ""
        for relative in rule["files"]:
            path = ROOT / relative
            if not path.exists():
                errors.append(f"{data_attr}: runtime file missing -> {relative}")
                continue
            joined += path.read_text(encoding="utf-8") + "\n"
        for snippet in rule["must_contain"]:
            if snippet not in joined:
                errors.append(f"{data_attr}: runtime binding snippet not found -> {snippet!r}")
    return errors


def verify_home_ctas():
    errors = []
    text = (ROOT / "index.html").read_text(encoding="utf-8")
    hero_match = re.search(r'<div class="hero-actions no-print">(?P<body>.*?)</div>', text, re.I | re.S)
    if not hero_match:
        return ["index.html missing .hero-actions block for homepage CTAs."]
    hero_html = hero_match.group("body")
    for label, href in HERO_CTA_EXPECTATIONS.items():
        if not re.search(rf'<a\b[^>]*href="{re.escape(href)}"[^>]*>\s*{re.escape(label)}\s*</a>', hero_html, re.I):
            errors.append(f"Homepage CTA missing or changed: {label} -> {href}")
    return errors


def verify_key_pages_exist():
    return [f"Key page missing: {page}" for page in KEY_PAGES if not (ROOT / page).exists()]


def verify_brochure_download_contract():
    errors = []
    pdf = ROOT / BROCHURE_PDF
    if not pdf.exists():
        errors.append(f"Downloadable brochure PDF missing: {BROCHURE_PDF}")
    elif not pdf.read_bytes().startswith(b"%PDF"):
        errors.append(f"Downloadable brochure asset does not start with %PDF: {BROCHURE_PDF}")

    for removed in REMOVED_LIVE_ARTIFACTS:
        if (ROOT / removed).exists():
            errors.append(f"Removed live-brochure artifact still exists: {removed}")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    sitejs = (ROOT / "assets/js/site.js").read_text(encoding="utf-8")

    if f'href="{BROCHURE_PDF}"' not in index:
        errors.append(f"Homepage missing brochure PDF download link: {BROCHURE_PDF}")
    if "Download brochure" not in index:
        errors.append("Homepage brochure action missing user-facing label: Download brochure")
    if " download" not in index:
        errors.append("Homepage brochure link missing download attribute")

    required_sitejs = {
        "PDF constant": f'var brochurePdf = "{BROCHURE_PDF}";',
        "footer download route": '{ href: brochurePdf, label: "Download brochure", download: true }',
        "search-index route": "href: brochurePdf,",
        "search-index title": 'title: "Download printable brochure"',
    }
    for label, snippet in required_sitejs.items():
        if snippet not in sitejs:
            errors.append(f"site.js missing {label}: {snippet}")

    next_step_pattern = re.compile(
        r'\{[^}]*href:\s*brochurePdf[^}]*label:\s*"Download brochure"[^}]*download:\s*true[^}]*\}',
        re.S,
    )
    if not next_step_pattern.search(sitejs):
        errors.append(
            'site.js missing next-step route with href: brochurePdf, label: "Download brochure", and download: true'
        )

    for removed in REMOVED_LIVE_ARTIFACTS:
        if removed in index:
            errors.append(f"index.html still references removed live-brochure artifact: {removed}")
        if removed in sitejs:
            errors.append(f"site.js still references removed live-brochure artifact: {removed}")

    for html_file in HTML_FILES:
        text = html_file.read_text(encoding="utf-8")
        if "printable-guide.html" in text:
            errors.append(f"{html_file.name} still contains active printable-guide.html route")
    return errors


def main():
    anchor_button_counts, anchor_button_files, data_button_counts, data_button_files = parse_counts()
    errors = []
    for required_attr in BUTTON_DATA_ATTRS:
        if data_button_counts.get(required_attr, 0) == 0:
            errors.append(f"No HTML <button> found with required attribute [{required_attr}].")
    errors.extend(verify_runtime())
    errors.extend(verify_home_ctas())
    errors.extend(verify_key_pages_exist())
    errors.extend(verify_brochure_download_contract())

    print("Interactive inventory report")
    print("=" * 28)
    print(f"HTML files scanned: {len(HTML_FILES)}")
    print("\n<a> elements with button classes")
    for class_name in sorted(anchor_button_counts):
        files = ", ".join(sorted(anchor_button_files[class_name]))
        print(f"- .{class_name}: {anchor_button_counts[class_name]} (files: {files})")
    print("\n<button> elements with audited data-* actions")
    for data_attr in BUTTON_DATA_ATTRS:
        count = data_button_counts.get(data_attr, 0)
        files = ", ".join(sorted(data_button_files.get(data_attr, []))) or "n/a"
        print(f"- [{data_attr}]: {count} (files: {files})")

    if errors:
        print("\nInteraction checks FAILED:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("\nOK: static inventory and runtime selector bindings verified.")
    print(f"OK: brochure access is routed to PDF download only: {BROCHURE_PDF}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
