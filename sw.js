const CACHE='cc-manager-v0-5-2b6m-mass-attendance-persistence';
const CORE=[
  './','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest',
  './assets/player-animals.webp','./assets/event-training-mask.png','./assets/event-home-mask.png','./assets/event-away-mask.png','./assets/beac-logo-96.png','./assets/team-logos/beac.png','./assets/team-logos/bdseemericus.png','./assets/team-logos/bdseemericus_dark.png','./assets/team-logos/bunnies.png','./assets/team-logos/dag.png','./assets/team-logos/kando.png','./assets/team-logos/keac.png','./assets/team-logos/kispest.png','./assets/team-logos/kispest_dark.png','./assets/team-logos/kozgaz.png','./assets/team-logos/kre.png','./assets/team-logos/kse.png','./assets/team-logos/mafc.png','./assets/team-logos/mozdulj.png','./assets/team-logos/mtk.png','./assets/team-logos/ossc.png','./assets/team-logos/ossc_dark.png','./assets/team-logos/panorama.png','./assets/team-logos/panorama_dark.png','./assets/team-logos/pase.png','./assets/team-logos/rackeve.png','./assets/team-logos/rksk.png','./assets/team-logos/semmeilweis.png','./assets/team-logos/taksony.png','./assets/team-logos/ute.png','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'
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
