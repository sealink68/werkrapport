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
 copyFail:"Kopiëren naar klembord mislukt – gebruik het gedownloade bestand.",newr:"Nieuw rapport",go:"Open ServiceMax Go",start:"Kies je taal",startp:"Choisissez votre langue",
 hint:"Druk op Enter voor de volgende vraag",sum:"Overzicht",file:"Werkrapport.txt",untr:"[niet vertaald]",
 trfail:"Vertaling (deels) mislukt – originele tekst gebruikt.",empty:"(leeg)",copyAgain:"Opnieuw kopiëren",dl:"Opnieuw downloaden",retr:"Opnieuw vertalen",reset:"Nieuw blanco rapport",conf:"Alle antwoorden wissen en een nieuw blanco rapport starten?",trerr:"Vertaling mislukt – controleer je internetverbinding en tik op ‘Opnieuw vertalen’. De originele tekst is gebruikt en gemarkeerd.",trl:"Vertaling"},
fr:{title:"Rapport de travail",prev:"Précédent",next:"Suivant",q:"Question {a} sur {b}",preview:"Aperçu",done:"Terminé",edit:"Modifier",
 back:"Retour aux questions",translating:"Traduction en cours…",ok:"Rapport terminé !",okp:"Le rapport a été copié dans le presse-papiers et téléchargé sous",
 copyFail:"Échec de la copie – utilisez le fichier téléchargé.",newr:"Nouveau rapport",go:"Ouvrir ServiceMax Go",start:"Choisissez votre langue",startp:"Kies je taal",
 hint:"Appuyez sur Entrée pour la question suivante",sum:"Résumé",file:"Rapport de travail.txt",untr:"[non traduit]",
 trfail:"",empty:"(vide)",copyAgain:"Copier à nouveau",dl:"Télécharger à nouveau",retr:"Retraduire",reset:"Nouveau rapport vierge",conf:"Effacer toutes les réponses et commencer un nouveau rapport vierge ?",trerr:"La traduction a échoué – vérifiez votre connexion internet et touchez « Retraduire ». Le texte original a été utilisé et marqué.",trl:"Traduction"}};
var DISC="Automatische vertaling – gelieve na te kijken / Traduction automatique – veuillez vérifier";
var GO="https://go.servicemax.io";
var N=7,SINGLE={0:1,6:1};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
var S={lang:ls("wr_lang"),step:+(ls("wr_step")||0),ans:[],view:"q"};
try{S.ans=JSON.parse(ls("wr_ans")||"[]")}catch(e){S.ans=[]}
for(var i=0;i<N;i++)if(typeof S.ans[i]!=="string")S.ans[i]="";
if(!(S.step>=0&&S.step<N))S.step=0;
var trCache={},result="",lastFail=false,copied=true,lastErr="",trVals=[];
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function save(){ls("wr_ans",JSON.stringify(S.ans));ls("wr_step",String(S.step))}
function t(){return T[S.lang||"nl"]}
function hdr(){var L=S.lang||"nl";$("title").textContent=t().title;document.title=t().title;document.documentElement.lang=L;
 [].forEach.call(document.querySelectorAll("#seg button"),function(b){b.classList.toggle("on",b.dataset.l===S.lang)});
 $("seg").style.visibility=S.lang?"visible":"hidden"}
function anim(dir){var c=$("card");c.classList.remove("slide-in-r","slide-in-l");void c.offsetWidth;c.classList.add(dir<0?"slide-in-l":"slide-in-r")}
function render(dir){hdr();$("top").innerHTML="";
 if(!S.lang)return startView();
 if(S.view==="q")qView();else if(S.view==="p")previewView();else doneView();
 anim(dir||1)}
function startView(){$("card").innerHTML='<div class="start"><h2>Kies je taal</h2><p>Choisissez votre langue</p>'+
 '<button class="btn pri big" data-l="nl">🇧🇪 Nederlands<small>Werkrapport · met Franse vertaling</small></button>'+
 '<button class="btn sec big" data-l="fr">🇫🇷 Français<small>Rapport de travail</small></button></div>';
 [].forEach.call($("card").querySelectorAll("[data-l]"),function(b){b.onclick=function(){setLang(b.dataset.l)}});resetBtn()}
function setLang(l){S.lang=l;ls("wr_lang",l);render(1)}
function qView(){var i=S.step,L=S.lang,x=t();
 $("top").innerHTML='<div class="prog"><span>'+x.q.replace("{a}",i+1).replace("{b}",N)+'</span><span>'+Math.round((i+1)/N*100)+'%</span></div><div class="bar"><i style="width:'+((i+1)/N*100)+'%"></i></div>';
 var f=SINGLE[i]?'<input id="inp" type="text" autocomplete="off" enterkeyhint="'+(i===N-1?'done':'next')+'"'+(i===0?' inputmode="text" autocapitalize="characters"':' autocapitalize="words"')+'>':'<textarea id="inp" autocapitalize="sentences"></textarea>';
 $("card").innerHTML='<div class="num">'+(i+1)+'</div><h2 class="q">'+esc(Q[L][i])+'</h2>'+f+(SINGLE[i]?'<div class="hint">'+x.hint+'</div>':'')+
 '<div class="btns"><button class="btn sec" id="prev"'+(i===0?' disabled':'')+'>‹ '+x.prev+'</button>'+
 (i===N-1?'<button class="btn pri" id="next">'+x.preview+'</button>':'<button class="btn pri" id="next">'+x.next+' ›</button>')+'</div>';
 var inp=$("inp");inp.value=S.ans[i];
 inp.oninput=function(){S.ans[i]=inp.value;save()};
 if(SINGLE[i])inp.onkeydown=function(e){if(e.key==="Enter"&&!e.isComposing){e.preventDefault();go(1)}};
 $("prev").onclick=function(){go(-1)};$("next").onclick=function(){go(1)};
if(hasAns())resetBtn();
 setTimeout(function(){try{inp.focus({preventScroll:true})}catch(e){}},60)}
