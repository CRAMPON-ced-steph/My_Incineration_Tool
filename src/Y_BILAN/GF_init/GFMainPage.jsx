/**
 * GFMainPage.jsx
 * Page principale — Four à Grille (Grate Furnace), mode Bilan.
 *
 * Architecture identique à FBMainPage :
 *  - innerDataRef  → objet mutable partagé entre onglets
 *  - notifyInnerDataChanged  → déclenche re-render des onglets aval
 *  - sendAllData  → appelle onSendData({ result: { ...innerData } })
 *
 * Onglets :
 *  1. Gaz de combustion   (1_GF_Combustion_ML.jsx)
 *  2. Émissions polluantes (2_GF_Pollutant_Emission_ML.jsx)
 *  3. OPEX                (3_GF_Opex.jsx)
 *  4. Rapport             (GF_Report.jsx)
 */
import React, { useState, useRef, useCallback, useMemo } from 'react';
import GFCombustion from './1_GF_Combustion_ML';
import GFPollutantEmission from './2_GF_Pollutant_Emission_ML';
import GFOpex from './3_GF_Opex';
import GF_Report from './GF_Report';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './GF_traduction';

const GFMainPage = ({
  innerData: _innerDataProp,
  nodeData,
  title,
  onSendData,
  onClose,
  onGoBack,
  currentLanguage = 'fr',
}) => {
  // ── Langue ──────────────────────────────────────────────────────────────────
  const languageCode = getLanguageCode(currentLanguage);
  const t = useMemo(() => {
    const tr = translations[languageCode] || translations['fr'];
    return (key) => tr[key] || key;
  }, [languageCode]);

  // ── innerData partagé (ref mutable) ─────────────────────────────────────────
  const innerDataRef = useRef({});

  // Compteur de version pour forcer les re-renders des onglets aval
  const [innerDataTick, setInnerDataTick] = useState(0);
  const notifyInnerDataChanged = useCallback(() => {
    setInnerDataTick(n => n + 1);
  }, []);

  // Setter compatible avec le pattern setInnerData(prev => ...) ou setInnerData(obj)
  const setInnerData = useCallback((updater) => {
    const newVal = typeof updater === 'function' ? updater(innerDataRef.current) : updater;
    Object.assign(innerDataRef.current, newVal);
    notifyInnerDataChanged();
  }, [notifyInnerDataChanged]);

  // ── Onglet actif ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('combustion');

  const tabs = useMemo(() => [
    { name: 'combustion', label: t('Gaz de combustion') },
    { name: 'pollutant',  label: t('Émissions polluantes') },
    { name: 'opex',       label: t('OPEX') },
    { name: 'rapport',    label: t('Rapport') },
  ], [languageCode]);

  // ── sendAllData ──────────────────────────────────────────────────────────────
  const sendAllData = useCallback(() => {
    if (!onSendData || typeof onSendData !== 'function') {
      console.error('[GFMainPage] onSendData is not a function');
      return;
    }
    try {
      const d = innerDataRef.current;
      const dataToSend = {
        result: {
          // Fumées de combustion
          FG_OUT_kg_h:           d.FG_OUT_kg_h           || { CO2: 0, H2O: 0, O2: 0, N2: 0, dry: 0, wet: 0 },
          FG_OUT_Nm3_h:          d.FG_OUT_Nm3_h          || { CO2: 0, H2O: 0, O2: 0, N2: 0, dry: 0, wet: 0 },
          FG_pollutant_OUT_kg_h: d.FG_pollutant_OUT_kg_h || { HCl: 0, SO2: 0, NOx: 0, N2: 0, CO2: 0 },
          O2_calcule:            d.O2_calcule             ?? 0,
          T_OUT:                 d.T_OUT                  ?? 0,
          P_out_mmCE:            d.P_out_mmCE             ?? 0,

          // Bilan énergétique GF
          GF_result:             d.GF_result              || {},
          GF_P_incinerateur_kWH: d.GF_P_incinerateur_kWH ?? 0,
          GF_PCI_kCal_kg:        d.GF_PCI_kCal_kg        ?? 0,

          // Polluants
          PollutantInput:        d.PInput                 || {},
          PollutantOutput:       d.Poutput                || {},
          Residus:               d.Residus                || { DryBottomAsh_kg_h: 0, WetBottomAsh_kg_h: 0, FlyAsh_kg_h: 0 },
          REFIDIS:               d.REFIDIS                ?? 0,
          Conso_reactifs:        d.Conso_reactifs         || {},

          // Débit déchet
          masse_dechets:         d.masse_dechets          ?? 0,
        },
      };
      onSendData(dataToSend);
    } catch (err) {
      console.error('[GFMainPage] Erreur sendAllData:', err);
      alert('Erreur lors de l\'envoi des données : ' + err.message);
    }
  }, [onSendData]);

  const handleBackToFlow = useCallback(() => {
    sendAllData();
    if (onGoBack && typeof onGoBack === 'function') onGoBack(null);
  }, [sendAllData, onGoBack]);

  const clearForm = useCallback(() => {
    innerDataRef.current = {};
    const keys = [
      'emissions_GF', 'emissions2_GF', 'Waste_flow_rate_kg_h_GF', 'Pressure_losse_mmCE_GF',
      'Combustion_air_flowrate_Nm3_h_GF', 'Measured_air_temperature_C_GF',
      'Q_feed_water_kg_h_GF', 'T_feed_water_C_GF', 'Blowdown_pourcent_GF',
      'Q_saturated_steam_GF', 'Steam_pressure_gauge_bar_GF',
      'super_heated_steam_temperature_C_GF', 'Q_superheated_steam_kg_h_GF',
      'P_superheated_steam_bar_GF', 'T_superheated_water_boiler_C_GF',
      'Q_superheated_water_kg_h_GF', 'Q_recycled_flue_gas_Nm3_h_GF',
      'T_recycled_flue_gas_C_GF', 'Injected_water_temperature_C_GF',
      'Q_treatment_injected_water_kg_h_GF', 'Auxiliary_fuel_kWh_GF',
      'Bottom_ash_pourcent_GF', 'Bottom_ash_temperature_C_GF',
      'Unburnt_bottom_ash_pourcent_GF', 'Unburnt_LCV_kcal_kg_GF',
      'Reference_temperature_C_GF', 'Q_air_ingress_Nm3_h_GF', 'T_air_ingress_C_GF',
      'opexDashboard_GF',
    ];
    keys.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
    window.location.reload();
  }, []);

  // ── Rendu onglets ─────────────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'combustion':
        return (
          <GFCombustion
            innerData={innerDataRef.current}
            nodeData={nodeData}
            onInnerDataChange={notifyInnerDataChanged}
            currentLanguage={currentLanguage}
          />
        );
      case 'pollutant':
        return (
          <GFPollutantEmission
            innerData={innerDataRef.current}
            setInnerData={setInnerData}
            currentLanguage={currentLanguage}
          />
        );
      case 'opex':
        return (
          <GFOpex
            innerData={innerDataRef.current}
            setInnerData={setInnerData}
            currentLanguage={currentLanguage}
          />
        );
      case 'rapport':
        return (
          <GF_Report
            innerData={innerDataRef.current}
            currentLanguage={currentLanguage}
          />
        );
      default:
        return null;
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────────
  const tabBtnStyle = (isActive) => ({
    padding: '10px 20px',
    background: isActive ? '#fb8c00' : 'white',
    color: isActive ? 'white' : '#333',
    border: 'none',
    borderBottom: isActive ? '2px solid #fb8c00' : '2px solid transparent',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    flex: 1,
    minWidth: 160,
    fontSize: 14,
    transition: 'all 0.2s ease',
  });

  const actionBtnStyle = (color) => ({
    padding: '8px 16px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s ease',
  });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#1a202c' }}>
          {t('Caractéristiques de Fonctionnement')} — Four à Grille (GF)
        </h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={clearForm}       style={actionBtnStyle('#ef4444')}>{t('Effacer')}</button>
          <button onClick={handleBackToFlow} style={actionBtnStyle('#fb8c00')}>{t('Retour au flow')}</button>
          <button onClick={sendAllData}      style={actionBtnStyle('#10b981')}>{t('Envoyer données')}</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 2, backgroundColor: '#e5e7eb', margin: '0 20px 20px' }} />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: 20, padding: '0 20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={tabBtnStyle(activeTab === tab.name)}
            title={`${t('Aller à l\'onglet')}: ${tab.label}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 20, background: '#f9f9f9', borderRadius: 8, minHeight: 500, margin: '0 20px 20px' }}>
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 12, borderTop: '1px solid #e5e7eb' }}>
        <p>Application de dimensionnement — Four à Grille (GF) | v1.0</p>
      </div>
    </div>
  );
};

export default GFMainPage;
