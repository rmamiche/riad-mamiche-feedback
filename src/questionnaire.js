export const CODE='RM-PDP-5J-CTMC-2026';
export const VERSION='rm-pdp-v1';
const build=(version,code,groups,commentLabels,extra={})=>{
 const sections=groups.map(([title,labels],section)=>({title,questions:labels.map((label,index)=>({id:`s${section+1}q${index+1}`,label}))}));
 return {version,code,sections,questions:sections.flatMap(s=>s.questions),scale:['pas du tout satisfait','peu satisfait','satisfait','très satisfait'],levels:['Débutant','Intermédiaire','Avancé'],commentLabels,instructions:'Ce questionnaire est anonyme, sauf si vous choisissez d’indiquer votre fonction. Cochez une case par critère : 1 = pas du tout satisfait · 2 = peu satisfait · 3 = satisfait · 4 = très satisfait. Vos réponses servent à améliorer les prochaines sessions.',...extra};
};
const ctmc=build(VERSION,CODE,[
 ['Objectifs et contenu',['Les objectifs annoncés ont été atteints','Le contenu correspondait à mes besoins professionnels','La progression des cinq jours était logique','Les distinctions loi / ANPDP / bonne pratique étaient claires','Les exemples étaient pertinents et concrets']],
 ['Animation et méthodes',['Clarté des explications du formateur','Maîtrise du sujet par le formateur','Qualité des échanges et des réponses aux questions','Utilité des quiz (pré-quiz, quiz finals, corrections)','Démonstration des procédures et du portail de l’ANPDP']],
 ['Supports',['Qualité des présentations projetées','Qualité et utilité des supports de cours','Utilité des références aux textes et documents officiels']],
 ['Organisation',['Rythme et durée des séquences','Horaires et pauses','Conditions matérielles (salle, équipement, accueil)']],
 ['Appréciation globale',['Note globale de la formation']],['Vos commentaires',[]]
],{strengths:'Les points forts de la formation :',improvements:'Les points à améliorer :',topics:'Les thèmes que vous souhaiteriez approfondir (formation complémentaire) :'}, {overallId:'s5q1'});
const rh=build('rm-pdp-rh-v1','RM-PDP-RH-2J-AT-2026',[
 ['Objectifs et contenu',['Les objectifs annoncés ont été atteints','Le contenu correspondait à mes besoins dans la fonction RH','L’organisation « la loi le matin, son application aux RH l’après-midi » était claire','Les exemples RH et les décisions de l’ANPDP présentés étaient concrets et utiles','La distinction loi / ANPDP / bonne pratique était claire']],
 ['Animation',['Clarté des explications du formateur','Maîtrise du sujet par le formateur','Qualité des échanges et des réponses aux questions','Utilité des quiz (pré-quiz, quiz finals, corrections)']],
 ['Supports',['Qualité des présentations projetées','Qualité et utilité des supports de cours','Utilité de la fiche réflexe « Confidentialité des données du personnel »']],
 ['Organisation',['Rythme et durée des séquences','Horaires et pauses','Conditions matérielles (salle, équipement, accueil)']],
 ['Appréciation globale',['Note globale de la formation']],['Vos commentaires',[]]
],{strengths:'Les points forts de la formation :',improvements:'Les points à améliorer :',practice_change:'Ce que je vais changer dans ma pratique quotidienne :',topics:'Les thèmes que vous souhaiteriez approfondir (formation complémentaire) :'}, {overallId:'s5q1',confidentialityQuestion:'Je me sens capable d’appliquer les bons réflexes de confidentialité à mon poste',functionChoices:['Agent RH','Cadre RH','Responsable RH','Autre']});
export const questionnaires={[ctmc.version]:ctmc,[rh.version]:rh};
export const getQuestionnaire=version=>questionnaires[version]||null;
export const sections=ctmc.sections,questions=ctmc.questions,scale=ctmc.scale,levels=ctmc.levels,commentLabels=ctmc.commentLabels,instructions=ctmc.instructions;
export const initialSession={code:CODE,title:'Protection des données à caractère personnel — 5 jours (30 heures)',subtitle:'Protection des données à caractère personnel : Loi n° 18-07 modifiée et complétée par la Loi n° 25-11',location:'CTMC / SPA',dates:'À renseigner par le formateur',trainer:'M. Riad MAMICHE',questionnaire_version:VERSION,is_open:true};
export const rhInitialSession={code:rh.code,title:'La Loi n° 18-07 modifiée et complétée par la Loi n° 25-11 appliquée à la gestion des ressources humaines',subtitle:'Formation destinée au personnel des ressources humaines d’Algérie Télécom — 2 jours (12 heures)',location:'ESAA',dates:'À renseigner par le formateur',trainer:'M. Riad MAMICHE',questionnaire_version:rh.version,is_open:false};
