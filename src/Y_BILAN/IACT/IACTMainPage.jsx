import React, { useState } from 'react';
import IACTFlueGasParameters from './1_IACT_Flue_gas_ML';
import IACTFlueGasPollutantEmission from './2_IACT_Pollutant_Emission_ML';
import IACTDesign from './3_IACT_Design_ML';
import IACTOpex from './4_IACT_Opex';
import IACT_Report from './IACT_Report';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import '../../index.css';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './IACT_traduction';

const IACTMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);

  const tabs = [
    {
      name: t('Flue gases'),
      content: <IACTFlueGasParameters innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Pollutant Emissions'),
      content: <IACTFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Design'),
      content: <IACTDesign innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Opex'),
      content: <IACTOpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: 'Rapport',
      content: <IACT_Report innerData={innerData} />
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
        <h1>IACT Configuration</h1>
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

export default IACTMainPage;
