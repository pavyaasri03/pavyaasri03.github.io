import {createWelcomeCore} from './welcome-core.js';

export function setupSkillsScene(){
  const panel=document.querySelector('.skills-sculpture');
  const canvas=document.querySelector('#skills-canvas');
  let core=null,attempted=false,visible=false,lastState='';
  function update(){
    const active=visible&&!document.body.classList.contains('session-open')&&!document.body.classList.contains('exploring');
    const paused=document.body.classList.contains('motion-paused');
    if(active&&!attempted){attempted=true;core=createWelcomeCore(canvas,{network:true});panel.classList.toggle('core-ready',!!core);}
    const state=`${active}:${paused}`;
    if(state!==lastState){lastState=state;core?.setState(active,paused);}
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{threshold:.05}).observe(panel);
  new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['class']});
  const captions={all:['CONNECTED CAPABILITIES','Models. Interfaces. Systems.'],ai:['LANGUAGE → INTELLIGENCE','Context becomes understanding.'],engineering:['LOGIC → EXPERIENCE','Connected from interface to database.'],delivery:['BUILD → VALIDATE → SHIP','Ideas become dependable systems.']};
  document.querySelectorAll('[data-skill-filter]').forEach(button=>button.addEventListener('click',()=>{
    const [title,copy]=captions[button.dataset.skillFilter];
    document.querySelector('#skills-scene-title').textContent=title;
    document.querySelector('#skills-scene-copy').textContent=copy;
  }));
}
