import React from 'react';

const InputField = ({ label, value, onChange, unit }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label style={{ color: 'black', width: '300px' }}>
        {label} {unit}:
      </label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        style={{ 
          width: 'auto',
          minWidth: '60px',
          maxWidth: '1000px'
        }}
      />
    </div>
  );
};

export default InputField;