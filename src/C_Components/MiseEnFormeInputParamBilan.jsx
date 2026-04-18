
import React from 'react';

const Input_bilan = ({ input, handleChange, currentLanguage = 'fr', translations }) => {
  // Fonction de traduction générique
  const t = (key) => {
    if (!translations) return key;
    return translations[currentLanguage]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <div>
      {Object.entries(input).map(([key, value]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <label
            style={{
              flex: '1',
              marginRight: '10px',
              textAlign: 'right',
              fontWeight: 'bold',
            }}
          >
            {t(key)}:
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(key, Number(e.target.value))}
            style={{
              flex: '0 0 100px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Input_bilan;