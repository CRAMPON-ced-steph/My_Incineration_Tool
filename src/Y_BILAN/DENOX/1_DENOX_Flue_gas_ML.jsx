import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import { Tsat_p, hL_T, hL_p, hV_p, h_pT } from '../../A_Transverse_fonction/steam_table3';
import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import PrintButton from '../../C_Components/Windows_print';
import '../../index.css';

import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee, Qeau_added_to_be_at_T } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './DENOX_traduction';
import { calculerCombustion } from '../../A_Transverse_fonction/TflammeAdia';

const DENOXFlueGasParameters = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  // ============ ÉTATS PRINCIPAUX ============
  const initialEmissions_DENOX = {
    'Flue gas temperature before reheating [°C]': 400,
    'Flue gas temperature after reheating [°C]': 450,
    'Ambient air temperature [°C]': 20,
    'Volume of air ingress [Nm3/h]': 0,
    'Thermal losses [%]': 2,
    'Cooling water temperature [°C]': 20,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // États séparés pour meilleure réactivité
  const [emissions_DENOX, setEmissions_DENOX] = useState(() => {
    const saved = localStorage.getItem('emissions_DENOX');
    return saved ? JSON.parse(saved) : initialEmissions_DENOX;
  });

  const [waterInjection, setWaterInjection] = useState(() => {
    const saved = localStorage.getItem('water_injection_DENOX');
    return saved ? JSON.parse(saved) : true;
  });

  const [gasType, setGasType] = useState(() => {
    const saved = localStorage.getItem('gas_type_DENOX');
    return saved ? JSON.parse(saved) : 'gaz H';
  });

  const [waterType, setWaterType] = useState(() => {
    const saved = localStorage.getItem('water_type_DENOX');
    return saved ? JSON.parse(saved) : 'potable';
  });

  const [combustionParams, setCombustionParams] = useState({
    O2_fumees: 3,
    debit_gaz: 1,
    temp_air: 15,
    composition: {
      N2: 0, CO2: 0, CH4: 85, C2H6: 10, C3H8: 3,
      nC4: 1, iC4: 0.5, nC5: 0.3, iC5: 0.2, nC6: 0,
      He: 0, O2: 0, H2: 0, CO: 0,
    }
  });

  // ============ USEEFFECTS POUR LOCALSTORAGE ============
  useEffect(() => {
    localStorage.setItem('emissions_DENOX', JSON.stringify(emissions_DENOX));
  }, [emissions_DENOX]);

  useEffect(() => {
    localStorage.setItem('water_injection_DENOX', JSON.stringify(waterInjection));
  }, [waterInjection]);

  useEffect(() => {
    localStorage.setItem('gas_type_DENOX', JSON.stringify(gasType));
  }, [gasType]);

  useEffect(() => {
    localStorage.setItem('water_type_DENOX', JSON.stringify(waterType));
  }, [waterType]);

  // ============ EXTRACTION DES PARAMÈTRES ============
  const T_IN = innerData?.T_OUT || 1;
  const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };

  const T_out = emissions_DENOX['Flue gas temperature before reheating [°C]'];
  const T_reheat = emissions_DENOX['Flue gas temperature after reheating [°C]'];
  const T_air = emissions_DENOX['Ambient air temperature [°C]'];
  const V_air_ingress = emissions_DENOX['Volume of air ingress [Nm3/h]'];
  const Pth = emissions_DENOX['Thermal losses [%]'];
  const T_eau = emissions_DENOX['Cooling water temperature [°C]'];

  // ============ CALCULS MÉMORISÉS POUR OPTIMISATION ============
  // Combustion de base
  const combustionResults = useMemo(() => {
    try {
      return calculerCombustion(
        combustionParams.composition,
        combustionParams.O2_fumees,
        combustionParams.debit_gaz,
        combustionParams.temp_air
      );
    } catch (error) {
      console.error("Erreur combustion:", error.message);
      return {
        temperature_flamme: 0, volume_air: 0, volume_fumees: 0,
        facteur_air: 1, pcs: 0, pci: 0, converged: false,
        CO2: 0, O2: 0, H2O: 0, N2: 0, Ar: 0,
      };
    }
  }, [combustionParams]);

  // Calculs des flux de gaz avant réchauffage
  const flueGasCalculations = useMemo(() => {
    try {
      const FG_CO2_m3_h = CO2_kg_m3(FG_IN.CO2);
      const FG_H2O_m3_h = H2O_kg_m3(FG_IN.H2O);
      const FG_O2_m3_h = O2_kg_m3(FG_IN.O2);
      const FG_N2_m3_h = N2_kg_m3(FG_IN.N2);

      const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;
      const FG_sec_tot_m3_h = FG_CO2_m3_h + FG_O2_m3_h + FG_N2_m3_h;

      let FG_air_O2_kg_h = 0;
      let FG_air_N2_kg_h = 0;
      let Q_eau_kg_h = 0;
      let Delta_H = 0;
      let T_with_air_ingress_out = T_out;

      if (V_air_ingress !== 0) {
        FG_air_O2_kg_h = 0.21 * V_air_ingress;
        FG_air_N2_kg_h = 0.79 * V_air_ingress;
        T_with_air_ingress_out = (T_out * FG_humide_tot_m3_h + V_air_ingress * T_air) / (FG_humide_tot_m3_h + V_air_ingress);
        
        const H_in = h_fumee(T_IN, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
        const H_out = h_fumee(T_out + (T_out - T_with_air_ingress_out), FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
        Delta_H = H_in * (1 - Pth / 100) - H_out;

        if (waterInjection) {
          Q_eau_kg_h = Qeau_added_to_be_at_T(T_IN, T_eau, T_out + (T_out - T_with_air_ingress_out), Pth, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
        }
      } else {
        const H_in = h_fumee(T_IN, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
        const H_out = h_fumee(T_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
        Delta_H = H_in * (1 - Pth / 100) - H_out;

        if (waterInjection) {
          Q_eau_kg_h = Qeau_added_to_be_at_T(T_IN, T_eau, T_out, Pth, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
        }
      }

      const masses_FG_in = { CO2: FG_IN.CO2, O2: FG_IN.O2, H2O: FG_IN.H2O, N2: FG_IN.N2 };
      const masses_FG_out = {
        CO2: FG_IN.CO2,
        O2: FG_IN.O2 + FG_air_O2_kg_h,
        H2O: FG_IN.H2O + Q_eau_kg_h,
        N2: FG_IN.N2 + FG_air_N2_kg_h
      };

      const FG_CO2_EAU_m3_h = CO2_kg_m3(masses_FG_out.CO2);
      const FG_H2O_EAU_m3_h = H2O_kg_m3(masses_FG_out.H2O);
      const FG_O2_EAU_m3_h = O2_kg_m3(masses_FG_out.O2);
      const FG_N2_EAU_m3_h = N2_kg_m3(masses_FG_out.N2);
      const FG_humide_EAU_tot_m3_h = FG_CO2_EAU_m3_h + FG_O2_EAU_m3_h + FG_N2_EAU_m3_h + FG_H2O_EAU_m3_h;

      const masses_Air_ingress = {
        CO2: 0,
        O2: FG_air_O2_kg_h,
        H2O: 0,
        N2: FG_air_N2_kg_h,
      };

      return {
        FG_humide_tot_m3_h,
        FG_sec_tot_m3_h,
        Delta_H,
        Q_eau_kg_h,
        FG_humide_EAU_tot_m3_h,
        masses_FG_in,
        masses_FG_out,
        masses_Air_ingress,
        T_with_air_ingress_out,
      };
    } catch (error) {
      console.error("Erreur calculs flux:", error.message);
      return {
        FG_humide_tot_m3_h: 0, FG_sec_tot_m3_h: 0, Delta_H: 0, Q_eau_kg_h: 0,
        FG_humide_EAU_tot_m3_h: 0,
        masses_FG_in: { CO2: 0, O2: 0, H2O: 0, N2: 0 },
        masses_FG_out: { CO2: 0, O2: 0, H2O: 0, N2: 0 },
        masses_Air_ingress: { CO2: 0, O2: 0, H2O: 0, N2: 0 },
        T_with_air_ingress_out: T_out,
      };
    }
  }, [FG_IN, T_IN, T_out, T_air, V_air_ingress, Pth, T_eau, waterInjection]);

  // Réchauffage
  const reheatingCalculations = useMemo(() => {
    let debit_gaz_rechauffage = 0;
    let T_melange_calcule_C = T_out;
    let iterations = 0;
    let currentCombustionResults = {
      temperature_flamme: 0, volume_air: 0, volume_fumees: 0,
      facteur_air: 1, pcs: 0, pci: 0, converged: true,
      CO2: 0, O2: 0, H2O: 0, N2: 0, Ar: 0,
    };

    if (T_out < T_reheat) {
      debit_gaz_rechauffage = combustionParams.debit_gaz;
      const maxIterations = 100;
      const FG_humide_ref = flueGasCalculations.FG_humide_EAU_tot_m3_h;

      while (T_melange_calcule_C < T_reheat && iterations < maxIterations) {
        try {
          const newResults = calculerCombustion(
            combustionParams.composition,
            combustionParams.O2_fumees,
            debit_gaz_rechauffage,
            combustionParams.temp_air
          );
          currentCombustionResults = newResults;
          T_melange_calcule_C = (FG_humide_ref * T_out + newResults.volume_fumees * newResults.temperature_flamme) / 
                                (FG_humide_ref + newResults.volume_fumees);
          if (T_melange_calcule_C < T_reheat) debit_gaz_rechauffage += 1;
          iterations++;
        } catch (error) {
          console.error("Erreur réchauffage:", error.message);
          break;
        }
      }
    }

    return {
      debit_gaz_rechauffage,
      T_melange_calcule_C,
      iterations,
      converged: iterations < 100 || T_out >= T_reheat,
      combustionResults: currentCombustionResults
    };
  }, [T_out, T_reheat, flueGasCalculations.FG_humide_EAU_tot_m3_h, combustionParams]);

  // Calculs après réchauffage
  const reheatingCombustionResults = useMemo(() => {
    if (T_out < T_reheat && reheatingCalculations.debit_gaz_rechauffage > 0) {
      try {
        return calculerCombustion(
          combustionParams.composition,
          combustionParams.O2_fumees,
          reheatingCalculations.debit_gaz_rechauffage,
          combustionParams.temp_air
        );
      } catch (error) {
        console.error("Erreur combustion réchauffage:", error.message);
        return {
          temperature_flamme: 0, volume_air: 0, volume_fumees: 0,
          facteur_air: 1, pcs: 0, pci: 0, converged: false,
          CO2: 0, O2: 0, H2O: 0, N2: 0, Ar: 0,
        };
      }
    }
    return {
      temperature_flamme: 0, volume_air: 0, volume_fumees: 0,
      facteur_air: 1, pcs: 0, pci: 0, converged: true,
      CO2: 0, O2: 0, H2O: 0, N2: 0, Ar: 0,
    };
  }, [reheatingCalculations.debit_gaz_rechauffage, combustionParams, T_out, T_reheat]);

  // Compositions finales après réchauffage
  const densities = { CO2: 1.977, O2: 1.429, H2O: 0.8, N2: 1.25, Ar: 1.784 };
  const convertVolumeToMass = (volume, density) => volume * density;

  const masses_FG_out_after_reheating = useMemo(() => {
    return {
      CO2: flueGasCalculations.masses_FG_out.CO2 + (T_out < T_reheat ? convertVolumeToMass(reheatingCombustionResults.CO2 || 0, densities.CO2) : 0),
      O2: flueGasCalculations.masses_FG_out.O2 + (T_out < T_reheat ? convertVolumeToMass(reheatingCombustionResults.O2 || 0, densities.O2) : 0),
      H2O: flueGasCalculations.masses_FG_out.H2O + (T_out < T_reheat ? convertVolumeToMass(reheatingCombustionResults.H2O || 0, densities.H2O) : 0),
      N2: flueGasCalculations.masses_FG_out.N2 + (T_out < T_reheat ? convertVolumeToMass((reheatingCombustionResults.N2 || 0) + (reheatingCombustionResults.Ar || 0), densities.N2) : 0),
    };
  }, [flueGasCalculations.masses_FG_out, reheatingCombustionResults, T_out, T_reheat]);

  const FG_humide_after_reheating_m3_h = useMemo(() => {
    return CO2_kg_m3(masses_FG_out_after_reheating.CO2) + 
           O2_kg_m3(masses_FG_out_after_reheating.O2) + 
           N2_kg_m3(masses_FG_out_after_reheating.N2) + 
           H2O_kg_m3(masses_FG_out_after_reheating.H2O);
  }, [masses_FG_out_after_reheating]);

  const FG_sec_after_reheating_m3_h = useMemo(() => {
    return CO2_kg_m3(masses_FG_out_after_reheating.CO2) + 
           O2_kg_m3(masses_FG_out_after_reheating.O2) + 
           N2_kg_m3(masses_FG_out_after_reheating.N2);
  }, [masses_FG_out_after_reheating]);

  // ============ MISE À JOUR INNERDATA ============
  useEffect(() => {
    if (innerData && setInnerData) {
      innerData.FG_humide_tot = flueGasCalculations.FG_humide_tot_m3_h;
      innerData.FG_sec_tot = flueGasCalculations.FG_sec_tot_m3_h;
      innerData.T_sortie = T_out;
      innerData.T_reheat = T_reheat;
      innerData.FG_humide_EAU_tot = flueGasCalculations.FG_humide_EAU_tot_m3_h;
      innerData.Q_eau_kg_h = flueGasCalculations.Q_eau_kg_h;
      innerData.Q_gaz_Nm3_h = reheatingCalculations.debit_gaz_rechauffage;
      innerData.temperature_flamme = reheatingCombustionResults.temperature_flamme;
      innerData.facteur_air = reheatingCombustionResults.facteur_air;
      innerData.volume_air_combustion = reheatingCombustionResults.volume_air;
      innerData.volume_fumees_combustion = reheatingCombustionResults.volume_fumees;
      innerData.debit_gaz_rechauffage = reheatingCalculations.debit_gaz_rechauffage;
      innerData.T_melange_calcule = reheatingCalculations.T_melange_calcule_C;
      innerData.reheating_converged = reheatingCalculations.converged;
      innerData.FG_DENOX_wet_OUT_reheating = FG_humide_after_reheating_m3_h;
      innerData.FG_DENOX_dry_OUT_reheating = FG_sec_after_reheating_m3_h;
      innerData.FG_DENOX_out_reheating_kg_h = masses_FG_out_after_reheating;
      innerData.gas_type = gasType;
      innerData.water_type = waterType;
    }
  }, [innerData, setInnerData, flueGasCalculations, reheatingCalculations, reheatingCombustionResults, masses_FG_out_after_reheating, FG_humide_after_reheating_m3_h, FG_sec_after_reheating_m3_h, T_out, T_reheat, gasType, waterType]);

  // ============ ÉLÉMENTS DE TABLEAU ============
  const elementsGeneric = [
    { text: t('Temperature inlet DENOX [°C]'), value: T_IN },
    { text: t('Delta enthalpies [kJ/h]'), value: flueGasCalculations.Delta_H.toFixed(0) },
    { text: `${t('Sprayed/cooling water [kg/h]')} ${waterInjection ? '(Active)' : '(Disabled)'}`, value: flueGasCalculations.Q_eau_kg_h.toFixed(0) },
    { text: t('Total humid flue gas output [m³/h]'), value: flueGasCalculations.FG_humide_EAU_tot_m3_h.toFixed(1) },
    { text: t('Temperature before reheating [°C]'), value: T_out },
    { text: t('Temperature after reheating [°C]'), value: T_reheat },
    { text: t('Adiabatic flame temperature [°C]'), value: reheatingCombustionResults.temperature_flamme.toFixed(1) },
    { text: t('Air factor [-]'), value: reheatingCombustionResults.facteur_air.toFixed(3) },
    { text: t('Combustion air volume [m³/h]'), value: reheatingCombustionResults.volume_air.toFixed(1) },
    { text: t('Combustion flue gas volume [m³/h]'), value: reheatingCombustionResults.volume_fumees.toFixed(1) },
    { text: t('Gas flow rate for reheating [Nm³/h]'), value: reheatingCalculations.debit_gaz_rechauffage.toFixed(1) },
    { text: t('Calculated mixing temperature [°C]'), value: reheatingCalculations.T_melange_calcule_C }
  ];

  // ============ HANDLERS ============
  const handleChange = useCallback((name, value) => {
    if (name === 'Volume of air ingress [Nm3/h]') {
      value = Math.max(0, Math.min(10000, value));
    }
    setEmissions_DENOX((prev) => ({ ...prev, [name]: value }));
  }, []);

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions_DENOX');
    localStorage.removeItem('water_injection_DENOX');
    localStorage.removeItem('gas_type_DENOX');
    localStorage.removeItem('water_type_DENOX');
    setEmissions_DENOX(initialEmissions_DENOX);
    setWaterInjection(true);
    setGasType('gaz H');
    setWaterType('potable');
  }, []);

  // ============ STYLES ============
  const controlRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const labelStyle = {
    textAlign: 'right',
    flex: '1',
    paddingRight: '10px'
  };

  const controlStyle = {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    minWidth: '120px'
  };

  const buttonStyle = {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    minWidth: '60px'
  };

  const inputRowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px'
  };

  const inputLabelStyle = {
    flex: '1',
    marginRight: '10px',
    textAlign: 'right',
    fontWeight: 'bold'
  };

  const inputStyle = {
    flex: '0 0 100px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Calculation parameters')}</h3>
      <div className="cadre_param_bilan">
        <button 
          onClick={clearMemory}
          style={{ ...buttonStyle, backgroundColor: '#ff6b6b', marginBottom: '15px' }}
        >
          {t('Clear memory')}
        </button>

        {/* Paramètres d'émission directs */}
        {Object.entries(emissions_DENOX).map(([key, value]) => (
          <div key={key} style={inputRowStyle}>
            <label style={inputLabelStyle}>
              {t(key)}:
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              style={inputStyle}
            />
          </div>
        ))}

        <div style={controlRowStyle}>
          <label style={labelStyle}>{t('Water injection')}</label>
          <button 
            onClick={() => setWaterInjection(!waterInjection)}
            style={{ ...buttonStyle, backgroundColor: waterInjection ? '#4CAF50' : '#f44336' }}
          >
            {waterInjection ? t('OUI') : t('NON')}
          </button>
        </div>

        <div style={controlRowStyle}>
          <label style={labelStyle}>{t('Gas type')}</label>
          <select value={gasType} onChange={(e) => setGasType(e.target.value)} style={controlStyle}>
            <option value="gaz H">Gaz H</option>
            <option value="gaz L">Gaz L</option>
            <option value="process gaz">Process gaz</option>
          </select>
        </div>

        <div style={controlRowStyle}>
          <label style={labelStyle}>{t('Water type')}</label>
          <select value={waterType} onChange={(e) => setWaterType(e.target.value)} style={controlStyle}>
            <option value="potable">Potable</option>
            <option value="refroidissement">Refroidissement</option>
            <option value="demineralisé">Déminéralisé</option>
            <option value="adoucie">Adoucie</option>
            <option value="rivière">Rivière</option>
          </select>
        </div>
      </div>

      {!combustionResults.converged && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          ⚠️ {t('Warning: Combustion calculation did not converge properly')}
        </div>
      )}

      {T_out < T_reheat && !reheatingCalculations.converged && (
        <div style={{ color: 'orange', marginBottom: '10px' }}>
          ⚠️ {t('Warning: Reheating calculation did not converge after')} {reheatingCalculations.iterations} {t('iterations')}
        </div>
      )}

      {T_out >= T_reheat && (
        <div style={{ color: 'blue', marginBottom: '10px' }}>
          ℹ️ {t('No reheating required: outlet temperature is already above target')}
        </div>
      )}

      <h3>{t('Calculated parameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('Flue gas composition')}</h3>
      <h4>{t('Flue gas inlet at inlet temperature')} ({T_IN}°C)</h4>
      <MassCalculator masses={flueGasCalculations.masses_FG_in} TemperatureImposee={T_IN} />

      <h4>{t('Flue gas outlet at temperature before reheating')} ({T_out}°C)</h4>
      <MassCalculator masses={flueGasCalculations.masses_FG_out} TemperatureImposee={T_out} />

      <h4>{t('Flue gas outlet at temperature after reheating')} ({T_reheat}°C)</h4>
      <MassCalculator masses={masses_FG_out_after_reheating} TemperatureImposee={T_reheat} />
    </div>
  );
};

export default DENOXFlueGasParameters;