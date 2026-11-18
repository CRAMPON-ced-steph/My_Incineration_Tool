import React, { useState, useEffect, useRef } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import ScrDenox from '../../B_Images/DENOX_img.jsx';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './DENOX_traduction';

import { fmt } from '../../A_Transverse_fonction/formatNumber';

// ─── Composants UI au niveau module (références stables → pas de perte de focus) ───
const Section = ({ title, results, children, t }) => (
  <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
    <h3 style={{ marginTop: 0, borderBottom: '2px solid #4a90e2', paddingBottom: '10px' }}>
      {title}
    </h3>
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

const ParameterInput = ({ translationKey, value, onChange, type = 'number', options = null, disabled = false, t }) => {
  const [display, setDisplay] = useState(() => value !== undefined && value !== null ? String(value) : '');
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setDisplay(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ flex: 1, minWidth: '200px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
        {t(translationKey)}:
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={display}
          onChange={(e) => { setDisplay(e.target.value); onChange(e.target.value); }}
          onFocus={() => { focused.current = true; }}
          onBlur={() => {
            focused.current = false;
            const n = parseFloat(display);
            setDisplay(isNaN(n) ? (value !== undefined && value !== null ? String(value) : '0') : String(n));
          }}
          disabled={disabled}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      )}
    </div>
  );
};

