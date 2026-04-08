import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

const ToggleButton = ({ label = 'Toggle Status', toggled, onToggle }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '2vh',
    padding: '20px',
  };

  const trackStyle = {
    width: '40px',
    height: '4px',
    backgroundColor: 'white',
    borderRadius: '4px',
    marginLeft: '10px',
    position: 'relative',
  };

  const buttonStyle = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: toggled ? '#3b82f6' : '#e5e7eb',
    position: 'absolute',
    top: '50%',
    left: toggled ? 'calc(100% - 20px)' : '0',
    transform: 'translateY(-50%)',
  };

  const textStyle = {
     width: '150px', // Add fixed width here
    marginRight: '10px',
    fontSize: '16px',
    textAlign: 'left',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <span style={textStyle}>{label}</span>
      <div style={trackStyle}>
        <motion.div style={buttonStyle} onClick={() => onToggle(!toggled)}>
          {toggled ? <Plus size={24} color="white" /> : <Minus size={24} color="black" />}
        </motion.div>
      </div>
    </div>
  );
};

export default ToggleButton;