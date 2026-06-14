#!/usr/bin/env python3
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
errors = []
brochure_pdf = root / 'assets/downloads/heirs-property-trifold-brochure.pdf'
removed_paths = [
    root / 'printable-guide.html',
    root / 'assets/css/brochure.css',
    root / 'assets/images/qr-heirs-property-home.svg',
]

index = (root / 'index.html').read_text(encoding='utf-8')
sitejs = (root / 'assets/js/site.js').read_text(encoding='utf-8')

if 'assets/images/HPfamilyland.gif' not in index:
    errors.append('index.html missing HPfamilyland.gif reference')
if not brochure_pdf.exists():
    errors.append('downloadable brochure PDF is missing')
for path in removed_paths:
    if path.exists():
        errors.append(f'live brochure artifact must be removed: {path.relative_to(root)}')

for html_file in sorted(root.glob('*.html')):
    text = html_file.read_text(encoding='utf-8')
    if 'assets/images/social-preview.png' in text:
        errors.append(f'{html_file.name} references deprecated social-preview.png')
    for m in re.finditer(r'<meta\s+property="og:image"\s+content="([^"]+)"', text):
        url = m.group(1)
        if 'HPfamilyland.gif' in url:
            continue
        if not url.endswith('/assets/images/social-preview-2.png'):
            errors.append(f'{html_file.name} og:image not standardized: {url}')
    if 'printable-guide.html' in text:
        errors.append(f'{html_file.name} still links to removed printable-guide.html')
    if re.search(r'Printable guide|Printable handout|Print tri-fold brochure', text):
        errors.append(f'{html_file.name} still contains stale live-brochure language')

if 'printable-guide.html' in sitejs:
    errors.append('site.js still references removed printable-guide.html')
if 'assets/downloads/heirs-property-trifold-brochure.pdf' not in sitejs:
    errors.append('site.js missing downloadable brochure PDF route')
if 'Download brochure' not in sitejs:
    errors.append('site.js missing Download brochure language')

next_step_brochure_route = re.search(
    r'"resources-get-help\.html"\s*:\s*\[[^\]]*?\{(?=[^}]*\bhref\s*:\s*brochurePdf\b)(?=[^}]*\blabel\s*:\s*["\']Download brochure["\'])(?=[^}]*\bdownload\s*:\s*true\b)[^}]*\}',
    sitejs,
    re.S,
)
if not next_step_brochure_route:
    errors.append('site.js missing next-step brochure route with href: brochurePdf, label: "Download brochure", download: true')

required_footer = [
    'Need help now?', '(843) 745-7055', '(866) 657-2676', '(888) 346-5592',
    'not legal advice', 'start-here.html', 'what-to-do-first.html', 'notes.html',
    'resources-get-help.html', 'assets/downloads/heirs-property-trifold-brochure.pdf',
    'accessibility.html', 'about-this-guide.html'
]
for html_file in sorted(root.glob('*.html')):
    text = html_file.read_text(encoding='utf-8')
    foot = re.search(r'<footer class="footer" data-shared-footer>(.*?)</footer>', text, re.S)
    if not foot:
        errors.append(f'{html_file.name} missing fallback footer block')
        continue
    footer = foot.group(1)
    if footer.strip():
        for item in required_footer:
            if item not in footer and html_file.name in {'404.html', 'south-carolina-legal-protections.html'}:
                errors.append(f'{html_file.name} footer fallback missing: {item}')

if errors:
    print('Guardrail checks FAILED:')
    for error in errors:
        print(' -', error)
    sys.exit(1)
print('Guardrail checks PASSED.')
