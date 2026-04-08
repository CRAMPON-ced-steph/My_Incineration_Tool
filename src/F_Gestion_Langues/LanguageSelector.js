import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Noms des langues à afficher
const languageNames = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch'
};

const LanguageSelector = () => {
  const { language, setLanguage, supportedLanguages } = useContext(LanguageContext);

  return (
    <div className="language-selector">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="language-dropdown"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;