import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './COOLINGTOWER_traduction';

const COOLINGTOWERFlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr' }) => {
  const initialEmissions_Pollutants = {
    'Fly ashes content outlet [g/Nm3]': 0.1,
    'siccity bottom ash [%]': 66,
    'O2 ref [%]': 11,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emissionsPollutants, setEmissionsPollutants] = useState(() => {
    const savedEmissions = localStorage.getItem('emissionsPollutants_COOLINGTOWER');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions_Pollutants;
  });

  useEffect(() => {
    localStorage.setItem('emissionsPollutants_COOLINGTOWER', JSON.stringify(emissionsPollutants));
  }, [emissionsPollutants]);

  // ========== EXTRACT PARAMETERS FROM STATE ==========
  const FlyAsh_g_Nm3 = emissionsPollutants['Fly ashes content outlet [g/Nm3]'];
  const O2ref = emissionsPollutants['O2 ref [%]'];
  const Bottom_Ash_Siccity = emissionsPollutants['siccity bottom ash [%]'];

  // ========== INPUT DATA WITH FALLBACK VALUES ==========
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const FG_O2_calcule = innerData?.O2calcul || 12;
  const masse_dechets = innerData?.MasseDechet || 0;
  const masses_pollutant_input = innerData?.PollutantOutput || {};

  // ========== RESIDUES INPUT DATA ==========
  const Residus_IN = innerData?.ResidusOutput || {
    FlyAsh_kg_h: 0,
    mass_residus_tot: 0,
    WetBottomAsh_kg_h: 0,
  };

  // ========== ASH CALCULATIONS ==========
  const Fly_ash_in_kg_h = Residus_IN.FlyAsh_kg_h;
  const Fly_ash_out_kg_h = (Debit_fumees_sec_Nm3_h * FlyAsh_g_Nm3) / 1000;
  const COOLINGTOWER_Ash_kg_h = Fly_ash_in_kg_h - Fly_ash_out_kg_h;

  // ========== OUTPUT POLLUTANT MASSES ==========
  const masses_pollutant_output = {
    HCl: masses_pollutant_input.HCL || 0,
    HF: masses_pollutant_input.HF || 0,
    Cl: masses_pollutant_input.Cl || 0,
    S: masses_pollutant_input.S || 0,
    SO2: masses_pollutant_input.SO2 || 0,
    N2: masses_pollutant_input.N2 || 0,
    NOx: masses_pollutant_input.NOx || 0,
    CO2: innerData?.FG_OUT_kg_h?.CO2 || 0,
    NH3: 0,
    DustFlyAsh: Fly_ash_out_kg_h,
    Mercury: masses_pollutant_input.Mercury || 0,
    PCDDF: masses_pollutant_input.PCDDF || 0,
    Cd_Ti: masses_pollutant_input.CdTi || 0,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.SdAsPbCrCoCuMnNi || 0,
  };

  // ========== UI DATA ==========
  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: masse_dechets.toFixed(2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('O2 calculated [%]'), value: FG_O2_calcule.toFixed(2) },
    { text: t('Fly ash content [g/Nm3]'), value: FlyAsh_g_Nm3.toFixed(2) },
  ];

  const residusCalculations = [
    { text: t('COOLINGTOWER ash [kg/h]'), value: COOLINGTOWER_Ash_kg_h.toFixed(2) },
  ];

  // ========== EVENT HANDLERS ==========
  const handleChange = useCallback((name, value) => {
    let newValue = value;

    if (name === 'Fly ashes content outlet [g/Nm3]') {
      newValue = Math.max(0, Math.min(40, value));
    } else if (name === 'siccity bottom ash [%]') {
      newValue = Math.max(0, Math.min(100, value));
    } else if (name === 'O2 ref [%]') {
      newValue = Math.max(0, Math.min(21, value));
    }

    setEmissionsPollutants((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setEmissionsPollutants(initialEmissions_Pollutants);
    localStorage.removeItem('emissionsPollutants_COOLINGTOWER');
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
            marginBottom: '15px'
          }}
        >
          {t('Clear memory')}
        </button>

        {/* Inline parameters form */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          {Object.entries(emissionsPollutants).map(([key, value]) => (
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

export default COOLINGTOWERFlueGasPollutantEmission;