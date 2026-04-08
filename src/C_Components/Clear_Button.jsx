import React from 'react';

const ClearButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      style={{ 
        background: '#FF5733', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        padding: '8px 16px', 
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }}
    >
      Clear Memory
    </button>
  );
};

export default ClearButton;