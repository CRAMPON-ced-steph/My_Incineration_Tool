import React, { useState, useEffect } from 'react';
import CYCLONEFlueGasParameters from './1_CYCLONE_Flue_gas_ML';
import CYCLONEFlueGasPollutantEmission from './2_CYCLONE_Pollutant_Emission_ML';
import CYCLONEDesign from './3_CYCLONE_Design_ML';
import CYCLONEOpex from './4_CYCLONE_Opex';
import CYCLONE_Report from './CYCLONE_Report';
import PrintButton from '../../C_Components/Windows_print';
import '../../index.css';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './CYCLONE_traduction';

const CYCLONEMainPage = ({ nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Mettre à jour automatiquement quand currentLanguage change
  useEffect(() => {
    // Force la mise à jour du composant en gardant l'index du tab actif
    setActiveTabIndex(activeTabIndex);
  }, [currentLanguage]);

  const tabs = [
    {
      name: t('Flue gases'),
      content: <CYCLONEFlueGasParameters innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Pollutant Emissions'),
      content: <CYCLONEFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Design'),
      content: <CYCLONEDesign innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('Opex'),
      content: <CYCLONEOpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: 'Rapport',
      content: <CYCLONE_Report innerData={innerData} />
    },
  ];

  const renderTabContent = () => {
    return tabs[activeTabIndex]?.content || null;
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
        <h1>{t('CYCLONE Configuration')}</h1>
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
            onClick={() => setActiveTabIndex(index)}
            style={{
              padding: '10px 20px',
              background: activeTabIndex === index ? '#4a90e2' : 'white',
              color: activeTabIndex === index ? 'white' : '#333',
              border: 'none',
              borderBottom:
                activeTabIndex === index
                  ? '2px solid #4a90e2'
                  : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTabIndex === index ? 'bold' : 'normal',
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

export default CYCLONEMainPage;