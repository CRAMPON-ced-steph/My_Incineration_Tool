import React, { createContext, useState, useEffect } from 'react';

// Créer le contexte
export const LanguageContext = createContext();

// Fournisseur du contexte
export const LanguageProvider = ({ children }) => {
  // Essayer de récupérer la langue du localStorage ou utiliser la langue du navigateur
  const getBrowserLanguage = () => {
    const browserLang = navigator.language.split('-')[0]; // 'fr-FR' devient 'fr'
    // Vérifier si la langue du navigateur est supportée
    return ['en', 'fr', 'es', 'de'].includes(browserLang) ? browserLang : 'en';
  };

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || getBrowserLanguage();
  });

  // Mettre à jour le localStorage quand la langue change
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // Valeur du contexte
  const value = {
    language,
    setLanguage,
    supportedLanguages: ['en', 'fr', 'es', 'de']
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};