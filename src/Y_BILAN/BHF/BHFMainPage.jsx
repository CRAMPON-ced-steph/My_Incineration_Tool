import React, { useState } from 'react';
import BHFFlueGasParameters from './1_BHF_Flue_gas_ML';
import BHFFlueGasPollutantEmission from './2_BHF_Pollutant_Emission_ML';
import BHFDesign from './3_BHF_Design_ML';
import BHFOpex from './4_BHF_Opex';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import '../../index.css';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './BHF_traduction';

const BHFMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);

  const tabs = [
    {
      name: t('Flue gases'),
      content: <BHFFlueGasParameters innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Pollutant Emissions'),
      content: <BHFFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Design'),
      content: <BHFDesign innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Opex'),
      content: <BHFOpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
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
        <h1>{t('BHF Configuration')}</h1>
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

export default BHFMainPage;