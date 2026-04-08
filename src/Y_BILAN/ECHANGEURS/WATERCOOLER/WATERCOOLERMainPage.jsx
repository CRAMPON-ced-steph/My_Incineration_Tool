import React, { useState, useEffect, useCallback } from 'react';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WaterCooler_traduction';

const WATERCOOLERMainPage = ({ innerData, currentLanguage = 'fr' }) => {
  const initialData_WaterCooler = {
    // Add your initial state here
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [data_WaterCooler, setData_WaterCooler] = useState(() => {
    const savedData = localStorage.getItem('data_WaterCooler');
    return savedData ? JSON.parse(savedData) : initialData_WaterCooler;
  });

  useEffect(() => {
    localStorage.setItem('data_WaterCooler', JSON.stringify(data_WaterCooler));
  }, [data_WaterCooler]);

  const handleChange = (name, value) => {
    setData_WaterCooler((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('data_WaterCooler');
    setData_WaterCooler(initialData_WaterCooler);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('WaterCooler Parameters')}</h3>
      
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

export default WATERCOOLERMainPage;