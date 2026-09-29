import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Original procedural sculptures. No model, texture, or image downloads are required.
export function createPortfolioScene({ canvas, onProject, onFailure }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch { onFailure(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 768 ? 1.25 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(39, innerWidth / innerHeight, .1, 70);
  camera.position.set(0, 0, 9);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(environment, .04);
  scene.environment = envTarget.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xadbaff, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 4.5); key.position.set(-3, 5, 4); scene.add(key);
  const violet = new THREE.PointLight(0xa084ff, 65, 18); violet.position.set(4, 2, 2); scene.add(violet);
  const green = new THREE.PointLight(0xd6ff8d, 38, 16); green.position.set(-4, -2, 3); scene.add(green);

  const chrome = new THREE.MeshPhysicalMaterial({color:0xaeb6c6,metalness:1,roughness:.18,iridescence:.55,iridescenceIOR:1.3,clearcoat:1,envMapIntensity:1.5});
  const darkChrome = new THREE.MeshPhysicalMaterial({color:0x333843,metalness:1,roughness:.22,clearcoat:1,envMapIntensity:1.8});
  const pearl = new THREE.MeshPhysicalMaterial({color:0xbaacf8,metalness:.8,roughness:.21,clearcoat:1,iridescence:1,envMapIntensity:1.6});
  const light = new THREE.MeshStandardMaterial({color:0xd4fd79,emissive:0xa4d851,emissiveIntensity:.35,metalness:.35,roughness:.3});
  const lineMaterial = new THREE.LineBasicMaterial({color:0x9b91bc,transparent:true,opacity:.24});
  const root = new THREE.Group(); scene.add(root);
  const sculptures = [];
  const orbiters = [];
  const mesh = (geometry, material, parent, x=0,y=0,z=0) => {
    const item = new THREE.Mesh(geometry, material); item.position.set(x,y,z); parent.add(item); return item;
  };
  const ring = (parent, radius, tube, material, rx=0,ry=0) => {
    const item=mesh(new THREE.TorusGeometry(radius,tube,12,120),material,parent);item.rotation.set(rx,ry,0);return item;
  };
  function group() {const g=new THREE.Group();root.add(g);sculptures.push(g);return g;}
  // 00: reflective interlocking torus, a physical-looking central AI core.
  const core=group();
  mesh(new THREE.TorusKnotGeometry(1.08,.35,180,28,2,3),chrome,core).rotation.set(.3,.2,.1);
  ring(core,1.98,.018,light,1.05,.28);
  ring(core,2.22,.009,pearl,.35,-.7);
  for(let i=0;i<6;i++) {const node=mesh(new THREE.SphereGeometry(i===0?.14:.055,16,12),i===0?light:chrome,core);orbiters.push({node,r:2.05,a:i*Math.PI/3,y:.25});}

  // 01: layers of contextual information surrounding a checked result.
  const knowledge=group();
  for(let i=0;i<5;i++) {
    const slab=mesh(new THREE.BoxGeometry(2.5,.09,1.65),i===2?pearl:darkChrome,knowledge,0,(i-2)*.49,0);
    slab.rotation.y=(i-2)*.1;
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry),lineMaterial);slab.add(outline);
    for(let j=0;j<3;j++) mesh(new THREE.BoxGeometry(.09,.045,.6-j*.13),j===1?light:chrome,slab,-.8+j*.32,.07,.08);
  }
  knowledge.rotation.set(.24,0,.1);
  ring(knowledge,2.12,.023,chrome,1.3,.3);
  mesh(new THREE.OctahedronGeometry(.42,0),light,knowledge,1.2,.9,.9);

  // 02: a double helix of voice segments with a moving wave profile.
  const speech=group();
  const waveform=[];
  for(let i=0;i<42;i++) {
    const a=i/42*Math.PI*2;
    const bar=mesh(new THREE.CapsuleGeometry(.035,.15+Math.sin(i*.75)**2*.75,3,6),i%5===0?light:chrome,speech,Math.cos(a)*1.5,Math.sin(a)*1.5,Math.sin(a*3)*.35);
    bar.rotation.z=a;waveform.push(bar);
  }
  ring(speech,1.06,.12,pearl,0,0);
  ring(speech,1.95,.015,light,.5,.4);
  const speechCore=mesh(new THREE.SphereGeometry(.62,36,24),darkChrome,speech);

  // 03: a constellation collecting information into a central intelligence node.
  const intelligence=group();
  mesh(new THREE.IcosahedronGeometry(.85,2),chrome,intelligence);
  const positions=[];
  for(let i=0;i<12;i++) {
    const a=i/12*Math.PI*2, b=(i%3-1)*.72;
    const pos=new THREE.Vector3(Math.cos(a)*1.9,Math.sin(a)*1.6,b);
    const node=mesh(new THREE.OctahedronGeometry(i%3===0?.24:.12,0),i%3===0?light:pearl,intelligence,...pos.toArray());
    positions.push(0,0,0,...pos.toArray());
    orbiters.push({node,r:1.9,a,y:b,system:true});
  }
  intelligence.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(positions,3)),lineMaterial));
  ring(intelligence,2.25,.014,pearl,1.1,.1);

  // 04: a modular system, with individual roles around a shared foundation.
  const systems=group();
  for(let i=0;i<3;i++) {
    const torus=ring(systems,1.15,.23,i===1?pearl:chrome,Math.PI/2,0);torus.position.y=(i-1)*.7;
  }
  mesh(new THREE.CylinderGeometry(.48,.48,2,48),darkChrome,systems);
  for(let i=0;i<3;i++) {const a=i/3*Math.PI*2;mesh(new THREE.BoxGeometry(.42,.42,.42),i===0?light:chrome,systems,Math.cos(a)*1.8,Math.sin(a)*.7,Math.sin(a)*1.8);}
  ring(systems,2.1,.015,light,.3,.3);

  // A sparse depth field keeps the visual focus on the sculptures.
  let seed=21;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  const starPositions=[];
  for(let i=0;i<380;i++)starPositions.push((random()-.5)*28,(random()-.5)*18,-random()*15-3);
  const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3)),new THREE.PointsMaterial({color:0xacabc4,size:.017,transparent:true,opacity:.45,sizeAttenuation:true}));scene.add(stars);

  const controls=new OrbitControls(camera,canvas);
  controls.enabled=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=5.5;controls.maxDistance=15;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI-.3;
  canvas.style.touchAction='pan-y';
  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
  let explore=false,paused=false,reduced=false,active=0,progress=0,frame=0,time=0,last=performance.now(),rendered=0,disposed=false,settleFrames=0,mobileAnchor=760;
  let mouse={x:0,y:0},dragStart=null,dragRotation=0,targetDrag=0;
  const target=new THREE.Vector3(),worldPos=new THREE.Vector3();
  const sceneSections=[...document.querySelectorAll('[data-scene]')];
  const hotspots=[...document.querySelectorAll('[data-hotspot]')];
  const stageNames=['THE POSSIBILITY','CONTEXT → ASSESSMENT','LANGUAGE → VOICE','SIGNALS → INTELLIGENCE','RULES → EXPERIENCE'];
  function measureScroll() {
    if(explore)return;
    let closest=sceneSections[0],distance=Infinity;
    sceneSections.forEach(section=>{const r=section.getBoundingClientRect();const d=Math.abs(r.top+r.height*.45-innerHeight*.5);if(d<distance){distance=d;closest=section;}});
    active=Number(closest.dataset.scene);
    const rect=closest.getBoundingClientRect();progress=Math.max(-1,Math.min(1,(innerHeight*.5-rect.top)/Math.max(rect.height,1)-.5));
    const copy=closest.querySelector('.chapter-copy,.hero-copy');
    mobileAnchor=copy?copy.getBoundingClientRect().bottom+185:innerHeight*.7;
    canvas.dataset.scene=String(active);document.getElementById('scene-name').textContent=stageNames[active];
    requestRender();
  }
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);measureScroll();requestRender();}
  function pointerMove(event){mouse.x=event.clientX/innerWidth*2-1;mouse.y=event.clientY/innerHeight*2-1;if(dragStart&&!explore){targetDrag=dragStart.rotation+(event.clientX-dragStart.x)*.008;}requestRender();}
  function down(event){if(event.target.closest('a,button,summary,dialog'))return;dragStart={x:event.clientX,y:event.clientY,rotation:targetDrag};}
  function up(event){
    if(explore&&dragStart&&Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y)<6){
      pointer.set(event.clientX/innerWidth*2-1,-event.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);
      const hit=raycaster.intersectObjects(sculptures.slice(1),true)[0];
      if(hit){let object=hit.object;while(object.parent&&!sculptures.includes(object))object=object.parent;const index=sculptures.indexOf(object);if(index>0)onProject(index-1);}
    }
    dragStart=null;
  }
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
  addEventListener('pointermove',pointerMove,{passive:true});addEventListener('pointerup',()=>{dragStart=null;});
  addEventListener('resize',resize);addEventListener('scroll',measureScroll,{passive:true});
  // Expanded engineering notes change chapter height without a viewport resize.
  const chapterResize=new ResizeObserver(measureScroll);
  sceneSections.forEach(section=>chapterResize.observe(section));
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;onFailure();});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  function animate(now){
    frame=0;if(disposed||document.hidden)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!paused&&!reduced)time+=dt;
    const mobile=innerWidth<768;
    dragRotation=THREE.MathUtils.lerp(dragRotation,targetDrag,reduced?1:.1);
    if(explore){
      root.position.lerp(target.set(0,0,0),reduced?1:.09);root.scale.lerp(target.set(1,1,1),reduced?1:.1);root.rotation.set(0,0,0);
      sculptures.forEach((g,i)=>{
        g.visible=true;
        const positions=mobile?[[0,0,-.8],[-1.25,1.5,0],[1.25,1.5,0],[-1.25,-1.5,0],[1.25,-1.5,0]]:[[0,0,-.8],[-2.65,1.5,0],[2.65,1.5,0],[-2.65,-1.55,0],[2.65,-1.55,0]];
        g.position.lerp(target.set(...positions[i]),reduced?1:.1);g.scale.lerp(target.setScalar(mobile?(i===0?.37:.32):(i===0?.58:.47)),reduced?1:.1);
        g.rotation.y=time*.13+i*.4;g.rotation.z=Math.sin(time*.2+i)*.12;
      });
      controls.update(dt);
      camera.updateMatrixWorld();
      hotspots.forEach((button,i)=>{sculptures[i+1].getWorldPosition(worldPos);worldPos.project(camera);button.style.left=`${(worldPos.x*.5+.5)*innerWidth}px`;button.style.top=`${(-worldPos.y*.5+.5)*innerHeight+(mobile?38:60)}px`;button.hidden=worldPos.z>1||Math.abs(worldPos.x)>1.12||Math.abs(worldPos.y)>1.12;});
    } else {
      camera.position.lerp(target.set(reduced?0:mouse.x*.1, reduced?0:-mouse.y*.08,9),reduced?1:.07);camera.lookAt(0,0,0);
      const mobileY=(innerHeight*.5-mobileAnchor)*(2*9*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/innerHeight);
      root.position.lerp(target.set(mobile?0:1.85,mobile?mobileY:-.25,0),reduced?1:.12);
      root.scale.lerp(target.setScalar(mobile?.61:1.05),reduced?1:.1);
      root.rotation.set(0,0,0);
      sculptures.forEach((g,i)=>{
        const selected=i===active;g.visible=selected||g.scale.x>.02;
        g.scale.lerp(target.setScalar(selected?1:.001),reduced?1:.085);
        g.position.lerp(target.set(0,selected?0:(i<active?-2.8:2.8),selected?0:-4),reduced?1:.08);
        g.rotation.y=time*.14+progress*.7+dragRotation;
        g.rotation.x=.12+Math.sin(time*.25)*.1+(reduced?0:mouse.y*.055);
        g.rotation.z=Math.sin(time*.18)*.1;
      });
    }
    orbiters.filter(item=>!item.system).forEach(({node,r,a,y})=>node.position.set(Math.cos(time*.25+a)*r,Math.sin(time*.25+a)*r*.47+y,Math.sin(time*.25+a)*r*.5));
    waveform.forEach((bar,i)=>{bar.scale.y=1+Math.sin(time*1.8+i*.48)*.25;});
    speechCore.rotation.y=time*.1;stars.rotation.y=time*.006;
    renderer.render(scene,camera);rendered++;
    canvas.dataset.frames=String(rendered);canvas.dataset.rotation=dragRotation.toFixed(3);
    canvas.dataset.camera=camera.position.toArray().map(n=>n.toFixed(2)).join(',');
    if(settleFrames>0)settleFrames--;
    if(!paused&&!reduced||settleFrames>0||Math.abs(dragRotation-targetDrag)>.001)frame=requestAnimationFrame(animate);
  }
  function requestRender(){settleFrames=reduced?0:45;if(!frame&&!disposed&&!document.hidden){last=performance.now();frame=requestAnimationFrame(animate);}}
  controls.addEventListener('change',requestRender);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestRender();}
  document.addEventListener('visibilitychange',visibility);
  measureScroll();resize();
  return {
    setMotion(value,preference){paused=value;reduced=preference;controls.enableDamping=!preference;canvas.dataset.motion=paused||reduced?'paused':'running';requestRender();if(paused||reduced)settleFrames=0;},
    setExplore(value){explore=value;canvas.dataset.explore=String(value);controls.enabled=value;canvas.style.touchAction=value?'none':'pan-y';targetDrag=0;dragRotation=0;if(value){camera.position.set(0,0,innerWidth<768?13:10.5);controls.target.set(0,0,0);controls.update();}else{camera.position.set(0,0,9);hotspots.forEach(b=>b.hidden=true);measureScroll();}requestRender();},
    rotate(amount){if(explore){controls.rotateLeft(amount);controls.update();}else targetDrag+=amount;requestRender();},
    zoom(amount){if(explore){amount>0?controls.dollyIn(.85):controls.dollyOut(.85);controls.update();requestRender();}},
    reset(){targetDrag=0;dragRotation=0;camera.position.set(0,0,innerWidth<768?13:10.5);controls.target.set(0,0,0);controls.update();requestRender();},
    dispose(){disposed=true;cancelAnimationFrame(frame);controls.dispose();scene.traverse(object=>{object.geometry?.dispose();});[chrome,darkChrome,pearl,light,lineMaterial,stars.material].forEach(m=>m.dispose());envTarget.dispose();renderer.dispose();}
  };
}
