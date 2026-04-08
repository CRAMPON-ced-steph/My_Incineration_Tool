import React, { useState, useEffect } from 'react';
import { performCalculation_DENOX_option_Qeau } from './DENOX_calculations';
import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './DENOX_traduction';

import '../../index.css';

const DENOX_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
    const [targetNOx, setTargetNOx] = useState(localStorage.getItem('targetNOx') || '150');
    const [sprayWaterTemp, setSprayWaterTemp] = useState(localStorage.getItem('sprayWaterTemp') || '15');
    const [coeffStoech, setCoeffStoech] = useState(localStorage.getItem('coeffStoech') || '1.2');
    const [solutionConc, setSolutionConc] = useState(localStorage.getItem('solutionConc') || '25');
    const [solutionDensity, setSolutionDensity] = useState(localStorage.getItem('solutionDensity') || '908');
    const [sprayFlowrate, setSprayFlowrate] = useState(localStorage.getItem('sprayFlowrate') || '15');
    const [pdc, setPdc] = useState(localStorage.getItem('pdc') || '50');
    const [calculationResult_DENOX, setCalculationResult] = useState(nodeData?.calculationResult || null);
    const [isSliderOpen, setIsSliderOpen] = useState(false);



          // Get current language code and translations
          const languageCode = getLanguageCode(currentLanguage);
          const t = translations[languageCode] || translations['en']; // fallback to English if language not found




    useEffect(() => {
        localStorage.setItem('targetNOx', targetNOx);
        localStorage.setItem('sprayWaterTemp', sprayWaterTemp);
        localStorage.setItem('coeffStoech', coeffStoech);
        localStorage.setItem('solutionConc', solutionConc);
        localStorage.setItem('solutionDensity', solutionDensity);
        localStorage.setItem('sprayFlowrate', sprayFlowrate);
        localStorage.setItem('pdc', pdc);
    }, [targetNOx, sprayWaterTemp, coeffStoech, solutionConc, solutionDensity, sprayFlowrate, pdc]);

    useEffect(() => {
        if (nodeData && !calculationResult_DENOX) {
            const initialResult = performCalculation_DENOX_option_Qeau(
                nodeData,
                parseFloat(targetNOx),
                parseFloat(sprayWaterTemp),
                parseFloat(coeffStoech),
                parseFloat(solutionConc),
                parseFloat(solutionDensity),
                parseFloat(sprayFlowrate),
                parseFloat(pdc)
            );
            setCalculationResult(initialResult);
        }
    }, [nodeData, calculationResult_DENOX, targetNOx, sprayWaterTemp, coeffStoech, solutionConc, solutionDensity, sprayFlowrate, pdc]);

    const handleSendData = () => {
        try {
            const result = performCalculation_DENOX_option_Qeau(
                nodeData,
                parseFloat(targetNOx),
                parseFloat(sprayWaterTemp),
                parseFloat(coeffStoech),
                parseFloat(solutionConc),
                parseFloat(solutionDensity),
                parseFloat(sprayFlowrate),
                parseFloat(pdc)
            );
            setCalculationResult(result);
            onSendData({ result });
        } catch (error) {
            console.error('Calculation error:', error);
            alert(`Error in calculation: ${error.message}`);
        }
    };

    const toggleSlider = () => setIsSliderOpen(!isSliderOpen);

    const clearMemory = () => {
        localStorage.clear();
        setCalculationResult(null);
    };

    return (
        <div className="container-box">
            <CloseButton onClose={onClose} />
            <h3>{title} Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <InputField
                    label="Target NOx Emission"
                    unit="[mg/Nm3]"
                    value={targetNOx}
                    onChange={(e) => setTargetNOx(e.target.value)}
                />
                <InputField
                    label="Spray water temperature"
                    unit="[°C]"
                    value={sprayWaterTemp}
                    onChange={(e) => setSprayWaterTemp(e.target.value)}
                />
                <InputField
                    label="Coefficient stoechiometric"
                    unit="[-]"
                    value={coeffStoech}
                    onChange={(e) => setCoeffStoech(e.target.value)}
                />
                <InputField
                    label="Commercial solution concentration"
                    unit="[%]"
                    value={solutionConc}
                    onChange={(e) => setSolutionConc(e.target.value)}
                />
                <InputField
                    label="Commercial solution relative density"
                    unit="[kg/m3]"
                    value={solutionDensity}
                    onChange={(e) => setSolutionDensity(e.target.value)}
                />
                <InputField
                    label="Spray flowrate"
                    unit="[l/h]"
                    value={sprayFlowrate}
                    onChange={(e) => setSprayFlowrate(e.target.value)}
                />
                <InputField
                    label="PDC"
                    unit="[mmCE]"
                    value={pdc}
                    onChange={(e) => setPdc(e.target.value)}
                />
            </div>
            <div className="prez-3-buttons">
                <button onClick={handleSendData}>Calculate and Send Data</button>
                <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
                <ClearButton onClick={clearMemory} />
            </div>
            {isSliderOpen && calculationResult_DENOX && (
                <CalculationResults
                    isOpen={isSliderOpen}
                    results={calculationResult_DENOX}
                />
            )}
        </div>
    );
};

export default DENOX_Parameter_Tab;
