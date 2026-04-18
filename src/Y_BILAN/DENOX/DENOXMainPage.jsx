import React, { useState, useEffect } from 'react';
import DENOXFlueGasParameters from './1_DENOX_Flue_gas_ML';
import DENOXFlueGasPollutantEmission from './2_DENOX_Pollutant_Emission_ML';
import DENOXDesign from './3_DENOX_Design1_ML';
import DENOXOpex from './4_DENOX_Opex';
import DENOX_Report from './DENOX_Report';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import '../../index.css';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './DENOX_traduction';

const DENOXMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);
  const [activeTab, setActiveTab] = useState(0);

  // Réinitialise le tab au premier onglet quand la langue change
  useEffect(() => {
    setActiveTab(0);
  }, [currentLanguage]);

  const tabs = [
    {
      name: t('Flue gases'),
      content: <DENOXFlueGasParameters innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Pollutant Emissions'),
      content: <DENOXFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Design'),
      content: <DENOXDesign innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Opex'),
      content: <DENOXOpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: 'Rapport',
      content: <DENOX_Report innerData={innerData} />
    },
  ];

  const renderTabContent = () => {
    return tabs[activeTab]?.content || null;
  };

  const sendAllData = () => {
    onSendData({
      result: {
        ...innerData,
        FG_OUT_kg_h: innerData['FG_DENOX_out_reheating_kg_h'],
        PollutantInput: innerData['PInput'],
        T_OUT: innerData['T_melange_calcule'],
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
        <h1>{t('DENOX Configuration')}</h1>
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

export default DENOXMainPage;