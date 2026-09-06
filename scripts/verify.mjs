import { readFile, stat, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
const manifest = JSON.parse(await readFile('legacy-manifest.json', 'utf8'));
for (const [file, hash] of Object.entries(manifest)) {
  assert.equal(createHash('sha256').update(await readFile(path.join('dist', file))).digest('hex'), hash, `Legacy file changed: ${file}`);
}
async function walk(dir) { const list = []; for (const e of await readdir(dir, {withFileTypes:true})) { const p = path.join(dir,e.name); if(e.isDirectory()) list.push(...await walk(p)); else list.push(p); } return list; }
const generated = (await walk('dist')).filter(p => p.endsWith('.html') && !manifest[p.slice(5)]);
const draftSlugs = (await readdir('editorial/field-rules').catch(() => [])).filter(f => f.endsWith('.md')).map(f => f.slice(0,-3));
const aliases = JSON.parse(await readFile('legacy-redirects.json','utf8'));
for (const [oldPath,target] of Object.entries(aliases)) {
  const file = path.join('dist',oldPath,oldPath.endsWith('.xml') ? '' : 'index.html');
  const content = await readFile(file,'utf8');
  if (oldPath.endsWith('.xml')) assert(content.includes('<rss'), `Legacy feed missing: ${oldPath}`);
  else assert(content.includes(target), `Redirect missing: ${oldPath}`);
}
assert(!(await walk('dist')).some(p => p.includes('/drafts/')), 'Editorial preview routes must not ship');
for (const file of (await walk('dist')).filter(p => /\.(html|xml|js|json)$/.test(p) && !manifest[p.slice(5)])) {
  const text = await readFile(file,'utf8');
  assert(!draftSlugs.some(slug => text.includes(slug)), `Editorial slug leaked: ${file}`);
  assert(!/invitation-is-not-identity|service-identity-is-not-permission|The service had access\. The caller had none\.|An invitation is not an identity\.|An invitation shall admit its recipient|A service shall not lend its privileges/.test(text), `Editorial draft leaked: ${file}`);
}
for (const file of generated) {
  const html = await readFile(file,'utf8');
  assert(!/headerWrapper|postWrapper|main\.min\.|Hugo 0\.|niccoloparlanti@cybersec/.test(html), `Old presentation remains: ${file}`);
  assert(!html.includes('borrowed-cloud-identity'), 'Private draft leaked');
  assert(!/github_pat_|ghp_[A-Za-z0-9]{20}|azurecontainerapps\.io|Submission ID:/.test(html), `Sensitive material in ${file}`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const target = decodeURIComponent(match[1]);
    const resolved = path.join('dist', target);
    let exists = false;
    for (const candidate of [resolved, path.join(resolved,'index.html')]) {
      try { if((await stat(candidate)).isFile()) exists = true; } catch {}
    }
    assert(exists, `Broken internal link ${target} in ${file}`);
  }
}
assert.equal((await readFile('dist/CNAME','utf8')).trim(),'niccoloparlanti.com');
console.log(`Verified ${Object.keys(manifest).length} unchanged legacy files and links in ${generated.length} new pages. No private draft in generated pages.`);
