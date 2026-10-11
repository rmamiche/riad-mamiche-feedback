import {getQuestionnaire,VERSION} from './questionnaire.js';
const mean=values=>{const valid=values.filter(v=>typeof v==='number'&&Number.isFinite(v));return valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null;};
export function summarize(rows,version=VERSION){
 const q=getQuestionnaire(version);if(!q)throw Error('Questionnaire inconnu');
 const result={count:rows.length,overall:mean(rows.map(r=>r.ratings?.[q.overallId])),recommend:rows.length?100*rows.filter(r=>r.recommend==='Oui').length/rows.length:null};
 result.questions=q.questions.map(item=>({...item,average:mean(rows.map(r=>r.ratings?.[item.id])),distribution:[1,2,3,4].map(v=>rows.filter(r=>r.ratings?.[item.id]===v).length)}));
 result.sections=q.sections.filter(s=>s.questions.length).map(s=>({title:s.title,average:mean(rows.flatMap(r=>s.questions.map(item=>r.ratings?.[item.id])))}));
 result.levels=q.levels.map(level=>({level,before:rows.filter(r=>r.before_level===level).length,after:rows.filter(r=>r.after_level===level).length}));
 if(q.confidentialityQuestion)result.confidentiality=['Oui','En partie','Non'].map(answer=>({answer,count:rows.filter(r=>r.raw_payload?.confidentiality===answer).length}));
 return result;
}
export const fmt=(value,digits=2)=>value==null?'—':value.toLocaleString('fr-FR',{maximumFractionDigits:digits,minimumFractionDigits:digits});
