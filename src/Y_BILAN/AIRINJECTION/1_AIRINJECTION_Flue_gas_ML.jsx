import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3, O2_m3_kg, N2_m3_kg } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './AIRINJECTION_traduction';
import '../../index.css';

import { fmt } from '../../A_Transverse_fonction/formatNumber';

const AIRINJECTIONFlueGasParameters = ({ innerData, nodeId, currentLanguage = 'fr' }) => {
  const initialEmissions_AIRINJECTION = {
    'Flue gas temperature outlet [°C]': 400,
    'Ambient air temperature [°C]': 20,
    'Thermal losses [%]': 2,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emissions_AIRINJECTION, setEmissions_AIRINJECTION] = useState(() => {
    const savedEmissions = localStorage.getItem(`emissions_AIRINJECTION_${nodeId}`);
    if (savedEmissions) {
      const parsed = JSON.parse(savedEmissions);
      // Migrate: drop legacy keys no longer in state
      delete parsed['Volume of air ingress [Nm3/h]'];
      delete parsed['Cooling water temperature [°C]'];
      return { ...initialEmissions_AIRINJECTION, ...parsed };
    }
    return initialEmissions_AIRINJECTION;
  });

  useEffect(() => {
    localStorage.setItem(`emissions_AIRINJECTION_${nodeId}`, JSON.stringify(emissions_AIRINJECTION));
  }, [emissions_AIRINJECTION]);

  // Input data with fallback values
  const P_in = innerData?.P_OUT || 0;
  // FG_OUT_kg_h is overwritten with outlet composition below; preserve inlet via FG_IN
  const FG_IN = innerData?.FG_IN ?? innerData?.FG_OUT_kg_h ?? { CO2: 1, H2O: 1, O2: 1, N2: 1 };

  // Extract parameters from state
  const T_out = emissions_AIRINJECTION['Flue gas temperature outlet [°C]'];
  const T_air = emissions_AIRINJECTION['Ambient air temperature [°C]'];
  const Pth   = emissions_AIRINJECTION['Thermal losses [%]'];

  // T_in: upstream T_OUT on first mount; preserved via innerData.T_IN across renders.
  // innerData.T_OUT_written tracks the value WE last wrote to T_OUT so we can distinguish
  // our own writes from a new upstream value. Without this, changing T_out (state) would
  // make T_OUT_val !== T_out, falsely triggering a fresh-upstream-value read.
  const T_in = (() => {
    if (!innerData) return 200;
    const T_OUT_val = innerData.T_OUT ?? 200;
    if (innerData.T_IN === undefined) return T_OUT_val;                          // first mount
    if (T_OUT_val !== (innerData.T_OUT_written ?? T_out)) return T_OUT_val;      // upstream changed
    return innerData.T_IN;
  })();

  // Calculate mass flows
  const FG_CO2_kg_h = FG_IN.CO2;
  const FG_H2O_kg_h = FG_IN.H2O;
  const FG_O2_kg_h  = FG_IN.O2;
  const FG_N2_kg_h  = FG_IN.N2;

  // Convert to volumetric flows (Nm3/h)
  const FG_CO2_m3_h = CO2_kg_m3(FG_CO2_kg_h);
  const FG_H2O_m3_h = H2O_kg_m3(FG_H2O_kg_h);
  const FG_O2_m3_h  = O2_kg_m3(FG_O2_kg_h);
  const FG_N2_m3_h  = N2_kg_m3(FG_N2_kg_h);

  const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;
  const FG_sec_tot_m3_h    = FG_CO2_m3_h + FG_O2_m3_h  + FG_N2_m3_h;

  // Volume d'air de refroidissement calculé par bilan de mélange (même formule que BHF)
  // T_out = (T_in * FG_tot + V_air * T_air) / (FG_tot + V_air)
  // => V_air = FG_tot * (T_in - T_out) / (T_out - T_air)
  const V_air_cooling = (T_in > T_out && T_out > T_air)
    ? FG_humide_tot_m3_h * (T_in - T_out) / (T_out - T_air)
    : 0;

  const FG_air_O2_kg_h = V_air_cooling > 0 ? O2_m3_kg(0.21 * V_air_cooling) : 0;
  const FG_air_N2_kg_h = V_air_cooling > 0 ? N2_m3_kg(0.79 * V_air_cooling) : 0;

  // Enthalpies (V_air calculé pour atteindre T_out par mélange → pas d'eau pulvérisée)
  const H_in_AIRINJECTION  = h_fumee(T_in,  FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const H_out_AIRINJECTION = h_fumee(T_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const Delta_H = H_in_AIRINJECTION * (1 - Pth / 100) - H_out_AIRINJECTION;

  // Output composition
  const masses_FG_in_AIRINJECTION = {
    CO2: FG_CO2_kg_h,
    O2:  FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2:  FG_N2_kg_h,
  };

  const masses_FG_out_AIRINJECTION = {
    CO2: FG_CO2_kg_h,
    O2:  FG_O2_kg_h  + FG_air_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2:  FG_N2_kg_h  + FG_air_N2_kg_h,
  };

  // Output volumetric flows
  const FG_CO2_EAU_m3_h = CO2_kg_m3(masses_FG_out_AIRINJECTION.CO2);
  const FG_H2O_EAU_m3_h = H2O_kg_m3(masses_FG_out_AIRINJECTION.H2O);
  const FG_O2_EAU_m3_h  = O2_kg_m3(masses_FG_out_AIRINJECTION.O2);
  const FG_N2_EAU_m3_h  = N2_kg_m3(masses_FG_out_AIRINJECTION.N2);

  const FG_humide_EAU_tot_m3_h = FG_CO2_EAU_m3_h + FG_O2_EAU_m3_h + FG_N2_EAU_m3_h + FG_H2O_EAU_m3_h;

  // Update innerData with calculated values
  if (innerData) {
    innerData.FG_humide_tot       = FG_humide_tot_m3_h;
    innerData.FG_sec_tot          = FG_sec_tot_m3_h;
    innerData.T_sortie            = T_out;
    innerData.T_IN                = T_in;
    innerData.T_OUT               = T_out;
    innerData.T_OUT_written       = T_out;
    innerData.Pin_mmCE            = P_in;
    innerData.FG_humide_EAU_tot   = FG_humide_EAU_tot_m3_h;
    innerData.Q_eau_kg_h          = 0;
    innerData.FG_IN               = FG_IN;
    innerData.FG_OUT_kg_h         = masses_FG_out_AIRINJECTION;
    innerData.V_air_dilution_Nm3_h = V_air_cooling;
  }

  const masses_Air_cooling = {
    CO2: 0,
    O2:  FG_air_O2_kg_h,
    H2O: 0,
    N2:  FG_air_N2_kg_h,
  };

  const elementsGeneric = [
    { text: t('Temperature inlet AIRINJECTION [°C]'),  value: fmt(T_in, 1) },
    { text: t('Volume of air ingress [Nm3/h]'),        value: fmt(V_air_cooling, 0) },
    { text: t('Delta enthalpies [kJ/kg]'),             value: fmt(Delta_H, 0) },
    { text: t('Outlet flue gas volume [Nm3/h]'),       value: fmt(FG_humide_EAU_tot_m3_h, 2) },
  ];

  const handleChange = (name, value) => {
    setEmissions_AIRINJECTION((prev) => ({ ...prev, [name]: value }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem(`emissions_AIRINJECTION_${nodeId}`);
    setEmissions_AIRINJECTION(initialEmissions_AIRINJECTION);
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
          {Object.entries(emissions_AIRINJECTION).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ flex: '1', minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
                {t(key)}:
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
              />
            </div>
          ))}
        </div>
      </div>

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Flue gas inlet at inlet temperature')} ({T_in}°C)</h4>
      <MassCalculator masses={masses_FG_in_AIRINJECTION} TemperatureImposee={T_in} />

      <h4>{t('Air ingress at ambient temperature')} ({T_air}°C)</h4>
      <MassCalculator masses={masses_Air_cooling} TemperatureImposee={T_air} />

      <h4>{t('Flue gas outlet at outlet temperature')} ({T_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_AIRINJECTION} TemperatureImposee={T_out} />
    </div>
  );
};

export default AIRINJECTIONFlueGasParameters;
