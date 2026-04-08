
import React, { useState, useEffect } from 'react';
import { performCalculation_IDFAN } from './IDFAN_calculations';
import { performCalculation_IDFAN2 } from './IDFAN_calculations2';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import {getTranslatedParameter, getLanguageCode} from '../../F_Gestion_Langues/Fonction_Traduction';
import {translations} from './REACTOR_traduction';


import '../../index.css';

const IDFAN_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
    const [calculationResult_IDFAN, setCalculationResult] = useState(nodeData?.calculationResult || null);
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [Type, setType] = useState(localStorage.getItem('Type') || 'OFF');

    // Input parameters with default values
    const [P_amont, setP_amont] = useState(() => localStorage.getItem('P_amont') || -250);
    const [Rdt_elec, setRdt_elec] = useState(() => localStorage.getItem('Rdt_elec') || 70);

          // Get current language code and translations
          const languageCode = getLanguageCode(currentLanguage);
          const t = translations[languageCode] || translations['en']; // fallback to English if language not found

    useEffect(() => {
        if (nodeData && !calculationResult_IDFAN) {
            const initialResult = performCalculation_IDFAN(nodeData, parseFloat(P_amont), parseFloat(Rdt_elec));
            setCalculationResult(initialResult);
        }
    }, [nodeData, calculationResult_IDFAN]);

    useEffect(() => {
        localStorage.setItem('Type', Type);
    }, [Type]);

    useEffect(() => {
        // Recalculate if P_amont or Rdt_elec changes
        let result;
        if (Type === 'OFF') {
            result = performCalculation_IDFAN(nodeData, parseFloat(P_amont), parseFloat(Rdt_elec));
        } else {
            result = performCalculation_IDFAN2(nodeData, parseFloat(P_amont), parseFloat(Rdt_elec));
        }
        setCalculationResult(result); // Update calculation result
    }, [P_amont, Rdt_elec, nodeData, Type]);

    const handleSendData = () => {
        try {
            let result;
            if (Type === 'OFF') {
                result = performCalculation_IDFAN(nodeData, parseFloat(P_amont), parseFloat(Rdt_elec));
            } else {
                result = performCalculation_IDFAN2(nodeData, parseFloat(P_amont), parseFloat(Rdt_elec));
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

    const toggleType = () => {
        setType(prev => prev === 'ON' ? 'OFF' : 'ON');
    };

    const clearMemory = () => {
        localStorage.clear();
        setCalculationResult(null);
    };

    return (
        <div className="container-box">
            <CloseButton onClose={onClose} />

            <h3>{title} Parameters</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              

                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginLeft: '10px' }}>Dissipation de l'énergie :</label>
                    <button
                        onClick={toggleType}
                        className={`toggle-button ${Type === 'OFF' ? 'toggle-button--option1' : 'toggle-button--option2'}`}
                    >
                        {Type}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <InputField label="Pression amont" unit="[mmCE]" value={P_amont} onChange={(e) => setP_amont(e.target.value)} />
                    <InputField label="Rendement électrique" unit="[%]" value={Rdt_elec} onChange={(e) => setRdt_elec(e.target.value)} />
                </div>
            </div>

            <div className="prez-3-buttons">
                <button onClick={handleSendData}>Calculate and Send Data</button>
                <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
                <ClearButton onClick={clearMemory} />
            </div>

            {isSliderOpen && calculationResult_IDFAN && (
                <CalculationResults isOpen={isSliderOpen} results={calculationResult_IDFAN} />
            )}
        </div>
    );
};

export default IDFAN_Parameter_Tab;
