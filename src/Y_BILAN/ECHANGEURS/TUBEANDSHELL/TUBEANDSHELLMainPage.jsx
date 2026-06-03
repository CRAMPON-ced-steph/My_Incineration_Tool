/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react';
import TubeAndShellParameters from './1_TUBEANDSHELL_Parameters';
import '../../../index.css';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './TubeShell_traduction';

const TUBEANDSHELLMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const [innerData] = useState(nodeData?.result || {});

  // Valeurs amont capturées une fois au montage — stables à travers les changements d'onglet
  const T_IN_upstream  = useRef(nodeData?.result?.T_OUT ?? 200).current;
  const FG_IN_upstream = useRef(nodeData?.result?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 }).current;
  const P_IN_upstream  = useRef(nodeData?.result?.P_OUT ?? 0).current;

  const tabs = [
    {
      name: t('TubeShell Parameters'),
      content: (
        <TubeAndShellParameters
          innerData={innerData}
          upstreamT_IN={T_IN_upstream}
          upstreamFG_IN={FG_IN_upstream}
          upstreamP_IN={P_IN_upstream}
          currentLanguage={currentLanguage}
        />
      ),
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const sendAllData = () => {
    const upstream = nodeData?.result || {};
    onSendData({
      result: {
        ...innerData,
        PollutantInput:       upstream['PInput']         || upstream['PollutantInput']  || {},
        PollutantOutput:      upstream['Poutput']        || upstream['PollutantOutput'] || {},
        ResidusOutput:        upstream['Residus']        || upstream['ResidusOutput']   || {},
        MasseDechet:          upstream['masse']          || upstream['MasseDechet']     || 0,
        T_OUT:                innerData?.T_OUT           ?? 0,
        P_OUT:                innerData?.P_OUT           ?? 0,
        activeNodes_Elec:     upstream['activeNodes_Elec']     || [],
        activeNodes_Eau:      upstream['activeNodes_Eau']      || [],
        activeNodes_Reactifs: upstream['activeNodes_Reactifs'] || [],
        activeNodes_Energie:  upstream['activeNodes_Energie']  || [],
        activeNodes_CO2:      upstream['activeNodes_CO2']      || [],
        activeNodes_cout:     upstream['activeNodes_cout']     || [],
      },
    });
  };

  return (
    <div className="cadre_pour_onglet_principal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Tube &amp; Shell Configuration</h1>
        <button
          onClick={() => { onGoBack(null); sendAllData(); }}
          style={{ padding: '8px 16px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Retour au Flow
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.name ? '#4a90e2' : 'white',
              color: activeTab === tab.name ? 'white' : '#333',
              border: 'none',
              borderBottom: activeTab === tab.name ? '2px solid #4a90e2' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.name ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        {tabs.find((tab) => tab.name === activeTab)?.content}
      </div>
    </div>
  );
};

export default TUBEANDSHELLMainPage;
