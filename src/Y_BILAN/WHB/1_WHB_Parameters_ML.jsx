import TableGeneric from '../../C_Components/Tableau_generique';
import React, { useState, useEffect, useCallback } from 'react';
import { Tsat_p, hL_T, hL_p, hV_p, h_pT } from '../../A_Transverse_fonction/steam_table3';
import { h_fumee } from '../../A_Transverse_fonction/enthalpy_gas';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const WHB_Parameters = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  // Mapping clés originales vers clés de traduction
  const parameterTranslationKeys = {
    'Boiler Outlet Temperature [°C]': 'boilerOutletTemperature',
    'Estimated Thermal Loss [%]': 'estimatedThermalLoss',
    'Feedwater Temperature [°C]': 'feedwaterTemperature',
    'Steam Type': 'steamType',
    'Superheated Steam Temperature [°C]': 'superheatedSteamTemperature',
    'Boiler Pressure [bar]': 'boilerPressure',
    'Blowdown Rate [%]': 'blowdownRate',
  };

  const WHBinitialParameters = {
    'Boiler Outlet Temperature [°C]': 400,
    'Estimated Thermal Loss [%]': 5,
    'Feedwater Temperature [°C]': 105,
    'Steam Type': 'saturated',
    'Superheated Steam Temperature [°C]': 220,
    'Boiler Pressure [bar]': 10,
    'Blowdown Rate [%]': 2,
  };

  const [WHBparameters, setWHBParameters] = useState(() => {
    const savedParams = localStorage.getItem('boilerWHBParameters');
    return savedParams ? JSON.parse(savedParams) : WHBinitialParameters;
  });

  useEffect(() => {
    localStorage.setItem('boilerWHBParameters', JSON.stringify(WHBparameters));
  }, [WHBparameters]);

  const handleChange = (key, value) => {
    if (key === 'Boiler Pressure [bar]') {
      value = Math.max(1, Math.min(60, value));
    }
    setWHBParameters(prev => ({ ...prev, [key]: value }));
  };

  const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };
  const T_IN = innerData?.T_OUT || 900;

  const {
    'Boiler Outlet Temperature [°C]': boilerOutletTemp,
    'Estimated Thermal Loss [%]': thermalLoss,
    'Feedwater Temperature [°C]': feedwaterTemp,
    'Steam Type': steamType,
    'Superheated Steam Temperature [°C]': superheatedSteamTemp,
    'Boiler Pressure [bar]': boilerPressure,
    'Blowdown Rate [%]': blowdownRate,
  } = WHBparameters;

  const T_WHB_out = boilerOutletTemp;
  const H_in = h_fumee(T_IN, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const H_out = h_fumee(T_WHB_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  const H_diff = H_in * (1 - (thermalLoss / 100)) - H_out;
  const H_feedwater = hL_T(feedwaterTemp);
  const P_feedwater = boilerPressure + 20;
  const H_steam = steamType === "saturated" 
    ? hV_p(boilerPressure + 1) 
    : h_pT(boilerPressure + 1, superheatedSteamTemp);
  const Q_steam_kg_h = H_diff / (H_steam - H_feedwater);
  const Q_purge_kg_h = Q_steam_kg_h * (blowdownRate / 100);
  const Q_feedwater_kg_h = Q_steam_kg_h * (1 + (blowdownRate / 100));
  const Q_flash_drum_event_kg_h = Q_purge_kg_h * (hL_p(boilerPressure + 1) - hL_p(1)) / (hV_p(1) - hL_p(1));
  const Q_rejet_liquide_kg_h = Q_purge_kg_h - Q_flash_drum_event_kg_h;
  const saturationSteamTemp = Tsat_p(boilerPressure + 1);

  const flue_gas_calculation = [
    { text: t('flueGasTemperatureInlet'), value: T_IN },
    { text: t('flueGasEnthalpyIn'), value: H_in },
    { text: t('flueGasEnthalpyOut'), value: H_out.toFixed(0) },
    { text: t('flueGasEnthalpyDifference'), value: H_diff.toFixed(0) },
  ];

  const feed_water_calculation = [
    { text: t('feedwaterFlow'), value: Q_feedwater_kg_h.toFixed(0) },
    { text: t('feedwaterPressure'), value: P_feedwater.toFixed(2) },
    { text: t('blowdownMassFlow'), value: Q_purge_kg_h.toFixed(0) },
    { text: t('enthalpyFeedwater'), value: H_feedwater.toFixed(0) },
  ];

  const steam_calculation = [
    { text: t('saturatedSteamTemperature'), value: saturationSteamTemp.toFixed(0) },
    { text: t('deltaEnthalpies'), value: H_diff.toFixed(0) },
    { text: t('steamEnthalpy'), value: H_steam.toFixed(0) },
    { text: t('steamFlow'), value: Q_steam_kg_h.toFixed(0) },
  ];

  const drum_calculation = [
    { text: t('ventFlashSteamDrum'), value: Q_flash_drum_event_kg_h.toFixed(0) },
    { text: t('liquidRejected'), value: Q_rejet_liquide_kg_h.toFixed(0) },
    { text: t('steamFlow'), value: Q_steam_kg_h.toFixed(0) },
  ];

  const clearMemory = useCallback(() => {
    localStorage.removeItem('boilerWHBParameters');
    setWHBParameters(WHBinitialParameters);
  }, []);

  if (innerData && setInnerData) {
    innerData['T_WHB_out'] = T_WHB_out;
    innerData['T_inlet_WHB'] = T_IN;
    innerData['Eau_purge_kg_h'] = Q_purge_kg_h;
    innerData['Débit_vapeur_kg_h'] = Q_steam_kg_h;
    innerData['Pression_vapeur_bar'] = boilerPressure;
    innerData['Temperature_vapeur_C'] = steamType === 'saturated' ? saturationSteamTemp : superheatedSteamTemp;
    innerData['Debit_eau_m3_h'] = Q_feedwater_kg_h / 1000;
    innerData['Q_steam_kg_h'] = Q_steam_kg_h;
    innerData['Q_feedwater_kg_h'] = Q_feedwater_kg_h;
    innerData['Q_purge_kg_h'] = Q_purge_kg_h;
    innerData['Q_flash_drum_event_kg_h'] = Q_flash_drum_event_kg_h;
  }

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('boilerCalculationParameters')}</h3>
      
      {/* GRILLE 2 COLONNES AVEC TRADUCTIONS */}
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
        
        {Object.entries(WHBparameters).map(([key, value]) => (
          <div key={key}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}>
              {t(parameterTranslationKeys[key]) || key}:
            </label>
            {key === 'Steam Type' ? (
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="saturated">{t('saturated')}</option>
                <option value="superheated">{t('superheated')}</option>
              </select>
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                min={key === 'Boiler Pressure [bar]' ? 1 : undefined}
                max={key === 'Boiler Pressure [bar]' ? 60 : undefined}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            )}
          </div>
        ))}
      </div>

      <h3>{t('flueGasCalculation')}</h3>
      <TableGeneric elements={flue_gas_calculation} />

      <h3>{t('feedWaterCalculation')}</h3>
      <TableGeneric elements={feed_water_calculation} />

      <h3>{t('steamCalculation')}</h3>
      <TableGeneric elements={steam_calculation} />

      <h3>{t('drumParameters')}</h3>
      <TableGeneric elements={drum_calculation} />
    </div>
  );
};

export default WHB_Parameters;