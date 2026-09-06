import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir, readdir} from 'node:fs/promises';
const slugs = (await readdir('editorial/field-rules')).filter(f => f.endsWith('.md')).map(f => f.slice(0,-3) + '/');
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',args:['--no-sandbox']});
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await mkdir('artifacts',{recursive:true});
try {
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:1000});
    for (const slug of ['', ...slugs]) {
      const response = await page.goto(`http://localhost:4322/bug-code/${slug}`);
      assert.equal(response.status(),200);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('h1').count(),1,`Heading: ${slug}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow ${width}: ${slug}`);
      if (slug) assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
      if (slug) {
        assert.equal(await page.locator('pre[data-language="python"] code').count(),2,`Two code models: ${slug}`);
        assert.equal(await page.locator('.case-flow li').count(),3,`Three-stage flow: ${slug}`);
        const colors = await page.locator('pre[data-language="python"] code span').evaluateAll(nodes => [...new Set(nodes.map(n => getComputedStyle(n).color))]);
        assert(colors.length >= 4, `Syntax colors missing: ${slug}`);
      }
      if (width === 1440) {
        const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        assert.deepEqual(results.violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],slug);
      }
      for (const link of await page.locator('nav[aria-label="Table of contents"] a').all()) {
        const href = await link.getAttribute('href');
        assert(await page.evaluate(id => !!document.getElementById(id),href.slice(1)), `Missing heading ${href}`);
      }
      if ([1440,390].includes(width)) await page.screenshot({path:`artifacts/draft-${slug.replaceAll('/','') || 'index'}-${width}.png`,fullPage:true});
    }
  }
  await page.goto('http://localhost:4322/bug-code/');
  await page.getByRole('link').filter({hasText:'ARTICLE 01'}).click();
  assert(page.url().includes('invitation-is-not-identity'));
  await page.getByRole('link',{name:'A service shall not lend its privileges to strangers. →'}).click();
  assert(page.url().includes('service-identity-is-not-permission'));
  await page.getByRole('link',{name:'← THE BUG CODE',exact:true}).click();
  assert(page.url().endsWith('/bug-code/'));
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Archive',exact:true}).click();
  assert.equal(await page.locator('.archive-entry').count(),13);
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:'artifacts/archive-1440.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log(`Bug Code and ${slugs.length} drafts pass at four widths: navigation, syntax colors, flows, and automated accessibility checks.`);
} finally { await browser.close(); }
