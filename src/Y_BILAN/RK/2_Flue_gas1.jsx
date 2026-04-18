import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import GasTable from '../../C_Components/Tableau_air';

import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './RK_traduction';

import { calculateWaterContent } from '../../A_Transverse_fonction/bilan_fct_combustion';
import { H_in_systemA } from '../../A_Transverse_fonction/bilan_fct_RK';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3, CO2_m3_kg, H2O_m3_kg, N2_m3_kg, O2_m3_kg } from '../../A_Transverse_fonction/conv_calculation';
import { TEMP_FUMEE_INC, Q_AIR_DILUTION } from '../../A_Transverse_fonction/enthalpy_mix_gas';

import '../../index.css';

const FlueGasParameters = ({ innerData, currentLanguage = 'fr' }) => {
  // Utilisation de clés internes simples
  const [emissions, setEmissions] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions');
    return savedEmissions ? JSON.parse(savedEmissions) : {
      flueGasTemperatureOutlet: 900,
      airFactor: 1,
      combustionAirTemperature: 20,
      wasteTemperature: 20,
      steamWaterTemperature: 20,
      estimatedThermalLosses: 8,
      airPreheatingPart: 20,
      airPreheatingTemperature: 20,
      airRelativeMoisture: 50,
      waterVaporizedFromExtractor: 500,
    };
  });

  const defaultEmissions = {
    flueGasTemperatureOutlet: 900,
    airFactor: 1,
    combustionAirTemperature: 20,
    wasteTemperature: 20,
    steamWaterTemperature: 20,
    estimatedThermalLosses: 8,
    airPreheatingPart: 20,
    airPreheatingTemperature: 20,
    airRelativeMoisture: 50,
    waterVaporizedFromExtractor: 500,
  };

  useEffect(() => {
    localStorage.setItem('emissions', JSON.stringify(emissions));
  }, [emissions]);

  // Fonction de traduction
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };


  // Utilisation des clés internes simplifiées
  const T_out = emissions.flueGasTemperatureOutlet;
  const T_air = emissions.combustionAirTemperature;
  const T_waste = emissions.wasteTemperature;
  const T_steam_water = emissions.steamWaterTemperature;
  const T_air_prechauffe = emissions.airPreheatingTemperature;
  const airRelativeMoisture = emissions.airRelativeMoisture;
  const Air_factor = emissions.airFactor;
  const Th_loss_pourcent = emissions.estimatedThermalLosses;
  const Air_preheat_pourcent = emissions.airPreheatingPart;
  const Water_vaporized_extractor = emissions.waterVaporizedFromExtractor;

  const Air_stoechio_kmole = (innerData.O2_stoechio_kmoles || 0) / 0.21;
  const Water_content_kg_Nm3 = calculateWaterContent(T_air, airRelativeMoisture);
  const Air_combustion_stoechio_sec_tot_Nm3_h = Air_stoechio_kmole * 22.4;
  const Air_combustion_stoechio_sec_tot_kg_h = Air_combustion_stoechio_sec_tot_Nm3_h * 1.293;
  const Air_combustion_stoechio_H2O_kg_h = Water_content_kg_Nm3 * Air_combustion_stoechio_sec_tot_Nm3_h;
  const Air_combustion_stoechio_O2_kg_h = 0.233 * Air_combustion_stoechio_sec_tot_kg_h;
  const Air_combustion_stoechio_N2_kg_h = (1 - 0.233) * Air_combustion_stoechio_sec_tot_kg_h;
  const Air_combustion_stoechio_CO2_kg_h = 0;
  const Air_combustion_stoechio_CO2_Nm3_h = 0;
  const Air_combustion_stoechio_H2O_Nm3_h = H2O_kg_m3(Air_combustion_stoechio_H2O_kg_h);
  const Air_combustion_stoechio_O2_Nm3_h = O2_kg_m3(Air_combustion_stoechio_O2_kg_h);
  const Air_combustion_stoechio_N2_Nm3_h = N2_kg_m3(Air_combustion_stoechio_N2_kg_h);
  const Air_combustion_stoechio_humide_tot_Nm3_h = Air_combustion_stoechio_sec_tot_Nm3_h * Air_factor + Air_combustion_stoechio_H2O_Nm3_h;
  const Air_combustion_stoechio_humide_tot_kg_h = Air_combustion_stoechio_humide_tot_Nm3_h * 1.293 + Air_combustion_stoechio_H2O_kg_h;

  const masse_dechets = innerData.masse;
  const cvw_kJ_kg = innerData.cvw_kJ_kg;

  let FG_CO2_stoechio_Nm3_h = innerData.Cmoles * 22.4;
  let FG_H2O_stoechio_Nm3_h = (innerData.Hmoles - innerData.Clmoles + innerData.masse_eau_input / 18) * 22.4 + Air_combustion_stoechio_H2O_kg_h * 22.4 / 18;
  let FG_O2_stoechio_Nm3_h = (Air_factor - 1) * 0.21 * Air_combustion_stoechio_sec_tot_kg_h;
  let FG_N2_stoechio_Nm3_h = innerData.Nmoles * 22.4 + Air_stoechio_kmole * 0.79 * 22.4 * Air_factor;
  let FG_CO2_stoechio_kg_h = CO2_m3_kg(FG_CO2_stoechio_Nm3_h);
  let FG_H2O_stoechio_kg_h = H2O_m3_kg(FG_H2O_stoechio_Nm3_h);
  let FG_O2_stoechio_kg_h = O2_m3_kg(FG_O2_stoechio_Nm3_h);
  let FG_N2_stoechio_kg_h = N2_m3_kg(FG_N2_stoechio_Nm3_h);

  let FG_stoechio_sec_tot_kg_h = FG_CO2_stoechio_kg_h + FG_O2_stoechio_kg_h + FG_N2_stoechio_kg_h;
  let FG_stoechio_humide_tot_kg_h = FG_stoechio_sec_tot_kg_h + FG_H2O_stoechio_kg_h;

  let Air_comb_sec_tot_kg_h = Air_combustion_stoechio_sec_tot_kg_h;
  let H_system = 0;
  let T_four_calcule = 0;
  let Air_adia_sec_tot_kg_h = 0;

  for (let i = 1; i <= 20; i++) {
    H_system = H_in_systemA(masse_dechets, cvw_kJ_kg, Air_comb_sec_tot_kg_h, T_air, Air_combustion_stoechio_H2O_kg_h, T_steam_water, T_waste, Th_loss_pourcent, T_air_prechauffe, Air_preheat_pourcent);
    T_four_calcule = TEMP_FUMEE_INC(H_system, FG_CO2_stoechio_kg_h, FG_H2O_stoechio_kg_h, FG_N2_stoechio_kg_h, FG_O2_stoechio_kg_h);
    Air_adia_sec_tot_kg_h = Q_AIR_DILUTION(T_air, T_four_calcule, T_out, FG_CO2_stoechio_kg_h, FG_H2O_stoechio_kg_h, FG_N2_stoechio_kg_h, FG_O2_stoechio_kg_h, 0);
    Air_comb_sec_tot_kg_h = Air_adia_sec_tot_kg_h + Air_combustion_stoechio_sec_tot_kg_h;
  }

  const Air_adia_sec_tot_m3_h = Air_adia_sec_tot_kg_h / 1.293;
  const Air_adia_H2O_kg_h = Air_adia_sec_tot_m3_h * Water_content_kg_Nm3;
  const Air_adia_O2_kg_h = Air_adia_sec_tot_kg_h * 0.233;
  const Air_adia_N2_kg_h = Air_adia_sec_tot_kg_h * (1 - 0.233);
  const Air_adia_CO2_kg_h = 0;
  const Air_adia_humide_tot_kg_h = Air_adia_sec_tot_kg_h + Air_adia_H2O_kg_h;

  const Air_adia_CO2_m3_h = CO2_m3_kg(Air_adia_CO2_kg_h);
  const Air_adia_H2O_m3_h = H2O_m3_kg(Air_adia_H2O_kg_h);
  const Air_adia_O2_m3_h = O2_m3_kg(Air_adia_O2_kg_h);
  const Air_adia_N2_m3_h = N2_m3_kg(Air_adia_N2_kg_h);
  const Air_adia_humide_tot_m3_h = Air_adia_sec_tot_m3_h + Air_adia_H2O_m3_h;

  const Air_comb_CO2_kg_h = Air_adia_CO2_kg_h + Air_combustion_stoechio_CO2_kg_h;
  const Air_comb_H2O_kg_h = Air_adia_H2O_kg_h + Air_combustion_stoechio_H2O_kg_h;
  const Air_comb_O2_kg_h = Air_adia_O2_kg_h + Air_combustion_stoechio_O2_kg_h;
  const Air_comb_N2_kg_h = Air_adia_N2_kg_h + Air_combustion_stoechio_N2_kg_h;
  Air_comb_sec_tot_kg_h = Air_adia_sec_tot_kg_h + Air_combustion_stoechio_sec_tot_kg_h;

  const Air_comb_humide_tot_kg_h = Air_comb_sec_tot_kg_h + Air_comb_H2O_kg_h;

  const Air_comb_CO2_m3_h = CO2_kg_m3(Air_comb_CO2_kg_h);
  const Air_comb_H2O_m3_h = H2O_kg_m3(Air_comb_H2O_kg_h);
  const Air_comb_O2_m3_h = O2_kg_m3(Air_comb_O2_kg_h);
  const Air_comb_N2_m3_h = N2_kg_m3(Air_comb_N2_kg_h);

  const Air_comb_sec_tot_m3_h = Air_comb_CO2_m3_h + Air_comb_O2_m3_h + Air_comb_N2_m3_h;
  const Air_comb_humide_tot_m3_h = Air_comb_sec_tot_m3_h + Air_comb_H2O_m3_h;

  const Air_factor_calculated = (Air_combustion_stoechio_sec_tot_Nm3_h + Air_adia_sec_tot_m3_h) / Air_combustion_stoechio_sec_tot_Nm3_h;

  const FG_CO2_Nm3_h = FG_CO2_stoechio_Nm3_h;
  const FG_H2O_Nm3_h = FG_H2O_stoechio_Nm3_h + Air_adia_H2O_m3_h;
  const FG_O2_Nm3_h = Air_adia_sec_tot_m3_h * 0.21;
  const FG_N2_Nm3_h = Air_adia_sec_tot_m3_h * 0.79 + FG_N2_stoechio_Nm3_h;

  const FG_CO2_kg_h = CO2_m3_kg(FG_CO2_Nm3_h);
  const FG_H2O_kg_h = H2O_m3_kg(FG_H2O_Nm3_h);
  const FG_O2_kg_h = O2_m3_kg(FG_O2_Nm3_h);
  const FG_N2_kg_h = N2_m3_kg(FG_N2_Nm3_h);

  const FG_CO2_extractor_kg_h = FG_CO2_kg_h;
  const FG_H2O_extractor_kg_h = FG_H2O_kg_h + Water_vaporized_extractor;
  const FG_O2_extractor_kg_h = FG_O2_kg_h;
  const FG_N2_extractor_kg_h = FG_N2_kg_h;

  const FG_CO2_extractor_Nm3_h = CO2_kg_m3(FG_CO2_extractor_kg_h);
  const FG_H2O_extractor_Nm3_h = H2O_kg_m3(FG_H2O_extractor_kg_h);
  const FG_O2_extractor_Nm3_h = O2_kg_m3(FG_O2_extractor_kg_h);
  const FG_N2_extractor_Nm3_h = N2_kg_m3(FG_N2_extractor_kg_h);
  const FG_dry_extractor_Nm3_h = FG_CO2_extractor_Nm3_h + FG_O2_extractor_Nm3_h + FG_N2_extractor_Nm3_h;
  const FG_wet_extractor_Nm3_h = FG_dry_extractor_Nm3_h + FG_H2O_extractor_Nm3_h;

  const O2_sec_pourcent = FG_O2_extractor_Nm3_h / FG_dry_extractor_Nm3_h * 100;

  // Éléments génériques avec traductions
  const elementsGeneric = [
    { text: t('airStoechio'), value: Air_stoechio_kmole.toFixed(2) },
    { text: t('calculatedTemperature'), value: T_four_calcule.toFixed(2) },
    { text: t('waterContent'), value: Water_content_kg_Nm3.toFixed(5) },
    { text: t('hSystem'), value: H_system.toFixed(0) },
    { text: t('airFactorCalculated'), value: Air_factor_calculated.toFixed(2) },
  ];

  const AirStData = {
    kg_h: {
      CO2: Air_combustion_stoechio_CO2_kg_h,
      H2O: Air_combustion_stoechio_H2O_kg_h,
      O2: Air_combustion_stoechio_O2_kg_h,
      N2: Air_combustion_stoechio_N2_kg_h,
      Q_dry_tot: Air_combustion_stoechio_sec_tot_kg_h,
      Q_wet_tot: Air_combustion_stoechio_humide_tot_kg_h
    },
    Nm3_h: {
      CO2: Air_combustion_stoechio_CO2_Nm3_h,
      H2O: Air_combustion_stoechio_H2O_Nm3_h,
      O2: Air_combustion_stoechio_O2_Nm3_h,
      N2: Air_combustion_stoechio_N2_Nm3_h,
      Q_dry_tot: Air_combustion_stoechio_sec_tot_Nm3_h,
      Q_wet_tot: Air_combustion_stoechio_humide_tot_Nm3_h
    }
  };

  const AirAdiaData = {
    kg_h: {
      CO2: Air_adia_CO2_kg_h,
      H2O: Air_adia_H2O_kg_h,
      O2: Air_adia_O2_kg_h,
      N2: Air_adia_N2_kg_h,
      Q_dry_tot: Air_adia_sec_tot_kg_h,
      Q_wet_tot: Air_adia_humide_tot_kg_h
    },
    Nm3_h: {
      CO2: Air_adia_CO2_m3_h,
      H2O: Air_adia_H2O_m3_h,
      O2: Air_adia_O2_m3_h,
      N2: Air_adia_N2_m3_h,
      Q_dry_tot: Air_adia_sec_tot_m3_h,
      Q_wet_tot: Air_adia_humide_tot_m3_h
    }
  };

  const AirCombData = {
    kg_h: {
      CO2: Air_comb_CO2_kg_h,
      H2O: Air_comb_H2O_kg_h,
      O2: Air_comb_O2_kg_h,
      N2: Air_comb_N2_kg_h,
      Q_dry_tot: Air_comb_sec_tot_kg_h,
      Q_wet_tot: Air_comb_humide_tot_kg_h
    },
    Nm3_h: {
      CO2: Air_comb_CO2_m3_h,
      H2O: Air_comb_H2O_m3_h,
      O2: Air_comb_O2_m3_h,
      N2: Air_comb_N2_m3_h,
      Q_dry_tot: Air_comb_sec_tot_m3_h,
      Q_wet_tot: Air_comb_humide_tot_m3_h
    }
  };

  const masses_FG_stoechio = {
    CO2: FG_CO2_stoechio_kg_h,
    O2: FG_O2_stoechio_kg_h,
    H2O: FG_H2O_stoechio_kg_h,
    N2: FG_N2_stoechio_kg_h
  };

  const masses_FG_out_RK = {
    CO2: FG_CO2_kg_h,
    O2: FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2: FG_N2_kg_h
  };

  const masses_FG_out_extractor_RK_kg_h = {
    CO2: FG_CO2_extractor_kg_h,
    O2: FG_O2_extractor_kg_h,
    H2O: FG_H2O_extractor_kg_h,
    N2: FG_N2_extractor_kg_h
  };

  const volume_FG_out_extractor_RK_Nm3_h = {
    CO2: FG_CO2_extractor_Nm3_h,
    O2: FG_O2_extractor_Nm3_h,
    H2O: FG_H2O_extractor_Nm3_h,
    N2: FG_N2_extractor_Nm3_h,
    dry: FG_dry_extractor_Nm3_h,
    wet: FG_wet_extractor_Nm3_h
  };

  const handleChange = (name, value) => {
    setEmissions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEmissions(defaultEmissions);
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions');
    setEmissions(defaultEmissions);
  }, []);

  // Mise à jour des données innerData
  innerData['FG_OUT_kg_h'] = masses_FG_out_extractor_RK_kg_h;
  innerData['FG_RK_OUT_Nm3_h'] = volume_FG_out_extractor_RK_Nm3_h;
  innerData['O2_calcule'] = O2_sec_pourcent;
  innerData['T_OUT'] = T_out;

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('calculationParameters')}</h3>
      <div className="cadre_param_bilan">
        <button onClick={clearMemory}>{t('resetValues')}</button>
        <Input_bilan 
          input={emissions} 
          handleChange={handleChange} 
          currentLanguage={languageCode} 
          translations={translations}
        />
      </div>

      <h3>{t('calculatedParameters')}</h3>
      <TableGeneric elements={elementsGeneric} />
      
      <h3>{t('combustionAirComposition')}</h3>
      <h3>{t('atStoichiometry')}</h3>
      <GasTable data={AirStData} />
      
      <h3>{t('atAdiabaticity')}</h3>
      <GasTable data={AirAdiaData} />
      
      <h3>{t('combustionAirTotal')}</h3>
      <GasTable data={AirCombData} />

      <h3>{t('flueGasComposition')}</h3>
      <h4>{t('flueGasAtStoichiometry')} ({T_four_calcule.toFixed(0)}°C)</h4>
      <MassCalculator masses={masses_FG_stoechio} TemperatureImposee={T_four_calcule} />
      
      <h4>{t('outputFlueGasWithoutWater')} ({T_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_RK} TemperatureImposee={T_out} />
      
      <h4>{t('outputFlueGasWithWater')} ({T_out}°C)</h4>
      <MassCalculator masses={masses_FG_out_extractor_RK_kg_h} TemperatureImposee={T_out} />
      
      <PrintButton onClick={window.print} text={t('export')} />
    </div>
  );
};

export default FlueGasParameters;