import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const dist=resolve(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const app of ['manager','player']){
 await cp(resolve(root,'apps',app),resolve(dist,app),{recursive:true,filter:(path)=>!path.endsWith('package.json')});
}
// Shared demo fixtures are referenced from Player; copy is preserved under manager.
const index=await readFile(resolve(dist,'index.html'),'utf8').catch(()=>null);
if(index!==null)throw new Error('Unexpected root index in output');
await writeFile(resolve(dist,'index.html'),`<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Club Control V2 preview</title><style>body{background:#0c1220;color:#fff;font:16px system-ui;padding:4rem}a{color:#9ed1ff;display:block;margin:1rem 0}</style></head><body><h1>Club Control V2 · DEMO</h1><p>Fiktív tesztadatok. Nem az éles rendszer.</p><a href="./manager/">Manager V2</a><a href="./player/">Player V2</a></body></html>`);
console.log('Built static preview: '+dist);
