import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { T_ref } from '../../A_Transverse_fonction/constantes';
import { performCalculation_STACK } from './STACK_calculations';
import InputField from '../../C_Components/input_retro';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';
import ClearButton from '../../C_Components/Clear_Button';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './STACK_traduction';
import STACK_Retro_Rapport from './STACK_Retro_Rapport';

import '../../index.css';

// Constantes pour les clés localStorage (cohérence et maintenabilité)
const STORAGE_KEYS = {
  TSTACK: 'Tstack',
  QV_WET: 'Qv_wet_Nm3_h',
  O2_DRY: 'O2_dry_pourcent',
  H2O: 'H2O_pourcent',
  CO2_DRY: 'CO2_dry_pourcent',
  P_OUT: 'P_out_mmCE',
  CALCULATION_RESULT: 'calculationResult_STACK'
};

// Valeurs par défaut centralisées
const DEFAULT_VALUES = {
  Tstack: '80',
  Qv_wet_Nm3_h: '50000',
  O2_dry_pourcent: '10',
  H2O_pourcent: '30',
  CO2_dry_pourcent: '10',
  P_out_mmCE: '100'
};

// Fonctions utilitaires pour localStorage
const getStorageValue = (key, defaultValue, nodeData = null) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue) return storedValue;
  if (nodeData && nodeData[key]) return nodeData[key].toString();
  return defaultValue;
};

