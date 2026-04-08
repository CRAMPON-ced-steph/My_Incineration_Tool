import React, { useState, useEffect } from 'react';
import { performCalculation_RK } from './RK_calculations1';
import { performCalculation_RK_with_WHB } from './RK_calculations2';
import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';
import '../../index.css';

import {getTranslatedParameter, getLanguageCode} from '../../F_Gestion_Langues/Fonction_Traduction';
import {translations} from './RK_traduction';

const RK_Parameter_Tab = ({ nodeData, title, onSendData, onClose, currentLanguage }) => {


  const [Tair_RK_C, setTair_RK_C] = useState(localStorage.getItem('Tair_RK_C') || '15');
  const [Thermal_losses_MW, setThermal_losses_MW] = useState(localStorage.getItem('Thermal_losses_MW') || '2');
  const [NCV_kcal_kg, setNCV_kcal_kg] = useState(localStorage.getItem('NCV_kcal_kg') || '2200');
  const [Masse_dechet_kg_h, setMasse_dechet_kg_h] = useState(localStorage.getItem('Masse_dechet_kg_h') || '6000');

  const [calculationResult_RK, setCalculationResult_RK] = useState(null);
  const [bilanType_NCV_Masse, setBilanType_NCV_Masse] = useState(localStorage.getItem('bilanType_NCV_Masse') || 'Net Calorific Value');
  const [bilanType_whb, setBilanType_whb] = useState(localStorage.getItem('bilanType_whb') || 'With WHB');
  const [isSliderOpen, setIsSliderOpen] = useState(false);


  // Get current language code and translations
  const languageCode = getLanguageCode(currentLanguage);
  const t = translations[languageCode] || translations['en']; // fallback to English if language not found

  useEffect(() => {
    const saveToLocalStorage = () => {
      localStorage.setItem('Tair_RK_C', Tair_RK_C);
      localStorage.setItem('Thermal_losses_MW', Thermal_losses_MW);
      localStorage.setItem('NCV_kcal_kg', NCV_kcal_kg);
      localStorage.setItem('Masse_dechet_kg_h', Masse_dechet_kg_h);
      localStorage.setItem('bilanType_NCV_Masse', bilanType_NCV_Masse);
      localStorage.setItem('bilanType_whb', bilanType_whb);
    };
    saveToLocalStorage();
  }, [Tair_RK_C, Thermal_losses_MW, NCV_kcal_kg, Masse_dechet_kg_h, bilanType_NCV_Masse, bilanType_whb]);

  useEffect(() => {
    if (calculationResult_RK) {
      localStorage.setItem('calculationResult_RK', JSON.stringify(calculationResult_RK));
    }
  }, [calculationResult_RK]);







  const handleSendData = () => {
    let result;
    
    if (bilanType_whb === 'With WHB') {
      result = performCalculation_RK_with_WHB(
        nodeData,
        parseFloat(Tair_RK_C),
        parseFloat(Thermal_losses_MW),
        parseFloat(NCV_kcal_kg),
        parseFloat(Masse_dechet_kg_h),
        bilanType_NCV_Masse
      );
    } else {
      result = performCalculation_RK(
        nodeData,
        parseFloat(Tair_RK_C),
        parseFloat(Thermal_losses_MW),
        parseFloat(NCV_kcal_kg),
        parseFloat(Masse_dechet_kg_h),
        bilanType_NCV_Masse
      );
    }
    setCalculationResult_RK(result);
    onSendData({ result });
  };






  
  const toggleSlider = () => setIsSliderOpen(!isSliderOpen);
  
  const toggleBilanType_NCV_Masse = () => {
    setBilanType_NCV_Masse(prev => prev === 'Net Calorific Value' ? 'Waste flowrate' : 'Net Calorific Value');
  };

  const toggleBilanType_whb = () => {
    setBilanType_whb(prev => prev === 'With WHB' ? 'Without WHB' : 'With WHB');
  };

  const clearMemory = () => {
    localStorage.clear();
    setCalculationResult_RK(null);
  };

  // Reusable toggle button component
  const ToggleButton = ({ label, value, options, onChange }) => (
    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
      <label style={{ marginRight: '10px' }}>{label}:</label>
      <button 
        onClick={onChange}
        className={`toggle-button ${value === options[0] ? 'toggle-button--option1' : 'toggle-button--option2'}`}
      >
        {value}
      </button>
    </div>
  );

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />
      <h3>{t.Parametres} {title}</h3>

      <div className="toggle-container">
        <ToggleButton 
          label={t.BilanTyp}
          value={bilanType_whb}
          options={['With WHB', 'Without WHB']}
          onChange={toggleBilanType_whb}
        />
      </div>
      
      <div className="inputs-container">
        <InputField 
          label={t.Tair} 
          unit="[°C]" 
          value={Tair_RK_C} 
          onChange={(e) => setTair_RK_C(e.target.value || '900')}
        />
        <InputField 
          label={t.PertesThermiques} 
          unit="[MW]" 
          value={Thermal_losses_MW} 
          onChange={(e) => setThermal_losses_MW(e.target.value || '2')}
        />

        <div className="toggle-container">
          <ToggleButton 
            label={t.BilanTyp}
            value={bilanType_NCV_Masse}
            options={['Net Calorific Value', 'Waste flowrate']}
            onChange={toggleBilanType_NCV_Masse}
          />
        </div>

        {bilanType_NCV_Masse === 'Net Calorific Value' ? (
          <InputField 
            label={t.PCI}
            unit="[kcal/kg]" 
            value={NCV_kcal_kg} 
            onChange={(e) => setNCV_kcal_kg(e.target.value || '0')}
          />
        ) : (
          <InputField 
            label={t.DebitDechets}
            unit="[kg/h]" 
            value={Masse_dechet_kg_h} 
            onChange={(e) => setMasse_dechet_kg_h(e.target.value || '0')}
          />
        )}
      </div>

      <div className="prez-3-buttons">
        <button onClick={handleSendData}>{t.calculer_et_envoyer_data}</button>
        <ShowResultButton 
          isOpen={isSliderOpen} 
          onToggle={toggleSlider}
          currentLanguage={currentLanguage}
        />
        <ClearButton 
          onClick={clearMemory}
          currentLanguage={currentLanguage}
        />
      </div>

      {isSliderOpen && calculationResult_RK && (
        <CalculationResults 
          isOpen={isSliderOpen} 
          results={calculationResult_RK}
          currentLanguage={currentLanguage}
        />
      )}
    </div>
  );
};

export default RK_Parameter_Tab;