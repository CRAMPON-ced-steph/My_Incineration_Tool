import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import PrintButton from '../../C_Components/Windows_print';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3, coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './IDFAN_traduction';

const IDFANFlueGasParameters = ({ innerData, currentLanguage = 'fr' }) => {
  const initialEmissions_IDFAN = {
    'Electrical yield [%]': 70,
    'Radiative losses [%]': 5,
    'Outlet pressure [mmCE]': 310,
    'Ambient air temperature [°C]': 20,
    'Safety factor [-]': 1.15,
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // États pour les menus déroulants
  const [fanType, setFanType] = useState('centrifuge_standard');
  const [motorType, setMotorType] = useState('standard');
  const [transmissionType, setTransmissionType] = useState('courroies');

  const [emissions_IDFAN, setEmissions_IDFAN] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions_IDFAN');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions_IDFAN;
  });

  // Configurations des rendements
  const fanConfigs = {
    centrifuge_optimise: { label: t('Optimized centrifugal fan'), efficiency: 0.75 },
    centrifuge_standard: { label: t('Standard centrifugal fan'), efficiency: 0.65 },
    axial_optimise: { label: t('Optimized axial fan'), efficiency: 0.80 },
    axial_standard: { label: t('Standard axial fan'), efficiency: 0.72 }
  };

  const motorConfigs = {
    haute_efficacite: { label: t('High efficiency motor (IE3/IE4)'), efficiency: 0.93 },
    standard: { label: t('Standard motor (IE2)'), efficiency: 0.89 }
  };

  const transmissionConfigs = {
    directe: { label: t('Direct transmission'), efficiency: 0.98 },
    courroies: { label: t('Belt transmission'), efficiency: 0.95 },
    reducteur: { label: t('Gear reducer'), efficiency: 0.96 }
  };

  useEffect(() => {
    localStorage.setItem('emissions_IDFAN', JSON.stringify(emissions_IDFAN));
  }, [emissions_IDFAN]);

  // Input data with fallback values
  const T_IN = innerData?.T_OUT || 200;
  const T_in = T_IN;
  const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };
  const P_inlet = innerData?.P_OUT || 1;

  // Extract parameters from state
  const Elec_yield = emissions_IDFAN['Electrical yield [%]'] / 100;
  const T_air = emissions_IDFAN['Ambient air temperature [°C]'];
  const Radiative_losses = emissions_IDFAN['Radiative losses [%]'] / 100;
  const P_outlet = emissions_IDFAN['Outlet pressure [mmCE]'];
  const safety_factor = emissions_IDFAN['Safety factor [-]'];

  // Calculate mass flows
  const FG_CO2_kg_h = FG_IN.CO2;
  const FG_H2O_kg_h = FG_IN.H2O;
  const FG_O2_kg_h = FG_IN.O2;
  const FG_N2_kg_h = FG_IN.N2;

  // Convert to volumetric flows
  const FG_CO2_Nm3_h = CO2_kg_m3(FG_CO2_kg_h);
  const FG_H2O_Nm3_h = H2O_kg_m3(FG_H2O_kg_h);
  const FG_O2_Nm3_h = O2_kg_m3(FG_O2_kg_h);
  const FG_N2_Nm3_h = N2_kg_m3(FG_N2_kg_h);

  const FG_humide_tot_Nm3_h = FG_CO2_Nm3_h + FG_H2O_Nm3_h + FG_O2_Nm3_h + FG_N2_Nm3_h;
  const FG_humide_CONV = coeff_Nm3_to_m3(T_IN, 0) * FG_humide_tot_Nm3_h;

  // Calcul avec les rendements sélectionnés
  const eta_ventilateur = fanConfigs[fanType].efficiency;
  const eta_moteur = motorConfigs[motorType].efficiency;
  const eta_transmission = transmissionConfigs[transmissionType].efficiency;

  // Calculs de puissance
  const delta_P_total_mmCE = P_outlet - P_inlet;
  const delta_P_total_Pa = delta_P_total_mmCE * 9.81;
  
  const P_aeraulique_kW = (FG_humide_CONV * delta_P_total_Pa) / (3600 * 1000);
  const P_mecanique_kW = P_aeraulique_kW / eta_ventilateur;
  const P_elec_brute_kW = P_mecanique_kW / (eta_moteur * eta_transmission);
  const P_elec_kW = P_elec_brute_kW * safety_factor;

  // Calcul des pertes thermiques
  const debit_massique_kg_s = (FG_CO2_kg_h + FG_H2O_kg_h + FG_O2_kg_h + FG_N2_kg_h) / 3600;
  
  // Fractions massiques pour Cp du mélange
  const debit_total = FG_CO2_kg_h + FG_H2O_kg_h + FG_O2_kg_h + FG_N2_kg_h;
  const x_CO2 = debit_total > 0 ? FG_CO2_kg_h / debit_total : 0;
  const x_H2O = debit_total > 0 ? FG_H2O_kg_h / debit_total : 0;
  const x_O2 = debit_total > 0 ? FG_O2_kg_h / debit_total : 0;
  const x_N2 = debit_total > 0 ? FG_N2_kg_h / debit_total : 0;

  // Capacités calorifiques (kJ/kg/K)
  const Cp_CO2 = 1.15;
  const Cp_H2O = 2.1;
  const Cp_O2 = 1.05;
  const Cp_N2 = 1.15;

  const Cp_melange = x_CO2 * Cp_CO2 + x_H2O * Cp_H2O + x_O2 * Cp_O2 + x_N2 * Cp_N2;

  // Pertes transmises aux fumées (pertes internes du ventilateur)
  const P_vers_fumees = P_mecanique_kW * (1 - eta_ventilateur);
  
  // Pertes vers l'ambiance (moteur + transmission)
  const P_vers_ambiance = P_elec_brute_kW * (1 - eta_moteur * eta_transmission);

  // Élévation de température
  const delta_T_fumees = debit_massique_kg_s > 0 && Cp_melange > 0 ? 
    P_vers_fumees / (debit_massique_kg_s * Cp_melange) : 0;

  // Calcul de la température de sortie
  const H_in_IDFAN = h_fumee(T_in, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
  let H_out_IDFAN = H_in_IDFAN;
  let T_out = T_in;

  const H_target = H_in_IDFAN + P_vers_fumees;

  while (H_out_IDFAN < H_target) {
    H_out_IDFAN = h_fumee(T_out, FG_IN.CO2, FG_IN.H2O, FG_IN.N2, FG_IN.O2);
    T_out += 0.01;
    
    if (T_out > 500) {
      console.warn('Température maximale atteinte');
      break;
    }
  }

  // Update innerData with calculated values
  if (innerData) {
    innerData.T_OUT = T_out;
    innerData.P_OUT = P_outlet;
    innerData.FG_OUT_kg_h = {
      CO2: FG_CO2_kg_h,
      H2O: FG_H2O_kg_h,
      O2: FG_O2_kg_h,
      N2: FG_N2_kg_h
    };
    innerData.consoElec1 = P_elec_kW;
    innerData.labelElec1 = 'ID fan';
  }

  const masses_FG_in_IDFAN = {
    CO2: FG_CO2_kg_h,
    O2: FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2: FG_N2_kg_h
  };

  const elementsGeneric = [
    { text: t('Flow rate [m³/h at conditions]'), value: FG_humide_CONV.toFixed(0) },
    { text: t('Total pressure drop [mmCE]'), value: delta_P_total_mmCE.toFixed(0) },
    { text: t('Aeraulic power [kW]'), value: P_aeraulique_kW.toFixed(3) },
    { text: t('Mechanical power [kW]'), value: P_mecanique_kW.toFixed(3) },
    { text: t('Electrical power (before safety) [kWe]'), value: P_elec_brute_kW.toFixed(3) },
    { text: t('Electrical power (with safety) [kWe]'), value: P_elec_kW.toFixed(2) },
    { text: t('Fan efficiency [%]'), value: (eta_ventilateur * 100).toFixed(1) },
    { text: t('Motor efficiency [%]'), value: (eta_moteur * 100).toFixed(1) },
    { text: t('Transmission efficiency [%]'), value: (eta_transmission * 100).toFixed(1) },
    { text: t('Global efficiency [%]'), value: ((eta_ventilateur * eta_moteur * eta_transmission) * 100).toFixed(1) },
    { text: t('Temperature inlet IDFAN [°C]'), value: T_in.toFixed(1) },
    { text: t('Temperature outlet IDFAN [°C]'), value: T_out.toFixed(1) },
    { text: t('Temperature rise (calculated) [°C]'), value: delta_T_fumees.toFixed(3) },
    { text: t('Power transmitted to flue gas [kW]'), value: P_vers_fumees.toFixed(3) },
    { text: t('Power lost to ambient [kW]'), value: P_vers_ambiance.toFixed(3) },
    { text: t('Pressure inlet [mmCE]'), value: P_inlet.toFixed(0) },
  ];

  const handleChange = (name, value) => {
    if (name === 'Electrical yield [%]') {
      value = Math.max(25, Math.min(90, value));
    } else if (name === 'Safety factor [-]') {
      value = Math.max(1.0, Math.min(2.0, value));
    }
    setEmissions_IDFAN((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions_IDFAN');
    setEmissions_IDFAN(initialEmissions_IDFAN);
    setFanType('centrifuge_standard');
    setMotorType('standard');
    setTransmissionType('courroies');
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

        {/* Equipment Configuration Section */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '5px',
          backgroundColor: '#f8f9fa'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '15px' }}>
            {t('Equipment Configuration')}
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Fan Type */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <label style={{
                flex: '1',
                minWidth: '200px',
                textAlign: 'right',
                fontWeight: '500',
                color: '#333',
              }}>
                {t('Fan Type')}:
              </label>
              <select 
                value={fanType} 
                onChange={(e) => setFanType(e.target.value)}
                style={{
                  flex: '0 0 350px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {Object.entries(fanConfigs).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} (η={Math.round(config.efficiency*100)}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Motor Type */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <label style={{
                flex: '1',
                minWidth: '200px',
                textAlign: 'right',
                fontWeight: '500',
                color: '#333',
              }}>
                {t('Motor Type')}:
              </label>
              <select 
                value={motorType} 
                onChange={(e) => setMotorType(e.target.value)}
                style={{
                  flex: '0 0 350px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {Object.entries(motorConfigs).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} (η={Math.round(config.efficiency*100)}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission Type */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <label style={{
                flex: '1',
                minWidth: '200px',
                textAlign: 'right',
                fontWeight: '500',
                color: '#333',
              }}>
                {t('Transmission Type')}:
              </label>
              <select 
                value={transmissionType} 
                onChange={(e) => setTransmissionType(e.target.value)}
                style={{
                  flex: '0 0 350px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {Object.entries(transmissionConfigs).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label} (η={Math.round(config.efficiency*100)}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inline parameters form */}
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(emissions_IDFAN).map(([key, value]) => (
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
      <h4>{t('Flue gas inlet at inlet temperature')} ({T_in.toFixed(1)}°C)</h4>
      <MassCalculator masses={masses_FG_in_IDFAN} TemperatureImposee={T_in} />

      <h4>{t('Flue gas outlet at outlet temperature')} ({T_out.toFixed(1)}°C)</h4>
      <MassCalculator masses={masses_FG_in_IDFAN} TemperatureImposee={T_out} />
    </div>
  );
};

export default IDFANFlueGasParameters;