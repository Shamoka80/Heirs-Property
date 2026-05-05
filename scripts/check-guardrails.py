#!/usr/bin/env python3
from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
html=sorted(root.glob('*.html'))
errors=[]

index=(root/'index.html').read_text(encoding='utf-8')
if 'assets/images/HPfamilyland.gif' not in index:
    errors.append('index.html missing HPfamilyland.gif reference')

for f in html:
    t=f.read_text(encoding='utf-8')
    if 'assets/images/social-preview.png' in t:
        errors.append(f'{f.name} references deprecated social-preview.png')
    for m in re.finditer(r'<meta\s+property="og:image"\s+content="([^"]+)"',t):
        url=m.group(1)
        if 'HPfamilyland.gif' in url:
            continue
        if not url.endswith('/assets/images/social-preview-2.png'):
            errors.append(f'{f.name} og:image not standardized: {url}')

sitejs=(root/'assets/js/site.js').read_text(encoding='utf-8')
for token in ['role="dialog"','aria-modal="true"','aria-labelledby="site-search-title"','<h2 id="site-search-title">']:
    if token not in sitejs:
        errors.append(f'search dialog token missing in site.js: {token}')

required_footer=[
    'Need help now?', '(843) 745-7055', '(866) 657-2676', '(888) 346-5592',
    'not legal advice', 'start-here.html', 'what-to-do-first.html', 'notes.html',
    'resources-get-help.html', 'printable-guide.html', 'accessibility.html', 'about-this-guide.html'
]
for f in html:
    t=f.read_text(encoding='utf-8')
    foot=re.search(r'<footer class="footer" data-shared-footer>(.*?)</footer>',t,re.S)
    if not foot:
        errors.append(f'{f.name} missing fallback footer block')
        continue
    fb=foot.group(1)
    for item in required_footer:
        if item not in fb:
            errors.append(f'{f.name} footer fallback missing: {item}')

if errors:
    print('Guardrail checks FAILED:')
    for e in errors:
        print(' -',e)
    sys.exit(1)
print('Guardrail checks PASSED.')
