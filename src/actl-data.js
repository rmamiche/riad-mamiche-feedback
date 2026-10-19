export const ACTL_CODE='RM-DPO-3J-ACTL-2026';
export const actlSession={code:ACTL_CODE,title:'Comment devenir un DPO — le délégué à la protection des données en pratique',location:'Académie de Transport et de Logistique (ACTL), Bordj El Kiffane',dates:'18, 19 et 20 octobre 2026',is_open:true};
export const actlSections=[
 ['Objectifs et contenu',['Les objectifs annoncés dans la fiche technique ont été atteints','Le contenu correspond à ma fonction de délégué','La progression des trois jours (loi → cartographie → formalités) est logique','Les exemples tirés des procès-verbaux de l’ANPDP sont utiles','La distinction loi / position de l’ANPDP / bonne pratique est claire']],
 ['Animation',['Clarté des explications','Rythme et gestion du temps','Réponses aux questions des participants','Équilibre entre théorie (matin) et pratique (après-midi)']],
 ['Ateliers et outils',['Le cas fil rouge TRANSIGMA','Les fichiers Excel (matrice et registre, feuille de route, tableau de bord)','Le simulateur du portail de l’ANPDP','Les supports de cours et les cahiers d’atelier','Les quiz et leurs corrigés']],
 ['Organisation',['Salle et équipement','Horaires et pauses','Accueil et logistique']]
].map(([title,labels],i)=>({title,questions:labels.map((label,j)=>({id:`s${i+1}q${j+1}`,label}))}));
export const actlQuestions=actlSections.flatMap(s=>s.questions);
export const actlComments={strengths:'Ce qui vous a été le plus utile :',improvements:'Ce qui devrait être amélioré :',topics:'Un besoin de suivi ou d’accompagnement dans votre organisme, ou un autre thème de formation souhaité :'};
export const actlInstructions='Votre avis sert à améliorer la formation. Cochez une case par critère : 1 = pas du tout satisfait · 2 = peu satisfait · 3 = satisfait · 4 = très satisfait. Le questionnaire peut rester anonyme.';
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
export function summarizeACTL(rows){return {count:rows.length,overall:mean(rows.map(r=>Number(r.overall))),recommend:['Oui','Non','Peut-être'].map(label=>({label,count:rows.filter(r=>r.recommend===label).length,percent:rows.length?100*rows.filter(r=>r.recommend===label).length/rows.length:null})),readiness:['Oui','En partie','Non'].map(label=>({label,count:rows.filter(r=>r.readiness===label).length})),sections:actlSections.map(s=>({title:s.title,average:mean(rows.flatMap(r=>s.questions.map(q=>r.ratings[q.id])))})),questions:actlQuestions.map(q=>({...q,average:mean(rows.map(r=>r.ratings[q.id])),distribution:[1,2,3,4].map(v=>rows.filter(r=>r.ratings[q.id]===v).length)}))};}
