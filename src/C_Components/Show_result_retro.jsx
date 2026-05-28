import React from 'react';
import { getLanguageCode } from '../F_Gestion_Langues/Fonction_Traduction';

const LABELS = {
  fr: { show: 'Afficher résultats',   hide: 'Masquer résultats' },
  en: { show: 'Show Results',         hide: 'Hide Results' },
  es: { show: 'Mostrar Resultados',   hide: 'Ocultar Resultados' },
  de: { show: 'Ergebnisse Anzeigen',  hide: 'Ergebnisse Verbergen' },
  it: { show: 'Mostra Risultati',     hide: 'Nascondi Risultati' },
  pt: { show: 'Mostrar Resultados',   hide: 'Ocultar Resultados' },
  ar: { show: 'إظهار النتائج',        hide: 'إخفاء النتائج' },
  ru: { show: 'Показать результаты',  hide: 'Скрыть результаты' },
  ja: { show: '結果を表示',            hide: '結果を非表示' },
  zh: { show: '显示结果',             hide: '隐藏结果' },
};

const ShowResultButton = ({ isOpen, onToggle, currentLanguage, disabled }) => {
  const code = getLanguageCode(currentLanguage);
  const t = LABELS[code] || LABELS.en;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      style={{
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {isOpen ? t.hide : t.show}
    </button>
  );
};

export default ShowResultButton;