const STACK_Parameter_Tab = ({ nodeData, title, onSendData, onClose, currentLanguage }) => {
  // États principaux avec initialisation optimisée
  const [Tstack, setTstack] = useState(() => 
    getStorageValue(STORAGE_KEYS.TSTACK, DEFAULT_VALUES.Tstack, nodeData)
  );
  const [Qv_wet_Nm3_h, setQv_wet_Nm3_h] = useState(() => 
    getStorageValue(STORAGE_KEYS.QV_WET, DEFAULT_VALUES.Qv_wet_Nm3_h, nodeData)
  );
  const [O2_dry_pourcent, setO2_dry_pourcent] = useState(() => 
    getStorageValue(STORAGE_KEYS.O2_DRY, DEFAULT_VALUES.O2_dry_pourcent, nodeData)
  );
  const [H2O_pourcent, setH2O_pourcent] = useState(() => 
    getStorageValue(STORAGE_KEYS.H2O, DEFAULT_VALUES.H2O_pourcent, nodeData)
  );
  const [CO2_dry_pourcent, setCO2_dry_pourcent] = useState(() => 
    getStorageValue(STORAGE_KEYS.CO2_DRY, DEFAULT_VALUES.CO2_dry_pourcent, nodeData)
  );
  const [P_out_mmCE, setP_out_mmCE] = useState(() => 
    getStorageValue(STORAGE_KEYS.P_OUT, DEFAULT_VALUES.P_out_mmCE, nodeData)
  );

  // États pour l'interface
  const [calculationResult, setCalculationResult] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALCULATION_RESULT);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Erreur lors du chargement des résultats:', error);
      return null;
    }
  });
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Récupération des traductions avec mémorisation
  const { languageCode, t } = useMemo(() => {
    const code = getLanguageCode(currentLanguage);
    const translationsObj = translations[code] || translations['en'];
    return { languageCode: code, t: translationsObj };
  }, [currentLanguage]);

  // Sauvegarde centralisée dans localStorage
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        const dataToSave = {
          [STORAGE_KEYS.TSTACK]: Tstack,
          [STORAGE_KEYS.QV_WET]: Qv_wet_Nm3_h,
          [STORAGE_KEYS.O2_DRY]: O2_dry_pourcent,
          [STORAGE_KEYS.H2O]: H2O_pourcent,
          [STORAGE_KEYS.CO2_DRY]: CO2_dry_pourcent,
          [STORAGE_KEYS.P_OUT]: P_out_mmCE
        };

        Object.entries(dataToSave).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde dans localStorage:', error);
      }
    };

    saveToLocalStorage();
  }, [Tstack, Qv_wet_Nm3_h, O2_dry_pourcent, H2O_pourcent, CO2_dry_pourcent, P_out_mmCE]);

  // Sauvegarde des résultats de calcul
  useEffect(() => {
    if (calculationResult) {
      try {
        localStorage.setItem(STORAGE_KEYS.CALCULATION_RESULT, JSON.stringify(calculationResult));
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde des résultats:', error);
      }
    }
  }, [calculationResult]);

  // Validation des entrées numériques
  const validateInputs = useCallback(() => {
    const inputs = {
      Tstack: parseFloat(Tstack),
      Qv_wet_Nm3_h: parseFloat(Qv_wet_Nm3_h),
      O2_dry_pourcent: parseFloat(O2_dry_pourcent),
      H2O_pourcent: parseFloat(H2O_pourcent),
      CO2_dry_pourcent: parseFloat(CO2_dry_pourcent),
      P_out_mmCE: parseFloat(P_out_mmCE)
    };

    // Validation des valeurs numériques
    for (const [key, value] of Object.entries(inputs)) {
      if (isNaN(value)) {
        throw new Error(`${t.InvalidInput}: ${key}`);
      }
    }

    // Validations spécifiques aux contraintes physiques
    if (inputs.Tstack < -T_ref) {
      throw new Error(`${t.InvalidInput}: Temperature cannot be below absolute zero`);
    }
    if (inputs.Qv_wet_Nm3_h < 0) {
      throw new Error(`${t.InvalidInput}: Volume flow cannot be negative`);
    }
    if (inputs.O2_dry_pourcent < 0 || inputs.O2_dry_pourcent > 100) {
      throw new Error(`${t.InvalidInput}: O2 percentage must be between 0-100%`);
    }
    if (inputs.H2O_pourcent < 0 || inputs.H2O_pourcent > 100) {
      throw new Error(`${t.InvalidInput}: H2O percentage must be between 0-100%`);
    }
    if (inputs.CO2_dry_pourcent < 0 || inputs.CO2_dry_pourcent > 100) {
      throw new Error(`${t.InvalidInput}: CO2 percentage must be between 0-100%`);
    }

    return inputs;
  }, [Tstack, Qv_wet_Nm3_h, O2_dry_pourcent, H2O_pourcent, CO2_dry_pourcent, P_out_mmCE, t]);

  // Gestion du calcul principal
  const handleSendData = useCallback(async () => {
    setIsCalculating(true);
    
    try {
      const validatedInputs = validateInputs();

      const result = performCalculation_STACK(
        validatedInputs.Tstack,
        validatedInputs.Qv_wet_Nm3_h,
        validatedInputs.O2_dry_pourcent,
        validatedInputs.H2O_pourcent,
        validatedInputs.CO2_dry_pourcent,
        validatedInputs.P_out_mmCE
      );

      setCalculationResult(result);

      onSendData({
        result,
        inputData: validatedInputs,
      });

    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert(`${t.CalculationError}: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  }, [validateInputs, onSendData, t]);

  // Toggle du slider des résultats
  const toggleSlider = useCallback(() => {
    setIsSliderOpen(prev => !prev);
  }, []);

  // Effacement de la mémoire
  const clearMemory = useCallback(() => {
    try {
      // Effacement sélectif des données STACK
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      setCalculationResult(null);
      
      // Réinitialisation aux valeurs par défaut
      setTstack(DEFAULT_VALUES.Tstack);
      setQv_wet_Nm3_h(DEFAULT_VALUES.Qv_wet_Nm3_h);
      setO2_dry_pourcent(DEFAULT_VALUES.O2_dry_pourcent);
      setH2O_pourcent(DEFAULT_VALUES.H2O_pourcent);
      setCO2_dry_pourcent(DEFAULT_VALUES.CO2_dry_pourcent);
      setP_out_mmCE(DEFAULT_VALUES.P_out_mmCE);
      
    } catch (error) {
      console.warn('Erreur lors de l\'effacement:', error);
    }
  }, []);

  // Gestionnaires d'entrée optimisés
  const createInputHandler = useCallback((setter, fallback = '0') => 
    (e) => setter(e.target.value || fallback), []
  );

  const handleTstackChange = createInputHandler(setTstack, DEFAULT_VALUES.Tstack);
  const handleQvChange = createInputHandler(setQv_wet_Nm3_h, DEFAULT_VALUES.Qv_wet_Nm3_h);
  const handleO2Change = createInputHandler(setO2_dry_pourcent, DEFAULT_VALUES.O2_dry_pourcent);
  const handleH2OChange = createInputHandler(setH2O_pourcent, DEFAULT_VALUES.H2O_pourcent);
  const handleCO2Change = createInputHandler(setCO2_dry_pourcent, DEFAULT_VALUES.CO2_dry_pourcent);
  const handlePressureChange = createInputHandler(setP_out_mmCE, DEFAULT_VALUES.P_out_mmCE);

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />
      <h3>{t.Parametres} {title}</h3>
      
      <div className="inputs-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InputField 
          label={t.Tstack} 
          unit={`[${t.celsius}]`} 
          value={Tstack} 
          onChange={handleTstackChange}
          disabled={isCalculating}
          aria-label={`${t.Tstack} en ${t.celsius}`}
        />
        
        <InputField 
          label={t.Qv_wet_fumees} 
          unit={`[${t.Nm3_h}]`} 
          value={Qv_wet_Nm3_h} 
          onChange={handleQvChange}
          disabled={isCalculating}
          aria-label={`${t.Qv_wet_fumees} en ${t.Nm3_h}`}
        />
        
        <InputField 
          label={t.O2_dry} 
          unit={`[${t.percent}]`} 
          value={O2_dry_pourcent} 
          onChange={handleO2Change}
          disabled={isCalculating}
          aria-label={`${t.O2_dry} en ${t.percent}`}
        />
        
        <InputField 
          label={t.H2O_content} 
          unit={`[${t.percent}]`} 
          value={H2O_pourcent} 
          onChange={handleH2OChange}
          disabled={isCalculating}
          aria-label={`${t.H2O_content} en ${t.percent}`}
        />
        
        <InputField 
          label={t.CO2_dry} 
          unit={`[${t.percent}]`} 
          value={CO2_dry_pourcent} 
          onChange={handleCO2Change}
          disabled={isCalculating}
          aria-label={`${t.CO2_dry} en ${t.percent}`}
        />
        
        <InputField 
          label={t.P_out} 
          unit={`[${t.mmCE}]`} 
          value={P_out_mmCE} 
          onChange={handlePressureChange}
          disabled={isCalculating}
          aria-label={`${t.P_out} en ${t.mmCE}`}
        />
      </div>

      <div className="prez-3-buttons">
        <button 
          onClick={handleSendData}
          disabled={isCalculating}
          className={isCalculating ? 'button-loading' : ''}
        >
          {isCalculating ? t.Calculating : t.calculer_et_envoyer_data}
        </button>
        
        <ShowResultButton 
          isOpen={isSliderOpen} 
          onToggle={toggleSlider}
          currentLanguage={currentLanguage}
          disabled={!calculationResult}
        />
        
        <ClearButton 
          onClick={clearMemory}
          currentLanguage={currentLanguage}
          disabled={isCalculating}
        />
      </div>

      {/* Affichage conditionnel des résultats */}
      {isSliderOpen && calculationResult && (
        <CalculationResults 
          isOpen={isSliderOpen} 
          results={calculationResult}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Message si pas de résultats */}
      {isSliderOpen && !calculationResult && (
        <div className="no-results-message">
          <p>{t.NoResults}</p>
        </div>
      )}

      {/* Bouton Editer Rapport */}
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={() => setShowReport(true)}
          disabled={!calculationResult || isCalculating}
          style={{
            width: '100%',
            padding: '8px 16px',
            background: calculationResult ? '#1a3a6b' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: calculationResult ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '13px',
          }}
        >
          Editer Rapport
        </button>
      </div>

      {/* Modal rapport */}
      {showReport && calculationResult && (
        <STACK_Retro_Rapport
          calculationResult={calculationResult}
          inputParams={{
            Tstack,
            Qv_wet_Nm3_h,
            O2_dry_pourcent,
            H2O_pourcent,
            CO2_dry_pourcent,
            P_out_mmCE,
          }}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default React.memo(STACK_Parameter_Tab);