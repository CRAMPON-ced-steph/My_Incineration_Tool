// Nouveau composant : MatrixView.jsx
import React from 'react';

const MatrixView = ({ nodesData, currentLanguage }) => {
  // nodesData = tableau de tous les innerData des différents nodes
  
  const parameters = [
    { key: 'FG_OUT_kg_h', label: 'Flue Gas Output (kg/h)' },
    { key: 'T_OUT', label: 'Temperature Out (°C)' },
    { key: 'P_out_mmCE', label: 'Pressure Out (mmCE)' },
    { key: 'masse', label: 'Masse Déchet' },
    // Ajoutez tous les paramètres importants
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '12px', background: '#4a90e2', color: 'white' }}>
              Parameter
            </th>
            {nodesData.map((node, index) => (
              <th key={index} style={{ border: '1px solid #ddd', padding: '12px', background: '#4a90e2', color: 'white' }}>
                {node.nodeName || `Node ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.key}>
              <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>
                {param.label}
              </td>
              {nodesData.map((node, index) => (
                <td key={index} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                  {node.data[param.key] !== undefined ? node.data[param.key] : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatrixView;