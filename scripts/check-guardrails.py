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
for token in ['role="dialog"','aria-modal="true"','aria-labelledby="site-search-title"','<h2 id="site-search-title">']:
    if token not in sitejs:
        errors.append(f'search dialog token missing in site.js: {token}')

# Search toggle responsive guardrails.
if 'data-search-toggle' not in sitejs:
    errors.append('site.js missing data-search-toggle trigger attribute')

control_match=re.search(r'var\s+controlClasses\s*=\s*\{(?P<body>.*?)\};', sitejs, re.S)
control_classes={}
if control_match:
    for key, value in re.findall(r'(\w+)\s*:\s*"([^"]+)"', control_match.group('body')):
        control_classes[key]=value
else:
    errors.append('site.js missing controlClasses map for search trigger styling')

class_assignment=re.search(r'searchButton\.className\s*=\s*(?P<expr>[^;]+);', sitejs)
assigned_classes=[]
if class_assignment:
    expr=class_assignment.group('expr').strip()
    control_key=re.fullmatch(r'controlClasses\.(\w+)', expr)
    literal=re.fullmatch(r'"([^"]+)"', expr)
    if control_key:
        assigned_classes=control_classes.get(control_key.group(1), '').split()
    elif literal:
        assigned_classes=literal.group(1).split()
else:
    errors.append('site.js missing explicit className assignment for searchButton')

def iter_rules(text):
    for m in re.finditer(r'(?P<selectors>[^{}@]+)\{(?P<body>[^{}]*)\}', text, re.S):
        yield m.group('selectors').strip(), m.group('body').strip(), m.start()

def hidden_in_body(body):
    normalized=' '.join(body.lower().split())
    return bool(re.search(r'\bdisplay\s*:\s*none\b', normalized) or re.search(r'\bvisibility\s*:\s*hidden\b', normalized))


def hidden_classes_under(max_width_limit):
    hidden=set()
    for media in re.finditer(r'@media\s*\((?:max-width:\s*(\d+)px|width\s*<=\s*(\d+)px)\)\s*\{(?P<body>.*?)\n\}', css_no_comments, re.S):
        width=int(media.group(1) or media.group(2))
        if width > max_width_limit:
            continue
        for selectors, body, _ in iter_rules(media.group('body')):
            if not hidden_in_body(body):
                continue
            for cls in re.findall(r'\.([A-Za-z0-9_-]+)', selectors):
                hidden.add(cls)
    return hidden

mobile_hidden_classes=hidden_classes_under(899)
if assigned_classes and len(assigned_classes) == 1 and assigned_classes[0] in mobile_hidden_classes:
    errors.append(f'[data-search-toggle] assigned only mobile/tablet-hidden class: {assigned_classes[0]}')

for media in re.finditer(r'@media\s*\((?:max-width:\s*(\d+)px|width\s*<=\s*(\d+)px)\)\s*\{(?P<body>.*?)\n\}', css_no_comments, re.S):
    width=int(media.group(1) or media.group(2))
    if width >= 899:
        continue
    for selectors, body, _ in iter_rules(media.group('body')):
        if '[data-search-toggle]' in selectors and hidden_in_body(body):
            errors.append(f'CSS hides [data-search-toggle] below 899px in max-width:{width}px media rule')

# Homepage hero visual guardrails.
for selectors, body, _ in iter_rules(css_no_comments):
    if selectors.startswith('@'):
        continue
    if '.home-hero' in selectors and '.hero-visual' in selectors and hidden_in_body(body):
        errors.append('CSS globally hides .home-hero .hero-visual')

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