const DENOXDesign = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const getInitialValue = (paramName, defaultValue) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const opexData = getOpexData() || {};
  const {
    truck15TCO2 = 0.5,
    truck15TPrice = 2,
    truck20TCO2 = 0.6,
    truck20TPrice = 2.5,
    truck25TCO2 = 0.7,
    truck25TPrice = 3,
    powerRatio = 0.1,
    gasTypes = {},
    waterPrices = {},
    currency = '€',
  } = opexData;

  const [technologieSelectionnee, setTechnologieSelectionnee] = useState('plaques');

  // Paramètres SCR
  const [parametresSCR, setParametresSCR] = useState({
    'Débit de gaz [Nm³/h]': getInitialValue('FG_DENOX_wet_OUT_reheating', 10000),
    'Concentration NOx entrée [mg/Nm³]': getInitialValue('Concentration_NOx_entree', 500),
    'Taux de réduction NOx [%]': getInitialValue('Taux_reduction_NOx', 90),
    'Température des gaz [°C]': getInitialValue('Temperature_gaz', 350),
    'Vitesse spatiale [h⁻¹]': getInitialValue('Vitesse_spatiale', 4000),
    'Vitesse superficielle [m/s]': getInitialValue('Vitesse_superficielle', 4.5),
  });

  // Le débit de gaz suit le débit calculé par l'onglet Gaz (après réchauffage) : cet onglet
  // peut être monté avant que l'onglet Gaz ait calculé (onglets montés en arrière-plan).
  // Une saisie manuelle reste en place tant que le débit amont ne change pas.
  const debitAmont = innerData?.FG_DENOX_wet_OUT_reheating;
  const dernierDebitAmont = useRef(debitAmont);
  useEffect(() => {
    if (debitAmont === undefined || debitAmont === dernierDebitAmont.current) return;
    dernierDebitAmont.current = debitAmont;
    setParametresSCR((prev) => ({ ...prev, 'Débit de gaz [Nm³/h]': debitAmont }));
  }, [debitAmont]);

  // Paramètres FAM
  const [parametresFAM, setParametresFAM] = useState({
    'Rendement de capture [%]': getInitialValue('Rendement_capture', 99.9),
    'Vitesse de filtration [m/h]': getInitialValue('Vitesse_filtration', 60),
  });

  // Perte de charge côté fumées : calculée selon la technologie (perteCharge) ou imposée
  const [modePDC, setModePDC] = useState(() => getInitialValue('PDC_DENOX_mode', 'calculee'));
  const [pdcImposee, setPdcImposee] = useState(() => getInitialValue('PDC_DENOX_impose_mmCE', 100));

  // Extraction des paramètres
  const debitGaz = parametresSCR['Débit de gaz [Nm³/h]'];
  const concNOxEntree = parametresSCR['Concentration NOx entrée [mg/Nm³]'];
  const tauxReduction = parametresSCR['Taux de réduction NOx [%]'];
  const temperatureGaz = parametresSCR['Température des gaz [°C]'];
  const vitesseSpatiale = parametresSCR['Vitesse spatiale [h⁻¹]'];
  const vitesseSuperficielle = parametresSCR['Vitesse superficielle [m/s]'];
  const Rdt_capture = parametresFAM['Rendement de capture [%]'];
  const Vitess_filtration = parametresFAM['Vitesse de filtration [m/h]'];

  // Calculs SCR de base
  const volumeCatalyseur = debitGaz / vitesseSpatiale;
  const sectionTransversale = (debitGaz * 1.2) / (vitesseSuperficielle * 3600);
  const concNOxSortie = concNOxEntree * (1 - tauxReduction / 100);
  const consoAmmoniaque = (concNOxEntree * tauxReduction / 100 * debitGaz * 17) / (30.01 * 1000000);
  const Qv_m3_h = debitGaz * 1.2;
  const surfaceManches = Math.abs(Qv_m3_h / Vitess_filtration);

  // Calcul de la perte de charge selon la technologie
  const calculerPerteCharge = () => {
    switch (technologieSelectionnee) {
      case 'plaques':
        const nombreCouches = Math.ceil(Math.sqrt(Math.ceil(volumeCatalyseur / (1.0 * 1.0 * 0.08)) / 4));
        return 800 + (nombreCouches - 1) * 100;
      case 'nid_abeilles':
        return 500 + (1.0 * 200);
      case 'lit_fixe':
        const porosite = 0.4;
        const volumeLitTotal = volumeCatalyseur / (1 - porosite);
        const hauteurLit = Math.min(3.0, Math.max(0.5, volumeLitTotal / sectionTransversale));
        return 1500 + (hauteurLit * 300);
      default:
        return 1000;
    }
  };

  const perteChargeEstimee = calculerPerteCharge(); // Pa, selon la technologie

  // Pression : P sortie = P entrée (P_OUT du nœud amont) − perte de charge retenue
  const PA_PAR_MMCE = 9.80665;
  const PDC_mmCE = modePDC === 'imposee' ? (parseFloat(pdcImposee) || 0) : perteChargeEstimee / PA_PAR_MMCE;
  const perteCharge = PDC_mmCE * PA_PAR_MMCE; // Pa, retenue (ventilateur, affichage)
  const pressionEntree = parseFloat(innerData?.P_OUT) || 0;
  const pressionSortie = pressionEntree - PDC_mmCE;

  // Dimensionnement spécifique par technologie
  const calculerDimensionnement = () => {
    switch (technologieSelectionnee) {
      case 'plaques':
        const volumePlaque = 1.0 * 1.0 * 0.08;
        const nombrePlaques = Math.ceil(volumeCatalyseur / volumePlaque);
        const nombreCouches = Math.ceil(Math.sqrt(nombrePlaques / 4));
        const plaquesParCouche = Math.ceil(nombrePlaques / nombreCouches);
        const hauteurTotale = nombreCouches * 0.08;
        const largeurReacteur = Math.ceil(Math.sqrt(plaquesParCouche)) * 1.0;
        const longueurReacteur = Math.ceil(plaquesParCouche / Math.ceil(Math.sqrt(plaquesParCouche))) * 1.0;

        return {
          'Nombre de plaques': nombrePlaques,
          'Nombre de couches': nombreCouches,
          'Plaques par couche': plaquesParCouche,
          'Hauteur réacteur [m]': fmt(hauteurTotale, 2),
          'Largeur réacteur [m]': fmt(largeurReacteur, 2),
          'Longueur réacteur [m]': fmt(longueurReacteur, 2),
          'Volume total plaques [m³]': fmt((nombrePlaques * volumePlaque), 2)
        };

      case 'nid_abeilles':
        const volumeElement = 0.15 * 0.15 * 1.0;
        const nombreElements = Math.ceil(volumeCatalyseur / volumeElement);
        const elementsParRangee = Math.ceil(Math.sqrt(nombreElements));
        const nombreRangees = Math.ceil(nombreElements / elementsParRangee);

        return {
          'Nombre d\'éléments': nombreElements,
          'Éléments par rangée': elementsParRangee,
          'Nombre de rangées': nombreRangees,
          'Hauteur réacteur [m]': '1.00',
          'Largeur réacteur [m]': fmt((elementsParRangee * 0.15), 2),
          'Longueur réacteur [m]': fmt((nombreRangees * 0.15), 2),
          'Densité cellulaire [cpsi]': '400',
          'Volume total éléments [m³]': fmt((nombreElements * volumeElement), 2)
        };

      case 'lit_fixe':
        const porosite = 0.4;
        const volumeLitTotal = volumeCatalyseur / (1 - porosite);
        const hauteurLit = Math.min(3.0, Math.max(0.5, volumeLitTotal / sectionTransversale));
        const sectionLitRecalculee = volumeLitTotal / hauteurLit;
        const diametreLit = Math.sqrt(4 * sectionLitRecalculee / Math.PI);
        const masseCatalyseur = volumeCatalyseur * 600;

        return {
          'Volume lit total [m³]': fmt(volumeLitTotal, 2),
          'Hauteur du lit [m]': fmt(hauteurLit, 2),
          'Diamètre réacteur [m]': fmt(diametreLit, 2),
          'Section du lit [m²]': fmt(sectionLitRecalculee, 2),
          'Porosité du lit [%]': fmt((porosite * 100), 1),
          'Masse catalyseur [kg]': fmt(masseCatalyseur, 0),
          'Densité apparente [kg/m³]': '600'
        };

      default:
        return {};
    }
  };

  const dimensionnementSpecifique = calculerDimensionnement();

  // Gestion des changements de paramètres
  const handleSCRChange = (name, value) => {
    const numericValue = parseFloat(value) || 0;
    let validatedValue = numericValue;

    if (name === 'Taux de réduction NOx [%]') {
      validatedValue = Math.max(0, Math.min(100, numericValue));
    }
    if (name === 'Vitesse spatiale [h⁻¹]') {
      validatedValue = Math.max(2000, Math.min(8000, numericValue));
    }
    if (name === 'Température des gaz [°C]') {
      validatedValue = Math.max(250, Math.min(450, numericValue));
    }

    setParametresSCR(prev => ({ ...prev, [name]: validatedValue }));
  };

  const handleFAMChange = (name, value) => {
    const numericValue = parseFloat(value) || 0;
    let validatedValue = numericValue;

    if (name === 'Rendement de capture [%]') {
      validatedValue = Math.max(0, Math.min(100, numericValue));
    }
    if (name === 'Vitesse de filtration [m/h]') {
      validatedValue = Math.max(30, Math.min(100, numericValue));
    }

    setParametresFAM(prev => ({ ...prev, [name]: validatedValue }));
  };

  // Paramètres calculés
  const elementsGeneral = [
    { text: t('Volume catalyseur requis [m³]'), value: fmt(volumeCatalyseur, 2) },
    { text: t('Section transversale [m²]'), value: fmt(sectionTransversale, 2) },
    { text: t('Concentration NOx sortie [mg/Nm³]'), value: fmt(concNOxSortie, 1) },
    { text: t('Consommation NH₃ [kg/h]'), value: fmt(consoAmmoniaque, 2) },
    { text: t('Perte de charge [Pa]'), value: fmt(perteCharge, 0) },
    { text: t('Surface des manches [m²]'), value: fmt(surfaceManches, 2) },
    { text: t("Pression d'entrée [mmCE]"), value: fmt(pressionEntree, 2) },
    { text: t('Perte de charge retenue [mmCE]'), value: fmt(PDC_mmCE, 1) },
    { text: t('Pression de sortie [mmCE]'), value: fmt(pressionSortie, 2) },
  ];

  const elementsSpecifiques = Object.entries(dimensionnementSpecifique).map(([key, value]) => ({
    text: t(key),
    value: value.toString()
  }));

  // Synchronisation des données
  useEffect(() => {
    if (setInnerData && typeof setInnerData === 'function') {
      const consoElec1 = 2 + (perteCharge / 1000 * debitGaz / 10000);
      const consoElec2 = 0.5;

      setInnerData(prevData => ({
        ...prevData,
        Pin_mmCE: pressionEntree,
        PDC_DENOX_mode: modePDC,
        PDC_DENOX_impose_mmCE: pdcImposee,
        PDC_DENOX_mmCE: PDC_mmCE,
        P_out_mmCE: pressionSortie,
        consoElec1: Math.round(consoElec1 * 100) / 100,
        consoElec2: Math.round(consoElec2 * 100) / 100,
        labelElec1: 'Ventilateur SCR',
        labelElec2: 'Pompe NH₃',
        Conso_Ammonia_kg: Math.round((parseFloat(consoAmmoniaque) || 0) * 100) / 100,
        conso_air_co_N_m3: 0,
      }));
    }
  }, [perteCharge, debitGaz, consoAmmoniaque, pressionEntree, pressionSortie, modePDC, pdcImposee, PDC_mmCE, setInnerData]);

  return (
    <div className="cadre_pour_onglet">
      {/* Sélection de technologie */}
      <Section title={t('Technologie SCR')} t={t}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: 1, minWidth: '200px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
            {t('Technologie SCR')}:
          </label>
          <select
            value={technologieSelectionnee}
            onChange={(e) => setTechnologieSelectionnee(e.target.value)}
            style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="plaques">{t('Plaques catalytiques')}</option>
            <option value="nid_abeilles">{t("Nid d'abeilles")}</option>
            <option value="lit_fixe">{t('Lit fixe')}</option>
          </select>
        </div>
      </Section>

      {/* Image */}
      <div style={{ textAlign: 'left', marginBottom: '30px', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}><ScrDenox /></div>
      </div>

      {/* Paramètres SCR */}
      <Section title={t('Paramètres SCR')} t={t}>
        {Object.entries(parametresSCR).map(([key, value]) => (
          <ParameterInput
            key={key}
            translationKey={key}
            value={value}
            onChange={(v) => handleSCRChange(key, v)}
            t={t}
          />
        ))}
      </Section>

      {/* Paramètres FAM */}
      <Section title={t('Paramètres FAM')} t={t}>
        {Object.entries(parametresFAM).map(([key, value]) => (
          <ParameterInput
            key={key}
            translationKey={key}
            value={value}
            onChange={(v) => handleFAMChange(key, v)}
            t={t}
          />
        ))}
      </Section>

      {/* Pression aéraulique : perte de charge calculée (technologie) ou imposée */}
      <Section title={t('Pression aéraulique')} t={t}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: 1, minWidth: '200px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
            {t('Perte de charge DeNOx')}:
          </label>
          <select
            value={modePDC}
            onChange={(e) => setModePDC(e.target.value)}
            style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="calculee">{t('Calculée (technologie)')}</option>
            <option value="imposee">{t('Imposée')}</option>
          </select>
        </div>
        <ParameterInput
          translationKey="Perte de charge imposée [mmCE]"
          value={pdcImposee}
          onChange={(v) => setPdcImposee(Math.max(0, parseFloat(v) || 0))}
          disabled={modePDC !== 'imposee'}
          t={t}
        />
      </Section>

      {/* Résultats généraux */}
      <Section title={t('Paramètres Calculés Généraux')} results={elementsGeneral} t={t} />

      {/* Dimensionnement spécifique */}
      <Section
        title={t('Dimensionnement Spécifique')}
        results={elementsSpecifiques}
        t={t}
      />

      {/* Résumé */}
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
        <h3>{t('Résumé des paramètres principaux')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <p><strong>{t('Technologie')}:</strong> {technologieSelectionnee.replace('_', ' ')}</p>
          <p><strong>{t('Volume catalyseur [m³]')}:</strong> {fmt(volumeCatalyseur, 2)}</p>
          <p><strong>{t('Taux de réduction NOx [%]')}:</strong> {tauxReduction}%</p>
          <p><strong>{t('Concentration NOx sortie [mg/Nm³]')}:</strong> {fmt(concNOxSortie, 1)}</p>
          <p><strong>{t('Consommation NH₃ [kg/h]')}:</strong> {fmt(consoAmmoniaque, 2)}</p>
          <p><strong>{t('Surface des manches [m²]')}:</strong> {fmt(surfaceManches, 2)}</p>
          <p><strong>{t('Perte de charge [Pa]')}:</strong> {fmt(perteCharge, 0)}</p>
          <p><strong>{t('Pression de sortie [mmCE]')}:</strong> {fmt(pressionSortie, 2)}</p>
        </div>
      </div>
    </div>
  );
};

export default DENOXDesign;