function go(d){var n=S.step+d;if(n<0)return;if(n>=N){S.view="p";save();render(1);return}S.step=n;save();render(d)}
var MM="https://api.mymemory.translated.net/get";
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
function build(){var L=S.lang,O=L==="nl"?"fr":"nl",lp=L+"|"+O;
 return Promise.all(S.ans.map(function(a,i){if(i===0||!a.trim())return Promise.resolve({ok:true,t:a});
  // translate line by line to keep line breaks
  return Promise.all(a.split("\n").map(function(ln){return ln.trim()?translate(ln,lp):Promise.resolve({ok:true,t:ln})})).then(function(rs){
   var ok=rs.every(function(r){return r.ok});return{ok:ok,same:rs.some(function(r){return r.same}),t:rs.map(function(r){return r.t}).join("\n")+(ok?"":" "+T[O].untr)}})}))
 .then(function(rs){lastFail=rs.some(function(r){return!r.ok});trVals=rs.map(function(r){return r.t});
  return T[L].title+"\n\n"+block(L,S.ans)+"\n\n────────────────────\n\n"+T[O].title+"\n("+DISC+")\n\n"+block(O,rs.map(function(r){return r.t}))})}
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
function resetAll(){if(hasAns()&&!confirm(t().conf))return;S.ans=[];for(var i=0;i<N;i++)S.ans[i]="";S.step=0;S.view="q";result="";trCache={};trVals=[];save();render(1)}
function resetBtn(){var b=document.createElement("button");b.className="btn reset";b.id="reset";b.textContent="⟲ "+(S.lang?t().reset:"Nieuw blanco rapport / Nouveau rapport vierge");b.onclick=resetAll;$("card").appendChild(b)}
function copyText(s){function fb(){var ta=document.createElement("textarea");ta.value=s;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.top="-1000px";document.body.appendChild(ta);
  ta.select();ta.setSelectionRange(0,s.length);var ok=false;try{ok=document.execCommand("copy")}catch(e){}document.body.removeChild(ta);return ok}
 if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(s).then(function(){return true},function(){return fb()})}
 return Promise.resolve(fb())}
function download(s){var b=new Blob([s.replace(/\n/g,"\r\n")],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");
 a.href=u;a.download=t().file;a.style.display="none";document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u)},8000)}
function clearAnswers(){S.ans=[];for(var i=0;i<N;i++)S.ans[i]="";S.step=0;trCache={};trVals=[];save()}
var handedOff=false;
function markHandoff(){handedOff=true;S.ans=[];for(var i=0;i<N;i++)S.ans[i]="";S.step=0;result="";trCache={};trVals=[];lastFail=false;lastErr="";trRun++;save()}
function showFresh(){if(!handedOff||S.view!=="d")return;S.view="q";render(1)}
function handoffReplace(){if(handedOff)return;markHandoff();S.view="q";render(1);location.replace(GO)}
function complete(){var s=result;
 // Start the download in this tap, before any navigation. Clipboard needs the same gesture.
 var p=copyText(s);download(s);clearAnswers();
 p.then(function(ok){copied=ok;S.view="d";render(1);setTimeout(handoffReplace,1000)})}
function doneView(){var x=t();
 $("card").innerHTML='<div class="center"><div class="check">✓</div><h2 class="q">'+x.ok+'</h2><p style="color:#64748b">'+x.okp+' <b>'+esc(x.file)+'</b>.</p>'+
 (copied?'':'<p class="note">⚠️ '+x.copyFail+'</p>')+
 '<div class="btns"><button class="btn sec" id="cp">'+x.copyAgain+'</button><button class="btn sec" id="dl">'+x.dl+'</button></div>'+
 '<div class="btns"><a class="btn pri" id="go" href="'+GO+'">'+esc(x.go)+'</a></div></div>';
 $("cp").onclick=function(){copyText(result)};$("dl").onclick=function(){download(result)};
 $("go").onclick=function(){markHandoff()}}
window.addEventListener("pagehide",showFresh);
window.addEventListener("pageshow",function(e){if(e.persisted)showFresh()});
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"||document.visibilityState==="visible")showFresh()});
[].forEach.call(document.querySelectorAll("#seg button"),function(b){b.onclick=function(){if(S.view==="d")S.view="q";S.lang=b.dataset.l;ls("wr_lang",S.lang);render(1)}});
render(1);
