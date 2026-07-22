import React, { useState, useRef } from 'react';
import WATER_INJECTIONFlueGasParameters from './2_WATER_INJECTION_Flue_gas_ML';
import WATER_INJECTIONFlueGasPollutantEmission from './3_WATER_INJECTION_Pollutant_Emission_ML';
import WATER_INJECTIONDesign from './4_WATER_INJECTION_Design1_ML';
import WATER_INJECTIONOpex from './5_WATER_INJECTION_Opex';
import WATER_INJECTION_Report from './WATER_INJECTION_Report';

import '../../index.css';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WATER_INJECTION_traduction';

const WATER_INJECTIONMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr', nodeId }) => {

  // ✅ FIX: Normaliser le code de langue
  const normalizeLanguageCode = (lang) => {
    if (!lang) return 'fr';
    const baseLang = lang.split('-')[0].toLowerCase(); // 'en-US' -> 'en'
    return baseLang === 'en' || baseLang === 'fr' ? baseLang : 'fr';
  };

  const languageCode = normalizeLanguageCode(currentLanguage);

  // ✅ FIX: Fonction de traduction robuste
  const t = (key) => {
    if (!key) return '';

    // Vérifier si la clé existe dans la langue courante
    if (translations[languageCode] && translations[languageCode][key]) {
      return translations[languageCode][key];
    }

    // Fallback vers le français
    if (translations['fr'] && translations['fr'][key]) {
      return translations['fr'][key];
    }

    // Si rien n'est trouvé, retourner la clé elle-même
    return key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);

  // Valeurs amont capturées une fois au montage — stables à travers les changements d'onglet.
  // On NE lit PAS innerData.T_OUT dans les onglets car l'onglet Flue gases y écrit sa T de sortie
  // (propagation aval), ce qui écraserait la T d'entrée à chaque re-montage d'onglet.
  const T_IN_upstream  = useRef(nodeData?.result?.T_OUT ?? 200).current;
  const FG_IN_upstream = useRef(nodeData?.result?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 }).current;

  const tabs = [
    {
      name: t('Flue gases'),
      content: <WATER_INJECTIONFlueGasParameters innerData={innerData} setInnerData={setInnerData} upstreamT_IN={T_IN_upstream} upstreamFG_IN={FG_IN_upstream} currentLanguage={currentLanguage} nodeId={nodeId} />
    },
    {
      name: t('Pollutant Emissions'),
      content: <WATER_INJECTIONFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} nodeId={nodeId} />
    },
    {
      name: t('Design'),
      content: <WATER_INJECTIONDesign innerData={innerData} setInnerData={setInnerData} upstreamT_IN={T_IN_upstream} currentLanguage={currentLanguage} nodeId={nodeId} />
    },
    {
      name: t('Opex'),
      content: <WATER_INJECTIONOpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} nodeId={nodeId} />
    },
    {
      name: 'Rapport',
      content: <WATER_INJECTION_Report innerData={innerData} nodeId={nodeId} currentLanguage={currentLanguage} />
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
    });
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
        <h1>{t('WATER INJECTION Configuration')}</h1>
        <button
          onClick={() => {
            onGoBack(null);
            sendAllData();
          }}
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
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #ddd',
          marginBottom: '20px',
          overflowX: 'auto',
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
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
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

export default WATER_INJECTIONMainPage;
