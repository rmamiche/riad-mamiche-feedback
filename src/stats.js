import {questions,sections,levels} from './questionnaire.js';
const mean=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
export function summarize(rows){
 const result={count:rows.length,overall:mean(rows.map(r=>r.ratings.s5q1)),recommend:rows.length?100*rows.filter(r=>r.recommend==='Oui').length/rows.length:null};
 result.questions=questions.map(q=>({...q,average:mean(rows.map(r=>r.ratings[q.id])),distribution:[1,2,3,4].map(v=>rows.filter(r=>r.ratings[q.id]===v).length)}));
 result.sections=sections.slice(0,5).map(s=>({title:s.title,average:mean(rows.flatMap(r=>s.questions.map(q=>r.ratings[q.id])))}));
 result.levels=levels.map(level=>({level,before:rows.filter(r=>r.before_level===level).length,after:rows.filter(r=>r.after_level===level).length}));return result;
}
export const fmt=(value,digits=2)=>value===null?'—':value.toLocaleString('fr-FR',{maximumFractionDigits:digits,minimumFractionDigits:digits});
