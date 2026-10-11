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
 $("seg").style.visibility=S.lang?"visible":"hidden";updateTip()}
function isStandalone(){if(navigator.standalone===true)return true;
 try{if(window.matchMedia("(display-mode: standalone)").matches)return true}catch(e){}
 return false}
function iosDevice(){var ua=navigator.userAgent||"";
 if(/iPad|iPhone|iPod/.test(ua))return true;
 return navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1}
function mobileBrowser(){if(iosDevice())return true;return /Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent||"")}
function updateTip(){var el=$("tip");if(!el)return;
 var until=+ls("wr_tip_hide")||0,show=!isStandalone()&&mobileBrowser()&&Date.now()>=until;
 el.hidden=!show;if(!show)return;
 var fr=S.lang==="fr",ios=iosDevice();
 $("tiptext").textContent=fr?(ios?"Astuce : ajoutez cette app à votre écran d\u2019accueil via Partager → Sur l\u2019écran d\u2019accueil. Supprimez aussi toutes les anciennes apps Rapport de travail.":"Astuce : ajoutez cette app à votre écran d\u2019accueil via le menu (\u22ee) → Ajouter à l\u2019écran d\u2019accueil. Supprimez aussi toutes les anciennes apps Rapport de travail."):(ios?"Tip: zet deze app op je beginscherm via Deel → Zet op beginscherm. Verwijder ook alle oude Werkrapport-apps.":"Tip: zet deze app op je beginscherm via het menu (\u22ee) → Toevoegen aan startscherm. Verwijder ook alle oude Werkrapport-apps.");
 var x=$("tipx");if(x)x.setAttribute("aria-label",fr?"Fermer":"Sluiten")}
function anim(dir){var c=$("card");c.classList.remove("slide-in-r","slide-in-l");void c.offsetWidth;c.classList.add(dir<0?"slide-in-l":"slide-in-r")}
function render(dir){hdr();$("top").innerHTML="";
 if(!S.lang)return startView();
 if(S.view==="p")previewView();else qView();
 anim(dir||1)}
function startView(){$("card").innerHTML='<div class="start"><h2>Kies je taal</h2><p>Choisissez votre langue</p>'+
 '<button class="btn pri big" data-l="nl">🇧🇪 Nederlands<small>Werkrapport · met Franse vertaling</small></button>'+
 '<button class="btn sec big" data-l="fr">🇫🇷 Français<small>Rapport de travail</small></button></div>';
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
 $("card").innerHTML='<div class="num">'+(i+1)+'</div><h2 class="q">'+esc(Q[L][i])+'</h2>'+f+'<div class="hint">'+esc(i===N-1?x.hintDone:x.hint)+'</div>'+
 '<div class="btns"><button class="btn sec" id="prev"'+(i===0?' disabled':'')+'>‹ '+x.prev+'</button>'+
 (i===N-1?'<button class="btn pri" id="next">'+x.preview+'</button>':'<button class="btn pri" id="next">'+x.next+' ›</button>')+'</div>';
 var inp=$("inp");inp.placeholder=PH[L][i];inp.value=S.ans[i];fit(inp);
 inp.oninput=function(){if(SINGLE[i])inp.value=inp.value.replace(/\n/g,"");S.ans[i]=inp.value;save();fit(inp)};
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
function freshStart(){S.ans=[];for(var i=0;i<N;i++)S.ans[i]="";S.step=0;S.view="q";result="";trCache={};trVals=[];lastFail=false;lastErr="";trRun++;save();render(1)}
function openGo(){var w=null;try{w=window.open(GO,"_blank")}catch(e){w=null}
 if(w)return;
 var a=document.createElement("a");a.href=GO;a.target="_blank";a.rel="noopener";a.style.display="none";
 document.body.appendChild(a);a.click();setTimeout(function(){if(a.parentNode)a.parentNode.removeChild(a)},0)}
function complete(){var s=result;
 // Same tap: download first, then clipboard, then leave this page on a blank report and hand off beside it.
 download(s);copyText(s);freshStart();openGo()}
[].forEach.call(document.querySelectorAll("#seg button"),function(b){b.onclick=function(){if(S.view==="d")S.view="q";S.lang=b.dataset.l;ls("wr_lang",S.lang);render(1)}});
$("tipx").onclick=function(){ls("wr_tip_hide",String(Date.now()+7*864e5));$("tip").hidden=true};
window.addEventListener("resize",function(){var el=$("inp");if(el)fit(el)});
render(1);
