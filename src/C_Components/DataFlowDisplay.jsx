import React from 'react';
import { fmt } from '../A_Transverse_fonction/formatNumber';

const DataFlowDisplay = ({ nodes, onClose }) => {
  // Filter nodes that have dataFlow in their result
  const nodesWithDataFlow = nodes.filter(node => node.data?.result?.dataFlow);

  // Merge all dataFlow objects into a single array
  const mergedDataFlow = nodesWithDataFlow.map(node => ({
nodeId: node.id,
    nodeName: node.data.label,
  //  nodeName: nextNodeLabel,// || node.data.label,
    ...node.data.result.dataFlow
  }));

  // Get all unique keys from all dataFlow objects (exclude metadata)
  const allKeys = [...new Set(mergedDataFlow.flatMap(Object.keys))].filter(k => k !== 'nodeId' && k !== 'nodeName');
  
  //              {data.nodeName} (ID: {data.nodeId})
  return (
    <div style={{ padding: '20px', maxWidth: '100%', overflowX: 'auto', position: 'relative' }}>
      {onClose && (
        <button
          onClick={onClose}
          title="Fermer"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '26px',
            height: '26px',
            lineHeight: '24px',
            textAlign: 'center',
            padding: 0,
            background: 'rgba(0,0,0,0.08)',
            color: '#555',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.background = 'rgba(0,0,0,0.2)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(0,0,0,0.08)')}
        >
          ×
        </button>
      )}
      <h2>Combined DataFlow Information</h2>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: '12px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}>
        <thead>
          <tr>
            <th style={{ 
              padding: '8px',
              backgroundColor: '#f4f4f4',
              border: '1px solid #ddd',
              position: 'sticky',
              top: 0
            }}>Parameter</th>
            {mergedDataFlow.map((data, index) => (
              <th key={index} style={{ 
                padding: '8px',
                backgroundColor: '#f4f4f4',
                border: '1px solid #ddd',
                position: 'sticky',
                top: 0
              }}>
                {data.nodeName} ({data.nodeId})
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allKeys.map((key, index) => (
            <tr key={index}>
              <td style={{ 
                padding: '8px',
                border: '1px solid #ddd',
                backgroundColor: '#f8f8f8',
                fontWeight: 'bold'
              }}>{key}</td>
              {mergedDataFlow.map((data, dataIndex) => (
                <td key={dataIndex} style={{ 
                  padding: '8px',
                  border: '1px solid #ddd',
                  textAlign: 'right'
                }}>
                  {data[key] !== undefined ?
                    (typeof data[key] === 'number' ?
                      fmt(data[key], 2) :
                      data[key].toString()
                    ) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataFlowDisplay;