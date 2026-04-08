import React, { useState, useRef, useCallback, useMemo } from 'react';
import BouesTab from './1_BouesTab';
import CombustionTab from './2_CombustionTab_amelioree';

//import CombustionTab from './2_CombustionTabTequi';

import Pollutant from './3_Pollutant_Emission';
import DimensionnementTab from './3_VouteTab';
import Recuperateur from './4_Recuperator';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';

const FBMainPage = ({ innerData, nodeData, title, onSendData, onClose, onGoBack, currentLanguage = 'fr' }) => {
  // ============================================================
  // LANGUAGE MANAGEMENT
  // ============================================================
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  console.log(currentLanguage);
  console.log(languageCode);

  // ============================================================
  // STATE & REFS
  // ============================================================

  // ✅ innerDataRef : ref partagée pour les mutations directes
  // Contient TOUTES les données échangées entre onglets
  const innerDataRef = useRef({});

  // ✅ combustionResults est un STATE (pas une ref)
  // CombustionTab appelle onResultsChange → setCombustionResults → nouvel objet créé
  // → React détecte le changement de prop dans RecuperateurHX
  const [combustionResults, setCombustionResults] = useState({});

  // ✅ Compteur de version pour forcer le re-render des onglets aval
  const [innerDataTick, setInnerDataTick] = useState(0);
  const notifyInnerDataChanged = useCallback(() => {
    setInnerDataTick((t) => t + 1);
  }, []);

  // ✅ State pour onglet actif
  const [activeTab, setActiveTab] = useState('boues');

  // ============================================================
  // TABS CONFIGURATION — RÉACTIF À LA LANGUE
  // ============================================================
  // ✨ useMemo + dépendance [currentLanguage] = traduction dynamique des titres
  const tabs = useMemo(() => [
    { name: 'boues', label: t('Caractéristiques des Boues') || 'Caractéristiques des Boues' },
    { name: 'combustion', label: t('Combustion') || 'Combustion' },
    { name: 'pollutant', label: t('Polluant') || 'Polluant' },
    { name: 'voute', label: t('Voûte') || 'Voûte' },
    { name: 'HX', label: t('HX') || 'HX' },
  ], [currentLanguage]);

  // ============================================================
  // HANDLERS — SEND DATA & BACK
  // ============================================================

  const sendAllData = useCallback(() => {
    console.log('=== FB SEND DATA DEBUG ===');
    console.log('innerDataRef.current:', innerDataRef.current);
    console.log('onSendData type:', typeof onSendData);

    if (!onSendData || typeof onSendData !== 'function') {
      console.error('❌ ERROR: onSendData callback is not defined or is not a function!');
      alert('Erreur : Le callback onSendData n\'est pas défini.');
      return;
    }

    try {
      // ✅ DONNÉES COHÉRENTES
      const dataToSend = {
        result: {
          // === COMBUSTION (depuis CombustionTab) ===
          FG_OUT_kg_h: innerDataRef.current['FG_OUT_kg_h'] || {
            CO2: 0,
            O2: 0,
            H2O: 0,
            N2: 0,
            dry: 0,
            wet: 0,
          },
          FG_OUT_Nm3_h: innerDataRef.current['FG_OUT_Nm3_h'] || {
            CO2: 0,
            O2: 0,
            H2O: 0,
            N2: 0,
            dry: 0,
            wet: 0,
          },
          FG_pollutant_OUT_kg_h: innerDataRef.current['FG_pollutant_OUT_kg_h'] || {
            NOx: 0,
            HCl: 0,
            SO2: 0,
            N2: 0,
            CO2: 0,
          },
          O2_calcule: innerDataRef.current['O2_calcule'] ?? 0,

          // ✅ Température fumées sortie HX
          T_OUT: innerDataRef.current['T_fumee_sortie_HX_C'] ?? 0,

          // ✅ Pression sortie HX (depuis onglet Recuperateur)
          P_out_mmCE: innerDataRef.current['P_sortie_HX_mmCE'] ?? 0,

          // === POLLUANT (depuis Pollutant_Emission) ===
          PollutantInput: innerDataRef.current['PInput'] || {},
          PollutantOutput: innerDataRef.current['Poutput'] || {},
          Residus: innerDataRef.current['Residus'] || {
            DryBottomAsh_kg_h: 0,
            WetBottomAsh_kg_h: 0,
            FlyAsh_kg_h: 0,
          },
          REFIDIS: innerDataRef.current['REFIDIS'] ?? 0,
          Conso_reactifs: innerDataRef.current['Conso_reactifs'] || {},

          // === DONNÉES BOUE ===
          MasseBoueBrute: innerDataRef.current['MasseBoueBrute'] ?? 0,
          masse_dechets: innerDataRef.current['MasseBoueBrute'] ?? 0,
        },
      };

      console.log('✅ Data to send:', dataToSend);

      // ✅ CONSOLE LOG DÉTAILLÉ POUR VÉRIFICATION
      console.group('📤 === FBMAINPAGE SEND DATA — VÉRIFICATION COMPLÈTE ===');

      console.group('🔥 COMBUSTION');
      console.log('FG_OUT_kg_h:', dataToSend.result.FG_OUT_kg_h);
      console.log('FG_OUT_Nm3_h:', dataToSend.result.FG_OUT_Nm3_h);
      console.log('FG_pollutant_OUT_kg_h:', dataToSend.result.FG_pollutant_OUT_kg_h);
      console.log('O2_calcule:', dataToSend.result.O2_calcule);
      console.log('T_OUT (T_fumee_sortie_HX_C):', dataToSend.result.T_OUT);
      console.log('P_out_mmCE (P_sortie_HX_mmCE):', dataToSend.result.P_out_mmCE);
      console.groupEnd();

      console.group('💨 POLLUANT');
      console.log('PollutantInput (PInput):', dataToSend.result.PollutantInput);
      console.log('PollutantOutput (Poutput):', dataToSend.result.PollutantOutput);
      console.log('Residus:', dataToSend.result.Residus);
      console.log('REFIDIS (mass_residus_tot):', dataToSend.result.REFIDIS);
      console.log('Conso_reactifs:', dataToSend.result.Conso_reactifs);
      console.groupEnd();

      console.group('🧪 BOUES');
      console.log('MasseBoueBrute:', dataToSend.result.MasseBoueBrute);
      console.log('masse_dechets:', dataToSend.result.masse_dechets);
      console.groupEnd();

      console.group('📋 INNERDATA SUMMARY');
      console.log('innerDataRef.current keys:', Object.keys(innerDataRef.current));
      console.log('Full innerDataRef.current:', innerDataRef.current);
      console.groupEnd();

      console.groupEnd();

      onSendData(dataToSend);
      console.log('✅ Data sent successfully!');
    } catch (error) {
      console.error('❌ Error sending data:', error);
      alert('Erreur lors de l\'envoi des données : ' + error.message);
    }
  }, [onSendData]);

  const handleBackToFlow = useCallback(() => {
    console.log('Going back to flow...');
    sendAllData();
    if (onGoBack && typeof onGoBack === 'function') {
      onGoBack(null);
    }
  }, [sendAllData, onGoBack]);

  // ============================================================
  // HANDLERS — CLEAR & SAVE
  // ============================================================

  const clearForm = useCallback(() => {
    // Réinitialiser les refs et state
    innerDataRef.current = {};
    setCombustionResults({});

    // Supprimer les données du localStorage
    const keys = [
      'bouesTab_fonctionnement',
      'bouesTab_boue',
      'bouesTab_chons',
      'bouesTab_heavyMetals',
      'emissions',
      'Temperatures_imposees',
      'thermalParams',
      'emissions2',
    ];
    keys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.warn(`Failed to remove localStorage key: ${k}`, e);
      }
    });

    // Recharger la page
    window.location.reload();
  }, []);

  const saveData = useCallback(() => {
    const d = innerDataRef.current;

    // Créer un résumé de ce qui a été enregistré
    const summary = [
      'DONNÉES ENREGISTRÉES AVEC SUCCÈS',
      '',
      '📅 FONCTIONNEMENT',
      `• ${d.daysPerWeek ?? 0} jours/semaine × ${d.hoursPerDay ?? 0} h/jour`,
      `• Total: ${d.totalHoursPerWeek ?? 0} heures/semaine`,
      '',
      '🧪 CARACTÉRISTIQUES DES BOUES',
      `• Type: ${d.sludgeType ?? ''}`,
      `• Siccité: ${d.MS_pourcent ?? 0}%`,
      `• Quantité: ${d.MS_kg_h ?? 0} kg MS/h`,
      `• Matière volatile: ${d.MV_kg_h ?? 0} kg/h`,
      `• Matière brute: ${d.MasseBoueBrute ?? 0} kg/h`,
      '',
      '🔥 COMBUSTION',
      `• PCI boue: ${d.PCIKCALKGMV ?? 0} kCal/kg MV`,
      `• Excès d\'air: ${d.Exces_air ?? 0}%`,
      `• Temp. fumée voûte: ${d.Temp_fumee_voute_C ?? 0} °C`,
      '',
      '💨 FUMÉES',
      `• Débit humide: ${d.FG_OUT_Nm3_h?.wet ?? 0} Nm³/h`,
      `• Débit sec: ${d.FG_OUT_Nm3_h?.dry ?? 0} Nm³/h`,
      `• O₂ calculé: ${((d.O2_calcule ?? 0) * 100).toFixed(2)}%`,
    ].join('\n');

    // Afficher l'alerte
    alert(summary);

    // Sauvegarder dans localStorage
    localStorage.setItem('bouesData', JSON.stringify(d));
    console.log('innerData complet sauvegardé:', d);
  }, []);

  const isSaveBtnDisabled = () => {
    const d = innerDataRef.current;
    return !d.daysPerWeek || !d.hoursPerDay || !d.sludgeType || !d.MS_pourcent || !d.MS_kg_h;
  };

  // ============================================================
  // HANDLERS — DATA FLOW
  // ============================================================

  // ✅ Callback pour DimensionnementTab — transmet résultats dans innerData
  const handleDimensionnementData = useCallback((data) => {
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      const hasChanged = Object.entries(data).some(
        ([key, value]) => innerDataRef.current[key] !== value
      );

      if (hasChanged) {
        Object.assign(innerDataRef.current, data);
        // Déclencher un tick SEULEMENT si les données ont vraiment changé
        setInnerDataTick((t) => t + 1);
      }
    }
  }, []);

  // ============================================================
  // RENDER TAB CONTENT
  // ============================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'boues':
        return (
          <BouesTab
            innerData={innerDataRef.current}
            currentLanguage={currentLanguage}
          />
        );

      case 'combustion':
        return (
          <CombustionTab
            innerData={innerDataRef.current}
            onInnerDataChange={notifyInnerDataChanged}
            onResultsChange={setCombustionResults}
            currentLanguage={currentLanguage}
          />
        );

      case 'pollutant':
        return (
          <Pollutant
            innerData={innerDataRef.current}
            onInnerDataChange={notifyInnerDataChanged}
            currentLanguage={currentLanguage}
          />
        );

      case 'voute':
        return (
          <DimensionnementTab
            innerData={innerDataRef.current}
            innerDataTick={innerDataTick}
            onDataChange={handleDimensionnementData}
            currentLanguage={currentLanguage}
          />
        );

      case 'HX':
        return (
          <Recuperateur
            innerData={innerDataRef.current}
            combustionResults={combustionResults}
            currentLanguage={currentLanguage}
          />
        );

      default:
        return null;
    }
  };

  // ============================================================
  // STYLES
  // ============================================================

  const tabButtonStyle = (isActive) => ({
    padding: '10px 20px',
    background: isActive ? '#4a90e2' : 'white',
    color: isActive ? 'white' : '#333',
    border: 'none',
    borderBottom: isActive ? '2px solid #4a90e2' : '2px solid transparent',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    flex: 1,
    minWidth: '200px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  });

  const actionButtonStyle = (color) => ({
    padding: '8px 16px',
    background: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="container" style={{ padding: '0' }}>
      {/* ════════════════════════════════════════ HEADER ════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1a202c' }}>
          {t('Caractéristiques de Fonctionnement') || 'Caractéristiques de Fonctionnement'} - Four à Lit Fluidisé
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={clearForm}
            style={actionButtonStyle('#ef4444')}
            title={t('Réinitialiser et recharger l\'application') || 'Réinitialiser et recharger l\'application'}
          >
            {t('Effacer') || 'Effacer'}
          </button>
          <button
            onClick={saveData}
            disabled={isSaveBtnDisabled()}
            style={{
              ...actionButtonStyle(isSaveBtnDisabled() ? '#cccccc' : '#28a745'),
              cursor: isSaveBtnDisabled() ? 'not-allowed' : 'pointer',
              opacity: isSaveBtnDisabled() ? 0.6 : 1,
            }}
            title={
              isSaveBtnDisabled()
                ? t('Complétez les données boues obligatoires') || 'Complétez les données boues obligatoires'
                : t('Enregistrer les données') || 'Enregistrer les données'
            }
          >
            {t('Enregistrer') || 'Enregistrer'}
          </button>

          <button
            onClick={handleBackToFlow}
            style={actionButtonStyle('#4a90e2')}
            title={t('Envoyer les données et retourner au flow') || 'Envoyer les données et retourner au flow'}
          >
            {t('Retour au flow') || 'Retour au flow'}
          </button>
          <button
            onClick={sendAllData}
            style={actionButtonStyle('#10b981')}
            title={t('Envoyer les données au nœud suivant') || 'Envoyer les données au nœud suivant'}
          >
            {t('Envoyer données') || 'Envoyer données'}
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════ DIVIDER ════════════════════════════════════════ */}
      <div className="underline" style={{ height: '2px', backgroundColor: '#e5e7eb', margin: '0 20px 20px 20px' }} />

      {/* ════════════════════════════════════════ TABS ════════════════════════════════════════ */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px', padding: '0 20px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={tabButtonStyle(activeTab === tab.name)}
            title={`${t('Aller à l\'onglet') || 'Aller à l\'onglet'}: ${tab.label}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════ CONTENT ════════════════════════════════════════ */}
      <div
        style={{
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '8px',
          minHeight: '500px',
          margin: '0 20px 20px 20px',
        }}
      >
        {renderTabContent()}
      </div>

      {/* ════════════════════════════════════════ FOOTER ════════════════════════════════════════ */}
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '12px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <p>Application de dimensionnement - Four à Lit Fluidisé | v1.0</p>
      </div>
    </div>
  );
};

export default FBMainPage;