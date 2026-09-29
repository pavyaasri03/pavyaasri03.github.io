import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
async function walk(path) {
  const result=[];
  for (const entry of await readdir(path,{withFileTypes:true})) {
    const target=resolve(path,entry.name);
    if(entry.isDirectory()) result.push(...await walk(target)); else result.push(target);
  }
  return result;
}
const files=await walk(root);
assert.equal(files.some(f=>/\.(docx|py|md|txt)$/.test(f)),false,'Private/source artifacts must not be deployed');
let count=0;
for(const file of files.filter(f=>f.endsWith('.html'))) {
  const html=await readFile(file,'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,`Duplicate IDs in ${file}`);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url=match[1];
    if(/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    if(url.startsWith('#')) { assert.ok(ids.includes(url.slice(1)),`Missing anchor ${url} in ${file}`);continue; }
    const [path,anchor]=url.split('#');
    let target=resolve(path.startsWith('/')?root:dirname(file),'.'+(path.startsWith('/')?path:'/'+path));
    if((await stat(target)).isDirectory()) target=resolve(target,'index.html');
    assert.ok(files.includes(target),`Missing file ${url} in ${file}`);
    if(anchor&&target.endsWith('.html')) assert.ok((await readFile(target,'utf8')).includes(`id="${anchor}"`),`Missing linked anchor ${url}`);
    count++;
  }
}
console.log(`PASS: ${count} local asset/page links and all section anchors; no source documents in public build.`);
