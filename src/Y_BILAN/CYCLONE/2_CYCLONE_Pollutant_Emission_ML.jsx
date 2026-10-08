import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './CYCLONE_traduction';
import '../../index.css';

import { fmt } from '../../A_Transverse_fonction/formatNumber';
const CYCLONEFlueGasPollutantEmission = ({ innerData, nodeId, currentLanguage = 'fr' }) => {
  const initialEmission_pollutant_cyclone = {
    'Taux de capture [%]': 70,
    'Fraction part. PCDD/F [%]': 30,
    'Fraction part. Cd+Ti [%]': 50,
    'Fraction part. Sb..V [%]': 80,
    'O2 ref [%]': 11,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emission_pollutant_cyclone, setEmission_pollutant_cyclone] = useState(() => {
    const savedEmissions = localStorage.getItem(`emission_pollutant_cyclone_CYCLONE_${nodeId}`);
    if (savedEmissions) {
      const parsed = JSON.parse(savedEmissions);
      delete parsed['Fly residus content outlet [g/Nm3]'];
      delete parsed['siccity bottom ash [%]'];
      return { ...initialEmission_pollutant_cyclone, ...parsed };
    }
    return initialEmission_pollutant_cyclone;
  });

  useEffect(() => {
    localStorage.setItem(`emission_pollutant_cyclone_CYCLONE_${nodeId}`, JSON.stringify(emission_pollutant_cyclone));
  }, [emission_pollutant_cyclone]);

  // Extract parameters from state
  const capture_rate = emission_pollutant_cyclone['Taux de capture [%]'] ?? 70;
  const frac_PCDDF   = (emission_pollutant_cyclone['Fraction part. PCDD/F [%]'] ?? 30) / 100;
  const frac_CdTi    = (emission_pollutant_cyclone['Fraction part. Cd+Ti [%]'] ?? 50) / 100;
  const frac_metals  = (emission_pollutant_cyclone['Fraction part. Sb..V [%]'] ?? 80) / 100;
  const O2ref = emission_pollutant_cyclone['O2 ref [%]'] || 11;

  // Input data from innerData
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const O2_amont = innerData?.O2_calcule; // % (RK/WHB/CO2) ou ratio 0-1 (FB/GF) -> normalisé en %
  const FG_O2_calcule = O2_amont > 0 ? (O2_amont <= 0.21 ? O2_amont * 100 : O2_amont) : 1;
  const masse_dechets = innerData?.MasseDechet || 1;

  const masses_pollutant_input = innerData?.PollutantOutput || {};

  const Residus_IN = innerData?.ResidusOutput || {
    FlyAsh_kg_h: 0,
    mass_residus_tot: 0,
    WetBottomAsh_kg_h: 0,
  };

  // Calculate ash flows using capture rate
  // DustFlyAsh from PollutantOutput is always propagated; ResidusOutput.FlyAsh_kg_h may be missing
  // when intermediate nodes haven't been saved yet — use PollutantOutput.DustFlyAsh as primary source.
  const Fly_ash_in_kg_h = masses_pollutant_input.DustFlyAsh || Residus_IN?.FlyAsh_kg_h || 0;
  const CYCLONE_Ash_kg_h = Fly_ash_in_kg_h * capture_rate / 100;
  const Fly_ash_out_kg_h = Fly_ash_in_kg_h - CYCLONE_Ash_kg_h;

  const capture = capture_rate / 100;

  // Output pollutant masses — physics-based cyclone capture model (inertial separation only):
  //   Gases (HCl, HF, Cl₂, SO₂, NOx, NH₃, Hg): 0 % — not captured, pass through
  //   DustFlyAsh: capture_rate % (particles)
  //   Non-volatile metals (Cr, Cu, Ni, Mn, Co, V…): ≈ capture_rate % (stay with particles)
  //   Volatile metals (Pb, Cd, Zn, As, Sb, Tl) + PCDD/F: fraction_on_particles × capture_rate %
  // Note: Cl = Cl₂/HCl-derived (gaseous), S = SO₂-derived (gaseous) → both 0 %
  const masses_pollutant_output = {
    HCl:    masses_pollutant_input.HCl,                                                               // gas → 0%
    HF:     masses_pollutant_input.HF,                                                                // gas → 0%
    Cl:     masses_pollutant_input.Cl,                                                                // Cl₂/HCl-derived, gaseous → 0%
    S:      masses_pollutant_input.S,                                                                 // SO₂-derived, gaseous → 0%
    SO2:    masses_pollutant_input.SO2,                                                               // gas → 0%
    N2:     masses_pollutant_input.N2,                                                                // gas → 0%
    NOx:    masses_pollutant_input.NOx,                                                               // gas → 0%
    CO2:    innerData?.FG_OUT_kg_h?.CO2 || 1,                                                        // gas → 0%
    NH3:    masses_pollutant_input.NH3  || 0,                                                         // gas → 0%
    DustFlyAsh: Fly_ash_out_kg_h,                                                                     // particles → capture_rate applied
    Mercury: masses_pollutant_input.Mercury,                                                          // vapor at 400°C → 0%
    PCDDF:  (masses_pollutant_input.PCDDF  || 0) * (1 - frac_PCDDF * capture),                      // mostly gas phase, fraction on particles captured
    Cd_Ti:  (masses_pollutant_input.Cd_Ti  || 0) * (1 - frac_CdTi  * capture),                      // Cd volatile, Ti follows ash
    Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V: (masses_pollutant_input.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V || 0) * (1 - frac_metals * capture),
  };

  // Total residue captured in the cyclone = DustFlyAsh + fraction of metals and PCDD/F on particles
  const PCDDF_captured   = (masses_pollutant_input.PCDDF                   || 0) * frac_PCDDF  * capture;
  const CdTi_captured    = (masses_pollutant_input.Cd_Ti                   || 0) * frac_CdTi   * capture;
  const metals_captured  = (masses_pollutant_input.Sb_As_Pb_Cr_Co_Cu_Mn_Ni_V || 0) * frac_metals * capture;
  const CYCLONE_Residus_kg_h = CYCLONE_Ash_kg_h + PCDDF_captured + CdTi_captured + metals_captured;

  // Update innerData — write to Poutput (not PollutantOutput) to avoid overwriting the upstream
  // data that this tab reads as input. MainPage.sendAllData reads Poutput first.
  if (innerData) {
    innerData.Poutput = masses_pollutant_output;
    innerData.CYCLONE_Ash_kg_h = CYCLONE_Residus_kg_h;
  }

  const elementsGeneric = [
    { text: t('Waste Flow [kg/h]'), value: fmt(masse_dechets, 2) },
    { text: t('Flue gas Flow Wet [Nm3/h]'), value: fmt(Debit_fumees_humide_Nm3_h, 0) },
    { text: t('Flue gas Flow Dry [Nm3/h]'), value: fmt(Debit_fumees_sec_Nm3_h, 0) },
    { text: t('O2 calculated [%]'), value: fmt(FG_O2_calcule, 2) },
    { text: t('Fly ash inlet [kg/h]'), value: fmt(Fly_ash_in_kg_h, 2) },
  ];

  const residusCalculations = [
    { text: t('Cyclone residus [kg/h]'), value: fmt(CYCLONE_Residus_kg_h, 2) },
  ];

  const handleChange = (name, value) => {
    let newValue = parseFloat(value) || 0;

    if (name === 'O2 ref [%]') {
      newValue = Math.max(0, Math.min(21, newValue));
    } else {
      newValue = Math.max(0, Math.min(100, newValue));
    }

    setEmission_pollutant_cyclone((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleReset = useCallback(() => {
    setEmission_pollutant_cyclone(initialEmission_pollutant_cyclone);
    localStorage.removeItem(`emission_pollutant_cyclone_CYCLONE_${nodeId}`);
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
