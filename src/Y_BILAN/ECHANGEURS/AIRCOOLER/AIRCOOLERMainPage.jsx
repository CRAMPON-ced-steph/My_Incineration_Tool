import React, { useState, useEffect, useCallback } from 'react';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './AirCooler_traduction';

const AIRCOOLERMainPage = ({ innerData, currentLanguage = 'fr' }) => {
  const initialData_AirCooler = {
    // Add your initial state here
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [data_AirCooler, setData_AirCooler] = useState(() => {
    const savedData = localStorage.getItem('data_AirCooler');
    return savedData ? JSON.parse(savedData) : initialData_AirCooler;
  });

  useEffect(() => {
    localStorage.setItem('data_AirCooler', JSON.stringify(data_AirCooler));
  }, [data_AirCooler]);

  const handleChange = (name, value) => {
    setData_AirCooler((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('data_AirCooler');
    setData_AirCooler(initialData_AirCooler);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('AirCooler Parameters')}</h3>
      
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

export default AIRCOOLERMainPage;