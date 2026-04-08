
import React from 'react';

const Input_bilan = ({ input, handleChange, currentLanguage = 'fr', translations }) => {
  // DEBUG - Ajoutez ces lignes
  console.log('=== DEBUG Input_bilan ===');
  console.log('currentLanguage:', currentLanguage);
  console.log('translations:', translations);
  console.log('translations[currentLanguage]:', translations?.[currentLanguage]);
  console.log('Clés de input:', Object.keys(input));
  
  // Fonction de traduction générique
  const t = (key) => {
    if (!translations) {
      console.log(`⚠️ Pas de translations pour la clé: ${key}`);
      return key;
    }
    
    const translated = translations[currentLanguage]?.[key] || translations['fr']?.[key] || key;
    console.log(`Traduction de "${key}":`, translated);
    return translated;
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