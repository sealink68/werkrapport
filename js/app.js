"use strict";
var Q={
nl:["Wat is dossiernummer van de deur?","Vaststelling?","Oorzaak?","Oplossing?","Resultaat?","Extra Info?","Ondertekenaar?"],
fr:["Quel est le numéro de dossier de la porte?","Description de l’état lors de mon arrivée?","Cause?","Solution?","Résultat de l’intervention?","Informations complémentaires?","Responsable sur place?"]};
var LB={
nl:["Dossiernummer:","Vaststelling:","Oorzaak:","Oplossing:","Resultaat:","Extra Info:","Ondertekenaar:"],
fr:["Numéro de dossier:","Description de l’état lors de mon arrivée:","Cause:","Solution:","Résultat de l’intervention:","Informations complémentaires:","Responsable sur place:"]};
var T={
nl:{title:"Werkrapport",prev:"Vorige",next:"Volgende",q:"Vraag {a} van {b}",preview:"Voorbeeld",done:"Voltooid",edit:"Bewerken",
 back:"Terug naar vragen",translating:"Bezig met vertalen…",ok:"Rapport voltooid!",okp:"Het rapport is gekopieerd naar het klembord en gedownload als",
 copyFail:"Kopiëren naar klembord mislukt – gebruik het gedownloade bestand.",newr:"Nieuw rapport",start:"Kies je taal",startp:"Choisissez votre langue",
 hint:"Druk op Volgende voor de volgende vraag",hintDone:"Druk op Voorbeeld om af te werken",sum:"Overzicht",file:"Werkrapport.txt",untr:"[niet vertaald]",
 trfail:"Vertaling (deels) mislukt – originele tekst gebruikt.",empty:"(leeg)",copyAgain:"Opnieuw kopiëren",dl:"Opnieuw downloaden",retr:"Opnieuw vertalen",reset:"Nieuw blanco rapport",conf:"Alle antwoorden wissen en een nieuw blanco rapport starten?",trerr:"Vertaling mislukt – controleer je internetverbinding en tik op ‘Opnieuw vertalen’. De originele tekst is gebruikt en gemarkeerd.",trl:"Vertaling"},
fr:{title:"Rapport de travail",prev:"Précédent",next:"Suivant",q:"Question {a} sur {b}",preview:"Aperçu",done:"Terminé",edit:"Modifier",
 back:"Retour aux questions",translating:"Traduction en cours…",ok:"Rapport terminé !",okp:"Le rapport a été copié dans le presse-papiers et téléchargé sous",
 copyFail:"Échec de la copie – utilisez le fichier téléchargé.",newr:"Nouveau rapport",start:"Choisissez votre langue",startp:"Kies je taal",
 hint:"Appuyez sur Suivant pour la question suivante",hintDone:"Appuyez sur Aperçu pour terminer",sum:"Résumé",file:"Rapport de travail.txt",untr:"[non traduit]",
 trfail:"",empty:"(vide)",copyAgain:"Copier à nouveau",dl:"Télécharger à nouveau",retr:"Retraduire",reset:"Nouveau rapport vierge",conf:"Effacer toutes les réponses et commencer un nouveau rapport vierge ?",trerr:"La traduction a échoué – vérifiez votre connexion internet et touchez « Retraduire ». Le texte original a été utilisé et marqué.",trl:"Traduction"}};
