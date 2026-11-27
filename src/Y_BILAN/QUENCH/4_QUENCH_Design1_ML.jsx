import React, { useState, useEffect, useRef, useCallback } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import SprayTower from '../../B_Images/quench_img.jsx';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './QUENCH_traduction';
import { qdTranslations } from './QUENCH_Design_traduction';
import { fmt } from '../../A_Transverse_fonction/formatNumber';

// ═══════════════════════════════════════════════════════════════════
// QUENCH DESIGN — quench sans saturation (27/11/2026, décision de Cédric)
// Le quench refroidit les fumées à la température visée de l'onglet Fumées
// (eau injectée Q_eau_kg_h) ; il ne va pas à la saturation. Le calcul de
// saturation Pyrofluid (ClassQuench) est dans le nœud SATURATOR.
// Cet onglet dimensionne la colonne et le cône (gamme Pyrofluid) sur les
// fumées réelles d'entrée et de sortie, calcule la perte de charge du
// venturi, et envoie l'eau injectée à l'OPEX.
// ═══════════════════════════════════════════════════════════════════

const M = { CO2: 44, H2O: 18, O2: 32, N2: 28 };
const VM = 22.4;
const T0 = 273.15;

const DIAM_QUENCH = [0.55, 0.65, 0.75, 0.9, 1.05, 1.25, 1.5];
const DIAM_CONE_AUTO = { 0.55: 445, 0.65: 535, 0.75: 615, 0.9: 735, 1.05: 860, 1.25: 1025, 1.5: 1230 }; // mm

const volNm3 = (m = {}) => Object.keys(M).reduce((s, k) => s + ((m[k] || 0) * VM) / M[k], 0);
const parseValue = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const masse = (m = {}) => Object.keys(M).reduce((s, k) => s + (m[k] || 0), 0);

// Dimensionnement sur les fumées réelles (entrée : amont, sortie : onglet Fumées)
export function dimensionnerQuench({ fgIn, tIn, fgOut, tOut, pTotal, diamQuench, chkCone, diamCone }) {
  const p = 760 - Math.abs((pTotal || 0) / 13.595); // mmHg
  const reel = (vol, T) => vol * ((T0 + T) / T0) * (760 / p); // m³/h réels
  const volIn = volNm3(fgIn);
  const volOut = volNm3(fgOut);
  if (!(volIn > 0) || !(volOut > 0) || !(p > 0)) return null;
  const debReelIn = reel(volIn, tIn);
  const debReelOut = reel(volOut, tOut);
  const Squench = (Math.PI * diamQuench * diamQuench) / 4;
  const vitesse = debReelIn / (3600 * Squench);
  const roSortie = masse(fgOut) / debReelOut;
  const cone = chkCone ? diamCone : DIAM_CONE_AUTO[diamQuench] || 0;
  const sPassage = Squench - (Math.PI * Math.pow(cone * 1e-3, 2)) / 4;
  const vPassage = sPassage > 0 ? debReelOut / (3600 * sPassage) : 0;
  const pVenturi = (1.5 * roSortie * vPassage * vPassage) / (2 * 9.81); // mmCE
  return { volIn, volOut, debReelIn, debReelOut, Squench, vitesse, roSortie, diamCone: cone, sPassage, vPassage, pVenturi };
}

// ═══════════════════════════════════════════════════════════════════
// COMPOSANTS UI — définis au niveau module pour avoir des références
// stables entre renders et éviter la perte de focus sur les inputs.
// ═══════════════════════════════════════════════════════════════════
const QSection = ({ title, results, children, t }) => (
  <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
    <h3 style={{ marginTop: 0, borderBottom: '2px solid #4a90e2', paddingBottom: '10px' }}>{title}</h3>
    <div style={{ display: 'grid', gap: '15px' }}>
      {children}
      {results && results.length > 0 && (
        <>
          <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>{t('Résultats')}</h4>
          <TableGeneric elements={results} />
        </>
      )}
    </div>
  </div>
);

