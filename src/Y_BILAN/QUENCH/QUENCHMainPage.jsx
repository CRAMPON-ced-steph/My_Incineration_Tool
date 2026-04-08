import React, { useState } from 'react';
import QUENCHFlueGasParameters from './2_QUENCH_Flue_gas_ML';
import QUENCHFlueGasPollutantEmission from './3_QUENCH_Pollutant_Emission_ML';
import QUENCHDesign from './4_QUENCH_Design1_ML';
import QUENCHOpex from './5_QUENCH_Opex';

import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import '../../index.css';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './QUENCH_traduction';

const QUENCHMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {

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
    console.warn(`Translation missing for key: "${key}" in language: ${languageCode}`);
    return key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);

  const tabs = [
    {
      name: t('Flue gases'),
      content: <QUENCHFlueGasParameters innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Pollutant Emissions'),
      content: <QUENCHFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Design'),
      content: <QUENCHDesign innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Opex'),
      content: <QUENCHOpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
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
        <h1>{t('QUENCH Configuration')}</h1>
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

export default QUENCHMainPage;