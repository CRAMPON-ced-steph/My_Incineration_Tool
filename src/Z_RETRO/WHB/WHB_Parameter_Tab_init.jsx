import React, { useState, useEffect } from 'react';
import { performCalculation_WHB_option_T_Qair} from './WHB_calculation_option1';
import { performCalculation_WHB_option_T_O2} from './WHB_calculation_option2';
import { performCalculation_WHB_option_Qeau_Qair} from './WHB_calculation_option3';
import { performCalculation_WHB_option_Qeau_O2} from './WHB_calculation_option4';

import  InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import ToggleButton from '../../C_Components/toggle_button_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';
import '../../index.css';


import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const WHB_Parameter_Tab = ({ nodeData, title, onSendData, onClose }) => {
  const [T_eau_alimentation_C, setT_eau_alimentation_C] = useState(() => localStorage.getItem('T_eau_alimentation_C') || 130);
  const [Q_air_parasite_Nm3_h, setQ_air_parasite_Nm3_h] = useState(() => localStorage.getItem('Q_air_parasite_Nm3_h') || 1000);
  const [Q_eau_purge_pourcent, setQ_eau_purge_pourcent] = useState(() => localStorage.getItem('Q_eau_purge_pourcent') || 1.5);
  const [T_air_exterieur_C, setT_air_exterieur_C] = useState(() => localStorage.getItem('T_air_exterieur_C') || 15);
  const [P_th_pourcent, setPth] = useState(() => localStorage.getItem('P_th_pourcent') || 2);
  const [P_vapeur_bar, setP_vapeur_bar] = useState(() => localStorage.getItem('P_vapeur_bar') || 30);
  const [T_vapeur, setT_vapeur] = useState(() => localStorage.getItem('T_vapeur') || 0);
  const [T_vapeur_surchauffee_C, setT_vapeur_surchauffee_C] = useState(() => localStorage.getItem('T_vapeur_surchauffee_C') || 250);
  const [T_amont_WHB_C, setT_amont_WHB_C] = useState(() => localStorage.getItem('T_amont_WHB_C') || 950);
  const [Q_eau_alimentation, setQ_eau_alimentation] = useState(() => localStorage.getItem('Q_eau_alimentation') || 0);
  const [O2_mesure, setO2_mesure] = useState(() => localStorage.getItem('O2_mesure') || nodeData?.result?.dataFlow?.O2_dry_pourcent|| 0);

  const [calculationResult_WHB, setCalculationResult_WHB] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const [bilanTypeVapeur, setBilanTypeVapeur] = useState(() => localStorage.getItem('bilanTypeVapeur') || 'Vapeur saturee');
  const [bilanType, setBilanType] = useState(() => localStorage.getItem('bilanType') || 'Tf');
  const [bilanTypeAir, setBilanTypeAir] = useState(() => localStorage.getItem('bilanTypeAir') || 'Q_air_parasite');


    // Get current language code and translations
    const languageCode = getLanguageCode(currentLanguage);
    const t = translations[languageCode] || translations['en']; // fallback to English if language not found

  useEffect(() => {
    localStorage.setItem('T_eau_alimentation_C', T_eau_alimentation_C);
    localStorage.setItem('Q_air_parasite_Nm3_h', Q_air_parasite_Nm3_h);
    localStorage.setItem('Q_eau_purge_pourcent', Q_eau_purge_pourcent);
    localStorage.setItem('T_air_exterieur_C', T_air_exterieur_C);
    localStorage.setItem('P_th_pourcent', P_th_pourcent);
    localStorage.setItem('P_vapeur_bar', P_vapeur_bar);
    localStorage.setItem('T_vapeur', T_vapeur);
    localStorage.setItem('T_vapeur_surchauffee_C', T_vapeur_surchauffee_C);
    localStorage.setItem('T_amont_WHB_C', T_amont_WHB_C);
    localStorage.setItem('Q_eau_alimentation', Q_eau_alimentation);
    localStorage.setItem('O2_mesure', O2_mesure);
    localStorage.setItem('bilanType', bilanType);
    localStorage.setItem('bilanTypeVapeur', bilanTypeVapeur);
    localStorage.setItem('bilanTypeAir', bilanTypeAir);
  }, [T_eau_alimentation_C,Q_air_parasite_Nm3_h, Q_eau_purge_pourcent, T_air_exterieur_C, P_th_pourcent, P_vapeur_bar, T_vapeur, T_vapeur_surchauffee_C, T_amont_WHB_C, Q_eau_alimentation, O2_mesure, bilanType, bilanTypeVapeur, bilanTypeAir]);

  useEffect(() => {if (calculationResult_WHB) {localStorage.setItem('calculationResult_WHB', JSON.stringify(calculationResult_WHB));}}, [calculationResult_WHB]);

  

  useEffect(() => {
    if (nodeData?.result) {
      try {
        let result;
        if (bilanType === 'Tf' && bilanTypeAir === 'Q_air_parasite') {
          result = performCalculation_WHB_option_T_Qair(
            nodeData,
            parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(T_amont_WHB_C), parseFloat(Q_air_parasite_Nm3_h));

        }

        if (bilanType === 'Tf' && bilanTypeAir === 'O2_mesure') {
          result = performCalculation_WHB_option_T_O2(
            nodeData,
             parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(T_amont_WHB_C), parseFloat(O2_mesure));

        }

        if (bilanType === 'Qeau_alimentaire' && bilanTypeAir === 'Q_air_parasite') {
          result = performCalculation_WHB_option_Qeau_Qair(
            nodeData,
            parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(Q_eau_alimentation), parseFloat(Q_air_parasite_Nm3_h));
        }

        if (bilanType === 'Qeau_alimentaire' && bilanTypeAir === 'O2_mesure') {
          result = performCalculation_WHB_option_Qeau_O2(
            nodeData,
            parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(Q_eau_alimentation), parseFloat(O2_mesure));
          }

        setCalculationResult_WHB(result);
      } catch (error) {
        console.error('Error recalculating with updated nodeData:', error);
      }
    }
  }, [nodeData, T_amont_WHB_C, T_eau_alimentation_C, Q_eau_alimentation, bilanType, bilanTypeAir, Q_air_parasite_Nm3_h, O2_mesure]);








  const handleSendData = () => {
    if (!nodeData?.result) {console.warn('No input data available');return;}

    try {
      let result;
      if (bilanType === 'Tf' && bilanTypeAir === 'Q_air_parasite') {
        result = performCalculation_WHB_option_T_Qair(nodeData, parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(T_amont_WHB_C), parseFloat(Q_air_parasite_Nm3_h));
      }


      if (bilanType === 'Tf' && bilanTypeAir === 'O2_mesure') {
        result = performCalculation_WHB_option_T_O2(nodeData, parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(T_amont_WHB_C), parseFloat(O2_mesure));
      }



      if (bilanType === 'Qeau_alimentaire' && bilanTypeAir === 'Q_air_parasite') {
        result = performCalculation_WHB_option_T_Qair(nodeData, parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(Q_eau_alimentation), parseFloat(Q_air_parasite_Nm3_h));
      }



      if (bilanType === 'Qeau_alimentaire' && bilanTypeAir === 'O2_mesure') {
        result = performCalculation_WHB_option_Qeau_O2(
          nodeData,
          parseFloat(T_eau_alimentation_C), parseFloat(Q_eau_purge_pourcent), parseFloat(T_air_exterieur_C), parseFloat(P_th_pourcent), parseFloat(P_vapeur_bar), bilanTypeVapeur, parseFloat(T_vapeur_surchauffee_C), parseFloat(Q_eau_alimentation), parseFloat(O2_mesure));
      }





      
      setCalculationResult_WHB(result);
      onSendData({result});


    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);}
  };


  const clearMemory = () => {localStorage.clear();setCalculationResult(null);};

  const toggleSlider = () => setIsSliderOpen(!isSliderOpen);
  const toggleBilanType = () => setBilanType((prevType) => (prevType === 'Tf' ? 'Qeau_alimentaire' : 'Tf'));
  const toggleBilanTypeVapeur = () => setBilanTypeVapeur((prevType) => (prevType === 'Vapeur saturee' ? 'Vapeur surchauffee' : 'Vapeur saturee'));
  const toggleBilanAir = () => setBilanTypeAir((prevType) => (prevType === 'Q_air_parasite' ? 'O2_mesure' : 'Q_air_parasite'));

  return (
    
    
    <div className="container-box">
            
     <CloseButton onClose={onClose} />
      
      
      <h3>{title} Parameters</h3>
      
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

      <InputField label="T eau alimentation" unit="[°C]" value={T_eau_alimentation_C} onChange={(e) => setT_eau_alimentation_C(e.target.value) || 0}/>
      <InputField label="Q eau de purge" unit="[%]" value={Q_eau_purge_pourcent} onChange={(e) => setQ_eau_purge_pourcent(e.target.value) || 0}/>
      <InputField label="T air exterieur" unit="[°C]" value={T_air_exterieur_C} onChange={(e) => setT_air_exterieur_C(e.target.value) || 0}/>
      <InputField label="Pertes thermiques" unit="[%]" value={P_th_pourcent} onChange={(e) => setPth(e.target.value) || 0}/>
      <InputField label="Pression vapeur" unit="[Bar]" value={P_vapeur_bar} onChange={(e) => setP_vapeur_bar(e.target.value) || 0}/>





        
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Bilan Type Vapeur:</label>
          <button onClick={toggleBilanTypeVapeur} 
          className={`toggle-button ${bilanTypeVapeur === 'Vapeur saturee' ? 'toggle-button--option1' : 'toggle-button--option2'}`}>

          {bilanTypeVapeur === 'Vapeur saturee' ? 'Vapeur saturee' : 'Vapeur surchauffee'}
          </button>
        </div>






        {bilanTypeVapeur === 'Vapeur surchauffee' &&      
        <InputField label="T vapeur surchauffee" unit="[°C]" value={T_vapeur_surchauffee_C} onChange={(e) => setT_vapeur_surchauffee_C(e.target.value) || 0}/> }       
  
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Bilan Type:</label>
          <button onClick={toggleBilanType} className={`toggle-button ${bilanType === 'Tf' ? 'toggle-button--option1' : 'toggle-button--option2'}`}>
          {bilanType === 'Tf' ? 'Bilan par T' : 'Bilan par Qeau_alimentaire'}
          </button>
        </div>



        {bilanType === 'Tf' &&
       <InputField label="T amont WHB" unit="[°C]" value={T_amont_WHB_C} onChange={(e) => setT_amont_WHB_C(e.target.value) || 0}/> }       

        {bilanType === 'Qeau_alimentaire' && 
       <InputField label="Q eau alimentation" unit="[kg/h]" value={Q_eau_alimentation} onChange={(e) => setQ_eau_alimentation(e.target.value) || 0}/> }      




        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>Bilan Air Type:</label>
          <button onClick={toggleBilanAir} 
          className={`toggle-button ${bilanTypeAir === 'Q_air_parasite' ? 'toggle-button--option1' : 'toggle-button--option2'}`}>
          {bilanTypeAir === 'Q_air_parasite' ? 'Bilan par Qv air faux' : 'Bilan par O2 mesure'}
          </button>
        </div>


        {bilanTypeAir === 'Q_air_parasite' && 
        <InputField label="Q air parasite" unit="[Nm3/h]" value={Q_air_parasite_Nm3_h} onChange={(e) => setQ_air_parasite_Nm3_h(e.target.value) || 0}/>}



        {bilanTypeAir === 'O2_mesure' && 
        <InputField label="O2 sec mesure" unit="[%]" value={O2_mesure} onChange={(e) => setO2_mesure(e.target.value) || 0}/>}
      </div>





      <div className="prez-3-buttons">
                <button onClick={handleSendData}>Calculate and Send Data</button>
                <ShowResultButton isOpen={isSliderOpen} onToggle={toggleSlider} />
                <ClearButton onClick={clearMemory} />
            </div>

            {isSliderOpen && calculationResult_WHB && <CalculationResults isOpen={isSliderOpen} results={calculationResult_WHB} />}


    </div>
  );
};

export default WHB_Parameter_Tab;
