import {createClient} from '@supabase/supabase-js';
import './style.css';
import './actl.css';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const demo=new URLSearchParams(location.search).get('demo')==='1';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const client=url&&key&&!url.includes('YOUR_PROJECT')&&!key.includes('YOUR_PUBLIC')?createClient(url,key,{auth:{persistSession:location.pathname.endsWith('actl-trainer.html'),detectSessionInUrl:false}}):null;
export const fmt=(v,d=2)=>v==null?'—':Number(v).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
export function shell(content,trainer=false){document.querySelector('#app').innerHTML=`<header><a class="brand" href="./actl.html"><span class="monogram">RM</span><span>RIAD MAMICHE<small>FORMATION & ÉVALUATION</small></span></a><span class="header-label">${trainer?'Espace formateur · ACTL':'Votre avis compte'}</span></header>${demo?'<div class="demo">DÉMONSTRATION · Aucune réponse réelle enregistrée</div>':''}<main class="${trainer?'wide':''}">${content}</main><footer>© 2026 Riad MAMICHE · Document propriétaire — reproduction interdite sans autorisation</footer>`;}
