// Validate draft examples without sending requests or evaluating template expressions.
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const directories = ['src/content/bug-code'];
if (await readdir('editorial/field-rules').catch(() => null)) directories.push('editorial/field-rules');
for (const directory of directories) for (const file of await readdir(directory)) {
  if (!file.endsWith('.md')) continue;
  const source = await readFile(`${directory}/${file}`, 'utf8');
  assert(!/[\u2013\u2014]|retest|github_pat_|ghp_[A-Za-z0-9]{20,}/i.test(source), file);
  for (const [,body] of source.matchAll(/```http\n([\s\S]*?)\n```/g)) {
    assert(/^Host: [\w.-]+\.example\.invalid$/m.test(body), `Non-example host: ${file}`);
    if (body.includes('\n\n{')) JSON.parse(body.split('\n\n')[1]);
  }
  for (const [,body] of source.matchAll(/```json\n([\s\S]*?)\n```/g)) JSON.parse(body);
  if (file === 'remember-the-device-not-the-password.md') {
    const code = [...source.matchAll(/```javascript\n([\s\S]*?)\n```/g)];
    assert.equal(code.length, 1);
    vm.runInNewContext(code[0][1], {btoa, atob, encodeURIComponent, decodeURIComponent, console:{assert: value => assert(value)}}, {timeout:1000});
  }
  if (file === 'an-id-shall-not-rewrite-the-route.md') {
    const code = [...source.matchAll(/```javascript\n([\s\S]*?)\n```/g)];
    assert.equal(code.length, 1);
    vm.runInNewContext(code[0][1], {URL, console:{assert: value => assert(value)}}, {timeout:1000});
  }
}
console.log('Article request/JSON checks and local cookie encoding and URL construction examples passed. No target requests or template evaluation.');
