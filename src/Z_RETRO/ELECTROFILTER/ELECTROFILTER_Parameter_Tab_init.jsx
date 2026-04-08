
import React, { useState, useEffect } from 'react';
import { performCalculation_ELECTROFILTER } from './ELECTROFILTER_calculations';

import  InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';


import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './ELECTROFILTER_traduction';

import '../../index.css';

const ELECTROFILTER_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [Qair_decolmatation, setQair_decolmatation] = useState(() => localStorage.getItem('Qair_decolmatation') || '0');
  const [T_air_decolmatation, setT_air_decolmatation] = useState(() => localStorage.getItem('T_air_decolmatation') || '15');
  const [T_amont_ELECTROFILTER, setT_amont_ELECTROFILTER] = useState(() => localStorage.getItem('T_amont_ELECTROFILTER') ||  nodeData?.result?.dataFlow?.T|| '10');
  const [PDC_aero, setPDC_aero] = useState(() => localStorage.getItem('PDC_aero') || '100');



  const [CalculationResult_ELECTROFILTER, setCalculationResult] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);


          // Get current language code and translations
          const languageCode = getLanguageCode(currentLanguage);
          const t = translations[languageCode] || translations['en']; // fallback to English if language not found




  useEffect(() => { localStorage.setItem('Qair_decolmatation', Qair_decolmatation); }, [Qair_decolmatation]);
  useEffect(() => { localStorage.setItem('T_air_decolmatation', T_air_decolmatation); }, [T_air_decolmatation]);
  useEffect(() => { localStorage.setItem('T_amont_ELECTROFILTER', T_amont_ELECTROFILTER); }, [T_amont_ELECTROFILTER]);
  useEffect(() => { localStorage.setItem('PDC_aero', PDC_aero); }, [PDC_aero]);

  useEffect(() => {
    if (CalculationResult_ELECTROFILTER) {
      localStorage.setItem('CalculationResult_ELECTROFILTER', JSON.stringify(CalculationResult_ELECTROFILTER));
    }
  }, [CalculationResult_ELECTROFILTER]);

  const handleSendData = () => {
    if (!nodeData?.result) {
      console.warn('No input data available');
      return;
    }
    try {
      const result = performCalculation_ELECTROFILTER(nodeData, parseFloat(T_air_decolmatation) || 0, parseFloat(Qair_decolmatation) || 0, parseFloat(T_amont_ELECTROFILTER) || 0, parseFloat(PDC_aero) || 0);
      setCalculationResult(result);
      onSendData({ result });
    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);
    }
  };

  const clearMemory = () => {
    localStorage.removeItem('Qair_decolmatation');
    localStorage.removeItem('T_air_decolmatation');
    localStorage.removeItem('T_amont_ELECTROFILTER');
    localStorage.removeItem('CalculationResult_ELECTROFILTER');
    localStorage.removeItem('PDC_aero');
    setQair_decolmatation('0');
    setT_air_decolmatation('15');
    setPDC_aero('0');
    setT_amont_ELECTROFILTER( nodeData.result.dataFlow.T|| '10');
    setCalculationResult(null);
  };

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  return (
    <div className="container-box">
               <CloseButton onClose={onClose} />
               <h3>{title} Parameters</h3>
               

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InputField label="Qair_decolmatation" unit="[m³/h]" value={Qair_decolmatation} onChange={(e) => setQair_decolmatation(parseFloat(e.target.value) || 0)}/>
        <InputField label="Tair" unit="[°C]" value={T_air_decolmatation} onChange={(e) => setT_air_decolmatation(parseFloat(e.target.value) || 0)}/>
        <InputField label="T fumées amont" unit="[°C]" value={T_amont_ELECTROFILTER} onChange={(e) => setT_amont_ELECTROFILTER(parseFloat(e.target.value) || 0)}/>
        <InputField label="PDC aero" unit="[mmCE]" value={PDC_aero} onChange={(e) => setPDC_aero(e.target.value)} />
      </div>

        <div className="prez-3-buttons">
                <button onClick={handleSendData}>Calculate and Send Data</button>
                <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
                <ClearButton onClick={clearMemory} />
            </div>


{isSliderOpen && CalculationResult_ELECTROFILTER && (
        <CalculationResults isOpen={isSliderOpen} results={CalculationResult_ELECTROFILTER} />
      )}


    </div>
  );
};

export default ELECTROFILTER_Parameter_Tab;

