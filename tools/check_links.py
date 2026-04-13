#!/usr/bin/env python3
from __future__ import annotations

import re
from html.parser import HTMLParser
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
html_files = sorted(ROOT.glob("*.html"))

EXTERNAL_PREFIXES = (
    "http://",
    "https://",
    "mailto:",
    "tel:",
    "javascript:",
    "#",
)

REQUIRED_PAGES = [
    "index.html",
    "start-here.html",
    "what-is-heirs-property.html",
    "how-families-lose-land.html",
    "south-carolina-legal-protections.html",
    "what-to-do-first.html",
    "resources-get-help.html",
    "protecting-preserving-family-land.html",
    "economic-opportunities.html",
    "history-culture-legacy.html",
    "notes.html",
    "printable-guide.html",
]

class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []
        self.canonical: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag == "a" and attrs_dict.get("href"):
            self.hrefs.append(attrs_dict["href"])
        if tag == "link" and attrs_dict.get("rel") == "canonical" and attrs_dict.get("href"):
            self.canonical = attrs_dict["href"]


def is_internal_html_link(href: str) -> bool:
    if not href or href.startswith(EXTERNAL_PREFIXES):
        return False
    cleaned = href.split("#", 1)[0].split("?", 1)[0]
    return cleaned.endswith(".html")


def main() -> int:
    errors: list[str] = []
    incoming_counts = {page: 0 for page in REQUIRED_PAGES}

    for html_file in html_files:
        parser = LinkParser()
        parser.feed(html_file.read_text(encoding="utf-8"))

        if parser.canonical and not parser.canonical.endswith(f"/{html_file.name}"):
            errors.append(
                f"{html_file.name}: canonical URL should end with /{html_file.name} (got {parser.canonical})"
            )

        for href in parser.hrefs:
            if not is_internal_html_link(href):
                continue
            local_target = href.split("#", 1)[0].split("?", 1)[0]
            target_path = (html_file.parent / local_target).resolve()
            if not target_path.exists():
                errors.append(f"{html_file.name}: broken internal link -> {href}")
                continue
            target_name = Path(local_target).name
            if target_name in incoming_counts:
                incoming_counts[target_name] += 1

    # include JS-generated nav paths as valid inbound references
    site_js = (ROOT / "assets/js/site.js").read_text(encoding="utf-8")
    for page in incoming_counts:
        incoming_counts[page] += len(re.findall(re.escape(page), site_js))

    for page, count in incoming_counts.items():
        if count == 0:
            errors.append(f"orphan page: {page} has no discovered inbound links")

    if errors:
        print("Link integrity check FAILED:\n")
        for item in errors:
            print(f"- {item}")
        return 1

    print("Link integrity check PASSED")
    print(f"Checked {len(html_files)} HTML files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
