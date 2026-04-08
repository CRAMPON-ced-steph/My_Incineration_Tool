import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { performCalculation_IDFAN } from './IDFAN_calculations';
import { performCalculation_IDFAN2 } from './IDFAN_calculations2';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';

import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './IDFAN_traduction';

import '../../index.css';

// Constantes pour les types de dissipation d'énergie
const DISSIPATION_TYPES = {
  ON: 'ON',
  OFF: 'OFF'
};

// Constantes pour localStorage
const STORAGE_KEYS = {
  TYPE: 'Type',
  P_AMONT: 'P_amont',
  RDT_ELEC: 'Rdt_elec',
  CALCULATION_RESULT: 'calculationResult_IDFAN'
};

// Valeurs par défaut
const DEFAULT_VALUES = {
  Type: DISSIPATION_TYPES.OFF,
  P_amont: '-250',
  Rdt_elec: '70'
};

const IDFAN_Parameter_Tab = ({ nodeData, title, onSendData, onClose, currentLanguage }) => {
  // États principaux
  const [P_amont, setP_amont] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.P_AMONT) || DEFAULT_VALUES.P_amont
  );
  const [Rdt_elec, setRdt_elec] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.RDT_ELEC) || DEFAULT_VALUES.Rdt_elec
  );

  // Type de dissipation d'énergie
  const [Type, setType] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.TYPE) || DEFAULT_VALUES.Type
  );

  // États pour l'interface
  const [calculationResult_IDFAN, setCalculationResult_IDFAN] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CALCULATION_RESULT);
      if (stored) return JSON.parse(stored);
      
      // Calcul initial si nodeData disponible
      if (nodeData?.result) {
        const result = performCalculation_IDFAN(nodeData, parseFloat(DEFAULT_VALUES.P_amont), parseFloat(DEFAULT_VALUES.Rdt_elec));
        return result;
      }
      return null;
    } catch (error) {
      console.warn('Erreur lors du chargement des résultats:', error);
      return null;
    }
  });
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Récupération des traductions avec mémorisation
  const { languageCode, t } = useMemo(() => {
    const code = getLanguageCode(currentLanguage);
    const translationsObj = translations[code] || translations['en'];
    return { languageCode: code, t: translationsObj };
  }, [currentLanguage]);

  // Mapping pour les traductions du toggle
  const dissipationTypeMapping = useMemo(() => ({
    [DISSIPATION_TYPES.ON]: t.ON,
    [DISSIPATION_TYPES.OFF]: t.OFF
  }), [t]);

  // Sauvegarde centralisée dans localStorage
  useEffect(() => {
    const saveToLocalStorage = () => {
      try {
        const dataToSave = {
          [STORAGE_KEYS.TYPE]: Type,
          [STORAGE_KEYS.P_AMONT]: P_amont,
          [STORAGE_KEYS.RDT_ELEC]: Rdt_elec
        };

        Object.entries(dataToSave).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde dans localStorage:', error);
      }
    };

    saveToLocalStorage();
  }, [Type, P_amont, Rdt_elec]);

  // Sauvegarde des résultats de calcul
  useEffect(() => {
    if (calculationResult_IDFAN) {
      try {
        localStorage.setItem(STORAGE_KEYS.CALCULATION_RESULT, JSON.stringify(calculationResult_IDFAN));
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde des résultats:', error);
      }
    }
  }, [calculationResult_IDFAN]);

  // Validation des entrées
  const validateInputs = useCallback(() => {
    const inputs = {
      P_amont: parseFloat(P_amont),
      Rdt_elec: parseFloat(Rdt_elec)
    };

    // Validation des valeurs numériques
    for (const [key, value] of Object.entries(inputs)) {
      if (isNaN(value)) {
        throw new Error(`${t.InvalidInput}: ${key}`);
      }
    }

    // Validations spécifiques aux contraintes physiques
    if (inputs.Rdt_elec < 0 || inputs.Rdt_elec > 100) {
      throw new Error(`${t.InvalidInput}: Electrical efficiency must be between 0-100%`);
    }

    return inputs;
  }, [P_amont, Rdt_elec, t]);

  // Gestion du calcul principal
  const handleSendData = useCallback(async () => {
    if (!nodeData?.result) {
      alert(t.NoInputData);
      return;
    }

    setIsCalculating(true);
    
    try {
      const validatedInputs = validateInputs();
      let result;

      if (Type === DISSIPATION_TYPES.OFF) {
        result = performCalculation_IDFAN(
          nodeData, 
          validatedInputs.P_amont, 
          validatedInputs.Rdt_elec
        );
      } else {
        result = performCalculation_IDFAN2(
          nodeData, 
          validatedInputs.P_amont, 
          validatedInputs.Rdt_elec
        );
      }

      setCalculationResult_IDFAN(result);
      onSendData({ result });

    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert(`${t.CalculationError}: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  }, [nodeData, validateInputs, Type, onSendData, t]);

  // Toggle du type de dissipation
  const toggleType = useCallback(() => {
    setType(prev => 
      prev === DISSIPATION_TYPES.ON ? DISSIPATION_TYPES.OFF : DISSIPATION_TYPES.ON
    );
  }, []);

  // Toggle du slider des résultats
  const toggleSlider = useCallback(() => {
    setIsSliderOpen(prev => !prev);
  }, []);

  // Effacement de la mémoire
  const clearMemory = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      setCalculationResult_IDFAN(null);
      
      // Réinitialisation aux valeurs par défaut
      setType(DEFAULT_VALUES.Type);
      setP_amont(DEFAULT_VALUES.P_amont);
      setRdt_elec(DEFAULT_VALUES.Rdt_elec);
      
    } catch (error) {
      console.warn('Erreur lors de l\'effacement:', error);
    }
  }, []);

  // Gestionnaires d'entrée optimisés
  const createInputHandler = useCallback((setter, fallback = '0') => 
    (e) => setter(e.target.value || fallback), []
  );

  const handlePAmontChange = createInputHandler(setP_amont, DEFAULT_VALUES.P_amont);
  const handleRdtElecChange = createInputHandler(setRdt_elec, DEFAULT_VALUES.Rdt_elec);

  // Composant ToggleButton réutilisable
  const ToggleButton = React.memo(({ label, value, mapping, onChange, testId }) => {
    const displayValue = mapping[value] || value;
    const isFirstOption = value === Object.keys(mapping)[0];
    
    return (
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label>{label}:</label>
        <button 
          onClick={onChange}
          data-testid={testId}
          className={`toggle-button ${isFirstOption ? 'toggle-button--option1' : 'toggle-button--option2'}`}
          disabled={isCalculating}
          aria-label={`${label}: ${displayValue}`}
        >
          {displayValue}
        </button>
      </div>
    );
  });

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />

      <h3>{t.Parametres} {title}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {/* Toggle type de dissipation d'énergie */}
        <ToggleButton 
          label={t.EnergyDissipation}
          value={Type}
          mapping={dissipationTypeMapping}
          onChange={toggleType}
          testId="dissipation-type-toggle"
        />

        <div className="inputs-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Champ pression amont */}
          <InputField 
            label={t.P_amont} 
            unit={`[${t.mmCE}]`} 
            value={P_amont} 
            onChange={handlePAmontChange}
            disabled={isCalculating}
            aria-label={`${t.P_amont} en ${t.mmCE}`}
          />
          
          {/* Champ rendement électrique */}
          <InputField 
            label={t.Rdt_elec} 
            unit={`[${t.percent}]`} 
            value={Rdt_elec} 
            onChange={handleRdtElecChange}
            disabled={isCalculating}
            aria-label={`${t.Rdt_elec} en ${t.percent}`}
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="prez-3-buttons">
        <button 
          onClick={handleSendData}
          disabled={isCalculating || !nodeData?.result}
          className={isCalculating ? 'button-loading' : ''}
        >
          {isCalculating ? t.Calculating : t.calculer_et_envoyer_data}
        </button>
        
        <ShowResultButton 
          isOpen={isSliderOpen} 
          onToggle={toggleSlider}
          currentLanguage={currentLanguage}
          disabled={!calculationResult_IDFAN}
        />
        
        <ClearButton 
          onClick={clearMemory}
          currentLanguage={currentLanguage}
          disabled={isCalculating}
        />
      </div>

      {/* Affichage conditionnel des résultats */}
      {isSliderOpen && calculationResult_IDFAN && (
        <CalculationResults 
          isOpen={isSliderOpen} 
          results={calculationResult_IDFAN}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Message si pas de résultats */}
      {isSliderOpen && !calculationResult_IDFAN && (
        <div className="no-results-message">
          <p>{t.NoResults}</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(IDFAN_Parameter_Tab);