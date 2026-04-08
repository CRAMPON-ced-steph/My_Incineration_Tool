import React from 'react';

const DataFlowDisplay = ({ nodes }) => {
  const nodesWithResults = nodes.filter(node => node.data?.result);

  const mergedResults = nodesWithResults.map(node => ({
    nodeId: node.id,
    nodeName: node.data.label,
    ...node.data.result
  }));

  const allKeys = [...new Set(mergedResults.flatMap(obj => 
    Object.keys(obj).filter(key => key !== 'dataFlow')
  ))];

  const tableHeaderStyle = {
    padding: '8px',
    backgroundColor: '#f4f4f4',
    border: '1px solid #ddd',
    position: 'sticky',
    top: 0
  };

  const tableCellStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'right'
  };

  const tableRowHeaderStyle = {
    padding: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#f8f8f8',
    fontWeight: 'bold'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  };

  const containerStyle = {
    padding: '20px',
    maxWidth: '100%',
    overflowX: 'auto'
  };

  const formatCellValue = (value) => {
    if (value === undefined) return '-';
    return typeof value === 'number' ? value.toFixed(2) : value.toString();
  };

  return (
    

{mergedResults.map((data, index) => ( ))} {allKeys.map((key, index) => ( {mergedResults.map((data, dataIndex) => ( ))} ))}
Parameter	{data.nodeName}
{key}	{formatCellValue(data[key])}
); };
export default DataFlowDisplay;