var PH={
nl:["Ga naar ServiceMax, kopieer het dossiernummer en plak in dit veld.","Meld de toestand van de installatie en gebreken of schade bij aankomst.","Geef aan wat de vermoedelijke of effectieve oorzaak van de storing is.","Vul in wat je gedaan hebt om de storing op te lossen.","Wat is de toestand van het systeem? 100% gebruiksklaar, beperkt opgelost, tijdelijk opgelost, buiten dienst gesteld...","Bvb. klant moet nog iets oplossen, technieker moet nog iets oplossen, er wordt een offerte opgemaakt, etc...","Hier naam of e-mailadres van verantwoordelijke."],
fr:["Allez dans ServiceMax, copiez le numéro de dossier et collez-le dans ce champ.","Décrivez l\u2019état de l\u2019installation et les défauts ou dommages à l\u2019arrivée.","Indiquez la cause présumée ou effective de la panne.","Indiquez ce que vous avez fait pour résoudre la panne.","Quel est l\u2019état du système ? 100 % opérationnel, partiellement résolu, temporairement résolu, mis hors service...","P. ex. le client doit encore corriger quelque chose, le technicien doit encore intervenir, un devis est établi, etc.","Ici, le nom ou l\u2019adresse e-mail du responsable."]};
var DISC="Automatische vertaling – gelieve na te kijken / Traduction automatique – veuillez vérifier";
var GO="https://go.servicemax.io";
var N=7,SINGLE={0:1,6:1};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
var S={lang:ls("wr_lang"),step:+(ls("wr_step")||0),ans:[],view:"q",client:ServiceMax.blank(),draft:ServiceMax.blank(),busy:false};
try{S.ans=JSON.parse(ls("wr_ans")||"[]")}catch(e){S.ans=[]}
for(var i=0;i<N;i++)if(typeof S.ans[i]!=="string")S.ans[i]="";
if(!(S.step>=0&&S.step<N))S.step=0;
try{var savedC=JSON.parse(ls("wr_client")||"null");
 if(savedC&&typeof savedC==="object")["wo","account","adres","contact","product"].forEach(function(k){if(typeof savedC[k]==="string")S.client[k]=savedC[k].slice(0,400)})}catch(e){}
var prevQ1=S.ans[0];
S.ans[0]=ServiceMax.q1OnLoad(prevQ1,S.client);
var trCache={},result="",lastFail=false,copied=true,lastErr="",trVals=[];
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function save(){ls("wr_ans",JSON.stringify(S.ans));ls("wr_step",String(S.step));ls("wr_client",JSON.stringify(S.client))}
if(S.ans[0]!==prevQ1)save();
function hasClient(){var c=S.client||{};return ["wo","account","adres","contact","product"].some(function(k){return String(c[k]||"").trim()})}
function grabDraft(){if(!$("f-wo"))return;var d=ServiceMax.blank();
 ["wo","account","adres","contact","product"].forEach(function(k){var el=$("f-"+k);if(el)d[k]=el.value});S.draft=d}
function t(){return T[S.lang||"nl"]}
function hdr(){var L=S.lang||"nl";$("title").textContent=t().title;document.title=t().title;document.documentElement.lang=L;
 [].forEach.call(document.querySelectorAll("#seg button"),function(b){b.classList.toggle("on",b.dataset.l===S.lang)});
 $("seg").style.visibility=S.lang?"visible":"hidden";fitBrand()}
// dormakaba logo: full word mark only when it fits next to the title, else just the red symbol.
function fitBrand(){var h=document.querySelector("header"),b=h&&h.querySelector(".brand"),t=$("title"),r=$("seg");if(!b||!t||!r)return;
 h.classList.remove("bc","bt","bt2","bt3");t.style.whiteSpace="nowrap";
 var g=function(e){return parseFloat(getComputedStyle(e).columnGap)||0},room=h.clientWidth-r.offsetWidth-g(h),over=function(){return b.offsetWidth+g(b.parentNode)+t.scrollWidth>room+.5};
 if(over())h.classList.add("bc");var k=["bt","bt2","bt3"],i=0;for(;i<k.length&&over();i++){if(i)h.classList.remove(k[i-1]);h.classList.add(k[i])}
 if(over()&&/\s/.test(t.textContent))h.classList.remove(k[i-1]); // smaller title only if that keeps it on one line; else wrap as before
 t.style.whiteSpace=""}
function anim(dir){var c=$("card");c.classList.remove("slide-in-r","slide-in-l");void c.offsetWidth;c.classList.add(dir<0?"slide-in-l":"slide-in-r")}
function render(dir){if(S.busy)return;grabDraft();hdr();$("top").innerHTML="";
 if(S.view==="r"){reviewView();if(S.lang)anim(dir||1);return}
 if(!S.lang)return startView();
 if(S.view==="p")previewView();else qView();
 anim(dir||1)}
