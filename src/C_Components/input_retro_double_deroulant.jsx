// CODE VALABLE SI 2 ENTR2E

/*
const countryOptions = [
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Allemagne' },
  { value: 'es', label: 'Espagne' },
  { value: 'it', label: 'Italie' }
];
*/
/*
import React from 'react';

const DropdownField_double = ({ label, value, onChange, unit, options }) => {
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownField_double;*/

import React from 'react';

const CountryDropdown = ({ label, value, onChange, unit }) => {
  // Données des pays et leurs ratios d'électricité transformées en format valeur/label
  const countryOptions = [
    { value: 'AU', label: 'Australia', ratio: 656 },
    { value: 'AT', label: 'Austria', ratio: 250 },
    { value: 'BE', label: 'Belgium', ratio: 335 },
    { value: 'CA', label: 'Canada', ratio: 220 },
    { value: 'CN', label: 'China', ratio: 720 },
    { value: 'DK', label: 'Denmark', ratio: 881 },
    { value: 'EU', label: 'EU', ratio: 353 },
    { value: 'FI', label: 'Finland', ratio: 399 },
    { value: 'FR', label: 'France', ratio: 83 },
    { value: 'DE', label: 'Germany', ratio: 601 },
    { value: 'GR', label: 'Greece', ratio: 864 },
    { value: 'IE', label: 'Ireland', ratio: 784 },
    { value: 'IT', label: 'Italy', ratio: 667 },
    { value: 'JP', label: 'Japan', ratio: 483 },
    { value: 'LU', label: 'Luxembourg', ratio: 590 },
    { value: 'NL', label: 'Netherlands', ratio: 652 },
    { value: 'PT', label: 'Portugal', ratio: 525 },
    { value: 'KR', label: 'South Korea', ratio: 485 },
    { value: 'ES', label: 'Spain', ratio: 408 },
    { value: 'SE', label: 'Sweden', ratio: 87 },
    { value: 'GB', label: 'UK', ratio: 580 },
    { value: 'US', label: 'USA', ratio: 613 },
    { value: 'OT', label: 'Other', ratio: 0 }
  ];

  // Fonction pour obtenir le ratio à partir de la valeur sélectionnée
  const getRatioFromValue = (selectedValue) => {
    const country = countryOptions.find(country => country.value === selectedValue);
    return country ? country.ratio : 0;
  };

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
        {countryOptions.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountryDropdown;