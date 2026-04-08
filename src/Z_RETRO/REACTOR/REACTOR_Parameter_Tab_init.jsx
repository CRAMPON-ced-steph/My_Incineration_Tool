import React, { useState, useEffect } from 'react';
import { performCalculation_REACTOR } from './REACTOR_calculations';

import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import ToggleButton from '../../C_Components/toggle_button_retro';

import InputField from '../../C_Components/input_retro';
import '../../index.css';

import {getTranslatedParameter, getLanguageCode} from '../../F_Gestion_Langues/Fonction_Traduction';
import {translations} from './REACTOR_traduction';


const REACTOR_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [T_amont_REACTOR, setT_amont_REACTOR] = useState(() => localStorage.getItem('T_amont_REACTOR') || nodeData?.result?.dataFlow?.T || '10');
  const [T_air, setT_air] = useState(() => localStorage.getItem('T_air') || '20');
  const [PDC_aero, setPDC_aero] = useState(() => localStorage.getItem('PDC_aero') || '20');
  
  const [Besoin_air_pulverisation_lime_Nm3_kg, setBesoin_air_pulverisation_lime_Nm3_kg] = useState(
    () => localStorage.getItem('Besoin_air_pulverisation_lime_Nm3_kg') || '0.5');
  const [Concentration_Lime_kg_lime_Nm3_FG, setConcentration_Lime_kg_lime_Nm3_FG] = useState(
    () => localStorage.getItem('Concentration_Lime_kg_lime_Nm3_FG') || '0.1');
  const [Besoin_air_pulverisation_cap_Nm3_kg, setBesoin_air_pulverisation_cap_Nm3_kg] = useState(
    () => localStorage.getItem('Besoin_air_pulverisation_cap_Nm3_kg') || '0.5');
  const [Concentration_cap_mg_cap_Nm3_FG, setConcentration_cap_mg_cap_Nm3_FG] = useState(
    () => localStorage.getItem('Concentration_cap_mg_cap_Nm3_FG') || '0.1');


  const [calculationResult_REACTOR, setCalculationResult_REACTOR] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);


  const [reagentType, setreagentType] = useState(localStorage.getItem('reagentType') || 'CAP');

    // Get current language code and translations
    const languageCode = getLanguageCode(currentLanguage);
    const t = translations[languageCode] || translations['en']; // fallback to English if language not found
  


  useEffect(() => {
    // Paramètres communs
    localStorage.setItem('T_amont_REACTOR', T_amont_REACTOR);
    localStorage.setItem('T_air', T_air);
    localStorage.setItem('PDC_aero', PDC_aero);
    localStorage.setItem('reagentType', reagentType);
  
    // Paramètres spécifiques selon le type de réactif
    localStorage.setItem('Besoin_air_pulverisation_lime_Nm3_kg', Besoin_air_pulverisation_lime_Nm3_kg);
    localStorage.setItem('Concentration_Lime_kg_lime_Nm3_FG', Concentration_Lime_kg_lime_Nm3_FG);
    localStorage.setItem('Besoin_air_pulverisation_cap_Nm3_kg', Besoin_air_pulverisation_cap_Nm3_kg);
    localStorage.setItem('Concentration_cap_mg_cap_Nm3_FG', Concentration_cap_mg_cap_Nm3_FG);

    localStorage.setItem('reagentType', reagentType);

  }, [
    T_amont_REACTOR, 
    T_air, 
    PDC_aero, 
    reagentType,
    Besoin_air_pulverisation_lime_Nm3_kg, 
    Concentration_Lime_kg_lime_Nm3_FG,
    Besoin_air_pulverisation_cap_Nm3_kg,
    Concentration_cap_mg_cap_Nm3_FG, reagentType
  ]);

  const handleSendData = () => {
    try {
      const result = performCalculation_REACTOR(
        nodeData,
        parseFloat(T_amont_REACTOR),
        parseFloat(T_air),
        parseFloat(PDC_aero),
        reagentType,
        parseFloat(Besoin_air_pulverisation_lime_Nm3_kg),
        parseFloat(Besoin_air_pulverisation_cap_Nm3_kg), 
        parseFloat(Concentration_cap_mg_cap_Nm3_FG)
        );
        setCalculationResult_REACTOR(result);
        onSendData({ result });
    } catch (error) {
      console.error('Calculation error:', error);
      alert(error.message);
    }
  };

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  const togglereagentType = () => {
    setreagentType(prev => prev === 'CAP' ? 'LIME' : 'CAP');
  };



  const clearMemory = () => {
    setT_amont_REACTOR( nodeData?.result?.dataFlow?.T || '10');
    setT_air('20');
    setPDC_aero('20');
    setBesoin_air_pulverisation_lime_Nm3_kg('0.5');
    setConcentration_Lime_kg_lime_Nm3_FG('0.1');
    setBesoin_air_pulverisation_cap_Nm3_kg('0.5');
    setConcentration_cap_mg_cap_Nm3_FG('0.1');
    setCalculationResult_REACTOR(null);
    localStorage.clear();
  };

  return (
    <div className="container-box">    
      <CloseButton onClose={onClose} />
      <h3>{title} Parameters</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InputField 
          label="T fumées amont" 
          unit="[°C]" 
          value={T_amont_REACTOR} 
          onChange={(e) => setT_amont_REACTOR(e.target.value)} 
        />
        <InputField 
          label="T air" 
          unit="[°C]" 
          value={T_air} 
          onChange={(e) => setT_air(e.target.value)} 
        />
        <InputField 
          label="PDC aero" 
          unit="[mmCE]" 
          value={PDC_aero} 
          onChange={(e) => setPDC_aero(e.target.value)} 
        />


        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
  <      label style={{ marginleft: '10px' }}>Bilan Type :</label>
        <button 
          onClick={togglereagentType}
          className={`toggle-button ${reagentType === 'CAP' ? 'toggle-button--tf' : 'toggle-button--qeau'}`}
        >
          {reagentType}
        </button>
      </div>





        {reagentType === 'LIME' && (
          <>
            <InputField 
              label="Besoin air pulverisation chaux" 
              unit="[Nm³/kg]" 
              value={Besoin_air_pulverisation_lime_Nm3_kg} 
              onChange={(e) => setBesoin_air_pulverisation_lime_Nm3_kg(e.target.value)} 
            />
            <InputField 
              label="Concentration chaux" 
              unit="[kg lime/Nm³ FG]" 
              value={Concentration_Lime_kg_lime_Nm3_FG} 
              onChange={(e) => setConcentration_Lime_kg_lime_Nm3_FG(e.target.value)} 
            />
          </>
        )}
        
        {reagentType === 'CAP' && (
          <>
            <InputField 
              label="Besoin air pulverisation CAP" 
              unit="[Nm³/kg]" 
              value={Besoin_air_pulverisation_cap_Nm3_kg} 
              onChange={(e) => setBesoin_air_pulverisation_cap_Nm3_kg(e.target.value)} 
            />
            <InputField 
              label="Concentration CAP" 
              unit="[kg cap/Nm³ FG]" 
              value={Concentration_cap_mg_cap_Nm3_FG} 
              onChange={(e) => setConcentration_cap_mg_cap_Nm3_FG(e.target.value)} 
            />
          </>
        )}
      </div>

      <div className="prez-3-buttons">
        <button onClick={handleSendData}>Calculate and Send Data</button>
        <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
        <ClearButton onClick={clearMemory} />
      </div>

      {isSliderOpen && calculationResult_REACTOR && (
        <CalculationResults isOpen={isSliderOpen} results={calculationResult_REACTOR} />
      )}
    </div>
  );
};

export default REACTOR_Parameter_Tab;