function startView(){var note=hasClient()?'<p class="note oknote">'+esc(ServiceMax.labels.nl.took)+'<br>'+esc(ServiceMax.labels.fr.took)+'</p>':"";
 $("card").innerHTML='<div class="start">'+
 '<button type="button" class="btn scan big" id="ocrbtn">'+esc(ServiceMax.labels.nl.scan)+'<small>'+esc(ServiceMax.labels.fr.scan)+'</small></button>'+
 '<p class="hint scan-hint">'+esc(ServiceMax.labels.nl.scanSub)+' / '+esc(ServiceMax.labels.fr.scanSub)+'</p>'+note+
 '<h2>Kies je taal</h2><p>Choisissez votre langue</p>'+
 '<button class="btn pri big" data-l="nl">🇧🇪 Nederlands<small>Werkrapport · met Franse vertaling</small></button>'+
 '<button class="btn sec big" data-l="fr">🇫🇷 Français<small>Rapport de travail</small></button></div>';
 bindScan($("ocrbtn"));
 [].forEach.call($("card").querySelectorAll("[data-l]"),function(b){b.onclick=function(){setLang(b.dataset.l)}});resetBtn()}
function setLang(l){S.lang=l;ls("wr_lang",l);render(1)}
function fit(el){if(!el)return;el.style.height="auto";
 var extra=el.offsetHeight-el.clientHeight;
 el.style.height=(el.scrollHeight+extra)+"px";
 if(el.scrollHeight>el.clientHeight)el.style.height=(el.offsetHeight+(el.scrollHeight-el.clientHeight))+"px"}
function qView(){var i=S.step,L=S.lang,x=t();
 $("top").innerHTML='<div class="prog"><span>'+x.q.replace("{a}",i+1).replace("{b}",N)+'</span><span>'+Math.round((i+1)/N*100)+'%</span></div><div class="bar"><i style="width:'+((i+1)/N*100)+'%"></i></div>';
 var cap=i===0?"characters":(SINGLE[i]?"words":"sentences");
 var f='<textarea id="inp" rows="1" autocomplete="off" enterkeyhint="'+(i===N-1?"done":"next")+'" autocapitalize="'+cap+'"'+(i===0?' inputmode="text"':'')+'></textarea>';
 var scan=i===0?'<button type="button" class="btn scan big" id="ocrbtn">'+esc(ServiceMax.labels[L].scan)+'</button><p class="hint scan-hint">'+esc(ServiceMax.labels[L].scanSub)+'</p>':"";
 $("card").innerHTML=scan+'<div class="num">'+(i+1)+'</div><h2 class="q">'+esc(Q[L][i])+'</h2>'+f+'<div class="hint">'+esc(i===N-1?x.hintDone:x.hint)+'</div>'+
 '<div class="btns"><button class="btn sec" id="prev"'+(i===0?' disabled':'')+'>‹ '+x.prev+'</button>'+
 (i===N-1?'<button class="btn pri" id="next">'+x.preview+'</button>':'<button class="btn pri" id="next">'+x.next+' ›</button>')+'</div>';
 var inp=$("inp");inp.placeholder=PH[L][i];inp.value=S.ans[i];fit(inp);
 inp.oninput=function(){if(SINGLE[i])inp.value=inp.value.replace(/\n/g,"");S.ans[i]=inp.value;save();fit(inp)};
 if(SINGLE[i])inp.onkeydown=function(e){if(e.key==="Enter"&&!e.isComposing){e.preventDefault();go(1)}};
 $("prev").onclick=function(){go(-1)};$("next").onclick=function(){go(1)};
 if(i===0)bindScan($("ocrbtn"));
 if(hasAns())resetBtn();
 setTimeout(function(){try{inp.focus({preventScroll:true})}catch(e){}},60)}
function go(d){var n=S.step+d;if(n<0)return;if(n>=N){S.view="p";save();render(1);return}S.step=n;save();render(d)}
var MM="https://api.mymemory.translated.net/get";
var PROXY="https://werkrapport-translate.sealink68.workers.dev";
function decode(o){var tx=document.createElement("textarea");tx.innerHTML=o;return tx.value}
function getJSON(url){return new Promise(function(res,rej){var done=false,tm=setTimeout(function(){if(!done){done=true;rej("timeout")}},12000);
 function fin(f,v){if(!done){done=true;clearTimeout(tm);f(v)}}
 if(window.fetch){fetch(url,{mode:"cors",credentials:"omit",cache:"no-store"}).then(function(r){if(!r.ok)throw "HTTP "+r.status;return r.json()}).then(function(j){fin(res,j)},function(e){xhr()})}else xhr();
 function xhr(){try{var x=new XMLHttpRequest();x.open("GET",url);x.onload=function(){try{fin(res,JSON.parse(x.responseText))}catch(e){fin(rej,"parse")}};x.onerror=function(){fin(rej,"network")};x.send()}catch(e){fin(rej,"xhr")}}})}
