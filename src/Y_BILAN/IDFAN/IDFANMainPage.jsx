
import React, { useState, useRef } from 'react';
//import IDFAN_Parameters from './1_IDFAN_Parameters';
import IDFANFlueGasParameters from './1_IDFAN_Flue_gas1_ML';
import IDFANFlueGasPollutantEmission  from './2_IDFAN_Pollutant_Emission_ML';
//import IDFANDesign from './3_IDFAN_Design';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './IDFAN_traduction';


import IDFANOpex from './4_IDFAN_Opex';
import IDFAN_Report from './IDFAN_Report';



import '../../index.css';


const IDFANMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr', nodeId  }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const [innerData, setInnerData] = useState(nodeData.result);

  // Valeurs amont capturées une fois au montage — stables à travers les changements d'onglet
  const T_IN_upstream  = useRef(nodeData?.result?.T_OUT ?? 200).current;
  const FG_IN_upstream = useRef(nodeData?.result?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 }).current;
  const P_IN_upstream  = useRef(nodeData?.result?.P_OUT ?? 0).current;

  const tabs = [
  //{name: 'Steam Parameters',content: (<IDFAN_Parameters innerData={innerData} />),},
  {name: t('Flue gases'), content: <IDFANFlueGasParameters
    innerData={innerData}
    setInnerData={setInnerData}
    upstreamT_IN={T_IN_upstream}
    upstreamFG_IN={FG_IN_upstream}
    upstreamP_IN={P_IN_upstream}
    currentLanguage={currentLanguage}
    nodeId={nodeId}
  /> },
  {name: t('Pollutant Emissions'), content: <IDFANFlueGasPollutantEmission  innerData={innerData}setInnerData={setInnerData}currentLanguage={currentLanguage} nodeId={nodeId}/>,},
 // {name: 'Design', content: < IDFANDesign innerData={innerData}/> },

 //{name: 'Design', content: < IDFANDesign innerData={innerData}setInnerData={setInnerData}/> },
 {name: t('Opex'), content: < IDFANOpex innerData={innerData}setInnerData={setInnerData}currentLanguage={currentLanguage} nodeId={nodeId} /> },
 {name: t('Rapport'), content: <IDFAN_Report innerData={innerData} currentLanguage={currentLanguage} nodeId={nodeId} />},

  ];

  const [activeTab, setActiveTab] = useState(tabs[0].name); // Onglet actif par défaut

  const renderTabContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active ? active.content : null;
  };



  const sendAllData = () => {
    onSendData({
      result: {
        ...innerData,
        FG_OUT_kg_h : innerData['FG_OUT_kg_h'],
        PollutantInput : innerData['PInput'],
        T_OUT : innerData['T_OUT'],
        PollutantOutput :   innerData['Poutput'],
        ResidusOutput : innerData['Residus'],
        MasseDechet : innerData['masse'],
        P_OUT: innerData['P_out_mmCE'],

        activeNodes_Elec: innerData['activeNodes_Elec'],
        activeNodes_Eau: innerData['activeNodes_Eau'],
        activeNodes_Reactifs: innerData['activeNodes_Reactifs'],
        activeNodes_Energie: innerData['activeNodes_Energie'],
        activeNodes_CO2: innerData['activeNodes_CO2'],
        activeNodes_cout: innerData['activeNodes_cout']








      }
    })
};









//  const TEST = nodeData.innerData.FG_CO2_kg_h;


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
        <h1>{t('IDFAN Configuration')}</h1>
        <button
          onClick={() =>{onGoBack(null); sendAllData()}}
          style={{
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {t('Back to Flow')}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #ddd',
          marginBottom: '20px',
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
              width: '2000px', 
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div
        style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default IDFANMainPage;
