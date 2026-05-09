#!/usr/bin/env python3
from pathlib import Path
import re,sys
root=Path(__file__).resolve().parents[1]
html=sorted(root.glob('*.html'))
errors=[]

index=(root/'index.html').read_text(encoding='utf-8')
if 'assets/images/HPfamilyland.gif' not in index:
    errors.append('index.html missing HPfamilyland.gif reference')
if not re.search(r'<img\b[^>]+src="assets/images/HPfamilyland\.gif"', index):
    errors.append('index.html missing homepage hero <img> for HPfamilyland.gif')

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
css=(root/'assets/css/site.css').read_text(encoding='utf-8')
css_no_comments=re.sub(r'/\*.*?\*/','',css,flags=re.S)

def iter_rules(text):
    for m in re.finditer(r'(?P<selectors>[^{}@]+)\{(?P<body>[^{}]*)\}', text, re.S):
        yield m.group('selectors').strip(), m.group('body').strip(), m.start()

def hidden_in_body(body):
    normalized=' '.join(body.lower().split())
    return bool(re.search(r'\bdisplay\s*:\s*none\b', normalized) or re.search(r'\bvisibility\s*:\s*hidden\b', normalized))

# Embedded static search guardrails.
required_search_tokens = [
    'className = "site-search no-print"',
    'setAttribute("role", "search")',
    'aria-label", "Search this guide"',
    '<label class="site-search-label" for="site-search-input">Search this guide</label>',
    'data-site-search type="search"',
    'aria-controls="site-search-results"',
    'role="status" aria-live="polite"',
    'data-search-panel hidden',
    'event.key === "Escape"',
]
for token in required_search_tokens:
    if token not in sitejs:
        errors.append(f'embedded search token missing in site.js: {token}')

for forbidden in ['role="dialog"', 'aria-modal="true"', 'data-search-toggle', 'search-modal', 'closeSearchDialog']:
    if forbidden in sitejs:
        errors.append(f'legacy modal search token must not remain in site.js: {forbidden}')

if 'search-result-link' not in sitejs or 'search-result-snippet' not in sitejs or 'search-result-url' not in sitejs:
    errors.append('site.js must render compact search result title, snippet, and destination URL')
if re.search(r'<a[^>]+class="(?:button|button-secondary|button-tertiary)[^" ]*"[^>]*>.*search-result', sitejs, re.S):
    errors.append('search results appear to use button-like link classes')

index_match = re.search(r'var\s+searchIndex\s*=\s*\[(?P<body>.*?)\];', sitejs, re.S)
required_index_pages = [
    'index.html',
    'start-here.html',
    'what-is-heirs-property.html',
    'how-families-lose-land.html',
    'south-carolina-legal-protections.html',
    'what-to-do-first.html',
    'protecting-preserving-family-land.html',
    'economic-opportunities.html',
    'history-culture-legacy.html',
    'resources-get-help.html',
    'notes.html',
    'printable-guide.html',
    'accessibility.html',
    'about-this-guide.html',
]
if not index_match:
    errors.append('site.js missing static searchIndex array')
else:
    search_index_body = index_match.group('body')
    for page in required_index_pages:
        if f'"href": "{page}"' not in search_index_body and f"href: \"{page}\"" not in search_index_body:
            errors.append(f'searchIndex missing required page: {page}')
    for term in ['probate', 'deed', 'tax', 'partition', 'heirs', 'legal aid', 'notes', 'family land']:
        if term not in search_index_body.lower():
            errors.append(f'searchIndex missing expected site term: {term}')

if '.site-search' not in css_no_comments or '.site-search input[type="search"]' not in css_no_comments:
    errors.append('CSS missing embedded .site-search input styling')
if '.site-search-panel' not in css_no_comments or '.search-result-link' not in css_no_comments:
    errors.append('CSS missing compact search dropdown/result styling')
if '.search-result-link' in css_no_comments:
    result_rule = ''.join(body for selectors, body in re.findall(r'([^{}@]+)\{([^{}]*)\}', css_no_comments, re.S) if '.search-result-link' in selectors)
    normalized_result_rule = ' '.join(result_rule.lower().split())
    if 'min-height' in normalized_result_rule or 'border-radius: 999px' in normalized_result_rule:
        errors.append('search result links look button-like; keep them compact text links')

# Brand visibility guardrails.
def selector_targets(selectors, target):
    return any(part.strip() == target for part in selectors.split(','))

