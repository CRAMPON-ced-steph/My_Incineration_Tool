import React from 'react';
import { getLanguageCode } from '../F_Gestion_Langues/Fonction_Traduction';

const LABELS = {
  fr: 'Effacer',
  en: 'Clear',
  es: 'Limpiar',
  de: 'Löschen',
  it: 'Cancella',
  pt: 'Limpar',
  ar: 'مسح',
  ru: 'Очистить',
  ja: 'クリア',
  zh: '清除',
};

const ClearButton = ({ onClick, currentLanguage, disabled }) => {
  const code = getLanguageCode(currentLanguage);
  const label = LABELS[code] || LABELS.en;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: '#FF5733',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 0.3s',
      }}
    >
      {label}
    </button>
  );
};

export default ClearButton;
