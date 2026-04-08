import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './IDFAN_traduction';

const IDFANFlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr' }) => {
  const initialEmissions2 = {
    'Fly ashes content outlet [g/Nm3]': 0.1,
    'siccity bottom ash [%]': 66,
    'O2 ref [%]': 11,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emissions2, setEmissions2] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions2_IDFAN');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions2;
  });

  useEffect(() => {
    localStorage.setItem('emissions2_IDFAN', JSON.stringify(emissions2));
  }, [emissions2]);

  // Extract parameters from state
  const FlyAsh_g_Nm3 = emissions2['Fly ashes content outlet [g/Nm3]'];
  const O2ref = emissions2['O2 ref [%]'];

  // Input data with fallback values
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const FG_O2_calcule = innerData?.O2calcul || 12;
  const masse_dechets = innerData?.MasseDechet || 1;
  const Inert_kg_h = innerData?.Inertmass || 0;

  const masses_pollutant_input = innerData?.PollutantOutput || {};

  const Residus_IN = innerData?.ResidusOutput || {
    FlyAsh_kg_h: 0,
    mass_residus_tot: 0,
    WetBottomAsh_kg_h: 0
  };

  // Calculate ash flows
  const Fly_ash_in_kg_h = Residus_IN.FlyAsh_kg_h;
  const Fly_ash_out_kg_h = Debit_fumees_sec_Nm3_h * FlyAsh_g_Nm3 / 1000;
  const IDFAN_Ash_kg_h = Fly_ash_in_kg_h - Fly_ash_out_kg_h;

  // Output pollutant composition
  const masses_pollutant_output = {
    HCl: masses_pollutant_input.HCL,
    HF: masses_pollutant_input.HF,
    Cl: masses_pollutant_input.Cl,
    S: masses_pollutant_input.S,
    SO2: masses_pollutant_input.SO2,
    N2: masses_pollutant_input.N2,
    NOx: masses_pollutant_input.NOx,
    CO2: innerData?.FG_OUT_kg_h?.CO2 || 0,
    NH3: 0,
    DustFlyAsh: Fly_ash_out_kg_h,
    Mercury: masses_pollutant_input.Mercury,
    PCDDF: masses_pollutant_input.PCDDF,
    Cd_Ti: masses_pollutant_input.CdTi,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.SdAsPbCrCoCuMnNi,
  };

  // Update innerData with calculated values
  if (innerData) {
    innerData.IDFAN_Ash_kg_h = IDFAN_Ash_kg_h;
    innerData.Fly_ash_out_kg_h = Fly_ash_out_kg_h;
    innerData.PollutantOutput_IDFAN = masses_pollutant_output;
  }

  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: masse_dechets.toFixed(2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('O2 calculated [%]'), value: FG_O2_calcule.toFixed(2) },
    { text: t('Fly ash inlet [kg/h]'), value: Fly_ash_in_kg_h.toFixed(3) },
    { text: t('Fly ash outlet [kg/h]'), value: Fly_ash_out_kg_h.toFixed(3) },
  ];

  const residusCalculations = [
    { text: t('IDFAN ash collected [kg/h]'), value: IDFAN_Ash_kg_h.toFixed(3) },
  ];

  const handleChange = (name, value) => {
    let newValue = value;
    
    if (name === 'Fly ashes content outlet [g/Nm3]') {
      newValue = Math.max(0, Math.min(40, value));
    } else if (name === 'siccity bottom ash [%]') {
      newValue = Math.max(0, Math.min(100, value));
    } else if (name === 'O2 ref [%]') {
      newValue = Math.max(0, Math.min(21, value));
    }

    setEmissions2((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions2_IDFAN');
    setEmissions2(initialEmissions2);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
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

        {/* Inline parameters form */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(emissions2).map(([key, value]) => (
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
        masses={masses_pollutant_output}
        O2_mesure={FG_O2_calcule}
        O2_ref={O2ref}
        Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h}
      />

      <h3>{t('Residues calculated')}</h3>
      <TableGeneric elements={residusCalculations} />
    </div>
  );
};

export default IDFANFlueGasPollutantEmission;