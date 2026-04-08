/*import React from 'react';

const SaveProjectButton = ({ nodes, edges, selectedNode, mode }) => {
  const handleSaveProject = () => {
    const projectData = {
      nodes,
      edges,
      selectedNode,
      mode,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleSaveProject} style={buttonStyle}>
      Save Project
    </button>
  );
};

// Un style de base (tu peux le déplacer dans un fichier CSS si tu veux)
const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

export default SaveProjectButton;

*/

 // Function to save the project
 const handleSaveProject = ( ) => {
  const projectData = {
    nodes,
    edges,
    selectedNode,
    mode
  };


  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
 
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'project-config.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default handleSaveProject;