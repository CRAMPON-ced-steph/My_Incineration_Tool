

import React from 'react';

const DropdownField = ({ label, value, onChange, unit, options }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <label style={{ color: 'black', width: '300px' }}>
        {label} {unit}:
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{ 
          width: 'auto',
          minWidth: '60px',
          maxWidth: '1000px'
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownField;