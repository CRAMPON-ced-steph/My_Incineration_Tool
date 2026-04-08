import React from 'react';

import { CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3 } from '../A_Transverse_fonction/conv_calculation';
import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../A_Transverse_fonction/enthalpy_gas';

const MassCalculator = ({ masses, TemperatureImposee }) => {
  const calculateMasses = (masses) => {
    const initialMasses = {
      CO2: parseFloat(masses.CO2) || 0,
      O2: parseFloat(masses.O2) || 0,
      H2O: parseFloat(masses.H2O) || 0,
      N2: parseFloat(masses.N2) || 0,
    };

    initialMasses.Total =
      initialMasses.CO2 + initialMasses.O2 + initialMasses.H2O + initialMasses.N2;

    const volume = {
      CO2: CO2_kg_m3(initialMasses.CO2),
      O2: O2_kg_m3(initialMasses.O2),
      H2O: H2O_kg_m3(initialMasses.H2O),
      N2: N2_kg_m3(initialMasses.N2),
    };

    volume.Total =
      volume.CO2 + volume.O2 + volume.H2O + volume.N2;

    const repartition_volume_humide = {
      CO2: CO2_kg_m3(initialMasses.CO2) / volume.Total*100,
      O2: O2_kg_m3(initialMasses.O2)/ volume.Total*100,
      H2O: H2O_kg_m3(initialMasses.H2O)/ volume.Total*100,
      N2: N2_kg_m3(initialMasses.N2)/ volume.Total*100,

    }
    repartition_volume_humide.Total =
      repartition_volume_humide.CO2 + repartition_volume_humide.O2 + repartition_volume_humide.H2O + repartition_volume_humide.N2;

      const repartition_volume_sec = {
        CO2: CO2_kg_m3(initialMasses.CO2) / (volume.Total-volume.H2O)*100,
        O2: O2_kg_m3(initialMasses.O2)/(volume.Total-volume.H2O)*100,
        H2O: 0,
        N2: N2_kg_m3(initialMasses.N2)  / (volume.Total-volume.H2O)*100,
  
      }
      repartition_volume_sec.Total =
        repartition_volume_sec.CO2 + repartition_volume_sec.O2 + repartition_volume_sec.H2O + repartition_volume_sec.N2;
  
  
  





    const enthalpie = {
      CO2: fh_CO2(initialMasses.CO2, TemperatureImposee),
      O2: fh_O2(initialMasses.O2, TemperatureImposee),
      H2O: fh_H2O(initialMasses.H2O, TemperatureImposee),
      N2: fh_N2(initialMasses.N2, TemperatureImposee),
    };

    enthalpie.Total =
      enthalpie.CO2 + enthalpie.O2 + enthalpie.H2O + enthalpie.N2;

    return { initialMasses, volume, enthalpie,repartition_volume_humide,repartition_volume_sec };
  };

  const results = calculateMasses(masses);

  return (
    <div>

      <table border="1" style={{ marginTop: '20px', width: '100%',textAlign: 'center', }}>
        <thead>
          <tr>
            <th>Élément</th>
            <th>Masse [kg/h]</th>
            <th>Volume [m3/h]</th>
            <th>Enthalpie [kJ]</th>
            <th>[% vol wet]</th>
            <th>[% vol dry]</th>
          </tr>
        </thead>
        <tbody>
          {['CO2', 'O2', 'H2O', 'N2', 'Total'].map((element) => (
            <tr key={element}>
              <td>{element}</td>
              <td>{results.initialMasses[element]?.toFixed(2)}</td>
              <td>{results.volume[element]?.toFixed(2)}</td>
              <td>{results.enthalpie[element]?.toFixed(2)}</td>
              <td>{results.repartition_volume_humide[element]?.toFixed(2)}</td>
              <td>{results.repartition_volume_sec[element]?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MassCalculator;