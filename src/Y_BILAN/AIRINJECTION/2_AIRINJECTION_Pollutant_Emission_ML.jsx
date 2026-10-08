import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './AIRINJECTION_traduction';
import '../../index.css';

import { fmt } from '../../A_Transverse_fonction/formatNumber';
const AIRINJECTIONFlueGasPollutantEmission = ({ innerData, nodeId, currentLanguage = 'fr' }) => {
  const initialEmission_pollutant_airinjection = {
    'O2 ref [%]': 11,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emission_pollutant_airinjection, setEmission_pollutant_airinjection] = useState(() => {
    const savedEmissions = localStorage.getItem(`emission_pollutant_airinjection_AIRINJECTION_${nodeId}`);
    if (savedEmissions) {
      const parsed = JSON.parse(savedEmissions);
      delete parsed['Fly residus content outlet [g/Nm3]'];
      delete parsed['siccity bottom ash [%]'];
      return { ...initialEmission_pollutant_airinjection, ...parsed };
    }
    return initialEmission_pollutant_airinjection;
  });

  useEffect(() => {
    localStorage.setItem(`emission_pollutant_airinjection_AIRINJECTION_${nodeId}`, JSON.stringify(emission_pollutant_airinjection));
  }, [emission_pollutant_airinjection]);

  // Extract parameters from state
  const O2ref = emission_pollutant_airinjection['O2 ref [%]'] || 11;

  // Input data from innerData
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const O2_amont = innerData?.O2_calcule;
  const FG_O2_calcule = O2_amont > 0 ? (O2_amont <= 0.21 ? O2_amont * 100 : O2_amont) : 1;
  const masse_dechets = innerData?.MasseDechet || 1;

  const masses_pollutant_input = innerData?.PollutantOutput || {};

  const Fly_ash_in_kg_h = innerData?.ResidusOutput?.FlyAsh_kg_h || 0;

  // Update innerData — pass-through, AIRINJECTION ne modifie pas les polluants
  if (innerData) {
    innerData.PollutantOutput = masses_pollutant_input;
  }

  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: fmt(masse_dechets, 2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: fmt(Debit_fumees_humide_Nm3_h, 0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: fmt(Debit_fumees_sec_Nm3_h, 0) },
    { text: t('O2 calculated [%]'), value: fmt(FG_O2_calcule, 2) },
    { text: t('Fly ash inlet [kg/h]'), value: fmt(Fly_ash_in_kg_h, 2) },
  ];

  const handleChange = (name, value) => {
    let newValue = parseFloat(value) || 0;
    if (name === 'O2 ref [%]') {
      newValue = Math.max(0, Math.min(21, newValue));
    }
    setEmission_pollutant_airinjection((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleReset = useCallback(() => {
    setEmission_pollutant_airinjection(initialEmission_pollutant_airinjection);
    localStorage.removeItem(`emission_pollutant_airinjection_AIRINJECTION_${nodeId}`);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
      <div className="cadre_param_bilan">
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '15px',
          }}
        >
          {t('Reset to Default Values')}
        </button>

        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(emission_pollutant_airinjection).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <label
                style={{
                  flex: '1',
                  minWidth: '250px',
                  textAlign: 'right',
                  fontWeight: '500',
                  color: '#333',
                }}
              >
                {t(key)}:
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                style={{
                  flex: '0 0 150px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Input flue gas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_input}
        O2_mesure={FG_O2_calcule}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h4>{t('Output flue gas')}</h4>
      <PollutantCalculator
        masses={masses_pollutant_input}
        O2_mesure={FG_O2_calcule}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />
    </div>
  );
};

export default AIRINJECTIONFlueGasPollutantEmission;
