import React, { useState } from 'react';
import { getLanguageCode } from '../F_Gestion_Langues/Fonction_Traduction';

const LABELS = {
  fr: { calculate: 'Calculer et envoyer données', calculating: 'Calcul en cours...' },
  en: { calculate: 'Calculate and Send Data',     calculating: 'Calculating...' },
  es: { calculate: 'Calcular y Enviar Datos',     calculating: 'Calculando...' },
  de: { calculate: 'Berechnen und Daten Senden',  calculating: 'Berechnung läuft...' },
  it: { calculate: 'Calcola e Invia Dati',        calculating: 'Calcolo in corso...' },
  pt: { calculate: 'Calcular e Enviar Dados',     calculating: 'Calculando...' },
  ar: { calculate: 'احسب وأرسل البيانات',         calculating: 'جاري الحساب...' },
  ru: { calculate: 'Вычислить и отправить данные', calculating: 'Вычисление...' },
  ja: { calculate: '計算してデータ送信',            calculating: '計算中...' },
  zh: { calculate: '计算并发送数据',               calculating: '计算中...' },
};

const CalculateSendButton = ({ onClick, disabled, currentLanguage, isCalculating }) => {
  const [sent, setSent] = useState(false);
  const code = getLanguageCode(currentLanguage);
  const t = LABELS[code] || LABELS.en;

  const handleClick = async () => {
    setSent(false);
    try {
      await onClick();
      setSent(true);
    } catch {
      setSent(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={isCalculating ? 'button-loading' : ''}
      style={{
        color: sent && !isCalculating ? '#16a34a' : undefined,
        fontWeight: sent && !isCalculating ? 'bold' : undefined,
      }}
    >
      {isCalculating ? t.calculating : t.calculate}
    </button>
  );
};

export default CalculateSendButton;
