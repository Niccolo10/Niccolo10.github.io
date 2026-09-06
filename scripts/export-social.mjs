import { chromium } from '@playwright/test';
const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
await page.goto('http://localhost:4321/social.svg');
await page.screenshot({path:'public/social.png'});
await browser.close();
