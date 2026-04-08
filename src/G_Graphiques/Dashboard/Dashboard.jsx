
import React, { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Fonction helper pour extraire les données du graphique
const extractChartData = (nodes, key) => {
  return nodes.map(node => ({
    name: node.data.label || `Node ${node.id}`,
    valeur: node.data[key] || 0
  }));
};

// Calcule le total d'une série de données
const total = (data) => data.reduce((sum, item) => sum + item.valeur, 0);

// Affiche un graphique avec un tableau de données
const renderChartWithTable = (data, title, unit, color) => {
  const totalVal = total(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <h4 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1rem' }}>
        {title} (Total : {totalVal} {unit})
      </h4>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} ${unit}`, 'Valeur']} />
            <Bar dataKey="valeur" fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '0.75rem', marginTop: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px', borderBottom: '1px solid #ddd' }}>Équipement</th>
              <th style={{ textAlign: 'right', padding: '4px', borderBottom: '1px solid #ddd' }}>Valeur ({unit})</th>
              <th style={{ textAlign: 'right', padding: '4px', borderBottom: '1px solid #ddd' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '4px', borderBottom: '1px solid #eee' }}>{item.name}</td>
                <td style={{ textAlign: 'right', padding: '4px', borderBottom: '1px solid #eee' }}>{item.valeur}</td>
                <td style={{ textAlign: 'right', padding: '4px', borderBottom: '1px solid #eee' }}>
                  {totalVal > 0 ? `${((item.valeur / totalVal) * 100).toFixed(1)}%` : '0%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant de débogage simple pour afficher les données brutes
const DebugPanel = ({ activeNodes }) => {
  return (
    <div style={{ 
      position: 'absolute', 
      bottom: '10px', 
      right: '10px',
      padding: '10px',
      background: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '5px',
      maxHeight: '200px',
      width: '300px',
      overflowY: 'auto',
      fontSize: '10px'
    }}>

{/* 
      <h4>Données disponibles (Debug):</h4>
      {activeNodes.map((node, index) => (
        <div key={index} style={{ marginBottom: '5px', borderBottom: '1px solid #eee' }}>
          <strong>{node.data.label || `Node ${node.id}`}:</strong>
          <ul style={{ margin: '2px 0', paddingLeft: '15px' }}>
            {Object.entries(node.data).filter(([key]) => key !== 'label' && key !== 'result').map(([key, value]) => (
              <li key={key}>{key}: {typeof value === 'object' ? 'Object' : value}</li>
            ))}
          </ul>
        </div>
      ))}

      */}

    </div>
  );
};

const DashboardWindow = ({ onClose, nodes }) => {
  // Liste des métriques à afficher
  const metrics = [
    { key: 'consommationElec', label: 'Consommation électrique', unit: 'kWh', color: '#8884d8' },
    { key: 'consommationEau', label: "Consommation d'eau", unit: 'L', color: '#82ca9d' },
    { key: 'consommationReactifs', label: 'Consommation de réactifs', unit: 'g', color: '#ffc658' },
    { key: 'consommationEnergie', label: "Consommation d'énergie", unit: 'kWh', color: '#ff7300' },
    { key: 'emissionsCO2', label: 'Émissions de CO2', unit: 'kg', color: '#a93226' },
    { key: 'cout', label: 'cout', unit: 'cout', color: '#6c3483' }
  ];

  // Filtrer les nœuds actifs
  const activeNodes = nodes.filter(node => node.data && node.data.isActive);
  
  /*
  // Log pour débogage - afficher les données disponibles
  useEffect(() => {
    console.log('Active Nodes:', activeNodes);
    activeNodes.forEach(node => {
      console.log(`Node ${node.id} (${node.data.label}):`, {
        consommationElec: node.data.consommationElec,
        consommationEau: node.data.consommationEau
      });
    });
  }, [activeNodes]);*/

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90vw',
      height: '90vh',
      backgroundColor: 'white',
      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
      borderRadius: '8px',
      padding: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h2 style={{ fontSize: '1.5rem' }}>Tableau de bord des consommations</h2>
        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fermer
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '16px',
        minHeight: 0
      }}>
        {metrics.map(({ key, label, unit, color }) => {
          const data = extractChartData(activeNodes, key);
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {renderChartWithTable(data, label, unit, color)}
            </div>
          );
        })}
      </div>
      
      {/* Panel de débogage */}
      <DebugPanel activeNodes={activeNodes} />
    </div>
  );
};

export default DashboardWindow;