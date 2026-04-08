import React, { useState, useEffect } from 'react';
import { performCalculation_COOLINGTOWER_option_T } from './COOLINGTOWER_calculations';
import { performCalculation_COOLINGTOWER_option_Qeau } from './COOLINGTOWER_calculations';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import '../../index.css';

const COOLINGTOWER_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  
  const [Teau, setTeau] = useState(() => parseFloat(localStorage.getItem('Teau')) || 15);
  const [T_amont_COOLINGTOWER, setT_amont_COOLINGTOWER] = useState(() => parseFloat(localStorage.getItem('T_amont_COOLINGTOWER')) || (nodeData?.result?.dataFlow?.T || 0));
  const [Qeau, setQeau] = useState(() => parseFloat(localStorage.getItem('Qeau')) || 0);
  const [calculationResult_COOLINGTOWER, setCalculationResult] = useState(null);

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [bilanType, setBilanType] = useState(() => localStorage.getItem('bilanType') || 'Tf'); 

  // Sauvegarde dans le localStorage
  useEffect(() => { localStorage.setItem('Teau', Teau); }, [Teau]);
  useEffect(() => { localStorage.setItem('T_amont_COOLINGTOWER', T_amont_COOLINGTOWER); }, [T_amont_COOLINGTOWER]);
  useEffect(() => { localStorage.setItem('Qeau', Qeau); }, [Qeau]);
  useEffect(() => { localStorage.setItem('bilanType', bilanType); }, [bilanType]);
  useEffect(() => { if (calculationResult_COOLINGTOWER) { localStorage.setItem('calculationResult_COOLINGTOWER', JSON.stringify(calculationResult_COOLINGTOWER)); } }, [calculationResult_COOLINGTOWER]);

  // Calcul à chaque changement de paramètre
  useEffect(() => {
    if (nodeData?.result) {
      try {
        if (bilanType === 'Tf') {
          const result = performCalculation_COOLINGTOWER_option_T(nodeData, parseFloat(T_amont_COOLINGTOWER), parseFloat(Teau));
          setCalculationResult(result);
        }
        if (bilanType === 'Qeau') {
          const result = performCalculation_COOLINGTOWER_option_Qeau(nodeData, parseFloat(Qeau), parseFloat(Teau));
          setCalculationResult(result);
        }
      } catch (error) {
        console.error('Error recalculating with updated nodeData:', error);
      }
    }
  }, [nodeData, T_amont_COOLINGTOWER, Teau, Qeau, bilanType]);

  const handleSendData = () => {
    if (!nodeData?.result) {
      console.warn('No input data available');
      return;
    }

    try {
      let result;
      if (bilanType === 'Tf') {
        result = performCalculation_COOLINGTOWER_option_T(nodeData, parseFloat(T_amont_COOLINGTOWER), parseFloat(Teau));
      }
      if (bilanType === 'Qeau') {
        result = performCalculation_COOLINGTOWER_option_Qeau(nodeData, parseFloat(Qeau), parseFloat(Teau));
      }
      setCalculationResult(result);
      onSendData({ result });
    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);
    }
  };

  const toggleSlider = () => {
    setIsSliderOpen(!isSliderOpen);
  };

  const toggleBilanType = () => {
    setBilanType((prevType) => (prevType === 'Tf' ? 'Qeau' : 'Tf'));
  };

  // Fonction pour réinitialiser le localStorage
  const clearMemory = () => {
    localStorage.removeItem('Teau');
    localStorage.removeItem('T_amont_COOLINGTOWER');
    localStorage.removeItem('Qeau');
    localStorage.removeItem('bilanType');
    localStorage.removeItem('calculationResult_COOLINGTOWER');
    setTeau(15);  // Réinitialise l'état après avoir vidé le localStorage
    setT_amont_COOLINGTOWER(0);
    setQeau(0);
    setBilanType('Tf');
    setCalculationResult(null);
  };

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />

      <h3>{title} Parameters</h3>




      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Bilan Type:</label>
          <button onClick={toggleBilanType} 
          className={`toggle-button ${bilanType === 'Tf' ? 'toggle-button--option1' : 'toggle-button--option2'}`}>
           {bilanType === 'Tf' ? 'Bilan par T' : 'Bilan par Qeau'}
          </button>
        </div>








      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InputField label="T eau injectée" unit="[°C]" value={Teau} onChange={(e) => setTeau(parseFloat(e.target.value) || 15)} />
        {bilanType === 'Tf' && (
          <InputField label="T fumées amont" unit="[°C]" value={T_amont_COOLINGTOWER} onChange={(e) => setT_amont_COOLINGTOWER(parseFloat(e.target.value) || 0)} />
        )}
        {bilanType === 'Qeau' && (
          <InputField label="Q eau" unit="[kg/h]" value={Qeau} onChange={(e) => setQeau(parseFloat(e.target.value) || 0)} />
        )}
      </div>

      <div className="prez-3-buttons">
        <button onClick={handleSendData}>Calculate and Send Data</button>
        <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
        <ClearButton onClick={clearMemory} />
      </div>

      {isSliderOpen && calculationResult_COOLINGTOWER && (
        <CalculationResults isOpen={isSliderOpen} results={calculationResult_COOLINGTOWER} />
      )}
    </div>
  );
};

export default COOLINGTOWER_Parameter_Tab;