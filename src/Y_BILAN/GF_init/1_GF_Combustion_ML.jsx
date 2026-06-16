/**
 * 1_GF_Combustion_ML.jsx
 * Onglet "Gaz de combustion" pour le four à grille (Grate Furnace) — mode Bilan.
 *
 * Logique :
 *  - Le nœud GF reçoit en entrée les fumées issues d'un équipement amont
 *    (via nodeData.result.dataFlow) et les paramètres de bilan de la salle
 *    des machines (via les champs saisis ici).
 *  - On appelle performCalculation_GF (Z_RETRO) pour calculer la puissance
 *    de l'incinérateur et le PCI du déchet.
 *  - Les résultats sont écrits dans innerData via onInnerDataChange, ce qui
 *    permet au rapport et aux onglets aval de les lire.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { performCalculation_GF } from '../../Z_RETRO/GF/GF_calculations';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './GF_traduction';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v, d = 2) => { const n = parseFloat(v); return isNaN(n) ? '—' : n.toFixed(d); };

const Field = ({ label, unit, value, onChange, readOnly = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px dotted #e0e0e0' }}>
    <span style={{ flex: 1, fontSize: 12, color: '#444' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="number"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          width: 90, padding: '3px 6px', fontSize: 12, textAlign: 'right',
          border: '1px solid #ccc', borderRadius: 3,
          backgroundColor: readOnly ? '#f5f5f5' : '#fff',
          color: readOnly ? '#666' : '#000',
        }}
      />
      {unit && <span style={{ fontSize: 11, color: '#888', minWidth: 50 }}>{unit}</span>}
    </div>
  </div>
);

const ResultRow = ({ label, value, unit }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', borderBottom: '1px dotted #e8e8e8' }}>
    <span style={{ fontSize: 12, color: '#444' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 'bold', color: '#1a3a6b' }}>
      {value} {unit && <span style={{ fontWeight: 'normal', color: '#666', fontSize: 11 }}>{unit}</span>}
    </span>
  </div>
);

// ── Clés localStorage ─────────────────────────────────────────────────────────
const LS = {
  WASTE_FLOW:           'Waste_flow_rate_kg_h_GF',
  PRESSURE_LOSS:        'Pressure_losse_mmCE_GF',
  AIR_FLOW:             'Combustion_air_flowrate_Nm3_h_GF',
  AIR_TEMP:             'Measured_air_temperature_C_GF',
  FEED_WATER_FLOW:      'Q_feed_water_kg_h_GF',
  FEED_WATER_TEMP:      'T_feed_water_C_GF',
  BLOWDOWN:             'Blowdown_pourcent_GF',
  Q_SAT_STEAM:          'Q_saturated_steam_GF',
  P_STEAM:              'Steam_pressure_gauge_bar_GF',
  SH_STEAM_TEMP:        'super_heated_steam_temperature_C_GF',
  Q_SH_STEAM:           'Q_superheated_steam_kg_h_GF',
  P_SH_STEAM:           'P_superheated_steam_bar_GF',
  T_SH_WATER:           'T_superheated_water_boiler_C_GF',
  Q_SH_WATER:           'Q_superheated_water_kg_h_GF',
  Q_RECYCLED_FG:        'Q_recycled_flue_gas_Nm3_h_GF',
  T_RECYCLED_FG:        'T_recycled_flue_gas_C_GF',
  T_INJECTED_WATER:     'Injected_water_temperature_C_GF',
  Q_INJECTED_WATER:     'Q_treatment_injected_water_kg_h_GF',
  AUX_FUEL:             'Auxiliary_fuel_kWh_GF',
  BOTTOM_ASH_PCT:       'Bottom_ash_pourcent_GF',
  BOTTOM_ASH_TEMP:      'Bottom_ash_temperature_C_GF',
  UNBURNT_PCT:          'Unburnt_bottom_ash_pourcent_GF',
  UNBURNT_LCV:          'Unburnt_LCV_kcal_kg_GF',
  REF_TEMP:             'Reference_temperature_C_GF',
  Q_AIR_INGRESS:        'Q_air_ingress_Nm3_h_GF',
  T_AIR_INGRESS:        'T_air_ingress_C_GF',
};

const DEF = {
  Waste_flow_rate:            '1000',
  Pressure_loss:              '100',
  Air_flow:                   '10000',
  Air_temp:                   '20',
  Feed_water_flow:            '0',
  Feed_water_temp:            '0',
  Blowdown:                   '0',
  Q_sat_steam:                '0',
  P_steam:                    '0',
  SH_steam_temp:              '0',
  Q_SH_steam:                 '0',
  P_SH_steam:                 '0',
  T_SH_water:                 '0',
  Q_SH_water:                 '0',
  Q_recycled_fg:              '0',
  T_recycled_fg:              '0',
  T_injected_water:           '0',
  Q_injected_water:           '0',
  Aux_fuel:                   '0',
  Bottom_ash_pct:             '15',
  Bottom_ash_temp:            '400',
  Unburnt_pct:                '2',
  Unburnt_LCV:                '7882',
  Ref_temp:                   '20',
  Q_air_ingress:              '0',
  T_air_ingress:              '20',
};

const ls = (key, def) => localStorage.getItem(key) || def;

// ── Composant principal ───────────────────────────────────────────────────────
const GFCombustion = ({ innerData, nodeData, onInnerDataChange, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = useMemo(() => {
    const tr = translations[languageCode] || translations['fr'];
    return (key) => tr[key] || key;
  }, [languageCode]);

  // ── États des paramètres ──
  const [wasteFlow,      setWasteFlow]      = useState(() => ls(LS.WASTE_FLOW,       DEF.Waste_flow_rate));
  const [pressureLoss,   setPressureLoss]   = useState(() => ls(LS.PRESSURE_LOSS,    DEF.Pressure_loss));
  const [airFlow,        setAirFlow]        = useState(() => ls(LS.AIR_FLOW,         DEF.Air_flow));
  const [airTemp,        setAirTemp]        = useState(() => ls(LS.AIR_TEMP,         DEF.Air_temp));
  const [feedWaterFlow,  setFeedWaterFlow]  = useState(() => ls(LS.FEED_WATER_FLOW,  DEF.Feed_water_flow));
  const [feedWaterTemp,  setFeedWaterTemp]  = useState(() => ls(LS.FEED_WATER_TEMP,  DEF.Feed_water_temp));
  const [blowdown,       setBlowdown]       = useState(() => ls(LS.BLOWDOWN,         DEF.Blowdown));
  const [qSatSteam,      setQSatSteam]      = useState(() => ls(LS.Q_SAT_STEAM,      DEF.Q_sat_steam));
  const [pSteam,         setPSteam]         = useState(() => ls(LS.P_STEAM,          DEF.P_steam));
  const [shSteamTemp,    setShSteamTemp]    = useState(() => ls(LS.SH_STEAM_TEMP,    DEF.SH_steam_temp));
  const [qShSteam,       setQShSteam]       = useState(() => ls(LS.Q_SH_STEAM,       DEF.Q_SH_steam));
  const [pShSteam,       setPShSteam]       = useState(() => ls(LS.P_SH_STEAM,       DEF.P_SH_steam));
  const [tShWater,       setTShWater]       = useState(() => ls(LS.T_SH_WATER,       DEF.T_SH_water));
  const [qShWater,       setQShWater]       = useState(() => ls(LS.Q_SH_WATER,       DEF.Q_SH_water));
  const [qRecycledFg,    setQRecycledFg]    = useState(() => ls(LS.Q_RECYCLED_FG,    DEF.Q_recycled_fg));
  const [tRecycledFg,    setTRecycledFg]    = useState(() => ls(LS.T_RECYCLED_FG,    DEF.T_recycled_fg));
  const [tInjWater,      setTInjWater]      = useState(() => ls(LS.T_INJECTED_WATER, DEF.T_injected_water));
  const [qInjWater,      setQInjWater]      = useState(() => ls(LS.Q_INJECTED_WATER, DEF.Q_injected_water));
  const [auxFuel,        setAuxFuel]        = useState(() => ls(LS.AUX_FUEL,         DEF.Aux_fuel));
  const [bottomAshPct,   setBottomAshPct]   = useState(() => ls(LS.BOTTOM_ASH_PCT,   DEF.Bottom_ash_pct));
  const [bottomAshTemp,  setBottomAshTemp]  = useState(() => ls(LS.BOTTOM_ASH_TEMP,  DEF.Bottom_ash_temp));
  const [unburntPct,     setUnburntPct]     = useState(() => ls(LS.UNBURNT_PCT,      DEF.Unburnt_pct));
  const [unburntLCV,     setUnburntLCV]     = useState(() => ls(LS.UNBURNT_LCV,      DEF.Unburnt_LCV));
  const [refTemp,        setRefTemp]        = useState(() => ls(LS.REF_TEMP,         DEF.Ref_temp));
  const [qAirIngress,    setQAirIngress]    = useState(() => ls(LS.Q_AIR_INGRESS,    DEF.Q_air_ingress));
  const [tAirIngress,    setTAirIngress]    = useState(() => ls(LS.T_AIR_INGRESS,    DEF.T_air_ingress));

  // ── Résultats calculés ──
  const [result, setResult] = useState(null);

  // ── Persistance localStorage ──
  useEffect(() => {
    const pairs = [
      [LS.WASTE_FLOW, wasteFlow], [LS.PRESSURE_LOSS, pressureLoss],
      [LS.AIR_FLOW, airFlow], [LS.AIR_TEMP, airTemp],
      [LS.FEED_WATER_FLOW, feedWaterFlow], [LS.FEED_WATER_TEMP, feedWaterTemp],
      [LS.BLOWDOWN, blowdown], [LS.Q_SAT_STEAM, qSatSteam],
      [LS.P_STEAM, pSteam], [LS.SH_STEAM_TEMP, shSteamTemp],
      [LS.Q_SH_STEAM, qShSteam], [LS.P_SH_STEAM, pShSteam],
      [LS.T_SH_WATER, tShWater], [LS.Q_SH_WATER, qShWater],
      [LS.Q_RECYCLED_FG, qRecycledFg], [LS.T_RECYCLED_FG, tRecycledFg],
      [LS.T_INJECTED_WATER, tInjWater], [LS.Q_INJECTED_WATER, qInjWater],
      [LS.AUX_FUEL, auxFuel], [LS.BOTTOM_ASH_PCT, bottomAshPct],
      [LS.BOTTOM_ASH_TEMP, bottomAshTemp], [LS.UNBURNT_PCT, unburntPct],
      [LS.UNBURNT_LCV, unburntLCV], [LS.REF_TEMP, refTemp],
      [LS.Q_AIR_INGRESS, qAirIngress], [LS.T_AIR_INGRESS, tAirIngress],
    ];
    pairs.forEach(([k, v]) => localStorage.setItem(k, v));
  }, [wasteFlow, pressureLoss, airFlow, airTemp, feedWaterFlow, feedWaterTemp,
      blowdown, qSatSteam, pSteam, shSteamTemp, qShSteam, pShSteam, tShWater,
      qShWater, qRecycledFg, tRecycledFg, tInjWater, qInjWater, auxFuel,
      bottomAshPct, bottomAshTemp, unburntPct, unburntLCV, refTemp,
      qAirIngress, tAirIngress]);

  // ── Calcul ──
  const runCalculation = useCallback(() => {
    if (!nodeData?.result?.dataFlow) return;
    try {
      const r = performCalculation_GF(
        nodeData,
        parseFloat(wasteFlow)     || 0,
        parseFloat(pressureLoss)  || 0,
        parseFloat(airFlow)       || 0,
        parseFloat(airTemp)       || 20,
        parseFloat(feedWaterFlow) || 0,
        parseFloat(feedWaterTemp) || 0,
        parseFloat(blowdown)      || 0,
        parseFloat(qSatSteam)     || 0,
        parseFloat(pSteam)        || 0,
        parseFloat(shSteamTemp)   || 0,
        parseFloat(qShSteam)      || 0,
        parseFloat(pShSteam)      || 0,
        parseFloat(tShWater)      || 0,
        parseFloat(qShWater)      || 0,
        parseFloat(qRecycledFg)   || 0,
        parseFloat(tRecycledFg)   || 0,
        parseFloat(tInjWater)     || 0,
        parseFloat(qInjWater)     || 0,
        parseFloat(auxFuel)       || 0,
        parseFloat(bottomAshPct)  || 0,
        parseFloat(bottomAshTemp) || 0,
        parseFloat(unburntPct)    || 0,
        parseFloat(unburntLCV)    || 0,
        parseFloat(refTemp)       || 20,
        parseFloat(qAirIngress)   || 0,
        parseFloat(tAirIngress)   || 20,
      );
      setResult(r);
      // Propagation dans innerData pour rapport et OPEX
      if (innerData && onInnerDataChange) {
        Object.assign(innerData, {
          GF_result: r,
          GF_P_incinerateur_kWH: r.P_incinerateur_kWH,
          GF_PCI_kCal_kg: r.PCI_kCal_kg,
          // Données fumées amont (pour le rapport)
          FG_OUT_kg_h: nodeData.result.dataFlow
            ? {
                CO2: nodeData.result.dataFlow.Qm_CO2_kg_h || 0,
                H2O: nodeData.result.dataFlow.Qm_H2O_kg_h || 0,
                O2:  nodeData.result.dataFlow.Qm_O2_kg_h  || 0,
                N2:  nodeData.result.dataFlow.Qm_N2_kg_h  || 0,
                dry: (nodeData.result.dataFlow.Qm_CO2_kg_h || 0)
                   + (nodeData.result.dataFlow.Qm_O2_kg_h  || 0)
                   + (nodeData.result.dataFlow.Qm_N2_kg_h  || 0),
                wet: nodeData.result.dataFlow.Qm_tot_kg_h || 0,
              }
            : {},
          FG_OUT_Nm3_h: nodeData.result.dataFlow
            ? {
                CO2: nodeData.result.dataFlow.Qv_CO2_Nm3_h || 0,
                H2O: nodeData.result.dataFlow.Qv_H2O_Nm3_h || 0,
                O2:  nodeData.result.dataFlow.Qv_O2_Nm3_h  || 0,
                N2:  nodeData.result.dataFlow.Qv_N2_Nm3_h  || 0,
                dry: nodeData.result.dataFlow.Qv_sec_Nm3_h || 0,
                wet: nodeData.result.dataFlow.Qv_wet_Nm3_h || 0,
              }
            : {},
          FG_dry_Nm3_h:  nodeData.result.dataFlow?.Qv_sec_Nm3_h || 0,
          FG_wet_Nm3_h:  nodeData.result.dataFlow?.Qv_wet_Nm3_h || 0,
          O2_calcule:    (nodeData.result.dataFlow?.O2_dry_pourcent || 0) / 100,
          T_OUT:         0, // GF n'a pas de T sortie propre (amont fournit la T)
          P_out_mmCE:    nodeData.result.dataFlow?.P_mmCE || 0,
          masse_dechets: parseFloat(wasteFlow) || 0,
          // Pas de métaux lourds côté GF bilan simple
          FG_pollutant_OUT_kg_h: { HCl: 0, SO2: 0, NOx: 0, N2: nodeData.result.dataFlow?.Qm_N2_kg_h || 0, CO2: nodeData.result.dataFlow?.Qm_CO2_kg_h || 0 },
          masse_pollutant_metallique_kg_h: { HF_kg_h: 0, Hg_kg_h: 0, PCDDF_kg_h: 0, Cd_kg_h: 0, Ti_kg_h: 0, Al_kg_h: 0, As_kg_h: 0, Pb_kg_h: 0, Cr_kg_h: 0, Cu_kg_h: 0, Ni_kg_h: 0, Fe_kg_h: 0, Zn_kg_h: 0 },
          Inert_kg_h: 0,
        });
        onInnerDataChange();
      }
    } catch (e) {
      console.error('[GFCombustion] Erreur calcul:', e);
    }
  }, [nodeData, wasteFlow, pressureLoss, airFlow, airTemp, feedWaterFlow,
      feedWaterTemp, blowdown, qSatSteam, pSteam, shSteamTemp, qShSteam,
      pShSteam, tShWater, qShWater, qRecycledFg, tRecycledFg, tInjWater,
      qInjWater, auxFuel, bottomAshPct, bottomAshTemp, unburntPct, unburntLCV,
      refTemp, qAirIngress, tAirIngress, innerData, onInnerDataChange]);

  // Recalcul automatique à chaque changement de paramètre
  useEffect(() => { runCalculation(); }, [runCalculation]);

  // ── Raccourcis résultats ──
  const INCI = result?.INCI || {};
  const airComb = result?.data_air_comb || {};
  const perthes = result?.data_pertes_thermique || {};

  const hasNodeData = !!nodeData?.result?.dataFlow;

  // ── Render ──
  const sectionStyle = { border: '1px solid #d0daea', borderRadius: 6, overflow: 'hidden', marginBottom: 20 };
  const sectionTitleStyle = { fontSize: 13, fontWeight: 'bold', color: '#fff', background: '#4a90e2', margin: 0, padding: '6px 12px' };
  const bodyStyle = { padding: '8px 12px' };
  const twoColStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('Paramètres de combustion')}</h3>

      {!hasNodeData && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#856404' }}>
          Aucune donnée amont disponible. Connectez un équipement source (STACK ou autre) au nœud GF.
        </div>
      )}

      <div style={twoColStyle}>
        {/* Colonne gauche — paramètres principaux */}
        <div>
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Déchets & air</h4>
            <div style={bodyStyle}>
              <Field label="Débit déchets"             unit="kg/h"   value={wasteFlow}    onChange={e => setWasteFlow(e.target.value)} />
              <Field label="PDC amont"                  unit="mmCE"   value={pressureLoss} onChange={e => setPressureLoss(e.target.value)} />
              <Field label="Débit air combustion"       unit="Nm³/h"  value={airFlow}      onChange={e => setAirFlow(e.target.value)} />
              <Field label="T air combustion"           unit="°C"     value={airTemp}      onChange={e => setAirTemp(e.target.value)} />
              <Field label="Q air parasites"            unit="Nm³/h"  value={qAirIngress}  onChange={e => setQAirIngress(e.target.value)} />
              <Field label="T air parasites"            unit="°C"     value={tAirIngress}  onChange={e => setTAirIngress(e.target.value)} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Eau & vapeur</h4>
            <div style={bodyStyle}>
              <Field label="Q eau alimentation"         unit="kg/h"   value={feedWaterFlow} onChange={e => setFeedWaterFlow(e.target.value)} />
              <Field label="T eau alimentation"         unit="°C"     value={feedWaterTemp} onChange={e => setFeedWaterTemp(e.target.value)} />
              <Field label="Purge"                      unit="%"      value={blowdown}      onChange={e => setBlowdown(e.target.value)} />
              <Field label="Q vapeur saturée"           unit="kg/h"   value={qSatSteam}    onChange={e => setQSatSteam(e.target.value)} />
              <Field label="P vapeur saturée"           unit="bar rel" value={pSteam}       onChange={e => setPSteam(e.target.value)} />
              <Field label="T vapeur surchauffée"       unit="°C"     value={shSteamTemp}  onChange={e => setShSteamTemp(e.target.value)} />
              <Field label="Q vapeur surchauffée"       unit="kg/h"   value={qShSteam}     onChange={e => setQShSteam(e.target.value)} />
              <Field label="P vapeur surchauffée"       unit="bar rel" value={pShSteam}     onChange={e => setPShSteam(e.target.value)} />
              <Field label="T eau surchauffée"          unit="°C"     value={tShWater}     onChange={e => setTShWater(e.target.value)} />
              <Field label="Q eau surchauffée"          unit="kg/h"   value={qShWater}     onChange={e => setQShWater(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Colonne droite — paramètres secondaires */}
        <div>
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Gaz recyclés & eau injectée</h4>
            <div style={bodyStyle}>
              <Field label="Q gaz recyclés"             unit="Nm³/h"  value={qRecycledFg}  onChange={e => setQRecycledFg(e.target.value)} />
              <Field label="T gaz recyclés"             unit="°C"     value={tRecycledFg}  onChange={e => setTRecycledFg(e.target.value)} />
              <Field label="T eau injectée"             unit="°C"     value={tInjWater}    onChange={e => setTInjWater(e.target.value)} />
              <Field label="Q eau injectée"             unit="kg/h"   value={qInjWater}    onChange={e => setQInjWater(e.target.value)} />
              <Field label="Combustible appoint"        unit="kW"     value={auxFuel}      onChange={e => setAuxFuel(e.target.value)} />
              <Field label="T référence"                unit="°C"     value={refTemp}      onChange={e => setRefTemp(e.target.value)} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Mâchefers</h4>
            <div style={bodyStyle}>
              <Field label="Part mâchefers"             unit="%"      value={bottomAshPct}  onChange={e => setBottomAshPct(e.target.value)} />
              <Field label="T mâchefers"                unit="°C"     value={bottomAshTemp} onChange={e => setBottomAshTemp(e.target.value)} />
              <Field label="Imbrûlés mâchefers"         unit="%"      value={unburntPct}    onChange={e => setUnburntPct(e.target.value)} />
              <Field label="PCI imbrûlés"               unit="kcal/kg" value={unburntLCV}   onChange={e => setUnburntLCV(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Section résultats */}
      <h3>{t('Bilan énergétique')}</h3>

      {result ? (
        <div style={twoColStyle}>
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Puissances</h4>
            <div style={bodyStyle}>
              <ResultRow label="Puissance incinérateur"         value={fmt(result.P_incinerateur_kWH, 0)} unit="kW" />
              <ResultRow label="Puissance incinérateur"         value={fmt((result.P_incinerateur_kWH || 0) / 1000, 3)} unit="MW" />
              <ResultRow label="PCI déchet"                     value={fmt(result.PCI_kCal_kg, 0)} unit="kcal/kg" />
              <ResultRow label="PCI déchet"                     value={fmt((result.PCI_kCal_kg || 0) * 4.1868, 0)} unit="kJ/kg" />
              <ResultRow label="Énergie récupérée (chaudière)"  value={fmt(INCI.Energie_recuperee_chaudiere_kW, 0)} unit="kW" />
              <ResultRow label="Rendement WHB"                  value={fmt(INCI.WHB_yield_pourcent, 1)} unit="%" />
            </div>
          </div>

          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Détail bilan</h4>
            <div style={bodyStyle}>
              <ResultRow label="H vapeur saturée"               value={fmt(INCI.H_saturated_steam_kW, 0)} unit="kW" />
              <ResultRow label="H vapeur surchauffée"           value={fmt(INCI.H_superheated_steam_kW, 0)} unit="kW" />
              <ResultRow label="H eau surchauffée"              value={fmt(INCI.H_superheated_water_kW, 0)} unit="kW" />
              <ResultRow label="H fumées sortie"                value={fmt(INCI.H_out_kW, 0)} unit="kW" />
              <ResultRow label="H eau alimentat."               value={fmt(INCI.H_feed_water_kW, 0)} unit="kW" />
              <ResultRow label="H air combustion"               value={fmt(INCI.H_air_comb_kW, 0)} unit="kW" />
              <ResultRow label="H pertes thermiques"            value={fmt(INCI.H_pertes_thermiques_kW, 3)} unit="kW" />
              <ResultRow label="H imbrûlés"                     value={fmt(INCI.H_imbrule_kW, 3)} unit="kW" />
              <ResultRow label="H gaz recyclés"                 value={fmt(INCI.H_fumee_recy_kW, 3)} unit="kW" />
              <ResultRow label="H combustible appoint"          value={fmt(INCI.H_combustible_appoint_kW, 3)} unit="kW" />
              <ResultRow label="H air parasites"                value={fmt(INCI.H_tot_air_entrant_kW, 3)} unit="kW" />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 16, color: '#888', fontSize: 12 }}>
          Calcul en attente de données amont (nodeData.result.dataFlow).
        </div>
      )}
    </div>
  );
};

export default GFCombustion;
