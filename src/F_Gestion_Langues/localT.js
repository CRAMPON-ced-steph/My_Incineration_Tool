import { getLanguageCode } from './Fonction_Traduction';

// makeT(dictionnaire, langue facultative) -> t(clé)
// Sans langue fournie, lit 'selectedLanguage' dans localStorage (écrit par Main_FLOW).
// Repli : langue demandée -> français -> clé.
export const makeT = (dict, currentLanguage) => {
  let lang = currentLanguage;
  if (!lang) {
    try { lang = localStorage.getItem('selectedLanguage') || 'fr'; } catch { lang = 'fr'; }
  }
  const code = getLanguageCode(lang);
  return (key) => dict[code]?.[key] ?? dict.fr?.[key] ?? key;
};
