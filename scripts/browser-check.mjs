import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
await mkdir('artifacts',{recursive:true});
const errors = [];
const archive = JSON.parse(await readFile('src/data/archive.json','utf8'));
const cases = (await readdir('src/content/bug-code')).filter(f => f.endsWith('.md'));
const readingOrder = [
  'a-template-is-not-an-administrator', 'an-id-shall-not-rewrite-the-route',
  'a-signed-response-is-not-a-safe-response', 'a-token-is-not-an-account',
  'service-identity-is-not-permission', 'invitation-is-not-identity',
  'the-shopper-shall-not-set-the-clock', 'a-mask-shall-not-answer-questions',
  'remember-the-device-not-the-password'
].map(slug => `/bug-code/${slug}/`);
const pages = ['/', '/about/', '/research/', '/archive/', '/bug-code/', ...cases.map(f => `/bug-code/${f.slice(0,-3)}/`), '/research/podinfo-content-type/', '/research/telejson-constructor/', ...archive.map(e=>e.href), '/404.html'];
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
await page.route('**/*', route => { const url = new URL(route.request().url()); return url.hostname === 'localhost' ? route.continue() : route.abort(); });
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({width,height:1000});
  for (const path of pages) {
    await page.goto(`http://localhost:4321${path}`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1,`Expected one title: ${path}`);
    if (path === '/bug-code/') {
      const links = await page.locator('.book-index-card').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')));
      assert.deepEqual(links, readingOrder);
      assert.deepEqual(await page.locator('.rule-reference').allTextContents(),readingOrder.map((_,i)=>`RULE ${String(i+1).padStart(2,'0')}`));
      assert.equal(await page.locator('.casebook-chapter').count(),3);
      assert.deepEqual(await page.locator('.casebook-chapter').evaluateAll(nodes => nodes.map(n => n.querySelectorAll('.book-index-card').length)),[3,3,3]);
      assert.equal(await page.locator('.chapter-navigation a').count(),3);
      assert.equal(await page.locator('.book-index-card p').count(),cases.length);
    }
    if (path.startsWith('/bug-code/') && path !== '/bug-code/') {
      assert.equal(await page.locator('meta[name="robots"]').count(),0);
      assert.equal(await page.locator('.preview-notice').count(),0);
      assert(await page.locator('pre[data-language="http"]').count() > 0);
      const next = page.locator('nav.article-end a');
      const rule = String(readingOrder.indexOf(path)+1).padStart(2,'0');
      assert((await page.locator('.book-opening .book-article').innerText()).includes(`ARTICLE ${rule}`));
      assert((await page.locator('.code-corollary strong').textContent()).includes(`Corollary ${rule}.`));
      assert.equal(await next.count(),1);
      assert.equal(await next.getAttribute('href'),readingOrder[readingOrder.indexOf(path)+1] ?? '/bug-code/#articles');
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`Overflow at ${width}px: ${path}`);
    const missing = await page.locator('img').evaluateAll(imgs => imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src));
    assert.deepEqual(missing, [], `Missing images: ${path}`);
    if (width === 1440) {
      const a11y = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(a11y.violations.map(v => ({id:v.id, targets:v.nodes.map(n => n.target)})),[],`Accessibility: ${path}`);
    }
    if (path === '/') {
      assert.equal(await page.getByRole('link',{name:'Freelance pentesting',exact:false}).getAttribute('href'),'#freelance');
      assert.equal(await page.locator('#freelance .freelance-details dt').count(),3);
      assert((await page.locator('#contact h2').innerText()).includes('penetration test?'));
      assert((await page.locator('#contact .button').getAttribute('href')).startsWith('mailto:'));
      if ([1440,390].includes(width)) await page.screenshot({path:`artifacts/home-${width}.png`,fullPage:true});
    }
  }
}
await page.goto('http://localhost:4321/research/');
await page.getByRole('button',{name:'Advisories',exact:true}).click();
assert.equal(await page.locator('[data-category]:visible').count(),2);
await page.getByRole('button',{name:'Archive',exact:true}).click();
assert.equal(await page.locator('[data-category]:visible').count(),archive.length);
await page.getByRole('button',{name:'Field notes',exact:true}).click();
assert.equal(await page.locator('[data-category]:visible').count(),cases.length);
await page.getByRole('button',{name:'All',exact:true}).click();
assert.equal(await page.locator('[data-category]:visible').count(),archive.length+2+cases.length);
const noJS = await browser.newContext({javaScriptEnabled:false});
const plain = await noJS.newPage();
await plain.goto('http://localhost:4321/research/');
assert.equal(await plain.locator('.research-row').count(),archive.length+2+cases.length);
assert(!(await plain.locator('.filters').isVisible()));
assert.deepEqual(errors,[]);
await browser.close();
console.log(`Browser checks passed: ${pages.length} pages at 4 widths, automated accessibility checks, images, filters, no-JS research, and no page errors.`);