function norm(x){return String(x).toLowerCase().replace(/[\s.,;:!?'"’]+/g," ").trim()}
function tryMM(txt,lp,withDe){var url=MM+"?q="+encodeURIComponent(txt.slice(0,500))+"&langpair="+encodeURIComponent(lp)+(withDe?"&de=sealink%40hotmail.com":"");
 return getJSON(url).then(function(j){var o=j&&j.responseData&&j.responseData.translatedText;
  if(!o||+j.responseStatus!==200||j.quotaFinished===true||/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID|NO QUERY|IS AN INVALID/i.test(o))throw "api: "+(j&&j.responseDetails||o||"empty");
  o=decode(o);
  if(norm(o)===norm(txt)){ // unchanged: try best non-identical match
   var m=(j.matches||[]).filter(function(x){return x.translation&&norm(x.translation)!==norm(txt)&&norm(x.segment||"")===norm(txt)})[0];
   if(m)o=decode(m.translation)}
  return o})}
function translate(txt,lp){var k=lp+"|"+txt;if(trCache[k])return Promise.resolve(trCache[k]);
 return tryMM(txt,lp,true).catch(function(e){lastErr=String(e);return tryMM(txt,lp,false)})
 .then(function(o){var r={ok:true,t:o,same:norm(o)===norm(txt)};trCache[k]=r;return r},
  function(e){lastErr=String(e);return{ok:false,t:txt}})}
function block(L,vals){return LB[L].map(function(l,i){return l+" "+vals[i]}).join("\n")}
function reportText(L,O,vals){return T[L].title+"\n\n"+ServiceMax.formatBlock(L,S.client)+block(L,S.ans)+"\n\n────────────────────\n\n"+T[O].title+"\n("+DISC+")\n\n"+ServiceMax.formatBlock(O,S.client)+block(O,vals)}
function postProxy(from,to,items){return new Promise(function(res,rej){var done=false,tm=setTimeout(function(){if(!done){done=true;rej("timeout")}},15000);
 function fin(f,v){if(!done){done=true;clearTimeout(tm);f(v)}}
 var body=JSON.stringify({from:from,to:to,items:items});
 function accept(j){if(!j||!Array.isArray(j.items)||j.items.length!==items.length)throw "length";fin(res,j.items)}
 if(window.fetch){fetch(PROXY,{method:"POST",mode:"cors",credentials:"omit",cache:"no-store",headers:{"Content-Type":"application/json"},body:body}).then(function(r){if(!r.ok)throw "HTTP "+r.status;return r.json()}).then(function(j){try{accept(j)}catch(e){fin(rej,String(e&&e.message||e))}},function(e){fin(rej,typeof e==="string"?e:String(e&&e.message||e))})}
 else{try{var x=new XMLHttpRequest();x.open("POST",PROXY);x.timeout=15000;x.setRequestHeader("Content-Type","application/json");x.onload=function(){if(x.status!==200){fin(rej,"HTTP "+x.status);return}try{accept(JSON.parse(x.responseText))}catch(e){fin(rej,String(e&&e.message||e))}};x.onerror=function(){fin(rej,"network")};x.ontimeout=function(){fin(rej,"timeout")};x.send(body)}catch(e){fin(rej,"xhr")}}})}
function proxyAll(from,to,items){var out=[],i=0;function next(){if(i>=items.length)return Promise.resolve(out);var chunk=items.slice(i,i+20);i+=chunk.length;return postProxy(from,to,chunk).then(function(part){out=out.concat(part);return next()})}return next()}
function buildMM(){var L=S.lang,O=L==="nl"?"fr":"nl",lp=L+"|"+O;
 return Promise.all(S.ans.map(function(a,i){if(i===0||!a.trim())return Promise.resolve({ok:true,t:a});
  // translate line by line to keep line breaks
  return Promise.all(a.split("\n").map(function(ln){return ln.trim()?translate(ln,lp):Promise.resolve({ok:true,t:ln})})).then(function(rs){
   var ok=rs.every(function(r){return r.ok});return{ok:ok,same:rs.some(function(r){return r.same}),t:rs.map(function(r){return r.t}).join("\n")+(ok?"":" "+T[O].untr)}})}))
 .then(function(rs){lastFail=rs.some(function(r){return!r.ok});trVals=rs.map(function(r){return r.t});
  return reportText(L,O,trVals)})}
function build(){var L=S.lang,O=L==="nl"?"fr":"nl",items=S.ans.slice(1);
 return proxyAll(L,O,items).then(function(trs){lastFail=false;lastErr="";trVals=[S.ans[0]].concat(trs);return reportText(L,O,trVals)},function(){return buildMM()})}
function previewView(){var x=t();result="";
 $("card").innerHTML='<h2 class="q" style="margin-bottom:8px">'+x.preview+'</h2><ul class="list">'+
  S.ans.map(function(a,i){return'<li><div><b>'+esc(LB[S.lang][i])+'</b><span>'+(a.trim()?esc(a):'<i style="color:#94a3b8">'+x.empty+'</i>')+'</span><span class="tr" id="tr'+i+'"></span></div><button class="edit" data-i="'+i+'">'+x.edit+'</button></li>'}).join("")+
  '</ul><div id="res"></div>'+
  '<div class="btns"><button class="btn sec" id="retr">↻ '+x.retr+'</button></div>'+
  '<div class="btns"><button class="btn sec" id="bk">‹ '+x.back+'</button><button class="btn ok" id="done" disabled>✓ '+x.done+'</button></div>';
 [].forEach.call($("card").querySelectorAll(".edit"),function(b){b.onclick=function(){S.step=+b.dataset.i;S.view="q";save();render(-1)}});
 $("bk").onclick=function(){S.view="q";S.step=N-1;render(-1)};
 $("done").onclick=complete;
 $("retr").onclick=function(){trCache={};runTr()};
 runTr()}
var trRun=0;
function runTr(){var x=t(),lang=S.lang,id=++trRun;result="";$("done").disabled=true;$("retr").disabled=true;
 $("res").innerHTML='<div class="load"><div class="spin"></div>'+x.translating+'</div>';
 build().then(function(r){if(id!==trRun||S.view!=="p"||S.lang!==lang)return;result=r;
  trVals.forEach(function(v,i){var e=$("tr"+i);if(e&&i>0&&S.ans[i].trim())e.textContent="→ "+v});
  $("res").innerHTML='<pre id="out">'+esc(r).replace(esc("("+DISC+")"),'<small class="disc">('+esc(DISC)+')</small>')+'</pre>'+(lastFail?'<div class="err" id="trerr">⚠️ '+esc(x.trerr)+(lastErr?' ('+esc(lastErr)+')':'')+'</div>':'');
  $("done").disabled=false;$("retr").disabled=false})}
function hasAns(){return S.ans.some(function(a){return a.trim()})}
function resetAll(){if((hasAns()||hasClient())&&!confirm(t().conf))return;S.ans=[];for(var i=0;i<N;i++)S.ans[i]="";S.step=0;S.view="q";result="";trCache={};trVals=[];S.client=ServiceMax.blank();S.draft=ServiceMax.blank();save();render(1)}
function resetBtn(){var b=document.createElement("button");b.className="btn reset";b.id="reset";b.textContent="⟲ "+(S.lang?t().reset:"Nieuw blanco rapport / Nouveau rapport vierge");b.onclick=resetAll;$("card").appendChild(b)}
function copyText(s){function fb(){var ta=document.createElement("textarea");ta.value=s;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.top="-1000px";document.body.appendChild(ta);
  ta.select();ta.setSelectionRange(0,s.length);var ok=false;try{ok=document.execCommand("copy")}catch(e){}document.body.removeChild(ta);return ok}
 if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(s).then(function(){return true},function(){return fb()})}
 return Promise.resolve(fb())}
function downloadName(){var safe=ServiceMax.fileName(S.ans[0]);
 if(!safe)return t().file;
 return /\.txt$/i.test(safe)?safe:safe+".txt"}
function download(s){var b=new Blob([s.replace(/\n/g,"\r\n")],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");
 a.href=u;a.download=downloadName();a.style.display="none";document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u)},8000)}
