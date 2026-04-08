import React from 'react';

const PrintResults = ({ nodes, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '80%',
      maxHeight: '80vh',
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          right: '10px',
          top: '10px',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>

      <h2>Flow Results Summary</h2>
      
      {nodes.map((node) => (
        <div key={node.id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <h3>{node.data.label} Node</h3>
          {node.data.result ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4>Basic Parameters</h4>
                <p>Temperature: {node.data.result.T_in || node.data.result.T_out}°C</p>
                <p>Flow Rate: {node.data.result.Qv_wet_Nm3_h} Nm³/h</p>
                
                <h4>Gas Composition</h4>
                <p>O2 (dry): {node.data.result.O2_dry_pourcent}%</p>
                <p>O2 (wet): {node.data.result.O2_humide_pourcent?.toFixed(2)}%</p>
                <p>H2O: {node.data.result.H2O_pourcent}%</p>
                <p>CO2 (dry): {node.data.result.CO2_dry_pourcent}%</p>
                <p>CO2 (wet): {node.data.result.CO2_humide_pourcent}%</p>
                <p>N2: {node.data.result.N2_humide_pourcent?.toFixed(2)}%</p>
              </div>

              <div>
                <h4>Mass Flow Rates</h4>
                <p>Total: {node.data.result.Qm_tot_kg_h?.toFixed(2)} kg/h</p>
                <p>CO2: {node.data.result.Qm_CO2_kg_h?.toFixed(2)} kg/h</p>
                <p>H2O: {node.data.result.Qm_H2O_kg_h?.toFixed(2)} kg/h</p>
                <p>O2: {node.data.result.Qm_O2_kg_h?.toFixed(2)} kg/h</p>
                <p>N2: {node.data.result.Qm_N2_kg_h?.toFixed(2)} kg/h</p>

                <h4>Energy Distribution</h4>
                <p>Total Energy: {node.data.result.H_tot_kW?.toFixed(2)} kW</p>
                <p>Total Energy: {node.data.result.H_tot_kj?.toFixed(2)} kJ</p>
              </div>
            </div>
          ) : (
            <p>No calculation results available</p>
          )}
        </div>
      ))}

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
        Print Results
      </button>
    </div>
  );
};

export default PrintResults;