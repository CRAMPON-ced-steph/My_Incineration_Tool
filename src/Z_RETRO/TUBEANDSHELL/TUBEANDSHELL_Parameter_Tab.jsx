/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { performCalculation_TUBEANDSHELL } from './TUBEANDSHELL_calculations';
import { fmt as fmtNum } from '../../A_Transverse_fonction/formatNumber';

import InputField from '../../C_Components/input_retro';
import ClearButton from '../../C_Components/Clear_Button';
import ShowResultButton from '../../C_Components/Show_result_retro';
import CloseButton from '../../C_Components/OnCloseButton_retro';
import CalculationResults from '../../C_Components/ShowCalculationResult_retro';
import CalculateSendButton from '../../C_Components/CalculateSendButton';
import TUBEANDSHELL_Retro_Rapport from './TUBEANDSHELL_Retro_Rapport';

import '../../index.css';

// ─── Styles locaux ────────────────────────────────────────────────────────────
const selectStyle = {
  padding: '5px 10px', borderRadius: '4px',
  border: '1px solid #ccc', fontSize: '13px', width: '100%',
};
const labelStyle = {
  fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '4px',
};

const TUBEANDSHELL_Parameter_Tab = ({ nodeData, title, onSendData, onClose, currentLanguage, autoTrigger = false, nodeId }) => {

  // ── Paramètres persistés ──────────────────────────────────────────────────
  const [fluide,       setFluide]       = useState(() => localStorage.getItem(`fluide_TUBEANDSHELL_${nodeId}`)       || 'eau');
  const [bilanType,    setBilanType]    = useState(() => localStorage.getItem(`bilanType_TUBEANDSHELL_${nodeId}`)    || 'T_sortie');
  const [T_fumee_in,   setT_fumee_in]   = useState(() => {
    const saved = localStorage.getItem(`T_fumee_in_TUBEANDSHELL_${nodeId}`);
    const defaultT = (nodeData?.result?.dataFlow?.T ?? 200) + 200;
    return saved != null ? parseFloat(saved) : defaultT;
  });
  const [T_fluide_in,  setT_fluide_in]  = useState(() => parseFloat(localStorage.getItem(`T_fluide_in_TUBEANDSHELL_${nodeId}`))  || 15);
  const [T_fluide_out, setT_fluide_out] = useState(() => parseFloat(localStorage.getItem(`T_fluide_out_TUBEANDSHELL_${nodeId}`)) || 50);
  const [m_eau,        setM_eau]        = useState(() => parseFloat(localStorage.getItem(`m_eau_TUBEANDSHELL_${nodeId}`))        || 1000);
  const [V_air,        setV_air]        = useState(() => parseFloat(localStorage.getItem(`V_air_TUBEANDSHELL_${nodeId}`))        || 1000);
  const [Rendement,    setRendement]    = useState(() => parseFloat(localStorage.getItem(`Rendement_TUBEANDSHELL_${nodeId}`))    || 95);
  const [Encrassement, setEncrassement] = useState(() => parseFloat(localStorage.getItem(`Encrassement_TUBEANDSHELL_${nodeId}`)) || 25);
  const [PDC_econo,    setPDC_econo]    = useState(() => parseFloat(localStorage.getItem(`PDC_econo_TUBEANDSHELL_${nodeId}`))    || 60);

  const [calculationResult, setCalculationResult] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // ── Persistance localStorage ──────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(`fluide_TUBEANDSHELL_${nodeId}`,       fluide);            }, [fluide]);
  useEffect(() => { localStorage.setItem(`bilanType_TUBEANDSHELL_${nodeId}`,    bilanType);         }, [bilanType]);
  useEffect(() => { localStorage.setItem(`T_fumee_in_TUBEANDSHELL_${nodeId}`,   T_fumee_in);        }, [T_fumee_in]);
  useEffect(() => { localStorage.setItem(`T_fluide_in_TUBEANDSHELL_${nodeId}`,  T_fluide_in);       }, [T_fluide_in]);
  useEffect(() => { localStorage.setItem(`T_fluide_out_TUBEANDSHELL_${nodeId}`, T_fluide_out);      }, [T_fluide_out]);
  useEffect(() => { localStorage.setItem(`m_eau_TUBEANDSHELL_${nodeId}`,        m_eau);             }, [m_eau]);
  useEffect(() => { localStorage.setItem(`V_air_TUBEANDSHELL_${nodeId}`,        V_air);             }, [V_air]);
  useEffect(() => { localStorage.setItem(`Rendement_TUBEANDSHELL_${nodeId}`,    Rendement);         }, [Rendement]);
  useEffect(() => { localStorage.setItem(`Encrassement_TUBEANDSHELL_${nodeId}`, Encrassement);      }, [Encrassement]);
  useEffect(() => { localStorage.setItem(`PDC_econo_TUBEANDSHELL_${nodeId}`,    PDC_econo);         }, [PDC_econo]);

  useEffect(() => {
    if (calculationResult) {
      localStorage.setItem(`CalculationResult_TUBEANDSHELL_${nodeId}`, JSON.stringify(calculationResult));
    }
  }, [calculationResult]);

  // ── Recalcul auto à chaque changement de paramètre ───────────────────────
  useEffect(() => {
    if (!nodeData?.result) return;
    try {
      const result = performCalculation_TUBEANDSHELL(
        nodeData, fluide, bilanType,
        T_fumee_in, T_fluide_in, T_fluide_out,
        m_eau, V_air, Rendement, Encrassement, PDC_econo
      );
      setCalculationResult(result);
      if (hasCalculatedOnce.current) {
        onSendData({ result });
      }
    } catch (error) {
      console.error('TUBEANDSHELL recalc error:', error);
    }
  }, [nodeData, fluide, bilanType, T_fumee_in, T_fluide_in, T_fluide_out, m_eau, V_air, Rendement, Encrassement, PDC_econo]);

  // ── Calcul manuel (bouton) ────────────────────────────────────────────────
  const handleSendData = () => {
    if (!nodeData?.result) {
      console.warn('No input data available');
      return;
    }
    try {
      const result = performCalculation_TUBEANDSHELL(
        nodeData, fluide, bilanType,
        T_fumee_in, T_fluide_in, T_fluide_out,
        m_eau, V_air, Rendement, Encrassement, PDC_econo
      );
      setCalculationResult(result);
      hasCalculatedOnce.current = true;
      onSendData({ result });
    } catch (error) {
      console.error('TUBEANDSHELL calculation error:', error);
      alert(`Erreur de calcul : ${error.message}`);
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearMemory = () => {
    const keys = [
      `fluide_TUBEANDSHELL_${nodeId}`, `bilanType_TUBEANDSHELL_${nodeId}`,
      `T_fumee_in_TUBEANDSHELL_${nodeId}`, `T_fluide_in_TUBEANDSHELL_${nodeId}`, `T_fluide_out_TUBEANDSHELL_${nodeId}`,
      `m_eau_TUBEANDSHELL_${nodeId}`, `V_air_TUBEANDSHELL_${nodeId}`,
      `Rendement_TUBEANDSHELL_${nodeId}`, `Encrassement_TUBEANDSHELL_${nodeId}`, `PDC_econo_TUBEANDSHELL_${nodeId}`,
      `CalculationResult_TUBEANDSHELL_${nodeId}`,
    ];
    keys.forEach(k => localStorage.removeItem(k));
    setFluide('eau');
    setBilanType('T_sortie');
    setT_fumee_in((nodeData?.result?.dataFlow?.T ?? 200) + 200);
    setT_fluide_in(15);
    setT_fluide_out(50);
    setM_eau(1000);
    setV_air(1000);
    setRendement(95);
    setEncrassement(25);
    setPDC_econo(60);
    setCalculationResult(null);
    setIsSliderOpen(false);
  };

  const hasCalculatedOnce = useRef(false);
  const hasAutoTriggered  = useRef(false);
  useEffect(() => {
    if (!autoTrigger || hasAutoTriggered.current) return;
    hasAutoTriggered.current = true;
    handleSendData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTrigger]);

  // ── Helpers affichage ────────────────────────────────────────────────────
  const r = calculationResult?.dataTUBEANDSHELL;
  const fmt = (v, d = 1) => fmtNum(v, d);

  return (
    <div className="container-box">
      <CloseButton onClose={onClose} />
      <h3>{title} — Tube &amp; Shell</h3>

      {/* Sélecteurs */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <div style={labelStyle}>Fluide secondaire</div>
          <select style={selectStyle} value={fluide} onChange={(e) => setFluide(e.target.value)}>
            <option value="eau">Eau</option>
            <option value="air">Air</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={labelStyle}>Bilan par</div>
          <select style={selectStyle} value={bilanType} onChange={(e) => setBilanType(e.target.value)}>
            <option value="T_sortie">T sortie fluide</option>
            <option value="debit">{fluide === 'eau' ? 'Débit eau' : 'Débit air'}</option>
          </select>
        </div>
      </div>

      {/* Paramètres côté fumées */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label style={{ color: 'black', width: '300px' }}>T fumées sortie [°C] :</label>
          <input
            type="number"
            value={nodeData?.result?.dataFlow?.T ?? '—'}
            disabled
            style={{ width: 'auto', minWidth: '60px', maxWidth: '1000px', backgroundColor: '#f0f0f0', color: 'black', cursor: 'not-allowed' }}
          />
        </div>
        <InputField label="T fumées entrée"  unit="[°C]"   value={T_fumee_in} onChange={(e) => setT_fumee_in(parseFloat(e.target.value) || 0)} />
        <InputField label="PDC échangeur"    unit="[mmCE]" value={PDC_econo}  onChange={(e) => setPDC_econo(parseFloat(e.target.value) || 0)} />
      </div>

      {/* Paramètres côté fluide */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
        {bilanType !== 'T_entree'
          ? <InputField label={fluide === 'eau' ? 'T entrée eau' : 'T entrée air'} unit="[°C]" value={T_fluide_in}  onChange={(e) => setT_fluide_in(Math.max(0, parseFloat(e.target.value) || 0))} />
          : <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', padding: '4px 0' }}>T entrée {fluide} : calculée</div>
        }
        {bilanType !== 'T_sortie'
          ? <InputField label={fluide === 'eau' ? 'T sortie eau' : 'T sortie air'} unit="[°C]" value={T_fluide_out} onChange={(e) => setT_fluide_out(parseFloat(e.target.value) || 0)} />
          : <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', padding: '4px 0' }}>T sortie {fluide} : calculée</div>
        }
        {bilanType !== 'debit' && fluide === 'eau' && (
          <InputField label="Débit eau" unit="[kg/h]"  value={m_eau} onChange={(e) => setM_eau(parseFloat(e.target.value) || 0)} />
        )}
        {bilanType !== 'debit' && fluide === 'air' && (
          <InputField label="Débit air" unit="[Nm³/h]" value={V_air} onChange={(e) => setV_air(parseFloat(e.target.value) || 0)} />
        )}
        {bilanType === 'debit' && (
          <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', padding: '4px 0' }}>Débit {fluide} : calculé</div>
        )}
      </div>

      {/* Paramètres échangeur */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        <InputField label="Rendement échangeur"    unit="[%]" value={Rendement}    onChange={(e) => setRendement(parseFloat(e.target.value) || 0)} />
        <InputField label="Encrassement échangeur" unit="[%]" value={Encrassement} onChange={(e) => setEncrassement(parseFloat(e.target.value) || 0)} />
      </div>

      {/* Alerte incohérence thermique */}
      {r?.T_fluide_out > T_fumee_in && (
        <div style={{ marginBottom: '10px', padding: '6px 10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404', fontWeight: '600', fontSize: '12px' }}>
          ⚠ T sortie {fluide} ({fmt(r.T_fluide_out)} °C) &gt; T fumées entrée ({fmt(T_fumee_in)} °C) — bilan incohérent
        </div>
      )}

      {/* Boutons */}
      <div className="prez-3-buttons">
        <CalculateSendButton onClick={handleSendData} currentLanguage={currentLanguage} storageKey={`calcSent_${title}_${nodeId}`} />
        <ShowResultButton isOpen={isSliderOpen} onToggle={() => setIsSliderOpen(!isSliderOpen)} currentLanguage={currentLanguage} />
        <ClearButton onClick={clearMemory} currentLanguage={currentLanguage} />
      </div>

      {/* Résultats */}
      {isSliderOpen && calculationResult && (
        <CalculationResults isOpen={isSliderOpen} results={calculationResult} />
      )}

      {/* Bouton rapport */}
      <div style={{ marginTop: '12px' }}>
        <button
          onClick={() => setShowReport(true)}
          disabled={!calculationResult}
          style={{ width: '100%', padding: '8px 16px', background: calculationResult ? '#1a3a6b' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: calculationResult ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '13px' }}
        >
          Editer Rapport
        </button>
      </div>

      {showReport && calculationResult && (
        <TUBEANDSHELL_Retro_Rapport
          calculationResult={calculationResult}
          inputParams={{ fluide, bilanType, T_fumee_in, T_fluide_in, T_fluide_out, m_eau, V_air, Rendement, Encrassement, PDC_econo }}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Résumé calculé affiché inline */}
      {r && (
        <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f0f4fb', borderRadius: '6px', fontSize: '12px', lineHeight: '1.8' }}>
          <div style={{ fontWeight: 'bold', color: '#1a3a6b', marginBottom: '6px' }}>Résultats calculés</div>
          <div>Enthalpie cédée fumées : <b>{fmt(r.Q_FG_kWh)}</b> kWh</div>
          <div>Enthalpie transmise au {fluide} : <b>{fmt(r.Q_utile_eau_kWh)}</b> kWh</div>
          <div>T sortie {fluide} {bilanType === 'T_sortie' ? '(calculée)' : ''} : <b>{fmt(r.T_fluide_out)}</b> °C</div>
          {fluide === 'eau'
            ? <div>Débit eau {bilanType === 'debit' ? '(calculé)' : ''} : <b>{fmt(r.m_eau_kg_h, 0)}</b> kg/h</div>
            : <div>Débit air {bilanType === 'debit' ? '(calculé)' : ''} : <b>{fmt(r.m_eau_kg_h, 0)}</b> Nm³/h</div>
          }
          <div>ΔT log. moyen : <b>{fmt(r.D_TLM)}</b> °C</div>
          <div>Facteur UA : <b>{fmt(r.Fact_UA, 2)}</b> kW/K</div>
          <div>U liste ({fluide}) : <b>{fmt(r.Fact_U_list, 0)}</b> kW/(m²·K)</div>
          <div>Surface d&apos;échange : <b>{fmt(r.Surface_m2, 2)}</b> m²</div>
        </div>
      )}
    </div>
  );
};

export default TUBEANDSHELL_Parameter_Tab;
