import React from 'react';

const ShowResultButton = ({ isOpen, onToggle }) => {
  return (
    <button 
      onClick={onToggle}
      style={{ 
        background: '#4CAF50', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        padding: '8px 16px', 
        cursor: 'pointer'
      }}
    >
      {isOpen ? 'Hide Results' : 'Show Results'}
    </button>
  );
};

export default ShowResultButton;