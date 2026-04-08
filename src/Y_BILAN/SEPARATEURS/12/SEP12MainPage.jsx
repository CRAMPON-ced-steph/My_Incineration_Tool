import React, { useState, useEffect, useCallback } from 'react';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
//import { translations } from './SEP12_traduction';

import { translations } from './SEP12_traduction';

const SEP12MainPage = ({ innerData, currentLanguage = 'fr' }) => {
  const initialData_SEP12 = {
    // Add your initial state here
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [data_SEP12, setData_SEP12] = useState(() => {
    const savedData = localStorage.getItem('data_SEP12');
    return savedData ? JSON.parse(savedData) : initialData_SEP12;
  });

  useEffect(() => {
    localStorage.setItem('data_SEP12', JSON.stringify(data_SEP12));
  }, [data_SEP12]);

  const handleChange = (name, value) => {
    setData_SEP12((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('data_SEP12');
    setData_SEP12(initialData_SEP12);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('SEP12 Parameters')}</h3>
      
      <div className="cadre_param_bilan">
        <button 
          onClick={clearMemory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}
        >
          {t('Clear memory')}
        </button>

        {/* Add your content here */}
      </div>
    </div>
  );
};

export default SEP12MainPage;