const QInField = ({ label, value, onChange, step = '0.01', disabled = false, t }) => {
  const [display, setDisplay] = useState(() => value !== undefined && value !== null ? String(value) : '');
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setDisplay(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: disabled ? 0.4 : 1 }}>
      <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
        {t(label)} :
      </label>
      <input
        type="number"
        value={display}
        step={step}
        disabled={disabled}
        onFocus={() => { focused.current = true; }}
        onBlur={() => {
          focused.current = false;
          const n = parseFloat(display);
          const norm = isNaN(n) ? 0 : n;
          setDisplay(isNaN(n) ? '0' : String(n));
          onChange(norm);
        }}
        onChange={(e) => {
          setDisplay(e.target.value);
          onChange(parseValue(e.target.value));
        }}
        style={{
          flex: '0 0 150px', padding: '8px', border: '1px solid #7cc7d8', borderRadius: '4px',
          fontSize: '14px', textAlign: 'right', backgroundColor: disabled ? '#eee' : '#e0f7fa', fontFamily: 'monospace',
        }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════
const QUENCHDesign = ({ innerData, setInnerData, upstreamT_IN, upstreamFG_IN, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = useCallback((key) =>
    qdTranslations[languageCode]?.[key] ||
    qdTranslations['fr']?.[key] ||
    translations[languageCode]?.[key] ||
    translations['fr']?.[key] ||
    key,
  [languageCode]);

  const getInitialValue = (paramName, defaultValue) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  // Types d'eau (alimente l'OPEX)
  const waterTypeLabels = {
    'eau potable': t('Eau potable'),
    'eau de refroidissement': t('Eau de refroidissement'),
    'eau déminéralisée': t('Eau déminéralisée'),
    'eau adoucie': t('Eau adoucie'),
    'eau de rivière': t('Eau de rivière'),
  };
  const opexData = getOpexData() || {};
  const { waterPrices = {} } = opexData;
  const getWaterPrice = (wt) => ({
    'eau potable': waterPrices.potable || 3,
    'eau de refroidissement': waterPrices.cooling || 1,
    'eau déminéralisée': waterPrices.demineralized || 5,
    'eau adoucie': waterPrices.soft || 2,
    'eau de rivière': waterPrices.river || 0.5,
  }[wt] || 3);

  // ─── États ───
  const [PDC_calcul, setPDC_calcul] = useState({
    'Pression aéraulique [mmCE]': getInitialValue('P_OUT', 0),
    'PDC [mmCE]': getInitialValue('PDC_mmCE_QUENCH', 150),
  });
  const [usePventuri, setUsePventuri] = useState(getInitialValue('QD_usePventuri', true));
  const [quenchParams, setQuenchParams] = useState({
    diamQuench: getInitialValue('Quench_diameter_std', 0.55),
    chkCone: getInitialValue('QD_chkCone', false),
    diamCone: getInitialValue('QD_diamCone', 445),
  });
  const [typeEau, setTypeEau] = useState(getInitialValue('Type_eau', 'eau potable'));
  const [Parametres_conso_Elec, setParametres_conso_Elec] = useState({
    'Puissance pompe [kW]': getInitialValue('Puissance_pompe_quench', 15),
    'Rendement pompe [%]': getInitialValue('Rendement_pompe', 85),
  });

  // ─── Fumées réelles : entrée = amont, sortie = onglet Fumées (température visée, eau injectée) ───
  const T_IN = upstreamT_IN ?? 200;
  const FG_IN = upstreamFG_IN || {};
  const T_OUT = innerData?.T_OUT ?? T_IN;
  const FG_OUT = innerData?.FG_OUT_kg_h || FG_IN;
  const Q_eau_kg_h = Math.max(0, innerData?.Q_eau_kg_h ?? 0);

  const P_in_mmCE = PDC_calcul['Pression aéraulique [mmCE]'];
  const r = dimensionnerQuench({
    fgIn: FG_IN, tIn: T_IN, fgOut: FG_OUT, tOut: T_OUT, pTotal: P_in_mmCE,
    diamQuench: quenchParams.diamQuench, chkCone: quenchParams.chkCone, diamCone: quenchParams.diamCone,
  });

  // ─── PDC & pompe ───
  const PDC_mmCE = usePventuri && r ? r.pVenturi : PDC_calcul['PDC [mmCE]'];
  const P_out_mmCE = P_in_mmCE - PDC_mmCE;

  const Puissance_pompe_kW = Parametres_conso_Elec['Puissance pompe [kW]'];
  const Rendement_pompe = Parametres_conso_Elec['Rendement pompe [%]'];
  const Conso_elec_pompe_reelle_kW = Puissance_pompe_kW / (Rendement_pompe / 100);

  // Eau consommée = eau injectée (onglet Fumées), ventilée par type
  const Q_eau_m3_h = Q_eau_kg_h / 1000;
  const eauParType = {
    Conso_EauPotable_m3: 0, Conso_EauRefroidissement_m3: 0, Conso_EauDemin_m3: 0,
    Conso_EauRiviere_m3: 0, Conso_EauAdoucie_m3: 0,
  };
  if (typeEau === 'eau de refroidissement') eauParType.Conso_EauRefroidissement_m3 = Q_eau_m3_h;
  else if (typeEau === 'eau déminéralisée') eauParType.Conso_EauDemin_m3 = Q_eau_m3_h;
  else if (typeEau === 'eau adoucie') eauParType.Conso_EauAdoucie_m3 = Q_eau_m3_h;
  else if (typeEau === 'eau de rivière') eauParType.Conso_EauRiviere_m3 = Q_eau_m3_h;
  else eauParType.Conso_EauPotable_m3 = Q_eau_m3_h;

  const currentWaterPrice = getWaterPrice(typeEau);
  const waterCostPerHour = Q_eau_m3_h * currentWaterPrice;

  // ─── Synchronisation innerData (rapport + OPEX + aval) ───
  const lastSync = useRef('');
  useEffect(() => {
    if (!setInnerData || typeof setInnerData !== 'function') return;
    const payload = {
      P_out_mmCE,
      consoElec1: Conso_elec_pompe_reelle_kW,
      labelElec1: t('pompe quench'),
      ...eauParType,
      Quench_diameter: quenchParams.diamQuench,
      Type_eau: typeEau,
      Puissance_pompe_quench: Puissance_pompe_kW,
      Rendement_pompe,
      PDC_mmCE_QUENCH: PDC_mmCE,
      QD_usePventuri: usePventuri,
      Quench_diameter_std: quenchParams.diamQuench,
      QD_chkCone: quenchParams.chkCone,
      QD_diamCone: quenchParams.diamCone,
      QUENCH_design: r ? { ...r, T_IN, T_OUT, Q_eau_kg_h } : null,
      // Le quench ne va pas à la saturation : plus de sortie « saturée » vers la tour de lavage
      QD: null, QD_inputs: null, recup_Ts: null, RoEpuree: null, T_quench_out: null,
      P_quench_out_mmCE: null, FG_quench_out_kg_h: null,
    };
    const json = JSON.stringify(payload);
    if (json === lastSync.current) return;
    lastSync.current = json;
    setInnerData((prev) => ({ ...prev, ...payload }));
  }, [r, T_IN, T_OUT, Q_eau_kg_h, eauParType, quenchParams, typeEau, P_out_mmCE, PDC_mmCE, usePventuri, Conso_elec_pompe_reelle_kW, Puissance_pompe_kW, Rendement_pompe, setInnerData, t]);

  // ─── Avertissements (plages Pyrofluid) ───
  const warnings = [];
  if (r) {
    if (r.vitesse < 10 || r.vitesse > 15)
      warnings.push(`${t('QD_warn_vitesse_colonne')} ${fmt(r.vitesse, 2)} m/s (10 – 15 m/s)`);
    if (r.vPassage < 30 || r.vPassage > 40)
      warnings.push(`${t('QD_warn_vitesse_cone')} ${fmt(r.vPassage, 2)} m/s (30 – 40 m/s)`);
  }

  const outEl = (label, value, unit = '', d = 2, warn = false) => ({
    text: t(label) + (unit ? ` [${unit}]` : ''),
    value: (warn ? '🔴 ' : '') + fmt(value, d),
  });
  const setQ = useCallback((k) => (v) => setQuenchParams((s) => ({ ...s, [k]: v })), []);

  // ─── Tables de résultats ───
  const elements_PDC = [{ text: t('Pression de sortie [mmCE]'), value: fmt(P_out_mmCE, 2) }];

  const elementsDim = r ? [
    outEl('QD_vitesse_colonne', r.vitesse, 'm/s', 2, r.vitesse < 10 || r.vitesse > 15),
    outEl('QD_vitesse_cone', r.vPassage, 'm/s', 2, r.vPassage < 30 || r.vPassage > 40),
    outEl('QD_diam_cone_retenu', r.diamCone, 'mm', 0),
    outEl('QD_pventuri', r.pVenturi, 'mmCE'),
    outEl('QD_debit_reel_sortie', r.debReelOut, 'm³/h', 0),
    outEl('QD_ro_sortie', r.roSortie, 'kg/m³', 3),
  ] : [];

  const elementsEau = [
    { text: t('Temperature inlet QUENCH [°C]'), value: fmt(T_IN, 1) },
    outEl('QD_temp_sortie', T_OUT, '°C', 1),
    { text: t('Sprayed/cooling water [kg/h]'), value: fmt(Q_eau_kg_h, 0) },
    { text: t("Prix de l'eau [€/m³]"), value: fmt(currentWaterPrice, 2) },
    { text: t('Coût eau par heure [€/h]'), value: fmt(waterCostPerHour, 2) },
  ];

  const elements_conso_pompe = [
    { text: t('Puissance pompe nominale [kW]'), value: fmt(Puissance_pompe_kW, 2) },
    { text: t('Rendement pompe [%]'), value: fmt(Rendement_pompe, 1) },
    { text: t('Consommation réelle [kW]'), value: fmt(Conso_elec_pompe_reelle_kW, 2) },
  ];

  return (
    <div className="cadre_pour_onglet">
      <div style={{ padding: 12, marginBottom: 12, borderRadius: 4, backgroundColor: '#e0f2fe', color: '#075985', border: '1px solid #7dd3fc' }}>
        ℹ️ {t('QD_info_sans_saturation')}
      </div>

      {warnings.length > 0 && (
        <div style={{ padding: 12, marginBottom: 12, borderRadius: 4, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
          {warnings.map((w, i) => (
            <div key={i}>⚠️ {w}</div>
          ))}
        </div>
      )}

      {/* PDC aéraulique (option ΔP venturi calculée) */}
      <QSection title={t('Pertes de charge aéraulique')} results={elements_PDC} t={t}>
        <QInField label="Pression aéraulique [mmCE]" value={PDC_calcul['Pression aéraulique [mmCE]']}
          onChange={(v) => setPDC_calcul((s) => ({ ...s, 'Pression aéraulique [mmCE]': v }))} t={t} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
            {t('QD_use_pventuri')} :
          </label>
          <input type="checkbox" checked={usePventuri} onChange={(e) => setUsePventuri(e.target.checked)} />
        </div>
        <QInField label="PDC [mmCE]" value={usePventuri && r ? r.pVenturi.toFixed(2) : PDC_calcul['PDC [mmCE]']}
          onChange={(v) => setPDC_calcul((s) => ({ ...s, 'PDC [mmCE]': v }))} disabled={usePventuri} t={t} />
      </QSection>

      {/* Dimensionnement du Quench */}
      <QSection title={t('Dimensionnement du Quench')} results={elementsDim} t={t}>
        <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '100%', maxWidth: '300px' }}><SprayTower /></div>
          </div>
          <div style={{ flex: 1.4, display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
                {t('Quench diameter [m]')} :
              </label>
              <select
                value={quenchParams.diamQuench}
                onChange={(e) => setQ('diamQuench')(parseFloat(e.target.value))}
                style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #7cc7d8', borderRadius: '4px', backgroundColor: '#e0f7fa', textAlign: 'right', fontFamily: 'monospace' }}
              >
                {DIAM_QUENCH.map((d) => (
                  <option key={d} value={d}>{d.toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
                {t('QD_cone_saisi')} :
              </label>
              <input type="checkbox" checked={quenchParams.chkCone} onChange={(e) => setQ('chkCone')(e.target.checked)} />
            </div>
            <QInField label="QD_diam_cone" value={quenchParams.chkCone ? quenchParams.diamCone : (DIAM_CONE_AUTO[quenchParams.diamQuench] || 0)}
              onChange={setQ('diamCone')} disabled={!quenchParams.chkCone} step="5" t={t} />
          </div>
        </div>
      </QSection>

      {/* Eau injectée */}
      <QSection title={t('QD_section_eau')} results={elementsEau} t={t}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
            {t("Type d'eau")} :
          </label>
          <select
            value={typeEau}
            onChange={(e) => setTypeEau(e.target.value)}
            style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #7cc7d8', borderRadius: '4px', backgroundColor: '#e0f7fa' }}
          >
            {Object.keys(waterTypeLabels).map((k) => (
              <option key={k} value={k}>{waterTypeLabels[k]}</option>
            ))}
          </select>
        </div>
      </QSection>

      {/* Consommation électrique de la pompe */}
      <QSection title={t('Consommation électrique de la pompe')} results={elements_conso_pompe} t={t}>
        <QInField label="Puissance pompe [kW]" value={Puissance_pompe_kW}
          onChange={(v) => setParametres_conso_Elec((s) => ({ ...s, 'Puissance pompe [kW]': Math.max(1, Math.min(500, v)) }))} step="1" t={t} />
        <QInField label="Rendement pompe [%]" value={Rendement_pompe}
          onChange={(v) => setParametres_conso_Elec((s) => ({ ...s, 'Rendement pompe [%]': Math.max(30, Math.min(95, v)) }))} step="1" t={t} />
      </QSection>
    </div>
  );
};

export default QUENCHDesign;
