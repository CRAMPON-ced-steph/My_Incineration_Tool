// Contexte pour les traductions
const LanguageContext = React.createContext({
  language: 'fr',
  setLanguage: () => {},
  t: (key) => key,
});

// Hook personnalisé pour utiliser les traductions
const useTranslation = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Provider pour les traductions
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'fr');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Fonction de traduction
  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return key; // Retourne la clé si la traduction n'est pas trouvée
      }
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Composant de sélection de langue
const LanguageSelector = () => {
  const { language, setLanguage, t } = useTranslation();
  
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        padding: '5px',
        borderRadius: '4px',
      }}
    >
      <option value="fr">{t('languages.french')}</option>
      <option value="en">{t('languages.english')}</option>
      <option value="es">{t('languages.spanish')}</option>
      <option value="de">{t('languages.german')}</option>
    </select>
  );
};