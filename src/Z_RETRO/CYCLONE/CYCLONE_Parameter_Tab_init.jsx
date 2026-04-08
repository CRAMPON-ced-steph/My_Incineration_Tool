

import React, { useState, useEffect } from 'react';
import { performCalculation_CYCLONE } from './CYCLONE_calculations';

import  InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';


import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './ELECTROFILTER_traduction';



import '../../index.css';


const CYCLONE_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [Qair_parasite, setQair_parasite] = useState(() => localStorage.getItem('Qair_parasite') || '0');
  const [T_air_parasite, setT_air_parasite] = useState(() => localStorage.getItem('T_air_parasite') || '15');
  const [T_amont_CYCLONE, setT_amont_CYCLONE] = useState(() => localStorage.getItem('T_amont_CYCLONE') || nodeData?.result?.dataFlow?.T|| '15');
  const [PDC_aero, setPDC_aero] = useState(() => localStorage.getItem('PDC_aero') || '10');


  const [CalculationResult_CYCLONE, setCalculationResult] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);



          // Get current language code and translations
          const languageCode = getLanguageCode(currentLanguage);
          const t = translations[languageCode] || translations['en']; // fallback to English if language not found



  useEffect(() => { localStorage.setItem('Qair_parasite', Qair_parasite); }, [Qair_parasite]);
  useEffect(() => { localStorage.setItem('T_air_parasite', T_air_parasite); }, [T_air_parasite]);
  useEffect(() => { localStorage.setItem('T_amont_CYCLONE', T_amont_CYCLONE); }, [T_amont_CYCLONE]);
  useEffect(() => { localStorage.setItem('PDC_aero', PDC_aero); }, [PDC_aero]);

  useEffect(() => {
    if (CalculationResult_CYCLONE) {localStorage.setItem('CalculationResult_CYCLONE', JSON.stringify(CalculationResult_CYCLONE));}}, [CalculationResult_CYCLONE]);

  useEffect(() => {
    if (nodeData?.result) {
      try {
        const result = performCalculation_CYCLONE(nodeData, parseFloat(T_air_parasite) || 0, parseFloat(Qair_parasite) || 0, parseFloat(T_amont_CYCLONE) || 0, parseFloat(PDC_aero) || 0);
        setCalculationResult(result);
      } catch (error) {console.error('Error recalculating with updated nodeData:', error);
      }}}, [nodeData, T_air_parasite, Qair_parasite, T_amont_CYCLONE]);

  const handleSendData = () => {
    if (!nodeData?.result) {
      console.warn('No input data available');
      return;
    }
    try {
      const result = performCalculation_CYCLONE(nodeData, parseFloat(T_air_parasite) || 0, parseFloat(Qair_parasite) || 0, parseFloat(T_amont_CYCLONE) || 0, parseFloat(PDC_aero) || 0);
      setCalculationResult(result);
      onSendData({ result });
    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);
    }
  };

  const clearMemory = () => {
    localStorage.removeItem('Qair_parasite');
    localStorage.removeItem('T_air_parasite');
    localStorage.removeItem('T_amont_CYCLONE');
    localStorage.removeItem('CalculationResult_CYCLONE');
    localStorage.removeItem('PDC_aero');
    setQair_parasite('0');
    setT_air_parasite('15');
    setPDC_aero('10');
    setT_amont_CYCLONE(nodeData.result.dataFlow.T);
    setCalculationResult(null);
  };

  const toggleSlider = () => {setIsSliderOpen(!isSliderOpen);};

  return (
    <div className="container-box">
     <CloseButton onClose={onClose} />
      <h3>{title} Parameters</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <InputField label="Qair_parasite" unit="[m³/h]" value={Qair_parasite} onChange={(e) => setQair_parasite(parseFloat(e.target.value) || 0)}/>
      <InputField label="Tair" unit="[°C]" value={T_air_parasite} onChange={(e) => setT_air_parasite(parseFloat(e.target.value) || 0)}/>
      <InputField label="T fumées amont" unit="[°C]" value={T_amont_CYCLONE} onChange={(e) => setT_amont_CYCLONE(parseFloat(e.target.value) || 0)}/>
      <InputField label="PDC aero" unit="[mmCE]" value={PDC_aero} onChange={(e) => setPDC_aero(e.target.value)} />
      </div>
      <div className="prez-3-buttons">
      <button onClick={handleSendData}>Calculate and Send Data</button>
      <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
      <ClearButton onClick={clearMemory} />
      </div>
      {isSliderOpen && CalculationResult_CYCLONE && (
      <CalculationResults isOpen={isSliderOpen} results={CalculationResult_CYCLONE} />
      )}
    </div>
  );
};

export default CYCLONE_Parameter_Tab;
