import React, { useState, useEffect, useCallback } from 'react';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './TubeShell_traduction';

const TUBEANDSHELLMainPage = ({ innerData, currentLanguage = 'fr' }) => {
  const initialData_TubeShell = {
    // Add your initial state here
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [data_TubeShell, setData_TubeShell] = useState(() => {
    const savedData = localStorage.getItem('data_TubeShell');
    return savedData ? JSON.parse(savedData) : initialData_TubeShell;
  });

  useEffect(() => {
    localStorage.setItem('data_TubeShell', JSON.stringify(data_TubeShell));
  }, [data_TubeShell]);

  const handleChange = (name, value) => {
    setData_TubeShell((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('data_TubeShell');
    setData_TubeShell(initialData_TubeShell);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('TubeShell Parameters')}</h3>
      
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

export default TUBEANDSHELLMainPage;