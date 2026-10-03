import {createClient} from '@supabase/supabase-js';
import './style.css';
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const demo=new URLSearchParams(location.search).get('demo')==='1';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured=!!url&&!!key&&!url.includes('YOUR_PROJECT')&&!key.includes('YOUR_PUBLIC');
export const client=configured?createClient(url,key,{auth:{persistSession:location.pathname.endsWith('trainer.html'),detectSessionInUrl:false}}):null;
export function shell(content,trainer=false){document.querySelector('#app').innerHTML=`<header><a class="brand" href="./index.html"><span class="monogram">RM</span><span>RIAD MAMICHE<small>FORMATION & ÉVALUATION</small></span></a><span class="header-label">${trainer?'Espace formateur':'Votre avis compte'}</span></header>${demo?'<div class="demo">DÉMONSTRATION · Aucune donnée réelle ni aucun envoi à Supabase</div>':''}<main class="${trainer?'wide':''}">${content}</main><footer>© 2026 Riad MAMICHE · Document propriétaire — reproduction interdite sans autorisation</footer>`;}
export function notice(text){document.querySelector('#status').textContent=text;}
export function formURL(code){const u=new URL('index.html',location.href);u.search='';u.searchParams.set('session',code);if(demo)u.searchParams.set('demo','1');return u.href;}
