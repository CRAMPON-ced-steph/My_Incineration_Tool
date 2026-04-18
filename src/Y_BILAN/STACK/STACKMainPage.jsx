import React, { useState } from 'react';
import STACKFlueGasParameters from './1_STACK_Flue_gas_ML';
import STACKFlueGasPollutantEmission from './2_STACK_Pollutant_Emission_ML';
import STACKDesign from './3_STACK_Design2_ML';
import STACKOpex from './4_STACK_Opex_ML';
import STACK_Report from './STACK_Report';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './STACK_traduction';


const STACKMainPage = ({
  nodeData,
  title,
  onSendData,
  onClose,
  onGoBack,
  currentLanguage = 'fr'
}) => {



  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // State management
  const [innerData, setInnerData] = useState(nodeData.result);
  const [activeTab, setActiveTab] = useState(0);

  // Tab configuration with translated names
  const tabs = [
    {
      name: t('flueGases'),
      content: (
        <STACKFlueGasParameters
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: t('pollutantEmissions'),
      content: (
        <STACKFlueGasPollutantEmission
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: t('design'),
      content: (
        <STACKDesign
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: t('opex'),
      content: (
        <STACKOpex
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: 'Rapport',
      content: <STACK_Report innerData={innerData} />
    }
  ];

  // Get current tab content
  const renderTabContent = () => {
    return tabs[activeTab]?.content || null;
  };

  // Send data and navigate back
  const sendAllData = () => {
    onSendData({
      result: {
        ...innerData,
        FG_OUT_kg_h: innerData['FG_OUT_kg_h'],
        PollutantInput: innerData['PInput'],
        T_OUT: innerData['T_OUT'],
        PollutantOutput: innerData['Poutput'],
        ResidusOutput: innerData['Residus'],
        MasseDechet: innerData['masse'],
        activeNodes_Elec: innerData['activeNodes_Elec'],
        activeNodes_Eau: innerData['activeNodes_Eau'],
        activeNodes_Reactifs: innerData['activeNodes_Reactifs'],
        activeNodes_Energie: innerData['activeNodes_Energie'],
        activeNodes_CO2: innerData['activeNodes_CO2'],
        activeNodes_cout: innerData['activeNodes_cout']
      }
    });
  };

  // Handle back button click
  const handleBackClick = () => {
    onGoBack(null);
    sendAllData();
  };

  return (
    <div className="cadre_pour_onglet_principal">
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>{t('stackConfiguration')}</h1>
        <button
          onClick={handleBackClick}
          style={{
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {t('backToFlow')}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #ddd',
          marginBottom: '20px',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              padding: '10px 20px',
              background: activeTab === index ? '#4a90e2' : 'white',
              color: activeTab === index ? 'white' : '#333',
              border: 'none',
              borderBottom:
                activeTab === index
                  ? '2px solid #4a90e2'
                  : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === index ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s',
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '8px',
          minHeight: '400px',
        }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default STACKMainPage;