import React, { useState, useEffect } from 'react';
import SEP21FlueGasMixer from './SEP21_fluegas_mixer';
import SEP21FlueGasPollutantEmission from './SEP21_Pollutant_Emission';

import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SEP21_traduction';

const SEP21MainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData?.result || {});
  const [activeTab, setActiveTab] = useState('flueGasMixer');

  // Mettre à jour automatiquement quand currentLanguage change
  useEffect(() => {
    // Force la mise à jour du composant
  }, [currentLanguage]);

  // Configuration des tabs
  const tabs = [
    {
      name: 'flueGasMixer',
      label: t('Flue Gas Mixer'),
      content: (
        <SEP21FlueGasMixer 
          innerData={innerData} 
          setInnerData={setInnerData}
          currentLanguage={currentLanguage} 
        />
      ),
    },
    {
      name: 'pollutantEmissions',
      label: t('Pollutant Emissions'),
      content: (
        <SEP21FlueGasPollutantEmission 
          innerData={innerData} 
          setInnerData={setInnerData}
          currentLanguage={currentLanguage} 
        />
      ),
    },
  ];

  const renderTabContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active ? active.content : null;
  };

  const sendAllData = () => {
    console.log('=== SEP21 SENDING DATA ===');
    console.log('innerData:', innerData);

    if (!onSendData || typeof onSendData !== 'function') {
      console.error('❌ ERROR: onSendData callback is not defined or is not a function!');
      alert('Error: Cannot send data. onSendData callback is missing.');
      return;
    }

    try {
      const dataToSend = {
        result: {
          // Gaz de combustion en sortie
          FG_OUT_kg_h: innerData['FG_OUT_kg_h'] || { CO2: 0, H2O: 0, O2: 0, N2: 0 },
          T_OUT: innerData['T_OUT'] || 0,
          FG_humide_tot: innerData['FG_humide_tot'] || 0,
          FG_sec_tot: innerData['FG_sec_tot'] || 0,

          // Polluants (si applicables)
          PollutantInput: innerData['PInput'] || {},
          PollutantOutput: innerData['Poutput'] || {},
          ResidusOutput: innerData['Residus'] || {},
          MasseDechet: innerData['masse'] || 0,
          P_OUT: innerData['P_out_mmCE'] || 0,

          // Consommations et émissions
          activeNodes_Elec: innerData['activeNodes_Elec'] || [],
          activeNodes_Eau: innerData['activeNodes_Eau'] || [],
          activeNodes_Reactifs: innerData['activeNodes_Reactifs'] || [],
          activeNodes_Energie: innerData['activeNodes_Energie'] || [],
          activeNodes_CO2: innerData['activeNodes_CO2'] || [],
          activeNodes_cout: innerData['activeNodes_cout'] || []
        }
      };

      console.log('✅ Data to send:', dataToSend);
      onSendData(dataToSend);
      console.log('✅ Data sent successfully!');
    } catch (error) {
      console.error('❌ Error sending data:', error);
      alert('Error sending data: ' + error.message);
    }
  };

  const handleBackToFlow = () => {
    console.log('Going back to flow...');
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
        <h1>{t('SEP21 - Flue Gas Mixer')}</h1>
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

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #ddd',
          marginBottom: '20px',
          flex: 1,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.name ? '#4a90e2' : 'white',
              color: activeTab === tab.name ? 'white' : '#333',
              border: 'none',
              borderBottom:
                activeTab === tab.name
                  ? '2px solid #4a90e2'
                  : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.name ? 'bold' : 'normal',
              flex: 1,
              minWidth: '120px',
              fontSize: '14px',
              transition: 'all 0.3s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{ 
          padding: '20px', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          minHeight: '500px'
        }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SEP21MainPage;