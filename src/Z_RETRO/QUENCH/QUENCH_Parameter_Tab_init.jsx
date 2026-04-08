import React, { useState, useEffect } from 'react';
import { performCalculation_QUENCH_option_T } from './QUENCH_calculations';
import { performCalculation_QUENCH_option_Qeau } from './QUENCH_calculations2';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import {getTranslatedParameter, getLanguageCode} from '../../F_Gestion_Langues/Fonction_Traduction';
import {translations} from './REACTOR_traduction';


import '../../index.css';

const QUENCH_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [Teau, setParam3] = useState(() => localStorage.getItem('Teau') || '15');
  const [T_amont_QUENCH, setParam1] = useState(() => localStorage.getItem('T_amont_QUENCH') || nodeData?.result?.dataFlow?.T|| '10');
  const [Qeau, setParam2] = useState(() => localStorage.getItem('Qeau') || 0);
  const [PDC_aero, setPDC_aero] = useState(() => localStorage.getItem('PDC_aero') || '10');
  const [calculationResult_QUENCH, setCalculationResult] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [bilanType, setBilanType] = useState(() => localStorage.getItem('bilanType') || 'Tf');

      // Get current language code and translations
      const languageCode = getLanguageCode(currentLanguage);
      const t = translations[languageCode] || translations['en']; // fallback to English if language not found

  useEffect(() => { localStorage.setItem('Teau', Teau); }, [Teau]);
  useEffect(() => { localStorage.setItem('T_amont_QUENCH', T_amont_QUENCH); }, [T_amont_QUENCH]);
  useEffect(() => { localStorage.setItem('Qeau', Qeau); }, [Qeau]);
  useEffect(() => { localStorage.setItem('PDC_aero', PDC_aero); }, [PDC_aero]);
  useEffect(() => { localStorage.setItem('bilanType', bilanType); }, [bilanType]);
  useEffect(() => { if (calculationResult_QUENCH) { localStorage.setItem('calculationResult_QUENCH', JSON.stringify(calculationResult_QUENCH)); }}, [calculationResult_QUENCH]);

  useEffect(() => {
    if (nodeData?.result) {
      try {
        const result = bilanType === 'Tf'
          ? performCalculation_QUENCH_option_T(nodeData, parseFloat(T_amont_QUENCH) || 0, parseFloat(Teau) || 0, parseFloat(PDC_aero) || 0 )
          : performCalculation_QUENCH_option_Qeau(nodeData, parseFloat(Qeau) || 0, parseFloat(Teau) || 0, parseFloat(PDC_aero) || 0 );
        setCalculationResult(result);
      } catch (error) {
        console.error('Error recalculating with updated nodeData:', error);
      }
    }
  }, [nodeData, T_amont_QUENCH, Teau, Qeau, bilanType]);

  const handleSendData = () => {
    if (!nodeData?.result) {
      console.warn('No input data available');
      return;
    }
    try {
      const result = bilanType === 'Tf'
        ? performCalculation_QUENCH_option_T(nodeData, parseFloat(T_amont_QUENCH) || 0, parseFloat(Teau) || 0, parseFloat(PDC_aero) || 0 )
        : performCalculation_QUENCH_option_Qeau(nodeData, parseFloat(Qeau) || 0, parseFloat(Teau) || 0, parseFloat(PDC_aero) || 0 );
      setCalculationResult(result);
      onSendData && onSendData({ result });
    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);
    }
  };

  const toggleSlider = () => setIsSliderOpen(!isSliderOpen);
  const toggleBilanType = () => setBilanType(prevType => (prevType === 'Tf' ? 'Qeau' : 'Tf'));

  const clearMemory = () => {
    localStorage.clear();
    setParam3('15');
    setParam1(nodeData.result.dataFlow.T);
    setParam2(0);
    setPDC_aero('10');
    setBilanType('Tf');
    setCalculationResult(null);
  };

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />
      <h3>{title} Parameters</h3>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>Bilan Type:</label>
        <button onClick={toggleBilanType} className={`toggle-button ${bilanType === 'Tf' ? 'toggle-button--tf' : 'toggle-button--qeau'}`}>
        {bilanType === 'Tf' ? 'Bilan par T' : 'Bilan par Qeau'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InputField label="T eau injectée" unit="[°C]" value={Teau} onChange={e => setParam3(e.target.value)} />
        {bilanType === 'Tf' && <InputField label="T fumées amont" unit="[°C]" value={T_amont_QUENCH} onChange={e => setParam1(e.target.value)} />}
        {bilanType === 'Qeau' && <InputField label="Q eau" unit="[kg/h]" value={Qeau} onChange={e => setParam2(e.target.value)} />}
        <InputField label="PDC aero" unit="[mmCE]" value={PDC_aero} onChange={e => setPDC_aero(e.target.value)} />
      </div>

      <div className="prez-3-buttons">
        <button onClick={handleSendData}>Calculate and Send Data</button>
        <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
        <ClearButton onClick={clearMemory} />
      </div>
      {isSliderOpen && calculationResult_QUENCH && <CalculationResults isOpen={isSliderOpen} results={calculationResult_QUENCH} />}
    </div>
  );
};

export default QUENCH_Parameter_Tab;
