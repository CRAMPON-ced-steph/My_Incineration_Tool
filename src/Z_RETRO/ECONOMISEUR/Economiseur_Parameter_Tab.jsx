// Onglet Retro commun des économiseurs (eau / air). Chaque équipement fournit sa configuration :
// { code, fluide, translations, calculer } (calculer = performCalculation_<CODE>, résultat
// { data<CODE>, dataFlow }).
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { cleParamsRetro, lireParamsRetro, paramsDefautRetro } from './economiseur_retro';
import { CALCUL, OPTIONS_RETRO, AUXILIAIRE } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_calculs';
import { ChoixBoutons, Messages } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_ui';
import { fmt } from '../../A_Transverse_fonction/formatNumber';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';
import CalculateSendButton from '../../C_Components/CalculateSendButton';
import useBatchCalcResult from '../../C_Components/useBatchCalcResult';

import Economiseur_Retro_Rapport from './Economiseur_Retro_Rapport';
import '../../index.css';

const getStorageKeys = (code, nodeId) => ({
  PARAMS: cleParamsRetro(code, nodeId),
  CALCULATION_RESULT: `calculationResult_${code}_${nodeId}`,
});

// Champs saisis ; celui que l'option choisie calcule est affiché en valeur calculée.
const champs = (fluide) => [
  { cle: 'T_amont_C', label: 'TfumeesEntree', calcul: CALCUL.T_FUMEES_ENTREE, res: 'T_fumees_entree_C', dec: 1 },
  { cle: 'T_fluide_entree_C', label: 'TfluideEntree', calcul: CALCUL.T_FLUIDE_ENTREE, res: 'T_fluide_entree_C', dec: 1 },
  { cle: 'T_fluide_sortie_C', label: 'TfluideSortie', calcul: CALCUL.T_FLUIDE_SORTIE, res: 'T_fluide_sortie_C', dec: 1 },
  { cle: 'Debit_fluide_kg_h', label: 'DebitFluideEch', calcul: CALCUL.DEBIT_FLUIDE, res: 'Debit_fluide_ech_kg_h', dec: 0 },
  { cle: 'nbEchangeurs', label: 'nbEchangeurs' },
  { cle: 'Rdt_pct', label: 'Rdt' },
  { cle: 'Encrassement_pct', label: 'Encrassement' },
  { cle: 'U_kcal_h_m2_C', label: 'U' },
  { cle: 'PDC_fumees_mmCE', label: 'PDCfumees' },
  { cle: AUXILIAIRE[fluide].cleDP, label: 'auxDP' },
  { cle: AUXILIAIRE[fluide].cleRdt, label: 'auxRdt' },
];

const ligne = { display: 'flex', alignItems: 'center' };