function freshStart(){S.ans=[];for(var i=0;i<N;i++)S.ans[i]="";S.step=0;S.view="q";result="";trCache={};trVals=[];lastFail=false;lastErr="";trRun++;S.client=ServiceMax.blank();S.draft=ServiceMax.blank();save();render(1)}
function openGo(){var w=null;try{w=window.open(GO,"_blank")}catch(e){w=null}
 if(w)return;
 var a=document.createElement("a");a.href=GO;a.target="_blank";a.rel="noopener";a.style.display="none";
 document.body.appendChild(a);a.click();setTimeout(function(){if(a.parentNode)a.parentNode.removeChild(a)},0)}
function complete(){var s=result;
 // Same tap: download first, then clipboard, then leave this page on a blank report and hand off beside it.
 download(s);copyText(s);freshStart();openGo()}
function bindScan(btn){if(!btn)return;btn.onclick=function(){var inp=$("ocrfile");if(inp)inp.click()}}
function ocrL(){return ServiceMax.labels[S.lang||"nl"]}
function showBusy(msg){var L=ocrL(),both=!S.lang;
 $("top").innerHTML="";
 $("card").innerHTML='<div class="start"><h2>'+esc(L.reading)+'</h2><p id="ocrstatus">'+esc(msg||L.loading)+'</p><div class="ocrbar"><i id="ocrfill"></i></div><p class="hint">'+esc(L.scanSub)+(both?" / "+esc(ServiceMax.labels.fr.scanSub):"")+'</p></div>'}
