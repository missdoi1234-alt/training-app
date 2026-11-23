// pfj offline cache. bump VERSION when you upload a new index.html
const VERSION='pfj-1';
const CORE=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // the app page: try the internet first so updates arrive, fall back to the saved copy offline
  if(r.mode==='navigate'||u.pathname.endsWith('index.html')){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
  // fonts and app files: saved copy first
  if(u.origin===location.origin||u.host.includes('fonts.g')){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})))}
  // youtube thumbnails and checks: always live, no caching
});
