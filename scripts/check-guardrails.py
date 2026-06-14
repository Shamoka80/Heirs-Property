#!/usr/bin/env python3
"""Repository guardrails for the current static-site contract.

This script intentionally fails if the former live brochure page or any
live-brochure-only assets return. Historical documentation may mention the
former page only when the surrounding text marks it as legacy, historical, or
superseded.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BROCHURE_PDF = "assets/downloads/heirs-property-trifold-brochure.pdf"
REMOVED_LIVE_ARTIFACTS = [
    "printable-guide.html",
    "assets/css/brochure.css",
    "assets/images/qr-heirs-property-home.svg",
]
STALE_LIVE_BROCHURE_TEXT = [
    "Printable handout",
    "Printable guide",
    "Print tri-fold brochure",
    "Open printable handout",
]
DOC_CONTEXT_MARKERS = re.compile(
    r"historical|legacy|superseded|former|removed|no longer active|not active|not treated as active",
    re.I,
)

errors = []


def fail(message):
    errors.append(message)


def read_text(path):
    return path.read_text(encoding="utf-8")


def assert_contains(label, path, text, expected):
    if expected not in text:
        fail(f"{path}: missing {label}: {expected!r}")


def assert_not_contains(label, path, text, forbidden):
    if forbidden in text:
        fail(f"{path}: forbidden {label}: {forbidden!r}")


def paragraph_for(text, index):
    start = text.rfind("\n\n", 0, index)
    end = text.find("\n\n", index)
    if start == -1:
        start = 0
    else:
        start += 2
    if end == -1:
        end = len(text)
    return text[start:end]


def check_pdf_asset():
    pdf_path = ROOT / BROCHURE_PDF
    if not pdf_path.exists():
        fail(f"Missing required brochure PDF asset: {BROCHURE_PDF}")
        return
    if not pdf_path.is_file():
        fail(f"Brochure PDF path is not a file: {BROCHURE_PDF}")
        return
    data = pdf_path.read_bytes()
    if not data.startswith(b"%PDF"):
        fail(f"Brochure asset is not a valid PDF header: {BROCHURE_PDF}")
    if len(data) < 1024:
        fail(f"Brochure PDF appears too small to be a real deliverable: {BROCHURE_PDF}")


def check_removed_artifacts_absent():
    for rel in REMOVED_LIVE_ARTIFACTS:
        if (ROOT / rel).exists():
            fail(f"Removed live-brochure artifact returned and must stay absent: {rel}")


def check_active_html_routes():
    for html_file in sorted(ROOT.glob("*.html")):
        text = read_text(html_file)
        rel = html_file.name
        assert_not_contains("removed live-brochure route", rel, text, "printable-guide.html")
        assert_not_contains("removed live-brochure stylesheet", rel, text, "assets/css/brochure.css")
        assert_not_contains("removed live-brochure QR asset", rel, text, "assets/images/qr-heirs-property-home.svg")
        for stale in STALE_LIVE_BROCHURE_TEXT:
            assert_not_contains("stale live-brochure language", rel, text, stale)
        if "assets/images/social-preview.png" in text:
            fail(f"{rel}: references deprecated social-preview.png")
        for m in re.finditer(r'<meta\s+property="og:image"\s+content="([^"]+)"', text):
            url = m.group(1)
            if "HPfamilyland.gif" in url:
                continue
            if not url.endswith("/assets/images/social-preview-2.png"):
                fail(f"{rel}: og:image not standardized: {url}")


def check_homepage_download_route():
    path = "index.html"
    text = read_text(ROOT / path)
    assert_contains("brochure PDF download route", path, text, f'href="{BROCHURE_PDF}"')
    assert_contains("explicit download attribute", path, text, " download")
    assert_contains("download brochure label", path, text, "Download brochure")
    assert_contains("homepage family-land hero image", path, text, "assets/images/HPfamilyland.gif")


def check_site_js_download_routing():
    path = "assets/js/site.js"
    text = read_text(ROOT / path)
    for rel in REMOVED_LIVE_ARTIFACTS:
        assert_not_contains("removed artifact reference in active JavaScript", path, text, rel)
    assert_contains("canonical brochure PDF constant", path, text, f'var brochurePdf = "{BROCHURE_PDF}";')
    assert_contains("footer download link", path, text, '{ href: brochurePdf, label: "Download brochure", download: true }')
    assert_contains("search index brochure route", path, text, 'href: brochurePdf,')
    assert_contains("search result brochure title", path, text, 'title: "Download printable brochure"')
    assert_contains("next-step brochure route", path, text, '{ href: brochurePdf, label: "Download brochure" }')


def check_historical_doc_references():
    for doc in sorted((ROOT / "docs").rglob("*.md")):
        text = read_text(doc)
        for match in re.finditer(r"printable-guide\.html", text):
            context = paragraph_for(text, match.start())
            if not DOC_CONTEXT_MARKERS.search(context):
                fail(
                    f"{doc.relative_to(ROOT)}: printable-guide.html reference is not clearly marked historical/legacy/superseded"
                )


def check_footer_fallbacks():
    required_footer = [
        "Need help now?",
        "(843) 745-7055",
        "(866) 657-2676",
        "(888) 346-5592",
        "not legal advice",
        "start-here.html",
        "what-to-do-first.html",
        "notes.html",
        "resources-get-help.html",
        BROCHURE_PDF,
        "accessibility.html",
        "about-this-guide.html",
    ]
    for html_file in sorted(ROOT.glob("*.html")):
        text = read_text(html_file)
        foot = re.search(r'<footer class="footer" data-shared-footer>(.*?)</footer>', text, re.S)
        if not foot:
            fail(f"{html_file.name}: missing shared footer hook")
            continue
        footer = foot.group(1)
        if footer.strip() and html_file.name in {"404.html", "south-carolina-legal-protections.html"}:
            for item in required_footer:
                if item not in footer:
                    fail(f"{html_file.name}: footer fallback missing required item: {item}")


def main():
    print("Guardrail checks")
    print("================")
    check_pdf_asset()
    check_removed_artifacts_absent()
    check_active_html_routes()
    check_homepage_download_route()
    check_site_js_download_routing()
    check_historical_doc_references()
    check_footer_fallbacks()

    if errors:
        print("Guardrail checks FAILED:")
        for error in errors:
            print(f" - {error}")
        return 1

    print(f"OK: PDF-only brochure contract enforced via {BROCHURE_PDF}.")
    print("OK: Former live brochure page/assets remain absent from active site routing.")
    print("OK: Historical printable-guide.html references are confined to marked legacy/superseded docs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
