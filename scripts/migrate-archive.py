"""Migrate presentation/content from the owned Hugo snapshot; preserve utility bytes."""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse, unquote
import json
import hashlib
import shutil

root = Path(__file__).resolve().parents[1]
source = Path('/tmp/niccoparla-review-20260906')
backup = root / 'editorial/legacy-presentation-backup'
special = {'posts/ejpt': 'ejpt', 'writeups/dante_ctf_2023_web': 'dante-web', 'writeups/ths_challenges_crypto': 'ths-crypto'}
skip = {'projects/about', 'projects/prova', 'posts/random', 'writeups/over_the_wire-bandit'}
entries, aliases, bodies = [], {}, []
for file in sorted(source.rglob('index.html')):
    relative = file.relative_to(source).as_posix()
    old = relative.removesuffix('/index.html')
    if not old.startswith(('projects/', 'posts/', 'writeups/')) or old in skip:
        continue
    soup = BeautifulSoup(file.read_text(), 'html.parser')
    body = soup.select_one('.postWrapper > div')
    if body is None or not body.get_text(strip=True):
        continue
    slug = special.get(old, old.replace('/', '-').replace('_', '-'))
    title = soup.h1.get_text(' ', strip=True)
    titles = {'projects/editdistance': 'Edit distance with and without N-grams', 'projects/watermarking': 'Image watermarking with DWT, SVD, and DCT', 'projects/cryptographically_enforced_access_control': 'Cryptographically enforced access control'}
    title = titles.get(old, title)
    time = soup.find('time')
    date = time.get('datetime', '2023-01-01')[:10] if time else '2023-01-01'
    description = body.find('p').get_text(' ', strip=True) if body.find('p') else title
    if slug in special.values():
        existing = (root / f'src/content/research/{slug}.md').read_text()
        # Retain the existing frontmatter for the three previously curated articles.
        front = existing.split('---', 2)[1]
    else:
        front = f'\ntitle: {json.dumps(title)}\ndescription: {json.dumps(description)}\ncategory: Archive\ndate: {date}\ndraft: false\n'
    target = f'/research/{slug}/'
    aliases[f'/{old}/'] = target
    entries.append(dict(title=title, href=target, date=date, section={'projects':'Projects','writeups':'CTF writeups','posts':'Learning notes'}[old.split('/')[0]]))
    bodies.append((slug, front, body))

for file in source.rglob('*'):
    if not file.is_file() or '.git' in file.parts:
        continue
    rel = file.relative_to(source).as_posix()
    is_old_page = rel.endswith('/index.html') or rel.endswith('.xml')
    if is_old_page:
        if rel.endswith('/index.html'):
            path = '/' + rel.removesuffix('index.html')
            if path not in aliases and path != '/about/':
                aliases[path] = '/about/' if 'about' in path.lower() else '/archive/'
        elif rel != 'sitemap.xml':
            aliases['/' + rel] = '/feed.xml'
    if is_old_page or rel.startswith('sass/'):
        local = root / 'public' / rel
        if local.exists():
            dest = backup / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(local), dest)

def rewrite(value):
    parsed = urlparse(value)
    if parsed.netloc and parsed.netloc.lower() not in {'niccolo10.github.io', 'niccoloparlanti.com'}:
        return value
    path = unquote(parsed.path)
    normalized = path.removesuffix('index.html')
    if normalized and not normalized.endswith('/') and '.' not in normalized.rsplit('/',1)[-1]:
        normalized += '/'
    destination = aliases.get(normalized, path)
    return destination + ('?' + parsed.query if parsed.query else '') + ('#' + parsed.fragment if parsed.fragment else '')

for slug, front, body in bodies:
    for tag in body.select('script, iframe, style'):
        tag.decompose()
    for tag in body.select('h1'):
        tag.name = 'h2'
    for tag in body.find_all(True):
        for attr in list(tag.attrs):
            if attr.lower().startswith('on') or attr == 'style':
                del tag[attr]
        for attr in ['src','href']:
            if tag.get(attr):
                tag[attr] = rewrite(tag[attr])
    note = '> From the archive. This article retains its original publication date; tools and recommendations reflect that period.\n\n'
    html = body.decode_contents().replace('</div><', '</div>\n\n<')
    (root / f'src/content/research/{slug}.md').write_text('---' + front + '---\n\n' + note + html + '\n')

data = root / 'src/data'
data.mkdir(exist_ok=True)
(data / 'archive.json').write_text(json.dumps(entries, indent=2) + '\n')
(root / 'legacy-redirects.json').write_text(json.dumps(aliases, indent=2) + '\n')
old_manifest = json.loads((root / 'legacy-manifest.json').read_text())
retained = {p:h for p,h in old_manifest.items() if (root / 'public' / p).is_file()}
for p,h in retained.items():
    assert hashlib.sha256((root/'public'/p).read_bytes()).hexdigest() == h
(root / 'legacy-manifest.json').write_text(json.dumps(retained, indent=2) + '\n')
print(f'Migrated {len(entries)} articles/projects; {len(aliases)} URL redirects; {len(retained)} unchanged support/assets. Old presentation moved to {backup}.')
