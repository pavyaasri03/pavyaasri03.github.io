import { createPortfolioScene } from './scene.js';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const menu=$('#mobile-menu-btn'),nav=$('#mobile-nav');
function setMenu(open){nav.hidden=!open;menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
matchMedia('(min-width: 768px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});
$('#current-year').textContent=new Date().getFullYear();

const projects=[
 {name:'ArivuPro',kind:'LLM assessment platform',text:'A source-grounded assessment pipeline: chunked extraction, generation, verification, repair and teacher review. Validated on a 98-page source document.',href:'#quiz-platform'},
 {name:'LingoCut',kind:'Multilingual speech',text:'English lectures become colloquial Indian-language audio and video. Twelve code-switched dialects, editable translations, segment timing and checkpointed processing.',href:'#lingocut'},
 {name:'MarketInsight Pro',kind:'Marketing intelligence',text:'Collect signals from 8+ sources, classify relevance and sentiment, and prepare grounded reply drafts for human review.',href:'#marketinsight'},
 {name:'Smart Attendance',kind:'Full-stack workflows',text:'Faculty onboarding, timetable assignment and weekly scheduling for three roles, with overlap detection and responsive dashboards.',href:'#smart-attendance'}
];
const explorer=$('#explorer'),dialog=$('#project-dialog'),canvas=$('#world-canvas');
let scene=null,exploring=false,lastFocus=null,paused=false;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
function failure(){
 document.body.classList.remove('webgl-ready','exploring');
 document.body.classList.add('webgl-fallback');
 $('#scene-status').textContent='3D unavailable on this device. Explore the full story below.';
 $$('[data-explore]').forEach(b=>{b.hidden=true;});
 if(exploring)closeExplorer();
 $('#motion-toggle').hidden=true;
}
function openProject(index){
 const project=projects[index];
 $('#dialog-title').textContent=project.name;$('#dialog-kind').textContent=project.kind;$('#dialog-copy').textContent=project.text;$('#dialog-story').href=project.href;
 dialog.showModal();
}
try { scene=createPortfolioScene({canvas,onProject:openProject,onFailure:failure}); }
catch { failure(); }
if(scene){document.body.classList.add('webgl-ready');$('#scene-status').textContent='Live 3D · Drag the sculpture to rotate';}
function motion(){
 const stopped=paused||preference.matches;
 document.body.classList.toggle('motion-paused',stopped);
 const button=$('#motion-toggle');button.textContent=preference.matches?'Reduced motion':paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(stopped));button.disabled=preference.matches;
 scene?.setMotion(paused,preference.matches);
}
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;motion();});preference.addEventListener('change',motion);motion();
function openExplorer(){
 if(!scene)return;
 lastFocus=document.activeElement;exploring=true;setMenu(false);
 document.body.classList.add('exploring');explorer.hidden=false;explorer.setAttribute('aria-modal','true');
 $('#page-content').inert=true;$('.site-header').inert=true;$('.journey-dock').inert=true;
 canvas.style.pointerEvents='auto';scene.setExplore(true);$('#close-explorer').focus();
}
function closeExplorer(){
 exploring=false;document.body.classList.remove('exploring');explorer.hidden=true;explorer.removeAttribute('aria-modal');
 $('#page-content').inert=false;$('.site-header').inert=false;$('.journey-dock').inert=false;
 canvas.style.pointerEvents='';scene?.setExplore(false);lastFocus?.focus({preventScroll:true});
}
$$('[data-explore]').forEach(button=>button.addEventListener('click',openExplorer));
$('#close-explorer').addEventListener('click',closeExplorer);
$$('[data-hotspot]').forEach(button=>button.addEventListener('click',()=>openProject(Number(button.dataset.hotspot))));
$$('[data-project-button]').forEach(button=>button.addEventListener('click',()=>openProject(Number(button.dataset.projectButton))));
$('#close-project').addEventListener('click',()=>dialog.close());
$('#dialog-story').addEventListener('click',()=>{dialog.close();closeExplorer();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
$('#rotate-left').addEventListener('click',()=>scene?.rotate(.3));$('#rotate-right').addEventListener('click',()=>scene?.rotate(-.3));
$('#zoom-in').addEventListener('click',()=>scene?.zoom(1));$('#zoom-out').addEventListener('click',()=>scene?.zoom(-1));$('#reset-camera').addEventListener('click',()=>scene?.reset());
document.addEventListener('keydown',event=>{
 if(dialog.open)return;
 if(event.key==='Escape'){
  if(exploring)closeExplorer();else if(menu.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}
 }
 if(exploring&&['ArrowLeft','ArrowRight','+','-'].includes(event.key)){
  event.preventDefault();if(event.key==='ArrowLeft')scene?.rotate(.2);if(event.key==='ArrowRight')scene?.rotate(-.2);if(event.key==='+')scene?.zoom(1);if(event.key==='-')scene?.zoom(-1);
 }
 if(exploring&&event.key==='Tab'){
  const focusables=[...explorer.querySelectorAll('button,a')].filter(el=>!el.hidden&&el.getClientRects().length);
  const first=focusables[0],last=focusables.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 }
});

const sections=$$('[data-chapter]');const dockLinks=$$('.journey-dock a');
let scheduled=false;
function reading(){
 scheduled=false;const distance=document.documentElement.scrollHeight-innerHeight;
 $('#reading-progress').style.transform=`scaleX(${distance>0?Math.max(0,Math.min(1,scrollY/distance)):0})`;
 let active=sections[0];sections.forEach(section=>{if(section.getBoundingClientRect().top<innerHeight*.5)active=section;});
 dockLinks.forEach(link=>{const current=link.hash===`#${active.id}`;if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 $('#chapter-readout').textContent=active.dataset.chapter;
}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(reading);}},{passive:true});addEventListener('resize',reading);reading();
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');reveal.unobserve(entry.target);}}),{threshold:.12});
$$('[data-reveal]').forEach(element=>reveal.observe(element));
document.body.classList.add('enhanced');
