import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import { Tsat_p, hL_T, hL_p, hV_p, h_pT } from '../../A_Transverse_fonction/steam_table3';
import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import PrintButton from '../../C_Components/Windows_print';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee, Qeau_added_to_be_at_T } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './BHF_traduction';

const BHFFlueGasParameters = ({ innerData, currentLanguage = 'fr' }) => {
  const initialEmissions_BHF = {
    'Flue gas temperature outlet [°C]': innerData?.T_OUT -10,
    'Ambient air temperature [°C]': 20,
    'Volume of air ingress [Nm3/h]': 0,
    'Thermal losses [%]': 2,
    'Cooling water temperature [°C]': 20,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [emissions_BHF, setEmissions_BHF] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions_BHF');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions_BHF;
  });

  useEffect(() => {
    localStorage.setItem('emissions_BHF', JSON.stringify(emissions_BHF));
  }, [emissions_BHF]);

  // Input data with fallback values
  const T_IN = innerData?.T_OUT || 200;

console.log(T_IN);

  const P_IN = innerData?.P_OUT || 0;
  const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };

  // Extract parameters from state
  const T_out = emissions_BHF['Flue gas temperature outlet [°C]'];
  const T_air = emissions_BHF['Ambient air temperature [°C]'];
  const V_air_ingress = emissions_BHF['Volume of air ingress [Nm3/h]'];
  const Pth = emissions_BHF['Thermal losses [%]'];
  const T_eau = emissions_BHF['Cooling water temperature [°C]'];

  // Calculate mass flows
  const FG_CO2_kg_h = FG_IN.CO2;
  const FG_H2O_kg_h = FG_IN.H2O;
  const FG_O2_kg_h = FG_IN.O2;
  const FG_N2_kg_h = FG_IN.N2;

  // Convert to volumetric flows
  const FG_CO2_m3_h = CO2_kg_m3(FG_CO2_kg_h);
  const FG_H2O_m3_h = H2O_kg_m3(FG_H2O_kg_h);
  const FG_O2_m3_h = O2_kg_m3(FG_O2_kg_h);
  const FG_N2_m3_h = N2_kg_m3(FG_N2_kg_h);

  const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;
  const FG_sec_tot_m3_h = FG_CO2_m3_h + FG_O2_m3_h + FG_N2_m3_h;

  // Air ingress composition
  let FG_air_O2_kg_h = 0;
  let FG_air_N2_kg_h = 0;
  let FG_air_CO2_kg_h = 0;
  let FG_air_H2O_kg_h = 0;
  let Q_eau_kg_h = 0;
  let Delta_H = 0;
  let H_in_BHF = 0;
  let H_out_BHF = 0;
  let T_with_air_ingress_out = T_out;

  // Calculate with or without air ingress
  if (V_air_ingress !== 0) {
    FG_air_O2_kg_h = 0.21 * V_air_ingress;
    FG_air_N2_kg_h = 0.79 * V_air_ingress;

    T_with_air_ingress_out = (T_out * FG_humide_tot_m3_h + V_air_ingress * T_air) / (FG_humide_tot_m3_h + V_air_ingress);
    H_in_BHF = h_fumee(T_IN, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    H_out_BHF = h_fumee(T_out + (T_out - T_with_air_ingress_out), FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    Delta_H = H_in_BHF * (1 - Pth / 100) - H_out_BHF;
    Q_eau_kg_h = Qeau_added_to_be_at_T(T_IN, T_eau, T_out + (T_out - T_with_air_ingress_out), Pth, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  } else {
    T_with_air_ingress_out = T_out;
    H_in_BHF = h_fumee(T_IN, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    H_out_BHF = h_fumee(T_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    Delta_H = H_in_BHF * (1 - Pth / 100) - H_out_BHF;
    Q_eau_kg_h = Qeau_added_to_be_at_T(T_IN, T_eau, T_out, Pth, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  }

  // Output composition
  const masses_FG_in_BHF = {
    CO2: FG_CO2_kg_h,
    O2: FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2: FG_N2_kg_h
  };

  const masses_FG_out_BHF = {
    CO2: FG_CO2_kg_h + FG_air_CO2_kg_h,
    O2: FG_O2_kg_h + FG_air_O2_kg_h,
    H2O: FG_H2O_kg_h + Q_eau_kg_h + FG_air_H2O_kg_h,
    N2: FG_N2_kg_h + FG_air_N2_kg_h
  };

  // Output volumetric flows
  const FG_CO2_EAU_m3_h = CO2_kg_m3(masses_FG_out_BHF.CO2);
  const FG_H2O_EAU_m3_h = H2O_kg_m3(masses_FG_out_BHF.H2O);
  const FG_O2_EAU_m3_h = O2_kg_m3(masses_FG_out_BHF.O2);
  const FG_N2_EAU_m3_h = N2_kg_m3(masses_FG_out_BHF.N2);

  const FG_humide_EAU_tot_m3_h = FG_CO2_EAU_m3_h + FG_O2_EAU_m3_h + FG_N2_EAU_m3_h + FG_H2O_EAU_m3_h;

  // Update innerData with calculated values
  if (innerData) {
    innerData.FG_humide_tot = FG_humide_tot_m3_h;
    innerData.FG_sec_tot = FG_sec_tot_m3_h;
    innerData.T_sortie = T_out;
    innerData.Pin_mmCE = P_IN;
    innerData.FG_humide_EAU_tot = FG_humide_EAU_tot_m3_h;
    innerData.Q_eau_kg_h = Q_eau_kg_h;
  }

  // Air ingress composition
  const masses_Air_ingress = {
    CO2: FG_air_CO2_kg_h,
    O2: FG_air_O2_kg_h,
    H2O: FG_air_H2O_kg_h,
    N2: FG_air_N2_kg_h,
  };

  const elementsGeneric = [
    { text: t('Temperature inlet BHF [°C]'), value: T_IN.toFixed(1) },
    { text: t('Delta enthalpies [kJ/kg]'), value: Delta_H.toFixed(0) },
    { text: t('Sprayed/cooling water [kg/h]'), value: Q_eau_kg_h.toFixed(0) },
    { text: t('Outlet flue gas volume [Nm3/h]'), value: FG_humide_EAU_tot_m3_h.toFixed(2) },
  ];

  const handleChange = (name, value) => {
    if (name === 'Volume of air ingress [Nm3/h]') {
      value = Math.max(0, Math.min(10000, value));
    }
    setEmissions_BHF((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions_BHF');
    setEmissions_BHF(initialEmissions_BHF);
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
          {Object.entries(emissions_BHF).map(([key, value]) => (
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
      <h4>{t('Flue gas inlet at inlet temperature')} ({T_IN}°C)</h4>
      <MassCalculator masses={masses_FG_in_BHF} TemperatureImposee={T_IN} />

      <h4>{t('Air ingress at ambient temperature')} ({T_air}°C)</h4>
      <MassCalculator masses={masses_Air_ingress} TemperatureImposee={T_air} />

      <h4>{t('Flue gas outlet at outlet temperature')} ({T_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_BHF} TemperatureImposee={T_out} />
    </div>
  );
};

export default BHFFlueGasParameters;