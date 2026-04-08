import React, { useState, useEffect } from 'react';
import { performCalculation_SCRUBBER_option_TinTout } from './SCRUBBER_calculations';
import { performCalculation_SCRUBBER_option_TinTsat } from './SCRUBBER_calculations2';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import '../../index.css';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './STACK_traduction';


const SCRUBBER_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [Teau, set_T_eau] = useState(() => localStorage.getItem('Teau') || '15');
  const [T_amont_SCRUBBER, set_T_amont_SCRUBBER] = useState(() => localStorage.getItem('T_amont_SCRUBBER') || nodeData?.result?.dataFlow?.T || '50');
  const [PDC_aero, setPDC_aero] = useState(() => localStorage.getItem('PDC_aero') || '50');

  const [calculationResult_SCRUBBER, setCalculationResult] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [bilanType, setBilanType] = useState(() => localStorage.getItem('bilanType') || 'Tin=Tout');

    // Get current language code and translations
    const languageCode = getLanguageCode(currentLanguage);
    const t = translations[languageCode] || translations['en']; // fallback to English if language not found
  

  useEffect(() => { localStorage.setItem('Teau', Teau); }, [Teau]);
  useEffect(() => { localStorage.setItem('T_amont_SCRUBBER', T_amont_SCRUBBER); }, [T_amont_SCRUBBER]);
  useEffect(() => { localStorage.setItem('PDC_aero', PDC_aero); }, [PDC_aero]);
  useEffect(() => { localStorage.setItem('bilanType', bilanType); }, [bilanType]);
  useEffect(() => {
    if (calculationResult_SCRUBBER) {
      localStorage.setItem('calculationResult_SCRUBBER', JSON.stringify(calculationResult_SCRUBBER));
    }
  }, [calculationResult_SCRUBBER]);

  useEffect(() => {
    if (nodeData?.result) {
      try {
        if (bilanType === 'Tin=Tout') {
          const result = performCalculation_SCRUBBER_option_TinTout(nodeData, parseFloat(PDC_aero) || 0);
          setCalculationResult(result);
        }
        if (bilanType === 'Tin=Tsat') {
          const result = performCalculation_SCRUBBER_option_TinTsat(nodeData, parseFloat(Teau) || 0, parseFloat(T_amont_SCRUBBER) || 0, parseFloat(PDC_aero) || 0);
          setCalculationResult(result);
        }
      } catch (error) {
        console.error('Error recalculating with updated nodeData:', error);
      }
    }
  }, [nodeData, T_amont_SCRUBBER, Teau, PDC_aero, bilanType]);

  const handleSendData = () => {
    if (!nodeData?.result) {
      console.warn('No input data available');
      return;
    }

    try {
      if (bilanType === 'Tin=Tout') {
        const result = performCalculation_SCRUBBER_option_TinTout(nodeData, parseFloat(PDC_aero) || 0);
        setCalculationResult(result);
        onSendData({ result });
      }
      if (bilanType === 'Tin=Tsat') {
        const result = performCalculation_SCRUBBER_option_TinTsat(nodeData, parseFloat(Teau) || 0, parseFloat(T_amont_SCRUBBER) || 0, parseFloat(PDC_aero) || 0);
        setCalculationResult(result);
        onSendData({ result });
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);
    }
  };

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  const toggleBilanType = () => {
    setBilanType((prevType) => (prevType === 'Tin=Tout' ? 'Tin=Tsat' : 'Tin=Tout'));
  };

  const handleClearStorage = () => {
    localStorage.removeItem('Teau');
    localStorage.removeItem('T_amont_SCRUBBER');
    localStorage.removeItem('PDC_aero');
    localStorage.removeItem('bilanType');
    localStorage.removeItem('calculationResult_SCRUBBER');

    set_T_eau('15');
    set_T_amont_SCRUBBER(nodeData?.result?.dataFlow?.T || '50');
    setPDC_aero('50');
    setBilanType('Tin=Tout');
    setCalculationResult(null);
  };

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />

      <h3>{title} Parameters</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label>Scrubber input:</label>
        <button onClick={toggleBilanType} 
          className={`toggle-button ${bilanType === 'Tin=Tout' ? 'toggle-button--option1' : 'toggle-button--option2'}`}>
          {bilanType === 'Tin=Tout' ? 'Tin=Tout' : 'Tin=Tsat'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InputField label="T eau injectée" unit="[°C]" value={Teau} onChange={(e) => set_T_eau(e.target.value)} />

        {bilanType === 'Tin=Tsat' && <InputField label="Tamont" unit="[°C]" value={T_amont_SCRUBBER} onChange={(e) => set_T_amont_SCRUBBER(e.target.value)} />}
      
        <InputField label="PDC aero" unit="[mmCE]" value={PDC_aero} onChange={(e) => setPDC_aero(e.target.value)} />
      </div>

      <div className="prez-3-buttons">
        <button onClick={handleSendData}>Calculate and Send Data</button>
        <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
        <ClearButton onClick={handleClearStorage} />
      </div>

      {isSliderOpen && calculationResult_SCRUBBER && (
        <CalculationResults isOpen={isSliderOpen} results={calculationResult_SCRUBBER} />
      )}
    </div>
  );
};

export default SCRUBBER_Parameter_Tab;
