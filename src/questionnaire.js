export const CODE='RM-PDP-5J-CTMC-2026';
export const VERSION='rm-pdp-v1';
export const sections=[
 ['Objectifs et contenu',['Les objectifs annoncés ont été atteints','Le contenu correspondait à mes besoins professionnels','La progression des cinq jours était logique','Les distinctions loi / ANPDP / bonne pratique étaient claires','Les exemples étaient pertinents et concrets']],
 ['Animation et méthodes',['Clarté des explications du formateur','Maîtrise du sujet par le formateur','Qualité des échanges et des réponses aux questions','Utilité des quiz (pré-quiz, quiz finals, corrections)','Démonstration des procédures et du portail de l’ANPDP']],
 ['Supports',['Qualité des présentations projetées','Qualité et utilité des supports de cours','Utilité des références aux textes et documents officiels']],
 ['Organisation',['Rythme et durée des séquences','Horaires et pauses','Conditions matérielles (salle, équipement, accueil)']],
 ['Appréciation globale',['Note globale de la formation']],
 ['Vos commentaires',[]]
].map(([title,labels],section)=>({title,questions:labels.map((label,index)=>({id:`s${section+1}q${index+1}`,label}))}));
export const questions=sections.flatMap(s=>s.questions);
export const scale=['pas du tout satisfait','peu satisfait','satisfait','très satisfait'];
export const levels=['Débutant','Intermédiaire','Avancé'];
export const commentLabels={strengths:'Les points forts de la formation :',improvements:'Les points à améliorer :',topics:'Les thèmes que vous souhaiteriez approfondir (formation complémentaire) :'};
export const instructions='Ce questionnaire est anonyme, sauf si vous choisissez d’indiquer votre fonction. Cochez une case par critère : 1 = pas du tout satisfait · 2 = peu satisfait · 3 = satisfait · 4 = très satisfait. Vos réponses servent à améliorer les prochaines sessions.';
export const initialSession={code:CODE,title:'Protection des données à caractère personnel — 5 jours (30 heures)',subtitle:'Protection des données à caractère personnel : Loi n° 18-07 modifiée et complétée par la Loi n° 25-11',location:'CTMC / SPA',dates:'À renseigner par le formateur',trainer:'M. Riad MAMICHE',questionnaire_version:VERSION,is_open:true};
