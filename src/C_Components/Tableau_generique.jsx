import React from 'react';
import PropTypes from 'prop-types';

const TableGeneric = ({ elements }) => {
  // Vérifie que des données valides sont fournies
  if (!elements || elements.length === 0) {
    return (
      <div style={{ color: 'red', fontWeight: 'bold' }}>
        Error: Please provide an array of objects with "text" and "value" properties.
      </div>
    );
  }

  // Fonction pour formater les valeurs numériques
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(3);
    }
    return value;
  };

  return (
    <table
      style={{
        borderCollapse: 'collapse',
        margin: '20px auto',
        width: '100%', // Étend le tableau sur toute la largeur
        textAlign: 'center',
        fontSize: '12px',
      }}
    >
      <tbody>
        {elements.map((element, index) => (
          <tr key={index}>
            <td
              style={{
                border: '1px double #000', // Double border
                padding: '2', // Pas d'espace
              }}
            >
              {element.text}
            </td>
            <td
              style={{
                border: '1px double #000', // Double border
                padding: '2', // Pas d'espace
              }}
            >
              {formatValue(element.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableGeneric;