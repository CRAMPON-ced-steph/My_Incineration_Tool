import React from 'react';

const LoadProjectButton = ({ setNodes, setEdges, setSelectedNode, setMode }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);
        setNodes(projectData.nodes || []);
        setEdges(projectData.edges || []);
        setSelectedNode(projectData.selectedNode);
        setMode(projectData.mode || 'Bilan');
      } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project file. Please ensure it is a valid project configuration.');
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    document.getElementById('load-project-input').click();
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  return (
    <>
      <input
        type="file"
        id="load-project-input"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button style={buttonStyle} onClick={triggerFileInput}>
        Load Project
      </button>
    </>
  );
};

export default LoadProjectButton;
