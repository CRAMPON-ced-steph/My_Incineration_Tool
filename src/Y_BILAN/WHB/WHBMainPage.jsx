import React, { useState, useRef } from 'react';
import WHB_Parameters from './1_WHB_Parameters_ML';
import WHBFlueGasParameters from './2_WHB_Flue_gas_ML';
import WHBFlueGasPollutantEmission from './3_WHB_Pollutant_Emission_ML';
import WHBDesign from './4_WHB_Design_ML';
import TurbineCalculator from './6_WHB_ValoVapeur3_ML';
import CalculateurChaudiere from './7_Various_boiler_calculations_ML';
import WHB_Report from './WHB_Report';

import '../../index.css';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const WHBMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr', nodeId }) => {
  // Get translations
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const [innerData, setInnerData] = useState(nodeData.result);

  // Valeurs amont capturées une fois au montage — stables à travers les changements d'onglet.
  // L'onglet Flue gas écrit innerData.T_OUT / FG_OUT_kg_h (sortie chaudière), ce qui écraserait
  // l'entrée lue par l'onglet Parameters. On fige donc l'entrée ici (le MainPage ne se démonte pas).
  const T_IN_upstream  = useRef(nodeData?.result?.T_OUT ?? 900).current;
  const FG_IN_upstream = useRef(nodeData?.result?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 }).current;

  const tabs = [
    {
      name: 'steamParameters',
      label: t('steamParameters'),
      content: (
        <WHB_Parameters
          innerData={innerData}
          setInnerData={setInnerData}
          upstreamT_IN={T_IN_upstream}
          upstreamFG_IN={FG_IN_upstream}
          currentLanguage={currentLanguage}
          nodeId={nodeId}
        />
      ),
    },
    {
      name: 'flueGases',
      label: t('flueGases'),
      content: (
        <WHBFlueGasParameters
          innerData={innerData}
          setInnerData={setInnerData}
          upstreamFG_IN={FG_IN_upstream}
          currentLanguage={currentLanguage}
          nodeId={nodeId}
        />
      )
    },
    {
      name: 'pollutantEmissions',
      label: t('pollutantEmissions'),
      content: (
        <WHBFlueGasPollutantEmission
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
          nodeId={nodeId}
        />
      ),
    },
    {
      name: 'steamValorization',
      label: t('steamValorization'),
      content: (
        <TurbineCalculator  
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      ),
    },
    {
      name: 'whbDesign',
      label: t('whbDesign'),
      content: (
        <WHBDesign 
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      )
    },
    {
      name: 'boilerDimensioning',
      label: t('boilerDimensioning'),
      content: (
        <CalculateurChaudiere
          innerData={innerData}
          setInnerData={setInnerData}
          currentLanguage={currentLanguage}
        />
      ),
    },
    {
      name: 'rapport',
      label: 'Rapport',
      content: <WHB_Report innerData={innerData} currentLanguage={currentLanguage} />,
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const renderTabContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active ? active.content : null;
  };

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
        P_OUT: innerData['P_out_mmCE'],

        activeNodes_Elec: innerData['activeNodes_Elec'],
        activeNodes_Eau: innerData['activeNodes_Eau'],
        activeNodes_Reactifs: innerData['activeNodes_Reactifs'],
        activeNodes_Energie: innerData['activeNodes_Energie'],
        activeNodes_CO2: innerData['activeNodes_CO2'],
        activeNodes_cout: innerData['activeNodes_cout']
      }
    });
  };

  const handleBackToFlow = () => {
    sendAllData();
    onGoBack(null);
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
        <h1>{t('wasteHeatBoilerConfiguration')}</h1>
        
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
            {t('backToFlow')}
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
            {t('sendData')}
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

export default WHBMainPage;