function showOcrError(msg){var L=ocrL(),both=!S.lang,back=both?L.back+" / "+ServiceMax.labels.fr.back:L.back,again=both?L.scan+" / "+ServiceMax.labels.fr.scan:L.scan;
 S.busy=false;
 $("card").innerHTML='<div class="start"><div class="err">'+esc(msg)+'</div><div class="btns"><button type="button" class="btn sec" id="ocrback">'+esc(back)+'</button><button type="button" class="btn pri" id="ocrretry">'+esc(again)+'</button></div></div>';
 $("ocrback").onclick=function(){S.view="q";render(1)};
 $("ocrretry").onclick=function(){var inp=$("ocrfile");if(inp)inp.click()}}
function loadTess(){if(window.Tesseract)return Promise.resolve(window.Tesseract);if(loadTess.p)return loadTess.p;
 loadTess.p=new Promise(function(ok,bad){var s=document.createElement("script");
  s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";s.async=true;
  s.onload=function(){window.Tesseract?ok(window.Tesseract):bad(new Error("lib"))};
  s.onerror=function(){loadTess.p=null;bad(new Error("cdn"))};
  document.head.appendChild(s)});
 return loadTess.p}
// The photo is drawn to a canvas in this page and read by Tesseract locally. It is never uploaded.
function prepImage(file){return new Promise(function(res,rej){var url=URL.createObjectURL(file),img=new Image();
 img.onload=function(){var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
  if(!w||!h){URL.revokeObjectURL(url);rej(new Error("image"));return}
  var scale=Math.min(1,2200/Math.max(w,h)),c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));
  var g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);
  URL.revokeObjectURL(url);res(c)};
 img.onerror=function(){URL.revokeObjectURL(url);rej(new Error("image"))};img.src=url})}
