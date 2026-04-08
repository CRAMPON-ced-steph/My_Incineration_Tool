import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import GasTable from '../../C_Components/Tableau_air';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3, CO2_m3_kg, H2O_m3_kg, N2_m3_kg, O2_m3_kg } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee } from '../../A_Transverse_fonction/enthalpy_mix_gas';

const WHBFlueGasParameters = ({ innerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  // Mapping clés originales vers clés de traduction
  const parameterTranslationKeys = {
    'Flue gas temperature outlet [°C]': 'flueGasTemperatureOutlet',
    'Ambiant air temperature [°C]': 'ambiantAirTemperature',
    'Volume of air ingrease [Nm3/h]': 'volumeAirIngrease',
  };

  const initialEmissions_WHB = {
    'Flue gas temperature outlet [°C]': innerData?.T_WHB_out || 400,
    'Ambiant air temperature [°C]': 20,
    'Volume of air ingrease [Nm3/h]': 0,
  };

  const [emissions_WHB, setEmissions_WHB] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions_WHB');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions_WHB;
  });

  useEffect(() => {
    localStorage.setItem('emissions_WHB', JSON.stringify(emissions_WHB));
  }, [emissions_WHB]);

  const T_without_air_ingrease_out = emissions_WHB['Flue gas temperature outlet [°C]'];
  const T_air = emissions_WHB['Ambiant air temperature [°C]'];
  const V_air_ingrease = emissions_WHB['Volume of air ingrease [Nm3/h]'];
  const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };

  const FG_CO2_kg_h = FG_IN.CO2;
  const FG_H2O_kg_h = FG_IN.H2O;
  const FG_O2_kg_h = FG_IN.O2;
  const FG_N2_kg_h = FG_IN.N2;

  const FG_CO2_m3_h = CO2_kg_m3(FG_CO2_kg_h);
  const FG_H2O_m3_h = H2O_kg_m3(FG_H2O_kg_h);
  const FG_O2_m3_h = O2_kg_m3(FG_O2_kg_h);
  const FG_N2_m3_h = N2_kg_m3(FG_N2_kg_h);

  const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;
  const FG_sec_tot_m3_h = FG_CO2_m3_h + FG_O2_m3_h + FG_N2_m3_h;

  const FG_air_CO2_kg_h = 0;
  const FG_air_H2O_kg_h = 0;
  const FG_air_O2_kg_h = 0.21 * V_air_ingrease;
  const FG_air_N2_kg_h = 0.79 * V_air_ingrease;

  const T_with_air_ingrease_out = (T_without_air_ingrease_out * FG_humide_tot_m3_h + V_air_ingrease * T_air) / (FG_humide_tot_m3_h + V_air_ingrease);
  const H_without_air_ingrease_out = h_fumee(T_without_air_ingrease_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2) / 3600;
  const H_air_ingrease_out = h_fumee(T_air, FG_air_CO2_kg_h, FG_air_H2O_kg_h, FG_air_O2_kg_h, FG_air_N2_kg_h) / 3600;
  const H_with_air_ingrease_out = h_fumee(T_with_air_ingrease_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2) / 3600;

  const masses_FG_out_WHB_kg_h = {
    CO2: FG_CO2_kg_h,
    O2: FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2: FG_N2_kg_h
  };

  const volume_FG_out_WHB_m3_h = {
    CO2: CO2_kg_m3(FG_CO2_kg_h),
    O2: O2_kg_m3(FG_O2_kg_h),
    H2O: H2O_kg_m3(FG_H2O_kg_h),
    N2: N2_kg_m3(FG_N2_kg_h)
  };

  const FG_wet_Nm3_h = volume_FG_out_WHB_m3_h.CO2 + volume_FG_out_WHB_m3_h.O2 + volume_FG_out_WHB_m3_h.H2O + volume_FG_out_WHB_m3_h.N2;
  const FG_dry_Nm3_h = volume_FG_out_WHB_m3_h.CO2 + volume_FG_out_WHB_m3_h.O2 + volume_FG_out_WHB_m3_h.N2;

  const O2_sec_pourcent = volume_FG_out_WHB_m3_h.O2 / FG_dry_Nm3_h * 100;

  const masses_Air_ingrease = {
    CO2: FG_air_CO2_kg_h,
    O2: FG_air_H2O_kg_h,
    H2O: FG_air_O2_kg_h,
    N2: FG_air_N2_kg_h,
  };

  const elementsGeneric = [
    { text: t('temperatureInletWHB'), value: innerData?.T_inlet_WHB || 1 },
    { text: t('temperatureOutletWHB'), value: T_with_air_ingrease_out },
  ];

  const handleChange = (name, value) => {
    setEmissions_WHB((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions_WHB');
    setEmissions_WHB(initialEmissions_WHB);
  }, [initialEmissions_WHB]);

  if (innerData) {
    innerData['FG_humide_tot'] = FG_humide_tot_m3_h;
    innerData['FG_sec_tot'] = FG_sec_tot_m3_h;
    innerData['FG_OUT_kg_h'] = masses_FG_out_WHB_kg_h;
    innerData['FG_RK_OUT_Nm3_h'] = volume_FG_out_WHB_m3_h;
    innerData['O2_calcule'] = O2_sec_pourcent;
    innerData['T_OUT'] = T_with_air_ingrease_out;
  }

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('calculationParameters')}</h3>

      {/* GRILLE 2 COLONNES SANS CADRE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        <div>
          <button onClick={clearMemory} style={{
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {t('clearMemory')}
          </button>
        </div>

        {Object.entries(emissions_WHB).map(([key, value]) => (
          <div key={key}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}>
              {t(parameterTranslationKeys[key]) || key}:
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}
      </div>

      <h3>{t('calculatedParameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('flueGasComposition')}</h3>
      <h4>{t('flueGasInlet')} ({innerData?.T_inlet_WHB || 1}°C)</h4>
      <MassCalculator masses={masses_FG_out_WHB_kg_h} TemperatureImposee={innerData?.T_inlet_WHB || 1} />

      <h4>{t('flueGasOutlet')} ({T_without_air_ingrease_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_WHB_kg_h} TemperatureImposee={T_without_air_ingrease_out} />

      <h4>{t('airIngrease')} ({T_air}°C)</h4>
      <MassCalculator masses={masses_Air_ingrease} TemperatureImposee={T_air} />

      <h4>{t('flueGasOutletConsideringAirIngrease')} ({T_with_air_ingrease_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_WHB_kg_h} TemperatureImposee={T_with_air_ingrease_out} />
    </div>
  );
};

export default WHBFlueGasParameters;