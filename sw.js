const CACHE='cc-manager-v0-5-2b5l-opponent-logo-order';
const CORE=[
  './','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest',
  './assets/player-animals.webp','./assets/event-training-mask.png','./assets/event-home-mask.png','./assets/event-away-mask.png','./assets/beac-logo-96.png','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'
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
