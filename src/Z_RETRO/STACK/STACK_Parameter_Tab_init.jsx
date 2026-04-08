import React, { useState, useEffect } from 'react';
import { performCalculation_STACK } from './STACK_calculations';
import InputField from '../../C_Components/input_retro';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';


import {getTranslatedParameter, getLanguageCode} from '../../F_Gestion_Langues/Fonction_Traduction';
//import {translations} from './STACK_traduction';


import '../../index.css';

const STACK_Parameter_Tab = ({ nodeData, title, onSendData, onClose , currentLanguage }) => {


    
    const [Tstack, setTstack] = useState(() => localStorage.getItem('Tstack') || (nodeData?.Tstack || 80));
    const [Qv_wet_Nm3_h, setQv_wet_Nm3_h] = useState(() => localStorage.getItem('Qv_wet_Nm3_h') || (nodeData?.Qv_wet_Nm3_h || 50000));
    const [O2_dry_pourcent, setO2_dry_pourcent] = useState(() => localStorage.getItem('O2_dry_pourcent') || (nodeData?.O2_dry_pourcent || 10));
    const [H2O_pourcent, setH2O_pourcent] = useState(() => localStorage.getItem('H2O_pourcent') || (nodeData?.H2O_pourcent || 30));
    const [CO2_dry_pourcent, setCO2_dry_pourcent] = useState(() => localStorage.getItem('CO2_dry_pourcent') || (nodeData?.CO2_dry_pourcent || 10));
    const [P_out_mmCE, setP_out_mmCE] = useState(() => localStorage.getItem('Pressions out') || (nodeData?.P_out_mmCE || 100));

    const [calculationResult, setCalculationResult] = useState(() => JSON.parse(localStorage.getItem('calculationResult')) || null);
    const [isSliderOpen, setIsSliderOpen] = useState(false);


  // Get current language code and translations
  const languageCode = getLanguageCode(currentLanguage);
  const t = translations[languageCode] || translations['en']; // fallback to English if language not found


    // Stockage local pour chaque état
    useEffect(() => { localStorage.setItem('Tstack', Tstack); }, [Tstack]);
    useEffect(() => { localStorage.setItem('Qv_wet_Nm3_h', Qv_wet_Nm3_h); }, [Qv_wet_Nm3_h]);
    useEffect(() => { localStorage.setItem('O2_dry_pourcent', O2_dry_pourcent); }, [O2_dry_pourcent]);
    useEffect(() => { localStorage.setItem('H2O_pourcent', H2O_pourcent); }, [H2O_pourcent]);
    useEffect(() => { localStorage.setItem('CO2_dry_pourcent', CO2_dry_pourcent); }, [CO2_dry_pourcent]);
    useEffect(() => { localStorage.setItem('Pression out', P_out_mmCE); }, [P_out_mmCE]);
    useEffect(() => { if (calculationResult) { localStorage.setItem('calculationResult', JSON.stringify(calculationResult)); }}, [calculationResult]);

    const handleSendData = () => {
        try {
            const parsedInputs = {
                Tstack: parseFloat(Tstack) || 0,
                Qv_wet_Nm3_h: parseFloat(Qv_wet_Nm3_h) || 0,
                O2_dry_pourcent: parseFloat(O2_dry_pourcent) || 0,
                H2O_pourcent: parseFloat(H2O_pourcent) || 0,
                CO2_dry_pourcent: parseFloat(CO2_dry_pourcent) || 0,
                P_out_mmCE: parseFloat(P_out_mmCE) || 0
            };

            const result = performCalculation_STACK(
                parsedInputs.Tstack,
                parsedInputs.Qv_wet_Nm3_h,
                parsedInputs.O2_dry_pourcent,
                parsedInputs.H2O_pourcent,
                parsedInputs.CO2_dry_pourcent,
                parsedInputs.P_out_mmCE
            );

            setCalculationResult(result);

            onSendData({
                result,
                inputData: parsedInputs,
            });
        } catch (error) {
            console.error('Erreur de calcul:', error);
            alert(`Erreur de calcul: ${error.message}`);
        }
    };

    // Effect pour recalculer dès qu'un paramètre change
    useEffect(() => {
        handleSendData();
    }, [Tstack, Qv_wet_Nm3_h, O2_dry_pourcent, H2O_pourcent, CO2_dry_pourcent, P_out_mmCE]);

    const toggleSlider = () => setIsSliderOpen(!isSliderOpen);

    return (
        <div className="container-box">
            <CloseButton onClose={onClose} />
            <h3>{title} Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <InputField label="T fumées" unit="[°C]" value={Tstack} onChange={(e) => setTstack(e.target.value)} />
                <InputField label="Qv fumees" unit="[Nm3/h]" value={Qv_wet_Nm3_h} onChange={(e) => setQv_wet_Nm3_h(e.target.value)} />
                <InputField label="O2 dry" unit="[%]" value={O2_dry_pourcent} onChange={(e) => setO2_dry_pourcent(e.target.value)} />
                <InputField label="H2O" unit="[%]" value={H2O_pourcent} onChange={(e) => setH2O_pourcent(e.target.value)} />
                <InputField label="CO2 sec" unit="[%]" value={CO2_dry_pourcent} onChange={(e) => setCO2_dry_pourcent(e.target.value)} />
                <InputField label="Pression sortie" unit="[mmCE]" value={P_out_mmCE} onChange={(e) => setP_out_mmCE(e.target.value)} />
            </div>

            <div className="prez-3-buttons">
<button onClick={handleSendData}>Calculate and Send Data</button>
                <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
            </div>
            {isSliderOpen && calculationResult && (
                <CalculationResults isOpen={isSliderOpen} results={calculationResult} />
            )}
        </div>
    );
};

export default STACK_Parameter_Tab;


