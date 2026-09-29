import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
process.env.PORT='0';
const {server}=await import('../scripts/serve.mjs');
if(!server.listening) await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'], ...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
await mkdir('test-results',{recursive:true});
const errors=[];const checks=[];
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
const click=label=>page.getByRole('button',{name:label,exact:true}).click();
async function audit(name) {
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  if(result.violations.length) await writeFile(`test-results/axe-${name}.json`,JSON.stringify(result.violations,null,2));
  assert.deepEqual(result.violations.map(v=>`${v.id}: ${v.nodes.map(n=>n.target).join(', ')}`),[],`Accessibility: ${name}`);
  checks.push(`Accessibility: ${name}`);
}
async function noOverflow(label) {
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${label} horizontal overflow`);
}
try {
  const routes=['index.html','ai-evaluator-demo.html','biometric-voting-demo.html','lms-demo.html','complaint-system-demo.html'];
  for(const width of [1440,768,390]) {
    await page.setViewportSize({width,height:1000});
    for(const file of routes) {
      await page.goto(`${base}/${file}`);await page.waitForLoadState('networkidle');
      if(file!=='index.html') await page.locator('#demo-app > :first-child').waitFor();
      await noOverflow(`${file} ${width}`);
      await page.screenshot({path:`test-results/${file.replace('.html','')}-${width}.png`,fullPage:true});
      if(file==='index.html' && width!==768) await page.screenshot({path:`test-results/portfolio-top-${width}.png`});
      if(file==='index.html') {
        const type=await page.evaluate(()=>({name:parseFloat(getComputedStyle(document.querySelector('#hero-name')).fontSize),role:parseFloat(getComputedStyle(document.querySelector('.hero-role')).fontSize),headings:[...document.querySelectorAll('h2,h3')].map(el=>parseFloat(getComputedStyle(el).fontSize))}));
        assert.ok(type.name>type.role && type.headings.every(size=>size<type.role),`Name and role dominate typography at ${width}px`);
      }
      if(width===1440) await audit(file);
    }
  }
  checks.push('Five pages at desktop, tablet and mobile widths');
  await page.goto(base);await click('Open navigation');
  await page.locator('#mobile-nav').getByRole('link',{name:'Contact',exact:true}).click();
  assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'),'false');
  await click('Open navigation');await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-menu-btn').getAttribute('aria-expanded'),'false');
  await page.locator('#quiz-platform summary').click();
  assert.equal(await page.locator('#quiz-platform details').getAttribute('open'),'');
  const pdf=await context.request.get(`${base}/output/pdf/Pavyaa_Sri_Res.pdf`);
  assert.equal(pdf.status(),200);assert.equal((await pdf.body()).subarray(0,4).toString(),'%PDF');
  checks.push('Mobile navigation, oversized identity, technical details and resume download');
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}/ai-evaluator-demo.html`);
  await click('Compare with rubric');assert.match(await page.locator('#assessment-result').innerText(),/7/);
  await click('Load complete answer');await click('Compare with rubric');
  assert.match(await page.locator('#assessment-result').innerText(),/4 of 4 criteria matched/);
  await page.locator('#response').fill('<img src=x onerror=alert(1)>');
  assert.match(await page.locator('#assessment-result').innerText(),/Response changed/);
  await click('Compare with rubric');assert.equal(await page.locator('#assessment-result img').count(),0);
  await page.locator('#rubric').selectOption('dbms');await click('Load complete answer');await click('Compare with rubric');
  const [report]=await Promise.all([page.waitForEvent('download'),click('Export this breakdown')]);assert.match(report.suggestedFilename(),/json$/);
  await audit('assessment-result');checks.push('Rubric evaluation, invalidation, presets, safe input and export');
  await page.goto(`${base}/biometric-voting-demo.html`);await click('Simulate verification');
  await page.getByRole('radio',{name:'Maya Rao'}).check();await click('Review selection →');await click('← Change selection');
  await page.getByRole('radio',{name:'Arjun Sen'}).check();await click('Review selection →');await click('Submit sample vote');
  assert.match(await page.locator('#demo-app').innerText(),/101/);assert.match(await page.locator('#demo-app').innerText(),/37 \/ 101/);
  await audit('voting-receipt');
  await click('Start a new simulation');await click('Keep exploring');assert.match(await page.locator('#view-title').innerText(),/recorded/);
  await click('Start a new simulation');await click('Reset sample data');assert.match(await page.locator('#view-title').innerText(),/Begin/);
  checks.push('Verification, candidate change, single vote, tally and reset');
  await page.goto(`${base}/lms-demo.html`);
  await page.locator('#course-search').fill('not a course');assert.match(await page.locator('#course-results').innerText(),/No courses/);
  await page.locator('#course-search').fill('python');await click('Continue learning →');await click('Mark lesson complete');
  await click('Back to courses');assert.match(await page.locator('#course-results').innerText(),/7 of 12/);
  await click('Assignments');await page.getByRole('button',{name:'Submit',exact:true}).first().click();
  await page.locator('textarea[name="notes"]').fill('Input validation and resource routes. <script>unsafe</script>');
  await click('Use sample attachment');await click('Submit coursework');
  await click('Faculty');await click('Grade');await page.locator('input[name="score"]').fill('87');
  await page.locator('textarea[name="feedback"]').fill('Clear resource boundaries.');await click('Save grade');
  await click('Student');await page.getByRole('button',{name:'View',exact:true}).first().click();
  assert.match(await page.locator('#demo-app').innerText(),/87\/100/);assert.match(await page.locator('#demo-app').innerText(),/Clear resource boundaries/);
  await audit('learning-feedback');await click('Admin');assert.match(await page.locator('#demo-app').innerText(),/7\/12/);
  checks.push('Course search/progress, submission, faculty grading and shared admin state');
  await page.goto(`${base}/complaint-system-demo.html`);await click('Register');
  await page.locator('[name="title"]').fill('Sample light <b>repair</b>');await page.locator('[name="category"]').selectOption('Facilities');
  await page.locator('[name="location"]').fill('Fictional room');await page.getByRole('textbox',{name:'Description',exact:true}).fill('Sample issue for verification.');await click('Register sample ticket →');
  assert.equal(await page.locator('[name="ticket"]').inputValue(),'CMP-0049');assert.match(await page.locator('#demo-app').innerText(),/Sample light <b>repair<\/b>/);
  await click('Admin');let row=page.getByRole('row').filter({hasText:'CMP-0049'});
  await row.getByRole('button',{name:'Assign',exact:true}).click();await row.getByRole('button',{name:'Resolve',exact:true}).click();await row.getByRole('button',{name:'View history'}).click();
  assert.equal(await page.locator('.timeline li').count(),3);assert.match(await page.locator('.timeline').innerText(),/Resolved/);
  await page.locator('[name="ticket"]').fill('CMP-NOT-FOUND');await click('Track ticket');assert.match(await page.locator('#demo-app').innerText(),/No sample ticket found/);
  await click('Admin');await page.locator('#category-filter').selectOption('Academic services');assert.match(await page.locator('#ticket-results').innerText(),/No tickets/);
  await audit('complaint-filter');checks.push('Complaint registration, exact-ID tracking, transitions, filters and safe rendering');
  await page.goto(`${base}/index_updated.html`);await page.waitForURL(`${base}/index.html`);checks.push('Legacy portfolio redirects');
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const plain=await noJS.newPage();
  await plain.goto(base);assert.equal(await plain.getByRole('heading',{level:1}).isVisible(),true);assert.equal(await plain.locator('#mobile-nav').isVisible(),true);await noJS.close();
  assert.deepEqual(errors,[],'Runtime or missing local resource errors');
  await writeFile('test-results/report.json',JSON.stringify({passed:checks,errors},null,2));
  console.log(`PASS: ${checks.length} browser check groups; no runtime errors. Screenshots in test-results/.`);
} finally {await browser.close();server.close();}
