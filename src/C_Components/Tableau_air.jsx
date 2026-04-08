import React from 'react';

const GasTable = ({ data }) => {
  const gases = ['CO2', 'H2O', 'O2', 'N2','Q_dry_tot','Q_wet_tot'];
  const units = ['kg_h', 'Nm3_h'];

  return (
    <table border="1" style={{ marginTop: '20px', width: '100%', textAlign: 'center', fontSize: '12px', }}>
      <thead>
        <tr>
          <th>Unité</th>
          {gases.map(gas => <th key={gas}>{gas}</th>)}
        </tr>
      </thead>
      <tbody>
        {units.map(unit => (
          <tr key={unit}>
            <td>{unit}</td>
            {gases.map(gas => (
              <td key={`${gas}-${unit}`}>
                {data[unit] && data[unit][gas] !== undefined
                  ? data[unit][gas].toFixed(2)
                  : '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GasTable;