const Economiseur_Parameter_Tab = ({ nodeData, title, onSendData, onClose, currentLanguage, nodeId, autoTrigger = false, config }) => {
  const { code, fluide, translations, calculer } = config;
  const STORAGE_KEYS = useMemo(() => getStorageKeys(code, nodeId), [code, nodeId]);
  const CHAMPS = useMemo(() => champs(fluide), [fluide]);
  const languageCode = getLanguageCode(currentLanguage);
  const t = useCallback((key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key, [languageCode, translations]);

  const [params, setParams] = useState(() => lireParamsRetro(code, fluide, nodeId));
  const setParam = (cle, valeur) => setParams((p) => ({ ...p, [cle]: valeur }));
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(params)); }, [params, STORAGE_KEYS]);

  const [resultat, setCalculationResult] = useState(null);
  useBatchCalcResult(nodeId, setCalculationResult);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const hasCalculatedOnce = useRef(false);
  const hasAutoTriggered = useRef(false);

  useEffect(() => {
    if (resultat) localStorage.setItem(STORAGE_KEYS.CALCULATION_RESULT, JSON.stringify(resultat));
  }, [resultat, STORAGE_KEYS]);

  // Recalcul à chaque changement (envoi automatique une fois le premier envoi fait)
  useEffect(() => {
    if (!nodeData?.result?.dataFlow) return;
    try {
      const result = calculer(nodeData, params);
      setCalculationResult(result);
      if (hasCalculatedOnce.current) onSendData({ result, inputData: params });
    } catch (error) {
      console.error('Error recalculating with updated nodeData:', error);
    }
  }, [nodeData, params]);

  const handleSendData = () => {
    if (!nodeData?.result?.dataFlow) {
      console.warn('No input data available');
      return;
    }
    try {
      const result = calculer(nodeData, params);
      setCalculationResult(result);
      hasCalculatedOnce.current = true;
      onSendData({ result, inputData: params });
    } catch (error) {
      console.error('Calculation error:', error);
      alert(`Error in calculation: ${error.message}`);
    }
  };

  const clearMemory = () => {
    setParams(paramsDefautRetro(fluide));
    setCalculationResult(null);
    setIsSliderOpen(false);
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  };

  useEffect(() => {
    if (!autoTrigger || hasAutoTriggered.current) return;
    hasAutoTriggered.current = true;
    handleSendData();
  }, [autoTrigger]);

  const d = resultat?.[`data${code}`] || {};
  const calcul = params.calcul === CALCUL.T_FUMEES_SORTIE ? CALCUL.T_FUMEES_ENTREE : params.calcul;

  // En changeant d'option, la grandeur calculée garde sa valeur et devient une donnée
  const changerCalcul = (option) => {
    const actuel = CHAMPS.find((c) => c.calcul && c.calcul === calcul);
    const v = actuel ? d[actuel.res] : NaN;
    setParams((p) => ({
      ...p,
      ...(actuel && Number.isFinite(v) ? { [actuel.cle]: Number(v.toFixed(actuel.dec)) } : {}),
      calcul: option,
    }));
  };

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />

      <h3>{title} — {t('titreRetro')}</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <div style={{ color: 'black', marginBottom: 4 }}>{t('calculDe')} :</div>
          <ChoixBoutons options={OPTIONS_RETRO.map((o) => ({ value: o, label: t(`opt_${o}`) }))} value={calcul} onChange={changerCalcul} />
        </div>
        <div>
          <div style={{ color: 'black', marginBottom: 4 }}>{t('proprietes')} :</div>
          <ChoixBoutons
            options={[{ value: false, label: t('modeOutil') }, { value: true, label: t('modeOrigine') }]}
            value={!!params.modeOrigine}
            onChange={(v) => setParam('modeOrigine', v)}
          />
        </div>
        <div style={ligne}>
          <label style={{ color: 'black', width: '300px' }}>{t('TfumeesSortie')} ({t('aval')}):</label>
          <span style={{ fontWeight: 'bold' }}>{fmt(nodeData?.result?.dataFlow?.T, 1)}</span>
        </div>
        {CHAMPS.map((c) => (c.calcul && c.calcul === calcul ? (
          <div key={c.cle} style={ligne}>
            <label style={{ color: 'black', width: '300px' }}>{t(c.label)} ({t('calcule')}):</label>
            <span style={{ fontWeight: 'bold', background: '#f5f0dc', padding: '2px 8px', borderRadius: 4 }}>{fmt(d[c.res], c.dec)}</span>
          </div>
        ) : (
          <InputField
            key={c.cle}
            label={t(c.label)}
            unit=""
            value={params[c.cle]}
            onChange={(e) => setParam(c.cle, parseFloat(e.target.value) || 0)}
          />
        )))}
      </div>

      {resultat && (
        <div style={{ marginTop: 10 }}>
          <Messages erreurs={d.erreurs || []} alertes={d.alertes || []} t={t} />
          <div style={{ fontSize: 13 }}>
            {t('PuissanceFumees')} : <strong>{fmt(d.Q_fumees_kW, 1)}</strong> — {t('SurfaceEch')} : <strong>{fmt(d.S_ech_m2, 1)}</strong> — {t('DebitFluideTot')} : <strong>{fmt(d.Debit_fluide_tot_kg_h, 0)}</strong>
          </div>
        </div>
      )}

      <div className="prez-3-buttons">
        <CalculateSendButton onClick={handleSendData} currentLanguage={currentLanguage} storageKey={`calcSent_${title}_${nodeId}`} />
        <ShowResultButton isOpen={isSliderOpen} onToggle={() => setIsSliderOpen(!isSliderOpen)} currentLanguage={currentLanguage} />
        <ClearButton onClick={clearMemory} currentLanguage={currentLanguage} />
      </div>

      {isSliderOpen && resultat && (
        <CalculationResults isOpen={isSliderOpen} results={resultat} />
      )}

      <div style={{ marginTop: '12px' }}>
        <button
          onClick={() => setShowReport(true)}
          disabled={!resultat}
          style={{ width: '100%', padding: '8px 16px', background: resultat ? '#1a3a6b' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: resultat ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}
        >
          {t('editerRapport')}
        </button>
      </div>

      {showReport && resultat && (
        <Economiseur_Retro_Rapport
          calculationResult={resultat}
          config={config}
          currentLanguage={currentLanguage}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

export default Economiseur_Parameter_Tab;
