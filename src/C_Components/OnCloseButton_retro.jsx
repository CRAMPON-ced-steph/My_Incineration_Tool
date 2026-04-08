import React from 'react';

const CloseButton = ({ onClose }) => {
  const buttonStyle = {
    position: 'absolute',
    right: '10px',
    top: '10px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer'
  };

  return (
    <button onClick={onClose} style={buttonStyle}>
      ✕
    </button>
  );
};

export default CloseButton;