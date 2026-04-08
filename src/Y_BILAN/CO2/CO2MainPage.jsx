import React, { useState } from 'react';
import CaptureParameters from './1_Capture_Parameters';
//import CaptureQuench from './2_Capture_Quench';
//import CaptureAbsorption  from './3_Capture_Absorption';
//import CaptureDesorption from './4_Capture_Desorption';

//import CapturePurification from './5_Capture_Purification';
//import CaptureDesign from './6_Capture_Design';



// Ajout des composants manquants
//const MaterialBalance = () => <div>Material Balance Content</div>;
//const EnergyBalance = () => <div>Energy Balance Content</div>;
//const Emissions = () => <div>Emissions Content</div>;
//const Results = () => <div>Results Content</div>;

const CO2MainPage = ({ nodeData, title, onSendData, onClose, onGoBack }) => {
  const [innerData, setInnerData] = useState({});
  const tabs = [
    {name: 'Capture Parameters',content: (<CaptureParameters innerData={innerData} />),},
    //{name: 'Flue gases', content: < FlueGasParameters innerData={innerData}/> },

   // { name: 'Pollutant Emissions', content: <FlueGasPollutantEmission  innerData={innerData}/>,},
   // { name: 'Results', content: < Results innerData={innerData}/> },
  ];

  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState(tabs[0].name); // Onglet actif par défaut

  const renderTabContent = () => {
    const active = tabs.find((tab) => tab.name === activeTab);
    return active ? active.content : null;
  };

  const sendAllData = () => {
      onSendData({
        result: {
          FG_OUT_kg_h : innerData['FG_OUT_kg_h'],
          PollutantInput : innerData['PInput'],
         T_OUT : innerData['T_OUT'],
        }
      })
  };



  const handleCloseTab = () => {
    if (window.opener) {
      // Si l'onglet a été ouvert par window.open, on peut le fermer
      window.close();
    } else {
      // Sinon, affiche un message ou redirige
      alert('Cannot close this tab. Please close it manually.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>Rotary Kiln Configuration</h1>
        <button
          onClick={() => {onGoBack(null); sendAllData()}}
          style={{
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Flow
        </button>
        <button
          onClick={sendAllData}
          style={{
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
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

export default CO2MainPage;