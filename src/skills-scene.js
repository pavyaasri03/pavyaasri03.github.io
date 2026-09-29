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
  const captions={all:['How my skills connect','From the model to the finished product.'],ai:['Working with language models','Giving a model the context it needs.'],engineering:['Building the application','Connecting the interface, API and database.'],delivery:['Getting it ready to ship','Testing, fixing and making it dependable.']};
  document.querySelectorAll('[data-skill-filter]').forEach(button=>button.addEventListener('click',()=>{
    const [title,copy]=captions[button.dataset.skillFilter];
    document.querySelector('#skills-scene-title').textContent=title;
    document.querySelector('#skills-scene-copy').textContent=copy;
  }));
}