brand_base_match = re.search(r'--brand-mark-base-size\s*:\s*([0-9.]+)rem\s*;', css_no_comments)
if not brand_base_match:
    errors.append('CSS missing --brand-mark-base-size token')
elif float(brand_base_match.group(1)) < 3.0:
    errors.append('--brand-mark-base-size must stay at least 3rem so the header logo remains prominent')

brand_size_match = re.search(r'--brand-mark-size\s*:\s*clamp\(\s*(?:var\(--brand-mark-base-size\)|([0-9.]+)rem)\s*,', css_no_comments)
if not brand_size_match:
    errors.append('CSS missing --brand-mark-size clamp token')
elif brand_size_match.group(1) and float(brand_size_match.group(1)) < 3.0:
    errors.append('--brand-mark-size clamp minimum must stay at least 3rem')

brand_text_size_match = re.search(r'--brand-text-size\s*:\s*clamp\(\s*([0-9.]+)rem\s*,.*?,\s*([0-9.]+)rem\s*\)', css_no_comments)
if not brand_text_size_match:
    errors.append('CSS missing --brand-text-size clamp token')
elif float(brand_text_size_match.group(1)) < 1.08 or float(brand_text_size_match.group(2)) < 1.45:
    errors.append('--brand-text-size must remain large enough to keep the brand name legible')

brand_text_rule_found = False
for selectors, body, _ in iter_rules(css_no_comments):
    if selector_targets(selectors, '.brand-mark') and hidden_in_body(body):
        errors.append('CSS hides .brand-mark by default')
    if selector_targets(selectors, '.brand-text'):
        brand_text_rule_found = True
        normalized = ' '.join(body.lower().split())
        if hidden_in_body(body) or re.search(r'\bfont-size\s*:\s*0\b', normalized):
            errors.append('CSS hides .brand-text by default')

if not brand_text_rule_found:
    errors.append('CSS missing .brand-text rule for visible brand name styling')

for media in re.finditer(r'@media\s*\((?:max-width:\s*(\d+)px|width\s*<=\s*(\d+)px|min-width:\s*(\d+)px)\)\s*\{(?P<body>.*?)\n\}', css_no_comments, re.S):
    width=int(media.group(1) or media.group(2) or media.group(3))
    condition = f'media rule at {width}px'
    for selectors, body, _ in iter_rules(media.group('body')):
        if selector_targets(selectors, '.brand-mark') and hidden_in_body(body):
            errors.append(f'CSS hides .brand-mark in {condition}')
        if selector_targets(selectors, '.brand-text') and hidden_in_body(body):
            errors.append(f'CSS hides .brand-text in {condition}')
        if selector_targets(selectors, '.brand-text') and re.search(r'\bdisplay\s*:\s*none\b', ' '.join(body.lower().split())):
            errors.append(f'CSS sets .brand-text to display:none in {condition}')


# Homepage hero visual guardrails.
for selectors, body, _ in iter_rules(css_no_comments):
    if selectors.startswith('@'):
        continue
    if '.home-hero' in selectors and '.hero-visual' in selectors and hidden_in_body(body):
        errors.append('CSS globally hides .home-hero .hero-visual')
    if 'HPfamilyland.gif' in selectors and hidden_in_body(body):
        errors.append('CSS globally hides the homepage HPfamilyland.gif asset')

small_phone_found=False
for media in re.finditer(r'@media\s*\((?:max-width:\s*(\d+)px|width\s*<=\s*(\d+)px)\)\s*\{(?P<body>.*?)\n\}', css_no_comments, re.S):
    width=int(media.group(1) or media.group(2))
    if width > 700:
        continue
    orders={}
    for selectors, body, _ in iter_rules(media.group('body')):
        order_match=re.search(r'\border\s*:\s*(\d+)\b', body)
        if not order_match:
            continue
        if '.home-hero' in selectors and '.hero-visual' in selectors:
            orders['visual']=int(order_match.group(1))
        if '.home-hero' in selectors and '.hero-actions' in selectors:
            orders['actions']=int(order_match.group(1))
    if {'visual','actions'} <= orders.keys():
        small_phone_found=True
        if orders['visual'] < orders['actions']:
            errors.append(f'Mobile hero ordering places .hero-visual before .hero-actions in max-width:{width}px media rule')
if not small_phone_found:
    errors.append('Missing small-phone CSS order rules for .home-hero .hero-actions and .hero-visual')

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
