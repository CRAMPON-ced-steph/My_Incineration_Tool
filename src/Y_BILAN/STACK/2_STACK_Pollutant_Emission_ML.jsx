import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './STACK_traduction';

const STACKFlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr', setInnerData }) => {
  // Translation setup
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // Initial state with translated keys
  const initialEmissions2 = {
    [t('O2RefPercent')]: 11,
    [t('flyAshContent')]: 0,
  };

  const [emissions2, setEmissions2] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions2_STACK');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions2;
  });

  // Save to localStorage whenever emissions change
  useEffect(() => {
    localStorage.setItem('emissions2_STACK', JSON.stringify(emissions2));
  }, [emissions2]);

  // Extract input data with safe fallbacks
  const FlyAsh_g_Nm3 = emissions2[t('flyAshContent')] || 0;
  const O2ref = emissions2[t('O2RefPercent')] || 11;
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const FG_O2_calcule = innerData?.O2calcul || 12;
  const masses_pollutant_input = innerData?.PollutantOutput || {};

  // Handle input changes
  const handleChange = (name, value) => {
    setEmissions2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear stored data
  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions2_STACK');
    setEmissions2(initialEmissions2);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('calculationParameters')}</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={clearMemory}
          style={{
            padding: '8px 16px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            marginBottom: '15px'
          }}
        >
          {t('clearMemory')}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.entries(emissions2).map(([key, value]) => (
            <div 
              key={key} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                background: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              <label style={{
                flex: 1,
                fontWeight: '500',
                color: '#333'
              }}>
                {key}:
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                style={{
                  flex: '0 0 120px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <h3>{t('flueGasComposition')}</h3>
      <h4>{t('inputFlueGas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_input}
        O2_mesure={FG_O2_calcule}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />
    </div>
  );
};

export default STACKFlueGasPollutantEmission;