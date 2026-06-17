import React, { useState, useEffect } from 'react';
import SEP12FluegasSep from './SEP12_fluegas_sep';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SEP12_traduction';

const SEP12MainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData?.result || {});

  useEffect(() => {
  }, [currentLanguage]);

  const sendAllData = () => {
    if (!onSendData || typeof onSendData !== 'function') {
      alert('Error: Cannot send data. onSendData callback is missing.');
      return;
    }

    try {
      const dataToSend = {
        result: {
          FG_OUT_kg_h: innerData['FG_OUT_kg_h'] || { CO2: 0, H2O: 0, O2: 0, N2: 0 },
          T_OUT: innerData['T_OUT'] ?? 0,
          FG_flux2: innerData['FG_flux2'] || { CO2: 0, H2O: 0, O2: 0, N2: 0 },
          pct_flux1_SEP12: innerData['pct_flux1_SEP12'] ?? 50,
          P_OUT: innerData['P_out_mmCE'] ?? 0,

          PollutantInput: innerData['PInput'] || {},
          PollutantOutput: innerData['Poutput'] || {},
          ResidusOutput: innerData['Residus'] || {},
          MasseDechet: innerData['masse'] || 0,

          activeNodes_Elec: innerData['activeNodes_Elec'] || [],
          activeNodes_Eau: innerData['activeNodes_Eau'] || [],
          activeNodes_Reactifs: innerData['activeNodes_Reactifs'] || [],
          activeNodes_Energie: innerData['activeNodes_Energie'] || [],
          activeNodes_CO2: innerData['activeNodes_CO2'] || [],
          activeNodes_cout: innerData['activeNodes_cout'] || [],
        }
      };

      onSendData(dataToSend);
    } catch (error) {
      console.error('❌ Error sending data:', error);
      alert('Error sending data: ' + error.message);
    }
  };

  const handleBackToFlow = () => {
    sendAllData();
    if (onGoBack && typeof onGoBack === 'function') {
      onGoBack(null);
    }
  };

  return (
    <div className="cadre_pour_onglet_principal">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>{t('SEP12 — 1 to 2 Separator')}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleBackToFlow}
            style={{
              padding: '8px 16px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {t('Back to Flow')}
          </button>
          <button
            onClick={sendAllData}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {t('Send Data')}
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '8px',
          minHeight: '500px',
        }}
      >
        <SEP12FluegasSep
          innerData={innerData}
          currentLanguage={currentLanguage}
        />
      </div>
    </div>
  );
};

export default SEP12MainPage;
