/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './IACT_traduction';

// Densités air sec à 0°C, 1 atm [kg/Nm³]
const rho_air = 1.293;
const O2_mass_frac = 0.233;
const N2_mass_frac = 0.767;

const IACTFlueGasParameters = ({ innerData, upstreamT_IN, upstreamFG_IN, upstreamP_IN, currentLanguage = 'fr' }) => {
  const initialEmissions_IACT = {
    'Flue gas temperature outlet [°C]': innerData?.T_OUT - 10,
    'Ambient air temperature [°C]': 20,
    'Temperature de l\'air réchauffé [°C]': 150,
    'Rendement d\'échange [%]': 98,
    'PDC_mmCE [mmCE]': 10,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emissions_IACT, setEmissions_IACT] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('emissions_IACT') || '{}');
      // Ne conserver que les clés actuelles, avec fallback sur les valeurs par défaut
      return Object.fromEntries(
        Object.keys(initialEmissions_IACT).map(k => [k, saved[k] ?? initialEmissions_IACT[k]])
      );
    } catch {
      return initialEmissions_IACT;
    }
  });

  useEffect(() => {
    localStorage.setItem('emissions_IACT', JSON.stringify(emissions_IACT));
  }, [emissions_IACT]);

  // Données amont — transmises depuis IACTMainPage, stables à travers les changements d'onglet
  const T_IN = upstreamT_IN ?? 200;
  const FG_IN = upstreamFG_IN || { CO2: 1, H2O: 1, O2: 1, N2: 1 };
  const P_IN = upstreamP_IN ?? 0;

  // Paramètres utilisateur
  const T_out     = emissions_IACT['Flue gas temperature outlet [°C]'];
  const T_air_in  = emissions_IACT['Ambient air temperature [°C]'];
  const T_air_out = emissions_IACT['Temperature de l\'air réchauffé [°C]'];
  const Pth       = emissions_IACT['Rendement d\'échange [%]'];
  const PDC_mmCE  = emissions_IACT['PDC_mmCE [mmCE]'];

  // Débits massiques fumées (inchangés côté fumées — échangeur sans mélange)
  const FG_CO2_kg_h = FG_IN.CO2;
  const FG_H2O_kg_h = FG_IN.H2O;
  const FG_O2_kg_h  = FG_IN.O2;
  const FG_N2_kg_h  = FG_IN.N2;

  // Débits volumiques fumées entrée [Nm³/h]
  const FG_CO2_m3_h = CO2_kg_m3(FG_CO2_kg_h);
  const FG_H2O_m3_h = H2O_kg_m3(FG_H2O_kg_h);
  const FG_O2_m3_h  = O2_kg_m3(FG_O2_kg_h);
  const FG_N2_m3_h  = N2_kg_m3(FG_N2_kg_h);

  const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;
  const FG_sec_tot_m3_h    = FG_CO2_m3_h + FG_O2_m3_h + FG_N2_m3_h;

  // Bilan enthalpique côté fumées
  const H_in_IACT   = h_fumee(T_IN,  FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const H_out_IACT  = h_fumee(T_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const Delta_H_FG  = H_in_IACT - H_out_IACT;            // kJ/h cédé par les fumées
  const Delta_H_air = Delta_H_FG * (Pth / 100);           // kJ/h transférés à l'air

  // Débit d'air calculé par boucle — incrémente de 1 Nm³/h jusqu'à satisfaire le bilan
  const m_O2_per_Nm3 = O2_mass_frac * rho_air;
  const m_N2_per_Nm3 = N2_mass_frac * rho_air;
  const h_air_out_unit = h_fumee(T_air_out, 0, 0, m_N2_per_Nm3, m_O2_per_Nm3);
  const h_air_in_unit  = h_fumee(T_air_in,  0, 0, m_N2_per_Nm3, m_O2_per_Nm3);

  // Débit d'air chauffé (cp_air moyen ≈ 1.005 kJ/kg·K)
  const cp_air = 1.005; // kJ/(kg·K)
  const Delta_T_air = T_air_out - T_air_in;
  const Qm_air_kg_h = Delta_T_air > 0
    ? Delta_H_air / (cp_air * Delta_T_air)
    : 0;
  const V_air_Nm3_h = Qm_air_kg_h / rho_air;















  // Débits massiques air chauffé
  const Qm_air_O2_kg_h = V_air_Nm3_h * m_O2_per_Nm3;
  const Qm_air_N2_kg_h = V_air_Nm3_h * m_N2_per_Nm3;

  // Composition fumées : identique en entrée et sortie (pas de mélange)
  const masses_FG_in_IACT = {
    CO2: FG_CO2_kg_h,
    O2:  FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2:  FG_N2_kg_h,
  };
  const masses_FG_out_IACT = { ...masses_FG_in_IACT };

  // Composition air chauffé en sortie
  const masses_air_out = {
    CO2: 0,
    O2:  Qm_air_O2_kg_h,
    H2O: 0,
    N2:  Qm_air_N2_kg_h,
  };

  const P_out_mmCE = P_IN - PDC_mmCE;

  // Mise à jour innerData (mutations intentionnelles — pattern établi)
  if (innerData) {
    innerData.FG_humide_tot        = FG_humide_tot_m3_h;
    innerData.FG_sec_tot           = FG_sec_tot_m3_h;
    innerData.T_OUT            = T_out;
    innerData.Pin_mmCE             = P_IN;
    innerData.P_out_mmCE           = P_out_mmCE;
    innerData.P_OUT                = P_out_mmCE;
    innerData.FG_OUT_kg_h          = masses_FG_out_IACT;
    innerData.V_air_chauffe_Nm3_h  = V_air_Nm3_h;
    innerData.Delta_H_to_air       = Delta_H_air;
    innerData.H_FG_in              = H_in_IACT;
    innerData.H_FG_out             = H_out_IACT;
    innerData.H_air_in             = h_air_in_unit  * V_air_Nm3_h;
    innerData.H_air_out            = h_air_out_unit * V_air_Nm3_h;
    innerData.T_air_in             = T_air_in;
    innerData.T_air_out            = T_air_out;
    innerData.Pth_echange          = Pth;
    innerData.PDC_mmCE             = PDC_mmCE;
  }

  const elementsGeneric = [
    { text: t('Temperature inlet IACT [°C]'),       value: T_IN.toFixed(1) },
    { text: t('Delta enthalpies fumées [kJ/h]'),    value: Delta_H_FG.toFixed(0) },
    { text: t('Chaleur transmise à l\'air [kJ/h]'), value: Delta_H_air.toFixed(0) },
    { text: t('Débit air chauffé [Nm³/h]'),         value:  V_air_Nm3_h.toFixed(0) },
  ];

  const handleChange = (name, value) => {
    setEmissions_IACT((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions_IACT');
    setEmissions_IACT(initialEmissions_IACT);
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
            marginBottom: '15px',
          }}
        >
          {t('Clear memory')}
        </button>

        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(emissions_IACT).map(([key, value]) => {
            const isToutlet = key === 'Flue gas temperature outlet [°C]';
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ flex: '1', minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
                  {t(key)}:
                </label>
                <input
                  type="number"
                  value={isToutlet ? parseFloat(Number(value).toFixed(2)) : value}
                  step={isToutlet ? '0.01' : undefined}
                  onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                  style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Flue gas inlet at inlet temperature')} ({T_IN}°C)</h4>
      <MassCalculator masses={masses_FG_in_IACT} TemperatureImposee={T_IN} />

      <h4>{t('Flue gas outlet at outlet temperature')} ({T_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_IACT} TemperatureImposee={T_out} />

      <h4>{t('Air chauffé en sortie')} ({T_air_out}°C)</h4>
      <MassCalculator masses={masses_air_out} TemperatureImposee={T_air_out} />
    </div>
  );
};

export default IACTFlueGasParameters;
