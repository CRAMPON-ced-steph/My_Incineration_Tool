import React, { useState } from 'react';
import CombustionParameters from './1_CombustionParameters1';
//import CombustionParameters from './1_Combustion_essai';
import FlueGasParameters from './2_Flue_gas1';
import FlueGasPollutantEmission from './3_Pollutant_Emission1';
import RKDesign from './4_RK_Design1';
import RKopex from './5_RK_Opex';
import RK_Report from './RK_Report';

//OPEX sans le cout

import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import '../../index.css';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './RK_traduction';

const RKMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  const [innerData, setInnerData] = useState(nodeData.result || {});
  
  // Get current language code and translations
  const languageCode = getLanguageCode(currentLanguage);
  const t = translations[languageCode] || translations['fr']; // fallback to French if language not found
  
  const tabs = [
    {
      name: 'combustionParameters',
      label: t.combustionParameters || 'Combustion Parameters',
      content: (
        <CombustionParameters 
          innerData={innerData} 
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      ),
    },
    {
      name: 'flueGases',
      label: t.flueGases || 'Flue gases',
      content: (
        <FlueGasParameters 
          innerData={innerData} 
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: 'pollutantEmissions',
      label: t.pollutantEmissions || 'Pollutant Emissions',
      content: (
        <FlueGasPollutantEmission 
          innerData={innerData} 
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      ),
    },
    {
      name: 'design',
      label: t.design || 'Design',
      content: (
        <RKDesign 
          innerData={innerData} 
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: 'opex',
      label: t.opex || 'Opex',
      content: (
        <RKopex
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: 'rapport',
      label: t.rapport || 'Rapport',
      content: (
        <RK_Report
          innerData={innerData}
          currentLanguage={currentLanguage}
        />
      )
    },
  ];

  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0].name); // Onglet actif par défaut
  
  const renderTabContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active ? active.content : null;
  };

  const sendAllData = () => {
    if (!onSendData || typeof onSendData !== 'function') {
      console.error('❌ ERROR: onSendData callback is not defined or is not a function!');
      alert('Error: Cannot send data. onSendData callback is missing.');
      return;
    }
    
    try {
      const dataToSend = {
        result: {
          ...innerData,
          // aliases for downstream nodes
          PollutantInput: innerData['PInput'] || {},
          PollutantOutput: innerData['Poutput'] || {},
          ResidusOutput: innerData['Residus'] || {},
          MasseDechet: innerData['masse'] || 0,
          P_OUT: innerData['P_out_mmCE'] || 0,
          activeNodes_Elec: innerData['activeNodes_Elec'] || [],
          activeNodes_Eau: innerData['activeNodes_Eau'] || [],
          activeNodes_Reactifs: innerData['activeNodes_Reactifs'] || [],
          activeNodes_Energie: innerData['activeNodes_Energie'] || [],
          activeNodes_CO2: innerData['activeNodes_CO2'] || [],
          activeNodes_cout: innerData['activeNodes_cout'] || []
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
        <h1>{t.title || 'Rotary Kiln and SCC Configuration'}</h1>
        
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
              fontSize: '14px',
            }}
          >
            {t.backToFlow || 'Back to Flow'}
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
              fontSize: '14px',
            }}
          >
            {t.sendData || 'Send Data'}
          </button>
        </div>
      </div>

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
              flex: 1, // Répartition équitable de l'espace
              minWidth: '120px', // Largeur minimale
              fontSize: '14px',
              transition: 'all 0.3s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{ 
          padding: '20px', 
          background: '#f9f9f9', 
          borderRadius: '8px',
          minHeight: '500px' // Hauteur minimale pour le contenu
        }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default RKMainPage;