import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import PrintButton from '../../C_Components/Windows_print';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './CYCLONE_traduction';
import '../../index.css';

const CYCLONEFlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr' }) => {
  const initialEmission_pollutant_cyclone = {
    'Fly residus content outlet [g/Nm3]': 1,
    'siccity bottom ash [%]': 66,
    'O2 ref [%]': 11,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emission_pollutant_cyclone, setEmission_pollutant_cyclone] = useState(() => {
    const savedEmissions = localStorage.getItem('emission_pollutant_cyclone_CYCLONE');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmission_pollutant_cyclone;
  });

  useEffect(() => {
    localStorage.setItem('emission_pollutant_cyclone_CYCLONE', JSON.stringify(emission_pollutant_cyclone));
  }, [emission_pollutant_cyclone]);

  // Extract parameters from state
  const FlyAsh_g_Nm3 = emission_pollutant_cyclone['Fly residus content outlet [g/Nm3]'] || 0;
  const Bottom_Ash_Siccity = emission_pollutant_cyclone['siccity bottom ash [%]'] || 66;
  const O2ref = emission_pollutant_cyclone['O2 ref [%]'] || 11;

  // Input data from innerData
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const FG_O2_calcule = innerData?.O2calcul || 1;
  const masse_dechets = innerData?.MasseDechet || 1;
  const Inert_kg_h = innerData?.Inertmass || 0;

  const masses_pollutant_input = innerData?.PollutantOutput || {};

  const Residus_IN = innerData?.ResidusOutput || {
    FlyAsh_kg_h: 0,
    mass_residus_tot: 0,
    WetBottomAsh_kg_h: 0,
  };

  // Calculate ash flows
  const Fly_ash_in_kg_h = Residus_IN?.FlyAsh_kg_h || 0;
  const Fly_ash_out_kg_h = Debit_fumees_sec_Nm3_h * FlyAsh_g_Nm3 / 1000;
  const CYCLONE_Ash_kg_h = Fly_ash_in_kg_h - Fly_ash_out_kg_h;

  // Output pollutant masses
  const masses_pollutant_output = {
    HCl: masses_pollutant_input.HCL,
    HF: masses_pollutant_input.HF,
    Cl: masses_pollutant_input.Cl,
    S: masses_pollutant_input.S,
    SO2: masses_pollutant_input.SO2,
    N2: masses_pollutant_input.N2,
    NOx: masses_pollutant_input.NOx,
    CO2: innerData?.FG_OUT_kg_h?.CO2 || 1,
    NH3: 0,
    DustFlyAsh: Fly_ash_out_kg_h,
    Mercury: masses_pollutant_input.Mercury,
    PCDDF: masses_pollutant_input.PCDDF,
    Cd_Ti: masses_pollutant_input.CdTi,
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: masses_pollutant_input.SdAsPbCrCoCuMnNi,
  };

  // Update innerData
  if (innerData) {
    innerData.PollutantOutput = masses_pollutant_output;
    innerData.CYCLONE_Ash_kg_h = CYCLONE_Ash_kg_h;
  }

  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: masse_dechets.toFixed(2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: Debit_fumees_humide_Nm3_h.toFixed(0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: Debit_fumees_sec_Nm3_h.toFixed(0) },
    { text: t('O2 calculated [%]'), value: FG_O2_calcule.toFixed(2) },
    { text: t('Fly ash inlet [kg/h]'), value: Fly_ash_in_kg_h.toFixed(2) },
  ];

  const residusCalculations = [
    { text: t('Cyclone residus [kg/h]'), value: CYCLONE_Ash_kg_h.toFixed(2) },
  ];

  const handleChange = (name, value) => {
    let newValue = parseFloat(value) || 0;

    if (name === 'Fly residus content outlet [g/Nm3]') {
      newValue = Math.max(0, Math.min(40, newValue));
    } else if (name === 'siccity bottom ash [%]') {
      newValue = Math.max(0, Math.min(100, newValue));
    } else if (name === 'O2 ref [%]') {
      newValue = Math.max(0, Math.min(21, newValue));
    }

    setEmission_pollutant_cyclone((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emission_pollutant_cyclone_CYCLONE');
    setEmission_pollutant_cyclone(initialEmission_pollutant_cyclone);
  }, []);

  const handleReset = () => {
    setEmission_pollutant_cyclone(initialEmission_pollutant_cyclone);
    localStorage.removeItem('emission_pollutant_cyclone_CYCLONE');
  };

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

        {/* Inline parameters form */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(emission_pollutant_cyclone).map(([key, value]) => (
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

export default CYCLONEFlueGasPollutantEmission;