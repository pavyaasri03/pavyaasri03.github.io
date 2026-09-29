import {createWelcomeCore} from './welcome-core.js';

export function setupSession({onWelcomeChange,onToggleMotion,isMotionStopped}) {
  const $=selector=>document.querySelector(selector);
  const welcome=$('#welcome-dialog'),feedback=$('#feedback-dialog'),prompt=$('#departure-prompt');
  const key='pavyaa:welcome:seen';
  let core=null,coreAttempted=false,previousFocus=null,departureShown=false,engaged=false;
  let seen=false;
  try {seen=localStorage.getItem(key)==='1';} catch { /* The portfolio also works with storage disabled. */ }
  function motion(){
    const stopped=isMotionStopped();
    welcome.classList.toggle('session-still',stopped);
    $('#welcome-motion').textContent=stopped?'Motion off':'Pause motion';
    $('#welcome-motion').setAttribute('aria-pressed',String(stopped));
    core?.setState(welcome.open,stopped);
  }
  function openWelcome(){
    if(welcome.open)return;
    previousFocus=document.activeElement;
    welcome.showModal();document.body.classList.add('session-open');onWelcomeChange(true);
    if(!coreAttempted){coreAttempted=true;core=createWelcomeCore($('#welcome-canvas'));}
    $('.welcome-visual').classList.toggle('core-ready',!!core?.isAvailable());
    motion();
  }
  function closeWelcome(){welcome.close();}
  welcome.addEventListener('close',()=>{
    seen=true;try {localStorage.setItem(key,'1');} catch {}
    document.body.classList.remove('session-open');onWelcomeChange(false);core?.setState(false,true);
    if(previousFocus&&previousFocus!==document.body)previousFocus.focus({preventScroll:true});
    else {$('#hero-name').setAttribute('tabindex','-1');$('#hero-name').focus({preventScroll:true});}
  });
  $('#skip-welcome').addEventListener('click',closeWelcome);
  $('#enter-portfolio').addEventListener('click',closeWelcome);
  $('#welcome-motion').addEventListener('click',()=>{onToggleMotion();motion();});
  document.querySelectorAll('[data-replay-welcome]').forEach(button=>button.addEventListener('click',openWelcome));
  function dismissDeparture(){prompt.hidden=true;departureShown=true;}
  function openFeedback(){
    dismissDeparture();if(feedback.open)return;
    feedback.showModal();document.body.classList.add('session-open');
  }
  document.querySelectorAll('[data-feedback]').forEach(button=>button.addEventListener('click',openFeedback));
  $('#dismiss-departure').addEventListener('click',dismissDeparture);
  $('#close-feedback').addEventListener('click',()=>feedback.close());
  $('#continue-exploring').addEventListener('click',()=>feedback.close());
  feedback.addEventListener('close',()=>document.body.classList.remove('session-open'));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!prompt.hidden)dismissDeparture();});

  // Optional invitation only after meaningful reading. Never intercept tab closing or navigation.
  const started=performance.now();
  addEventListener('scroll',()=>{if(scrollY>innerHeight)engaged=true;},{passive:true});
  document.documentElement.addEventListener('mouseleave',event=>{
    if(event.clientY>8||!engaged||performance.now()-started<15000||departureShown||document.querySelector('dialog[open]')||document.body.classList.contains('exploring')||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
    prompt.hidden=false;departureShown=true;
  });
  $('#feedback-form').addEventListener('submit',event=>{
    event.preventDefault();
    const message=$('#feedback-message').value.trim();
    if(!message){$('#feedback-message').setCustomValidity('Please add a short message.');$('#feedback-message').reportValidity();return;}
    const subject=`Portfolio / ${$('#feedback-intent').value} / Pavyaa Sri`;
    const body=`Hi Pavyaa,\n\n${message}\n\nSent from your portfolio: https://pavyaasri03.github.io/`;
    location.href=`mailto:pavyaasris@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#feedback-status').textContent='Email draft requested. If your email app did not open, copy the address below. Your message stays here.';
  });
  $('#feedback-message').addEventListener('input',()=>$('#feedback-message').setCustomValidity(''));
  $('#copy-email').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText('pavyaasris@gmail.com');$('#feedback-status').textContent='Email address copied.';}
    catch {$('#feedback-status').textContent='Copy this address: pavyaasris@gmail.com';}
  });
  const filters=[...document.querySelectorAll('[data-skill-filter]')],groups=[...document.querySelectorAll('[data-skill-category]')];
  function filterSkills(value){
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.skillFilter===value)));
    groups.forEach(group=>{group.hidden=value!=='all'&&group.dataset.skillCategory!==value;});
    const count=groups.filter(group=>!group.hidden).reduce((sum,group)=>sum+group.querySelectorAll('li').length,0);
    $('#skill-count').textContent=`${count} skills / ${value==='all'?'All capabilities':filters.find(button=>button.dataset.skillFilter===value).textContent}`;
  }
  filters.forEach(button=>button.addEventListener('click',()=>filterSkills(button.dataset.skillFilter)));filterSkills('all');
  // Direct project links remain direct; the welcome can still be replayed from the footer.
  if(!seen&&!location.hash)openWelcome();
  return {motion};
}
