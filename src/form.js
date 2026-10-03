import {CODE,VERSION,sections,scale,levels,instructions,commentLabels,initialSession,questions} from './questionnaire.js';
import {shell,esc,demo,client,notice} from './shared.js';
const code=new URLSearchParams(location.search).get('session')||CODE;
let session,submissionId=crypto.randomUUID(),busy=false;
const storageKey=`rm-feedback:submission:${location.pathname.replace(/index\.html$/,'')}:${encodeURIComponent(code)}`;
const storageMessage='Ce navigateur doit autoriser le stockage local pour envoyer une seule évaluation par session. Activez-le puis rechargez la page.';
function ticket(){
 try{
  const saved=localStorage.getItem(storageKey);
  if(saved){
   const value=JSON.parse(saved);
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id)||typeof value.submitted!=='boolean')throw Error('Invalid local record');
   return value;
  }
  const value={id:crypto.randomUUID(),submitted:false};
  localStorage.setItem(storageKey,JSON.stringify(value));
  if(localStorage.getItem(storageKey)!==JSON.stringify(value))throw Error('Storage unavailable');
  return value;
 }catch{throw Error(storageMessage);}
}
function markSubmitted(value){
 // The persisted ID also prevents another database row if the confirmation flag cannot be saved.
 try{localStorage.setItem(storageKey,JSON.stringify({...value,submitted:true}));}catch{}
}
function withTicketLock(action){
 return navigator.locks?navigator.locks.request(storageKey,action):Promise.resolve().then(action);
}
function alreadySubmitted(){
 shell(`<section class="thanks"><span class="success">✓</span><h1>Vous avez déjà envoyé votre évaluation.</h1><p>Une seule réponse est acceptée par navigateur pour cette session. Merci de votre participation.</p><p class="muted">${esc(code)}</p></section>`);
}
addEventListener('storage',event=>{
 if(!demo&&!busy&&event.key===storageKey){
  try{if(JSON.parse(event.newValue)?.submitted)alreadySubmitted();}catch{}
 }
});
const choice=(name,label,values)=>`<fieldset class="question"><legend>${esc(label)}</legend><div class="choices ${values.length===4?'four':''}">${values.map((v,i)=>`<label><input type="radio" name="${name}" value="${esc(v)}" required><span>${esc(v)}${values.length===4?`<small>${scale[i]}</small>`:''}</span></label>`).join('')}</div></fieldset>`;
async function start(){
 shell('<p id="status" role="status">Chargement de la session…</p>');
 try{
 if(demo){if(code!==CODE)throw Error('Session de démonstration inconnue.');session=initialSession;}
 else {if(!client)throw Error('Application non configurée. Renseignez la connexion Supabase avant de recueillir des évaluations.');const {data,error}=await client.from('sessions').select('*').eq('code',code).maybeSingle();if(error)throw error;if(!data)throw Error('Session introuvable ou indisponible.');session=data;}
 if(!session.is_open)throw Error('Cette session est fermée. Merci de contacter votre formateur.');
 if(session.questionnaire_version!==VERSION)throw Error('Version du questionnaire non prise en charge.');
 if(!demo){const value=await withTicketLock(ticket);submissionId=value.id;if(value.submitted){alreadySubmitted();return;}}
 shell(`<div class="eyebrow">ÉVALUATION DE SATISFACTION À CHAUD</div><h1>Votre retour fait<br>progresser la formation<span class="red">.</span></h1><p class="subtitle">${esc(session.subtitle)}</p><section class="session"><h2>${esc(session.title)}</h2><dl>${[['Code',session.code],['Lieu',session.location],['Dates',session.dates],['Formateur',session.trainer]].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section><aside class="instructions"><strong>Consignes</strong><p>${instructions}</p></aside><div class="progress"><span id="progressText">0 / 20 réponses</span><progress id="progress" max="20" value="0"></progress></div><form id="evaluation"><label class="field">Fonction (facultatif)<input name="fonction" maxlength="200" autocomplete="off"></label>${sections.map((s,i)=>`<section class="section"><h2><span class="number">${i+1}</span>${esc(s.title)}</h2>${s.questions.map(q=>choice(q.id,q.label,[1,2,3,4])).join('')}${i===4?choice('recommend','Recommanderiez-vous cette formation à un collègue ?',['Oui','Non'])+choice('before_level','Votre niveau sur le sujet avant la formation',levels)+choice('after_level','Votre niveau sur le sujet après la formation',levels):''}${i===5?Object.entries(commentLabels).map(([k,v])=>`<label class="field">${esc(v)}<textarea name="${k}" rows="4" maxlength="4000"></textarea></label>`).join(''):''}</section>`).join('')}<p class="muted">Les évaluations et les trois questions de la section 5 sont obligatoires. Fonction et commentaires sont facultatifs.</p><p id="status" role="status" aria-live="polite"></p><button id="submit" type="submit">Envoyer l’évaluation <span aria-hidden="true">→</span></button></form>`);
 const form=document.querySelector('form');form.addEventListener('change',()=>{const count=new Set([...form.querySelectorAll('input[type=radio]:checked')].map(e=>e.name)).size;document.querySelector('#progress').value=count;document.querySelector('#progressText').textContent=`${count} / 20 réponses`;});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;busy=true;document.querySelector('#submit').disabled=true;notice('Envoi en cours…');
  const f=new FormData(form);
  const send=async()=>{
   const value=demo?{id:submissionId,submitted:false}:ticket();
   if(value.submitted){alreadySubmitted();return;}
   const payload={submission_id:value.id,session_code:code,questionnaire_version:VERSION,ratings:Object.fromEntries(questions.map(q=>[q.id,Number(f.get(q.id))])),fonction:f.get('fonction').trim(),recommend:f.get('recommend'),before_level:f.get('before_level'),after_level:f.get('after_level'),strengths:f.get('strengths').trim(),improvements:f.get('improvements').trim(),topics:f.get('topics').trim()};
   if(!demo){
    const {error}=await client.rpc('submit_evaluation',{payload});
    // A prior request may have committed even though the browser never received its reply.
    if(error?.message==='Invalid submission'){markSubmitted(value);alreadySubmitted();return;}
    if(error)throw error;
    markSubmitted(value);
   }
   shell(`<section class="thanks"><span class="success">✓</span><h1>Merci de votre participation.</h1><p>${demo?'Simulation terminée. Aucune réponse n’a été enregistrée.':'Votre évaluation a bien été enregistrée.'}</p><p class="muted">${esc(code)}</p></section>`);
  };
  try{if(demo)await send();else await withTicketLock(send);}catch(error){notice(error.message===storageMessage?storageMessage:'L’envoi a échoué. Vos réponses sont conservées à l’écran. Vérifiez votre connexion et réessayez.');busy=false;document.querySelector('#submit').disabled=false;}
 });
 }catch(error){shell(`<section class="section"><h1>Évaluation indisponible</h1><p id="status" role="alert">${esc(error.message)}</p>${!client&&!demo?'<a href="?demo=1">Voir la démonstration</a>':''}</section>`);}
}start();
