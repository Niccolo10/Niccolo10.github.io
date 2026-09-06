"""One-time import of the owned, generated site. No remote requests or script execution."""
import hashlib
import json
import shutil
from pathlib import Path
from bs4 import BeautifulSoup

source = Path('/tmp/niccoparla-review-20260906')
root = Path(__file__).resolve().parents[1]
if (root / 'legacy-redirects.json').exists():
    raise SystemExit('Archive already migrated. Use migrate-archive.py; this original importer would restore the retired presentation.')
public = root / 'public'
overridden = {'index.html', 'about/index.html', '404.html', 'sitemap.xml'}
manifest = {}
for item in source.rglob('*'):
    if not item.is_file() or '.git' in item.parts:
        continue
    name = item.relative_to(source).as_posix()
    if name in overridden:
        continue
    dest = public / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(item, dest)
    manifest[name] = hashlib.sha256(item.read_bytes()).hexdigest()
(root / 'legacy-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')

selected = [
    ('posts/ejpt/index.html', 'ejpt', 'My experience with eJPTv2', 'Preparation, practice, and lessons from my first penetration testing certification.', '2024-07-03'),
    ('writeups/dante_ctf_2023_web/index.html', 'dante-web', 'Dante CTF: web challenges', 'An earlier set of hands-on web security challenges and their solutions.', '2023-06-05'),
    ('writeups/ths_challenges_crypto/index.html', 'ths-crypto', 'THS challenges: cryptography', 'Working through cryptographic puzzles, from assumptions to solutions.', '2023-09-12'),
]
for old, slug, title, description, date in selected:
    soup = BeautifulSoup((source / old).read_text(), 'html.parser')
    body = soup.select_one('.postWrapper > div')
    if body is None:
        raise RuntimeError(f'Cannot locate article body: {old}')
    for tag in body.select('script, iframe, style'):
        tag.decompose()
    for tag in body.select('h1'):
        tag.name = 'h2'
    for tag in body.find_all(True):
        for key in list(tag.attrs):
            if key.lower().startswith('on') or key.lower() == 'style':
                del tag[key]
        for attr in ['src', 'href']:
            value = tag.get(attr, '')
            for base in ['http://Niccolo10.github.io', 'https://Niccolo10.github.io', 'https://niccoloparlanti.com']:
                if value.startswith(base):
                    tag[attr] = value[len(base):] or '/'
    front = f'---\ntitle: {json.dumps(title)}\ndescription: {json.dumps(description)}\ncategory: Archive\ndate: {date}\ndraft: false\n---\n\n'
    note = f'> From the archive. Originally published in {date[:4]}; retained as a historical learning note. Tools and recommendations reflect that period. [Original page](/{old.removesuffix("index.html")}).\n\n'
    (root / 'src/content/research' / f'{slug}.md').write_text(front + note + body.decode_contents() + '\n')
print(f'Preserved {len(manifest)} original files and imported {len(selected)} articles.')
