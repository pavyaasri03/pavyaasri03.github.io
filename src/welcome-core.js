import * as THREE from 'three';

// Small procedural neural core. Runs only while the welcome is open.
export function createWelcomeCore(canvas, {network=false} = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'}); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 30);
  camera.position.z = 7;
  scene.add(new THREE.HemisphereLight(0xe4e1ff, 0x292233, 3));
  const key = new THREE.PointLight(0xc5b6ff, 45); key.position.set(2,3,4); scene.add(key);
  const rim = new THREE.PointLight(0xd4fd79, 35); rim.position.set(-2,-1,3); scene.add(rim);
  const root = new THREE.Group(); scene.add(root);
  const materials = [
    new THREE.MeshStandardMaterial({color:0xbbb1e4, metalness:.65, roughness:.25}),
    new THREE.MeshBasicMaterial({color:0xd4fd79}),
    new THREE.MeshBasicMaterial({color:0x8875ba, wireframe:true, transparent:true, opacity:.22}),
    new THREE.LineBasicMaterial({color:0xa69abd, transparent:true, opacity:.3})
  ];
  const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(.74,1),materials[0]); root.add(heart);
  root.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.11,1),materials[2]));
  const rings=[];
  for(let i=0;i<3;i++) {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.42+i*.2,.014,8,100),materials[i===1?1:0]);
    ring.rotation.set(.7+i*.8,.3+i*.6,0);root.add(ring);rings.push(ring);
  }
  const nodes=[];const edges=[];
  for(let i=0;i<16;i++) {
    const y=1-2*(i+.5)/16, angle=i*2.39996;
    const p=new THREE.Vector3(Math.cos(angle)*Math.sqrt(1-y*y),y,Math.sin(angle)*Math.sqrt(1-y*y)).multiplyScalar(1.12);
    const node=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),materials[1]);node.position.copy(p);root.add(node);nodes.push(node);
    edges.push(...p.toArray(),...p.clone().multiplyScalar(.63).toArray());
  }
  root.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(edges,3)),materials[3]));
  const signals=[];
  if(network){
    heart.scale.setScalar(.7);
    const points=[];
    for(let layer=0;layer<3;layer++)for(let i=0;i<8;i++){
      const angle=i*Math.PI/4+layer*.3;
      const point=new THREE.Vector3(Math.cos(angle)*(layer===1?1.55:1.1),(layer-1)*1.05,Math.sin(angle)*(layer===1?1.55:1.1));
      points.push(point);
      const node=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),materials[1]);node.position.copy(point);root.add(node);
    }
    const connections=[];
    for(let i=0;i<16;i++)for(let offset=0;offset<2;offset++){
      const from=points[i],to=points[8+Math.floor(i/8)*8+(i+offset)%8];
      connections.push(...from.toArray(),...to.toArray());
      if(i%3===0){const pulse=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),materials[1]);root.add(pulse);signals.push({pulse,from,to,offset:i*.13+offset*.4});}
    }
    root.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(connections,3)),materials[3]));
  }
  let frame=0,visible=false,stopped=false,t=0,previous=0,mx=0,my=0,lost=false;
  function render(now){
    frame=0;if(!visible||document.hidden||lost)return;
    const dt=Math.min((now-previous)/1000,.05);previous=now;
    if(!stopped)t+=dt;
    root.rotation.set(my*.2, t*.16+mx*.3, Math.sin(t*.2)*.06);
    heart.rotation.y=-t*.3;
    rings.forEach((ring,i)=>{ring.rotation.z=t*(i%2?-.16:.13);});
    nodes.forEach((node,i)=>node.scale.setScalar(1+Math.sin(t*1.5+i)*.18));
    signals.forEach(({pulse,from,to,offset})=>pulse.position.lerpVectors(from,to,(t*.3+offset)%1));
    renderer.render(scene,camera);canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);
    if(!stopped)frame=requestAnimationFrame(render);
  }
  function draw(){if(visible&&!frame&&!lost){previous=performance.now();frame=requestAnimationFrame(render);}}
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();draw();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  canvas.parentElement.addEventListener('pointermove',event=>{if(stopped)return;const r=canvas.getBoundingClientRect();mx=(event.clientX-r.left)/r.width-.5;my=(event.clientY-r.top)/r.height-.5;draw();});
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);frame=0;if(!document.hidden)draw();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;canvas.parentElement.classList.remove('core-ready');});
  return {setState(open,paused){visible=open;stopped=paused;cancelAnimationFrame(frame);frame=0;if(open){resize();draw();}},isAvailable:()=>!lost};
}
