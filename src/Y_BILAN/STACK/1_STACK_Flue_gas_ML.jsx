import React, { useState, useEffect, useCallback } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3, coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './STACK_traduction';

const STACKFlueGasParameters = ({ innerData, currentLanguage = 'fr', setInnerData }) => {
  // Translation setup
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // Initial state
  const initialEmissions_STACK = {};

  const [emissions_STACK, setEmissions_STACK] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions_STACK');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions_STACK;
  });

  // Save to localStorage whenever emissions change
  useEffect(() => {
    localStorage.setItem('emissions_STACK', JSON.stringify(emissions_STACK));
  }, [emissions_STACK]);

  // Extract input data
  const T_IN = innerData?.T_OUT || 1;
  const T_in = T_IN;
  const FG_IN = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };

  // Calculate gas flows in kg/h
  const FG_CO2_kg_h = FG_IN.CO2;
  const FG_H2O_kg_h = FG_IN.H2O;
  const FG_O2_kg_h = FG_IN.O2;
  const FG_N2_kg_h = FG_IN.N2;

  // Convert to m3/h at normal conditions
  const FG_CO2_m3_h = CO2_kg_m3(FG_CO2_kg_h);
  const FG_H2O_m3_h = H2O_kg_m3(FG_H2O_kg_h);
  const FG_O2_m3_h = O2_kg_m3(FG_O2_kg_h);
  const FG_N2_m3_h = N2_kg_m3(FG_N2_kg_h);

  // Total wet volume at normal conditions
  const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;

  // Convert to actual volume at exit temperature
  const FG_humide_CONV_ = coeff_Nm3_to_m3(T_in, 0) * FG_humide_tot_m3_h;

  // Mass flows for display
  const masses_FG_in_STACK = {
    CO2: FG_CO2_kg_h,
    O2: FG_O2_kg_h,
    H2O: FG_H2O_kg_h,
    N2: FG_N2_kg_h
  };

  // Handle input changes
  const handleChange = (name, value) => {
    setEmissions_STACK((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear stored data
  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions_STACK');
    setEmissions_STACK(initialEmissions_STACK);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Calculation Parameters Section */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>
          {t('calculationParameters')}
        </h3>

        <button
          onClick={clearMemory}
          style={{
            padding: '8px 16px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            marginBottom: '20px',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#c0392b'}
          onMouseLeave={(e) => e.target.style.background = '#e74c3c'}
        >
          {t('clearMemory')}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(emissions_STACK).length > 0 ? (
            Object.entries(emissions_STACK).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '12px',
                  background: '#f9f9f9',
                  borderLeft: '3px solid #4a90e2',
                  borderRadius: '4px'
                }}
              >
                <label style={{
                  flex: 1,
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  {key}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  style={{
                    flex: '0 0 120px',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))
          ) : (
            <div style={{
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#999',
              fontStyle: 'italic',
              fontSize: '14px'
            }}>
              {t('calculationParameters')} - {t('clearMemory')}
            </div>
          )}
        </div>
      </section>

      {/* Flue Gas Composition Section */}
      <section>
        <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
          {t('flueGasComposition')}
        </h3>
        <h4 style={{ marginTop: 0, marginBottom: '20px', color: '#666', fontWeight: '400' }}>
          {t('flueGasInletAtTemperature')} ({T_in}°C)
        </h4>
        <MassCalculator
          masses={masses_FG_in_STACK}
          TemperatureImposee={T_in}
        />
      </section>
    </div>
  );
};

export default STACKFlueGasParameters;