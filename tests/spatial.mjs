import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {mkdir,writeFile} from 'node:fs/promises';
process.env.PORT='0';
const {server}=await import('../scripts/serve.mjs');if(!server.listening)await once(server,'listening');
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
await mkdir('test-results',{recursive:true});
const errors=[],checks=[];
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
const canvas=page.locator('#world-canvas');
const click=name=>page.getByRole('button',{name,exact:true}).click();
async function audit(label){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();if(result.violations.length)await writeFile(`test-results/spatial-axe-${label}.json`,JSON.stringify(result.violations,null,2));assert.deepEqual(result.violations.map(v=>`${v.id}: ${v.nodes.map(n=>n.target).join(', ')}`),[],label);}
try {
 await page.goto(base);await page.waitForFunction(()=>document.body.classList.contains('webgl-ready')&&Number(document.querySelector('canvas').dataset.frames)>2);
 const f=Number(await canvas.getAttribute('data-frames'));await page.waitForFunction(before=>Number(document.querySelector('canvas').dataset.frames)>before+4,f);
 await click('Pause motion');await page.waitForTimeout(150);const still=await canvas.getAttribute('data-frames');await page.waitForTimeout(250);assert.equal(await canvas.getAttribute('data-frames'),still,'Pause stops continuous rendering');
 await click('Resume motion');await page.waitForFunction(before=>Number(document.querySelector('canvas').dataset.frames)>Number(before),still);
 checks.push('Real WebGL rendering, animated frames and working pause/resume');
 const before=await canvas.getAttribute('data-rotation');await page.mouse.move(1120,590);await page.mouse.down();await page.mouse.move(1230,620,{steps:12});await page.mouse.up();await page.waitForFunction(value=>document.querySelector('canvas').dataset.rotation!==value,before);
 checks.push('Hero sculpture responds to drag');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [id,stage] of [['quiz-platform','1'],['lingocut','2'],['marketinsight','3'],['smart-attendance','4']]){
  await page.evaluate(id=>scrollTo(0,document.getElementById(id).offsetTop),id);
  await page.waitForFunction(stage=>document.querySelector('canvas').dataset.scene===stage,stage);
  await page.screenshot({path:`test-results/spatial-${id}.png`});
 }
 checks.push('Scroll selects all four distinct project sculptures');
 await click('Explore in 3D');assert.equal(await page.locator('#explorer').isVisible(),true);assert.equal(await canvas.getAttribute('data-explore'),'true');
 let camera=await canvas.getAttribute('data-camera');await click('Rotate right');await page.waitForFunction(value=>document.querySelector('canvas').dataset.camera!==value,camera);
 camera=await canvas.getAttribute('data-camera');await click('Zoom in');await page.waitForFunction(value=>document.querySelector('canvas').dataset.camera!==value,camera);
  await click('Reset view');
  await audit('explorer');
  const node=await page.locator('[data-hotspot="2"]').boundingBox();
  await page.mouse.click(node.x+node.width/2,node.y+node.height/2-60);
  await page.locator('#project-dialog[open]').waitFor();
  assert.equal(await page.locator('#dialog-title').innerText(),'MarketInsight Pro','Selecting the 3D object opens its project');
  await page.keyboard.press('Escape');
 for(const [button,name] of [['01 · ArivuPro','ArivuPro'],['02 · LingoCut','LingoCut'],['03 · MarketInsight','MarketInsight Pro'],['04 · Attendance','Smart Attendance']]){
  await click(button);assert.equal(await page.locator('#dialog-title').innerText(),name);assert.equal(await page.locator('#project-dialog').isVisible(),true);await page.keyboard.press('Escape');
 }
 await click('01 · ArivuPro');await audit('project-dialog');await page.getByRole('link',{name:'Read the engineering story'}).click();assert.equal(await page.locator('#explorer').isVisible(),false);assert.equal(await page.locator('#project-dialog').isVisible(),false);assert.equal(await page.locator('#page-content').getAttribute('inert'),null);
 await click('Explore in 3D');await page.keyboard.press('Escape');assert.equal(await page.locator('#explorer').isVisible(),false);
 checks.push('Explorer orbit/zoom/reset, 3D object picking, project dialogs, story links, Escape and accessibility');
 for(const width of [320,390,768,1440,1920]){
  await page.setViewportSize({width,height:900});await page.goto(base);await page.waitForFunction(()=>document.body.classList.contains('webgl-ready'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`No overflow at ${width}`);
  assert.equal(await canvas.evaluate(el=>getComputedStyle(el).touchAction),'pan-y','Normal scrolling remains available');
  if(width===390){await page.screenshot({path:'test-results/spatial-mobile-final.png'});await click('Explore in 3D');await page.waitForTimeout(100);await page.screenshot({path:'test-results/spatial-mobile-explorer.png'});await audit('mobile-explorer');await page.keyboard.press('Escape');}
 }
 checks.push('320–1920px layouts and mobile explorer');
 const fallback=await browser.newContext({viewport:{width:390,height:844}});
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...rest){return /^webgl/.test(kind)?null:original.call(this,kind,...rest);};});
 const plain=await fallback.newPage();await plain.goto(base);await plain.waitForFunction(()=>document.body.classList.contains('webgl-fallback'));
 assert.equal(await plain.locator('#hero-name').isVisible(),true);assert.equal(await plain.getByRole('link',{name:'Enter my work'}).isVisible(),true);assert.equal(await plain.locator('[data-explore]').isVisible(),false);await fallback.close();
 checks.push('WebGL-unavailable fallback keeps the portfolio usable');
 assert.deepEqual(errors,[],'No runtime errors');await writeFile('test-results/spatial-report.json',JSON.stringify({checks,errors},null,2));console.log(`PASS: ${checks.length} 3D experience check groups.`);
} finally {await browser.close();server.close();}
