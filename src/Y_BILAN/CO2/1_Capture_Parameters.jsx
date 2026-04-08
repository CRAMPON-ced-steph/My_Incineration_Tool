
import React, { useState, useEffect } from 'react';
import MassCalculator from '../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../C_Components/Tableau_generique';
import GasTable from '../../C_Components/Tableau_air';
import { calculateWaterContent } from '../../A_Transverse_fonction/bilan_fct_combustion';
import { H_in_systemA } from '../../A_Transverse_fonction/bilan_fct_RK';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3, CO2_m3_kg, H2O_m3_kg, N2_m3_kg, O2_m3_kg } from '../../A_Transverse_fonction/conv_calculation';
import { TEMP_FUMEE_INC, Q_AIR_DILUTION } from '../../A_Transverse_fonction/enthalpy_mix_gas';

const CaptureParameters = ({ innerData }) => {
  const [emissions, setEmissions] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions');
    return savedEmissions ? JSON.parse(savedEmissions) : {
      'Flue gas temperature outlet [°C]': 900,
      'Air factor': 1,
      'Combustion Air Temperature [°C]': 20,
      'Waste Temperature [°C]': 20,
      'Steam water temperature': 20,
      'Estimated thermal Losses [%]': 8,
      'Air preheating part [%]': 20,
      'Air preheating temperature [°C]': 20,
      'Air Relative Moisture [%]': 50,
      'Water vaporized from extractor [kg/h] ': 500,
    };
  });

  const defaultEmissions = {
    'Flue gas temperature outlet [°C]': 900,
    'Air factor': 1,
    'Combustion Air Temperature [°C]': 20,
    'Waste Temperature [°C]': 20,
    'Steam water temperature': 20,
    'Estimated thermal Losses [%]': 8,
    'Air preheating part [%]': 20,
    'Air preheating temperature [°C]': 20,
    'Air Relative Moisture [%]': 50,
    'Water vaporized from extractor [kg/h] ': 500,
  };

  useEffect(() => {
    localStorage.setItem('emissions', JSON.stringify(emissions));
  }, [emissions]);

  const handleChange = (name, value) => {
    setEmissions(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetValues = () => {
    setEmissions(defaultEmissions);
  };





  const T_out = emissions['Flue gas temperature outlet [°C]'];
  const T_air = emissions['Combustion Air Temperature [°C]'];
  const T_waste = emissions['Waste Temperature [°C]'];
  const T_steam_water = emissions['Steam water temperature'];
  const T_air_prechauffe = emissions['Air preheating temperature [°C]'];
  const airRelativeMoisture = emissions['Air Relative Moisture [%]'];
  const Air_factor = emissions['Air factor'];
  const Th_loss_pourcent = emissions['Estimated thermal Losses [%]'];
  const Air_preheat_pourcent = emissions['Air preheating part [%]'];
  const Water_vaporized_extractor = emissions['Water vaporized from extractor [kg/h] '];

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

  const elementsGeneric = [
    { text: 'Air Stoechio [Kmole]', value: Air_stoechio_kmole.toFixed(2) },
    { text: 'Calculated temperature [°C]', value: T_four_calcule.toFixed(2) },
    { text: 'Water Content [kg/Nm3]', value: Water_content_kg_Nm3.toFixed(5) },
    { text: 'H_system', value: H_system.toFixed(0) },
    { text: 'Air factor calculated', value: Air_factor_calculated.toFixed(1) },
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

  innerData['FG_OUT_kg_h'] = masses_FG_out_extractor_RK_kg_h;
  innerData['FG_RK_OUT_Nm3_h'] = volume_FG_out_extractor_RK_Nm3_h;
  innerData['O2_calcule'] = O2_sec_pourcent;
  innerData['T_OUT'] = T_out;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h3>Calculation parameters</h3>
      <div
        style={{
          background: 'lightgrey',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}
      >
        {Object.entries(emissions).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <label
              style={{
                flex: '1',
                marginRight: '10px',
                textAlign: 'right',
                fontWeight: 'bold',
              }}
            >
              {key}:
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              style={{
                flex: '0 0 100px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
      </div>

      <h3>Calculated parameters</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>Combustion air composition</h3>
      <h3>At the stoechiometry</h3>
      <GasTable data={AirStData} />
    
      <h3>At the adiabaticity</h3>
      <GasTable data={AirAdiaData} />
    
      <h3>Combustion air total</h3>
      <GasTable data={AirCombData} />

      <div style={{ marginTop: '20px' }}>
        <h3>Flue gas composition</h3>
        <h4>Flue gas at the stoechiometry</h4>
        <MassCalculator masses={masses_FG_stoechio} TemperatureImposee={T_four_calcule} />

        <h4>Output flue gas without water from extractor</h4>
        <MassCalculator masses={masses_FG_out_RK} TemperatureImposee={T_out} />

        <h4>Output flue gas with water from extractor</h4>
        <MassCalculator masses={masses_FG_out_extractor_RK_kg_h} TemperatureImposee={T_out} />

        <button
          onClick={() => window.print()}
          style={{
            width: '100%',
            padding: '12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Export Results
        </button>

        <button
          onClick={resetValues}
          style={{
            width: '100%',
            padding: '12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Reset Values
        </button>


      </div>
    </div>
  );
};

export default CaptureParameters;