const CACHE='cc-manager-v0-4-2f6-medical-rollback-filter-type-lock';
const CORE=[
  './','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest?v=0.4.2f3',
  './assets/player-animals.webp','./icons/icon-192.png?v=manager-double-ring-v1','./icons/icon-512.png?v=manager-double-ring-v1','./icons/apple-touch-icon.png?v=manager-double-ring-v1'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const sameOrigin=url.origin===self.location.origin;
  const shellRequest=sameOrigin && (event.request.mode==='navigate' || /\/(index\.html|styles\.css|app\.js|config\.js)$/.test(url.pathname));
  if(shellRequest){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
    if(sameOrigin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});
