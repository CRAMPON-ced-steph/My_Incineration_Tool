import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import SprayTower from '../../B_Images/quench_img.jsx';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './COOLINGTOWER_traduction';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';

import { fmt } from '../../A_Transverse_fonction/formatNumber';

// ─── Composants UI au niveau module (références stables → pas de perte de focus) ───
const Section = ({ title, children, results: sectionResults, t }) => (
  <div className="mb-6 p-6 bg-gray-50 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">
      {title}
    </h3>
    <div className="space-y-4">
      {children}
      {sectionResults && sectionResults.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <h4 className="font-semibold text-gray-700 mb-3">{t('Résultats')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionResults.map((result, idx) => (
              <div key={idx} className="text-sm">
                <p className="text-gray-600">
                  <strong>{result.label}:</strong> {result.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const ParameterInput = ({ label, name, value, onChange, type = 'number', options = null }) => {
  const [display, setDisplay] = useState(() => value !== undefined && value !== null ? String(value) : '');
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setDisplay(value !== undefined && value !== null ? String(value) : '');
    }
  }, [value]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <label className="w-full sm:w-64 text-sm font-medium text-gray-700">
        {label}:
      </label>
      {options ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full sm:w-72 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        >
          {options.map(opt => (typeof opt === 'object'
            ? <option key={opt.value} value={opt.value}>{opt.label}</option>
            : <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={display}
          onChange={(e) => {
            setDisplay(e.target.value);
            onChange(e);
          }}
          onFocus={() => { focused.current = true; }}
          onBlur={() => {
            focused.current = false;
            const n = parseFloat(display);
            setDisplay(isNaN(n) ? (value !== undefined && value !== null ? String(value) : '0') : String(n));
          }}
          className="w-full sm:w-72 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        />
      )}
    </div>
  );
};

const ResultsGrid = ({ results: resultsData, t }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('Résultats')}</h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold text-lg text-gray-700 mb-3">{t('Caractéristiques calculées')}</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><strong>{t('Hauteur minimale')}:</strong> {fmt(resultsData.height, 2)} m</li>
          <li><strong>SMD:</strong> {fmt((resultsData.sprayCharacteristics.smd * 1e6), 1)} μm</li>
          <li><strong>{t('Vitesse des gouttes')}:</strong> {fmt(resultsData.sprayCharacteristics.dropletVelocity, 1)} m/s</li>
          <li><strong>{t('Angle de spray')}:</strong> {fmt(resultsData.sprayCharacteristics.sprayAngle, 1)}°</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-lg text-gray-700 mb-3">{t('Qualité du spray')}</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li><strong>{t('Atomisation')}:</strong> {resultsData.sprayQuality.atomization}</li>
          <li><strong>{t('Uniformité')}:</strong> {resultsData.sprayQuality.uniformity}</li>
          <li><strong>{t('Couverture')}:</strong> {resultsData.sprayQuality.coverage}</li>
        </ul>
      </div>
    </div>
  </div>
);

// Types d'eau de pulvérisation → clé OPEX (même liste que le quench)
const TYPES_EAU = {
  'eau potable': 'Conso_EauPotable_m3',
  'eau de refroidissement': 'Conso_EauRefroidissement_m3',
  'eau déminéralisée': 'Conso_EauDemin_m3',
  'eau adoucie': 'Conso_EauAdoucie_m3',
  'eau de rivière': 'Conso_EauRiviere_m3',
};
const PRIX_EAU = {
  'eau potable': 'potable', 'eau de refroidissement': 'cooling', 'eau déminéralisée': 'demineralized',
  'eau adoucie': 'soft', 'eau de rivière': 'river',
};

const COOLINGTOWERDesign = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  // t stable : une fonction recréée à chaque rendu relançait les effets en boucle.
  const t = useCallback(
    (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key,
    [languageCode]
  );

  // ========== NOZZLE TYPES CONFIGURATION ==========
  const NOZZLE_TYPES = {
    HOLLOW_CONE: {
      name: t('Cône creux'),
      defaultN: 2.8,
      dMeanRange: { min: 0.0001, max: 0.0003 },
      description: t('Distribution étroite, bon pour l\'uniformité')
    },
    FULL_CONE: {
      name: t('Cône plein'),
      defaultN: 2.3,
      dMeanRange: { min: 0.00015, max: 0.0004 },
      description: t('Distribution plus large, meilleure couverture')
    },
    FLAT_JET: {
      name: t('Jet plat'),
      defaultN: 2.0,
      dMeanRange: { min: 0.0002, max: 0.0005 },
      description: t('Distribution large, bon pour les grandes surfaces')
    },
    SPIRAL: {
      name: t('Spirale'),
      defaultN: 3.2,
      dMeanRange: { min: 0.00008, max: 0.00025 },
      description: t('Distribution très étroite, excellente atomisation')
    }
  };

  // ========== INITIAL STATE ==========
  const initialParams = {
    vGas: 5,
    dMean: 0.0002,
    n: 2.0,
    vDropInitial: -2.0,
    tGasIn: 200,
    tLiquid: 293,
    pressure: 3,
    flowRate: 1,
    nozzleType: 'FULL_CONE'
  };

  const [params, setParams] = useState(() => ({ ...initialParams, ...(innerData?.CT_design_params || {}) }));

  // ========== OPEX : eau pulvérisée et pompe ==========
  const [typeEau, setTypeEau] = useState(() => (TYPES_EAU[innerData?.Type_eau_tour] ? innerData.Type_eau_tour : 'eau potable'));
  const [rendementPompe, setRendementPompe] = useState(() => innerData?.Rendement_pompe_tour ?? 70);
  // Débit d'eau pulvérisée calculé dans l'onglet Gaz de combustion (bilan d'énergie)
  const Q_eau_m3_h = Math.max(0, parseFloat(innerData?.Q_eau_kg_h) || 0) / 1000;
  // Puissance de la pompe : débit × pression de pulvérisation / rendement (1 bar·m³/h = 1/36 kW)
  const P_pompe_kW = rendementPompe > 0 ? (Q_eau_m3_h * params.pressure) / 36 / (rendementPompe / 100) : 0;
  const prixEau = (getOpexData()?.waterPrices || {})[PRIX_EAU[typeEau]] || 0;
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // ========== CALCULATOR METHODS ==========
  const calculateSprayCharacteristics = useCallback((calcParams) => {
    const { dMean, n, pressure, flowRate } = calcParams;
    const smd = dMean * 0.693 * (1 + 1 / n);
    const dropletVelocity = Math.sqrt(2 * pressure / 1000);
    const sprayAngle = 2 * Math.atan(0.2 * Math.sqrt(pressure / flowRate));

    return {
      smd,
      dropletVelocity,
      sprayAngle: sprayAngle * (180 / Math.PI)
    };
  }, []);

  const getSprayQuality = useCallback((dMean, n) => {
    let quality = {
      atomization: '',
      coverage: '',
      uniformity: ''
    };

    if (dMean < 0.0002) {
      quality.atomization = t('Excellente');
    } else if (dMean < 0.0003) {
      quality.atomization = t('Bonne');
    } else {
      quality.atomization = t('Moyenne');
    }

    if (n > 3.0) {
      quality.uniformity = t('Très uniforme');
    } else if (n > 2.5) {
      quality.uniformity = t('Uniforme');
    } else {
      quality.uniformity = t('Moins uniforme');
    }

    if (n < 2.2) {
      quality.coverage = t('Large couverture');
    } else if (n < 2.8) {
      quality.coverage = t('Couverture moyenne');
    } else {
      quality.coverage = t('Couverture concentrée');
    }

    return quality;
  }, [t]);

  const calculateCOOLINGTOWERHeight = useCallback((calcParams) => {
    const { vGas, dMean, n, vDropInitial, tGasIn, tLiquid, pressure, flowRate } = calcParams;

    const sprayCharacteristics = calculateSprayCharacteristics({
      dMean,
      n,
      pressure,
      flowRate
    });

    const sprayQuality = getSprayQuality(dMean, n);
    const height = 1.2 * Math.abs(vGas - vDropInitial) * (tGasIn - tLiquid) / 100;

    return { height, sprayCharacteristics, sprayQuality };
  }, [calculateSprayCharacteristics, getSprayQuality]);

  // ========== EVENT HANDLERS ==========
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  }, []);

  const handleNozzleChange = useCallback((e) => {
    const value = e.target.value;
    const nozzleType = NOZZLE_TYPES[value];
    setParams(prev => ({
      ...prev,
      nozzleType: value,
      n: nozzleType.defaultN,
      dMean: (nozzleType.dMeanRange.min + nozzleType.dMeanRange.max) / 2
    }));
  }, [NOZZLE_TYPES]);

  const handleReset = useCallback(() => {
    setParams(initialParams);
  }, []);

  // ========== RECALCULATE RESULTS ==========
  useEffect(() => {
    try {
      const calculatedResults = calculateCOOLINGTOWERHeight(params);
      setResults(calculatedResults);
      setError(null);
    } catch (err) {
      setError(t('Erreur lors du calcul. Vérifiez les paramètres d\'entrée.'));
      setResults(null);
    }
  }, [params, calculateCOOLINGTOWERHeight, t]);

  // ========== UPDATE INNER DATA (OPEX) ==========
  // Seules les consommations calculées ici sont écrites ; tout le reste est remis
  // à 0 (efface les anciennes valeurs fictives : cendres 1 kg/h, transport 90 €/h…).
  const opexPayload = useMemo(() => {
    const eau = Object.fromEntries(Object.values(TYPES_EAU).map((k) => [k, 0]));
    eau[TYPES_EAU[typeEau]] = Q_eau_m3_h;
    return {
      consoElec1: P_pompe_kW,
      labelElec1: t('Pompe d\'eau de pulvérisation'),
      ...Object.fromEntries([2, 3, 4, 5, 6, 7, 8].flatMap((i) => [[`consoElec${i}`, 0], [`labelElec${i}`, '']])),
      conso_air_co_N_m3: 0,
      ...eau,
      Conso_CaCO3_kg: 0, Conso_CaO_kg: 0, Conso_CaOH2_dry_kg: 0, Conso_CaOH2_wet_kg: 0,
      Conso_NaOH_kg: 0, Conso_NaOHCO3_kg: 0, Conso_Ammonia_kg: 0, Conso_NaBrCaBr2_kg: 0, Conso_CAP_kg: 0,
      conso_gaz_H_MW: 0, conso_gaz_L_MW: 0, conso_gaz_Process_MW: 0, conso_fuel_MW: 0,
      conso_incineration_ash_kg_h: 0, conso_boiler_ash_kg_h: 0, conso_fly_ash_kg_h: 0,
      CO2_transport_incineratino_ash: 0, CO2_transport_boiler_ash: 0, CO2_transport_fly_ash: 0, CO2_transport_reactifs: 0,
      cout_transport_incineratino_ash: 0, cout_transport_boiler_ash: 0, cout_transport_fly_ash: 0, cout_transport_reactifs: 0,
      Type_eau_tour: typeEau,
      Rendement_pompe_tour: rendementPompe,
      CT_design_params: params,
      CT_resultats: results ? {
        hauteur_m: results.height,
        smd_um: results.sprayCharacteristics.smd * 1e6,
        vitesse_gouttes_m_s: results.sprayCharacteristics.dropletVelocity,
        angle_spray_deg: results.sprayCharacteristics.sprayAngle,
        Q_eau_m3_h,
        P_pompe_kW,
      } : null,
    };
  }, [typeEau, Q_eau_m3_h, P_pompe_kW, rendementPompe, params, results, t]);

  const lastSync = useRef('');
  useEffect(() => {
    if (!setInnerData || typeof setInnerData !== 'function') return;
    const json = JSON.stringify(opexPayload);
    if (json === lastSync.current) return;
    lastSync.current = json;
    setInnerData((prevData) => ({ ...prevData, ...opexPayload }));
  }, [opexPayload, setInnerData]);

  return (
    <div className="p-6 flex flex-col lg:flex-row items-start bg-gray-50">
      {/* ========== IMAGE COLUMN ========== */}
      <div className="lg:w-1/3 mb-6 lg:mb-0 lg:mr-8">
        <SprayTower />
      </div>

      {/* ========== PARAMETERS & CALCULATIONS COLUMN ========== */}
      <div className="lg:w-2/3 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {t('Configuration du COOLINGTOWER')}
        </h2>

        {/* ========== NOZZLE SELECTION SECTION ========== */}
        <Section title={t('Sélection de la buse')} t={t}>
          <div className="space-y-4">
            <ParameterInput
              label={t('Type de buse')}
              value={params.nozzleType}
              onChange={handleNozzleChange}
              options={Object.entries(NOZZLE_TYPES).map(([value, n]) => ({ value, label: n.name }))}
            />
            <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
              {NOZZLE_TYPES[params.nozzleType].description}
            </p>
          </div>
        </Section>

        {/* ========== SPRAY PARAMETERS SECTION ========== */}
        <Section title={t('Paramètres du spray')} t={t}>
          <div className="space-y-4">
            <ParameterInput
              label={t('Pression (bar)')}
              name="pressure"
              value={params.pressure}
              onChange={handleInputChange}
            />
            <ParameterInput
              label={t('Débit (L/min)')}
              name="flowRate"
              value={params.flowRate}
              onChange={handleInputChange}
            />
            <ParameterInput
              label={t('Diamètre moyen (m)')}
              name="dMean"
              value={params.dMean}
              onChange={handleInputChange}
            />
            <ParameterInput
              label={t('Indice de distribution (n)')}
              name="n"
              value={params.n}
              onChange={handleInputChange}
            />
          </div>
        </Section>

        {/* ========== GAS PARAMETERS SECTION ========== */}
        <Section title={t('Paramètres du gaz')} t={t}>
          <div className="space-y-4">
            <ParameterInput
              label={t('Température du gaz (K)')}
              name="tGasIn"
              value={params.tGasIn}
              onChange={handleInputChange}
            />
            <ParameterInput
              label={t('Vitesse du gaz (m/s)')}
              name="vGas"
              value={params.vGas}
              onChange={handleInputChange}
            />
            <ParameterInput
              label={t('Vitesse des gouttes initiale (m/s)')}
              name="vDropInitial"
              value={params.vDropInitial}
              onChange={handleInputChange}
            />
          </div>
        </Section>

        {/* ========== LIQUID PARAMETERS SECTION ========== */}
        <Section title={t('Paramètres du liquide')} t={t}>
          <div className="space-y-4">
            <ParameterInput
              label={t('Température du liquide (K)')}
              name="tLiquid"
              value={params.tLiquid}
              onChange={handleInputChange}
            />
          </div>
        </Section>

        {/* ========== OPEX SECTION ========== */}
        <Section
          title={t('Consommations (OPEX)')}
          t={t}
          results={[
            { label: t('Débit d\'eau pulvérisée [m³/h]'), value: fmt(Q_eau_m3_h, 3) },
            { label: t('Puissance électrique pompe [kW]'), value: fmt(P_pompe_kW, 2) },
            { label: t('Coût de l\'eau [€/h]'), value: fmt(Q_eau_m3_h * prixEau, 2) },
          ]}
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="w-full sm:w-64 text-sm font-medium text-gray-700">{t('Type d\'eau')}:</label>
              <select
                value={typeEau}
                onChange={(e) => setTypeEau(e.target.value)}
                className="w-full sm:w-72 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              >
                {Object.keys(TYPES_EAU).map((k) => <option key={k} value={k}>{t(k)}</option>)}
              </select>
            </div>
            <ParameterInput
              label={t('Rendement pompe [%]')}
              name="rendementPompe"
              value={rendementPompe}
              onChange={(e) => setRendementPompe(Math.max(1, Math.min(100, parseFloat(e.target.value) || 0)))}
            />
            <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
              {t('Débit d\'eau calculé dans l\'onglet Gaz de combustion ; pression de pompage = pression de pulvérisation.')}
            </p>
          </div>
        </Section>

        {/* ========== RESET BUTTON ========== */}
        <div className="mb-6">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
          >
            {t('Réinitialiser les paramètres')}
          </button>
        </div>

        {/* ========== RESULTS SECTION ========== */}
        {results && <ResultsGrid results={results} t={t} />}

        {/* ========== ERROR SECTION ========== */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default COOLINGTOWERDesign;
