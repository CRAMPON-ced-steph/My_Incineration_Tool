import React, { useState, useMemo } from 'react';
//import REACTOR_Parameters from './1_REACTOR_Parameters';
import REACTORFlueGasParameters from './1_REACTOR_Flue_gas_ML';
import REACTORFlueGasPollutantEmission  from './2_REACTOR_Pollutant_Emission_ML';
import REACTORDesign from './3_REACTOR_Design_ML';
import REACTOROpex from './4_REACTOR_Opex_ML';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './REACTOR_traduction';

import '../../index.css';

import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import '../../index.css';

const REACTORMainPage = ({ nodeData, title, onSendData, onClose, onGoBack,  currentLanguage = 'fr' }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    const lang = languageCode || 'fr';
    return translations[lang]?.[key] || translations['fr']?.[key] || key;
  };

  const [innerData, setInnerData] = useState(nodeData.result);
  const [activeTab, setActiveTab] = useState(0); // Utiliser l'indice plutôt que le nom
  
  // ===== RECALCUL DES ONGLETS QUAND LA LANGUE CHANGE =====
  const tabs = useMemo(() => [
    {
      name: t('flueGases'),
      content: <REACTORFlueGasParameters innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('pollutantEmissions'),
      content: <REACTORFlueGasPollutantEmission innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('design'),
      content: <REACTORDesign innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
    {
      name: t('opex'),
      content: <REACTOROpex innerData={innerData} setInnerData={setInnerData} currentLanguage={currentLanguage} />
    },
  ], [currentLanguage, innerData, t]);

  const [isActive, setIsActive] = useState(true);

  const renderTabContent = () => {
    return tabs[activeTab]?.content || null;
  };

  const sendAllData = () => {
    onSendData({
      result: {
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
        <h1>{t('stackConfiguration')}</h1>
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
          {t('backToFlow')}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #ddd',
          marginBottom: '20px',
        }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.name}
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

export default REACTORMainPage;