"use strict";
// Bump this together with the ?v= query on index.html and the footer label.
var VERSION="v2026.11.04-1";
var CACHE="werkrapport-v2026.11.04-1";
var SHELL=[
 "./",
 "./index.html",
 "./css/style.css?v=2026.11.04-1",
 "./js/servicemax.js?v=2026.11.04-1",
 "./js/app.js?v=2026.11.04-1",
 "./manifest.webmanifest"
];
self.addEventListener("install",function(e){
 self.skipWaiting();
 e.waitUntil(caches.open(CACHE).then(function(cache){return cache.addAll(SHELL)}).catch(function(){}));
});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(keys){
  return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
 }).then(function(){return self.clients.claim()}));
});
self.addEventListener("message",function(e){
 if(e.data==="skipWaiting") self.skipWaiting();
});
function isShell(req){
 var path=new URL(req.url).pathname;
 if(req.mode==="navigate") return true;
 return /\/$/.test(path)||/\.(?:html|js|css)$/i.test(path);
}
self.addEventListener("fetch",function(e){
 var req=e.request;
 if(req.method!=="GET") return;
 if(new URL(req.url).origin!==self.location.origin) return;
 if(!isShell(req)) return;
 e.respondWith(fetch(req).then(function(res){
  var copy=res.clone();
  caches.open(CACHE).then(function(cache){cache.put(req,copy)}).catch(function(){});
  return res;
 }).catch(function(){
  return caches.match(req).then(function(hit){return hit||caches.match("./index.html")});
 }));
});
