import React, { useState, useMemo } from 'react';
import { fmt } from '../A_Transverse_fonction/formatNumber';
import { buildProcessLines, getLineName, LINE_COLORS } from './DataFlowDisplay';

// Colonnes affichées : libellé + clés candidates (cherchées dans l'ordre selon l'équipement)
const COLUMNS = [
  { label: 'Air injecté net', keys: ['Qv_air_injecté_net_Nm3_h'] },
  { label: 'Air parasite', keys: ['Qv_air_parasite_Nm3_h'] },
  { label: 'Air entrant', keys: ['Qv_air_entrant_Nm3_h', 'Qv_air_entrant_tot_Nm3_h'] },
  { label: 'Air décolmatage', keys: ['Qv_air_decolmatage_Nm3_h'] },
];

// Cherche la première clé trouvée (parmi `keys`) dans les sous-objets data<EQ> du résultat
const extractValue = (node, keys) => {
  const result = node.data?.result;
  if (!result || typeof result !== 'object') return null;
  for (const k of keys) {
    // Sous-objets (dataBHF, dataCYCLONE, dataREACTOR, data_Air_WHB, …)
    for (const sub of Object.values(result)) {
      if (sub && typeof sub === 'object' && typeof sub[k] === 'number' && !Number.isNaN(sub[k])) return sub[k];
    }
    // Au cas où la clé serait au niveau racine
    if (typeof result[k] === 'number' && !Number.isNaN(result[k])) return result[k];
  }
  return null;
};

const LineTable = ({ lineNodes }) => {
  const rows = lineNodes
    .map(n => ({
      id: n.id,
      name: n.data?.label,
      values: COLUMNS.map(col => extractValue(n, col.keys)),
    }))
    .filter(r => r.values.some(v => v !== null && v !== undefined));

  if (rows.length === 0) {
    return <div style={{ padding: '20px', color: '#888', fontStyle: 'italic' }}>Aucun débit d'air disponible pour cette ligne.</div>;
  }

  const totals = COLUMNS.map((_, c) => rows.reduce((s, r) => s + (r.values[c] || 0), 0));

  const cell = { padding: '8px 12px', border: '1px solid #ddd' };
  const numCell = { ...cell, textAlign: 'right' };
  const thBase = { ...cell, backgroundColor: '#f4f4f4' };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
      <thead>
        <tr>
          <th style={{ ...thBase, textAlign: 'left' }}>Équipement</th>
          {COLUMNS.map((col) => (
            <th key={col.label} style={{ ...thBase, textAlign: 'right' }}>{col.label}<br />[Nm³/h]</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td style={cell}>{r.name} ({r.id})</td>
            {r.values.map((v, c) => (
              <td key={c} style={numCell}>{v !== null && v !== undefined ? fmt(v, 0) : '-'}</td>
            ))}
          </tr>
        ))}
        <tr style={{ fontWeight: 'bold', background: '#eaf0fb' }}>
          <td style={cell}>Total</td>
          {totals.map((t, c) => (
            <td key={c} style={numCell}>{fmt(t, 0)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

const AirParasiteDisplay = ({ nodes, edges, onClose }) => {
  const lines = useMemo(() => buildProcessLines(nodes, edges), [nodes, edges]);
  const [activeTab, setActiveTab] = useState(0);

  const lineNodes = lines.length > 1 ? (lines[activeTab] || []) : (lines[0] || nodes);

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: '70vw', maxWidth: '900px', height: '80vh',
      backgroundColor: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', borderRadius: '8px',
      padding: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Air parasite par ligne</h2>
        <button
          onClick={onClose}
          style={{ padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Fermer
        </button>
      </div>

      {lines.length > 1 && (
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #ddd', marginBottom: '12px' }}>
          {lines.map((line, i) => {
            const color = LINE_COLORS[i % LINE_COLORS.length];
            const isActive = activeTab === i;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  padding: '8px 16px', border: 'none',
                  borderBottom: isActive ? `3px solid ${color}` : '3px solid transparent',
                  background: isActive ? `${color}15` : 'transparent',
                  color: isActive ? color : '#666',
                  fontWeight: isActive ? 700 : 400, fontSize: '13px',
                  cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.15s',
                }}
              >
                {getLineName(line, i)}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <LineTable lineNodes={lineNodes} />
      </div>
    </div>
  );
};

export default AirParasiteDisplay;
