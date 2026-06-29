import React, { useState, useMemo } from 'react';
import { fmt } from '../A_Transverse_fonction/formatNumber';

const FURNACE_LABELS = ['RK+SCC', 'GF', 'FB'];

const buildProcessLines = (allNodes, edgeList) => {
  const edges = edgeList || [];
  const allIds = new Set(allNodes.map(n => n.id));
  const parent = {};
  const find = (x) => { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; };
  const union = (a, b) => { parent[find(a)] = find(b); };
  for (const n of allNodes) parent[n.id] = n.id;
  for (const e of edges) { if (allIds.has(e.source) && allIds.has(e.target)) union(e.source, e.target); }
  const adj = {}, inDeg = {};
  for (const n of allNodes) { adj[n.id] = []; inDeg[n.id] = 0; }
  for (const e of edges) {
    if (allIds.has(e.source) && allIds.has(e.target)) { adj[e.source].push(e.target); inDeg[e.target] = (inDeg[e.target] || 0) + 1; }
  }
  const topoOrder = [];
  const queue = allNodes.filter(n => inDeg[n.id] === 0).map(n => n.id);
  while (queue.length) { const id = queue.shift(); topoOrder.push(id); for (const next of (adj[id] || [])) { inDeg[next]--; if (inDeg[next] === 0) queue.push(next); } }
  for (const n of allNodes) { if (!topoOrder.includes(n.id)) topoOrder.push(n.id); }
  const topoRank = {}; topoOrder.forEach((id, i) => { topoRank[id] = i; });
  const groups = {};
  for (const n of allNodes) { const root = find(n.id); if (!groups[root]) groups[root] = []; groups[root].push(n); }
  for (const root in groups) { groups[root].sort((a, b) => (topoRank[a.id] || 0) - (topoRank[b.id] || 0)); }
  return Object.values(groups).sort((a, b) => (topoRank[a[0]?.id] || 0) - (topoRank[b[0]?.id] || 0));
};

const getLineName = (line, idx) => {
  const furnace = line.find(n => FURNACE_LABELS.includes(n.data?.label));
  return furnace?.data?.lineName || line[0]?.data?.lineName || `Ligne ${idx + 1}`;
};

const LINE_COLORS = ['#4a90e2', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];

const LineTable = ({ lineNodes }) => {
  const nodesWithData = lineNodes.filter(n => n.data?.result?.dataFlow);
  const merged = nodesWithData.map(n => ({
    nodeId: n.id,
    nodeName: n.data.label,
    ...n.data.result.dataFlow,
  }));
  const allKeys = [...new Set(merged.flatMap(Object.keys))].filter(k => k !== 'nodeId' && k !== 'nodeName');

  if (merged.length === 0) {
    return <div style={{ padding: '20px', color: '#888', fontStyle: 'italic' }}>Aucune donnée disponible pour cette ligne.</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
      <thead>
        <tr>
          <th style={{ padding: '8px', backgroundColor: '#f4f4f4', border: '1px solid #ddd', position: 'sticky', top: 0 }}>Parameter</th>
          {merged.map((data, i) => (
            <th key={i} style={{ padding: '8px', backgroundColor: '#f4f4f4', border: '1px solid #ddd', position: 'sticky', top: 0 }}>
              {data.nodeName} ({data.nodeId})
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {allKeys.map((key, i) => (
          <tr key={i}>
            <td style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f8f8f8', fontWeight: 'bold' }}>{key}</td>
            {merged.map((data, j) => (
              <td key={j} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                {data[key] !== undefined
                  ? (typeof data[key] === 'number' ? fmt(data[key], 2) : data[key].toString())
                  : '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DataFlowDisplay = ({ nodes, edges, onClose }) => {
  const lines = useMemo(() => buildProcessLines(nodes, edges), [nodes, edges]);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'auto', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {onClose && (
        <button
          onClick={onClose}
          title="Fermer"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '26px', height: '26px', lineHeight: '24px', textAlign: 'center',
            padding: 0, background: 'rgba(0,0,0,0.08)', color: '#555',
            border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.background = 'rgba(0,0,0,0.2)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(0,0,0,0.08)')}
        >
          ×
        </button>
      )}

      <h2 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Combined DataFlow Information</h2>

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
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${color}` : '3px solid transparent',
                  background: isActive ? `${color}15` : 'transparent',
                  color: isActive ? color : '#666',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '-2px',
                  transition: 'all 0.15s',
                }}
              >
                {getLineName(line, i)}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {lines[activeTab] && <LineTable lineNodes={lines[activeTab]} />}
      </div>
    </div>
  );
};

export default DataFlowDisplay;