var ocrGen=0;
function runOcr(files){var id=++ocrGen,n=files.length,cur=0;S.busy=true;showBusy(ocrL().loading);
 loadTess().then(function(Tess){
  return Tess.createWorker("nld+fra+eng",1,{logger:function(m){if(id!==ocrGen)return;
   var p=typeof m.progress==="number"?m.progress:0,fill=$("ocrfill");
   if(fill)fill.style.width=Math.round(((cur+Math.min(p,0.99))/n)*100)+"%";
   var st=$("ocrstatus");if(!st)return;var L=ocrL();
   st.textContent=m.status==="recognizing text"?L.reading+(n>1?" ("+(cur+1)+"/"+n+")":""):L.loading}});
 }).then(function(worker){var texts=[],i=0;
  function next(){if(i>=n)return worker.terminate().then(function(){return texts});
   var file=files[i];cur=i;i++;
   return prepImage(file).then(function(canvas){return worker.recognize(canvas).then(function(r){texts.push(r&&r.data&&r.data.text||"");return next()})},function(){texts.push("");return next()})}
  return next().catch(function(e){return worker.terminate().catch(function(){}).then(function(){throw e})})}).then(function(texts){if(id!==ocrGen)return;S.busy=false;
  if(!texts.some(function(t){return String(t||"").trim()})){showOcrError(ocrL().imgfail);return}
  S.draft=ServiceMax.parse(ServiceMax.merge(texts));S.view="r";render(1)},
  function(){if(id!==ocrGen)return;S.busy=false;showOcrError(ocrL().fail)})}
function reviewView(){var L=S.lang||"nl",bi=!S.lang,x=ServiceMax.labels[L],y=ServiceMax.labels[L==="fr"?"nl":"fr"],d=S.draft||ServiceMax.blank();
 function field(k){var long=k==="adres"||k==="contact"||k==="product";
  var control=long?'<textarea id="f-'+k+'" rows="1" autocomplete="off" autocapitalize="words"></textarea>':'<input id="f-'+k+'" autocomplete="off" autocapitalize="'+(k==="wo"?"off":"words")+'" enterkeyhint="done">';
  return '<label>'+esc(x[k])+(bi?"<small>"+esc(y[k])+"</small>":"")+control+'</label>'}
 $("card").innerHTML='<div class="start"><h2>'+esc(bi?x.review+" / "+y.review:x.review)+'</h2><p class="hint">'+esc(bi?x.reviewSub+" / "+y.reviewSub:x.reviewSub)+'</p><div class="fields">'+
  field("wo")+field("account")+field("adres")+field("contact")+field("product")+'</div><div class="btns stack"><button type="button" class="btn pri" id="ocrtake">'+esc(bi?x.take+" / "+y.take:x.take)+'</button><button type="button" class="btn sec" id="ocrback">'+esc(bi?x.back+" / "+y.back:x.back)+'</button></div></div>';
 ["wo","account","adres","contact","product"].forEach(function(k){var el=$("f-"+k);el.value=d[k]||"";if(el.tagName==="TEXTAREA")fit(el)});
 $("ocrback").onclick=function(){S.view="q";render(-1)};
 $("ocrtake").onclick=function(){grabDraft();var d=S.draft;
  S.client={wo:d.wo.trim(),account:d.account.trim(),adres:d.adres.trim(),contact:d.contact.trim(),product:d.product.trim()};
  S.ans[0]=ServiceMax.dossierFrom(S.client);
  S.view="q";S.step=0;save();render(1)}}
[].forEach.call(document.querySelectorAll("#seg button"),function(b){b.onclick=function(){if(S.busy)return;if(S.view==="d")S.view="q";S.lang=b.dataset.l;ls("wr_lang",S.lang);render(1)}});
var ocrFile=$("ocrfile");
if(ocrFile)ocrFile.addEventListener("change",function(){var files=[].slice.call(this.files||[]);this.value="";if(files.length)runOcr(files)});
ls("wr_tip_hide",null); // clean up the key of the removed home-screen banner
if($("ver"))$("ver").textContent=ServiceMax.version||"v2026.11.04-1";
if("serviceWorker" in navigator){
 try{sessionStorage.removeItem("wr_reloaded")}catch(e){}
 var hadCtrl=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener("controllerchange",function(){
  if(!hadCtrl){hadCtrl=true;return}
  try{if(sessionStorage.getItem("wr_reloaded")==="1")return;sessionStorage.setItem("wr_reloaded","1")}catch(e){}
  location.reload()});
 navigator.serviceWorker.register("sw.js?v=2026.11.04-1").catch(function(){})}
window.addEventListener("resize",function(){var el=$("inp");if(el)fit(el);fitBrand()});
render(1);
