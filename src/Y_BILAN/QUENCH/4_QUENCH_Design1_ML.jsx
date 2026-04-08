import React, { useState, useEffect, useCallback } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import { coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import reactImage from '../../B_Images/quench_img.png';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './QUENCH_traduction';

const QUENCHDesign = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  const getInitialValue = (paramName, defaultValue) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  // Nozzle types with characteristics
  const nozzleTypes = {
    'cone creux': { defaultN: 2.8, dMeanRange: { min: 0.0001, max: 0.0003 }, description: t('Distribution étroite, bon pour uniformité') },
    'cone plein': { defaultN: 2.3, dMeanRange: { min: 0.00015, max: 0.0004 }, description: t('Distribution plus large, meilleure couverture') },
    'jet plat': { defaultN: 2.0, dMeanRange: { min: 0.0002, max: 0.0005 }, description: t('Distribution large, bon pour surfaces') },
    'spirale': { defaultN: 3.2, dMeanRange: { min: 0.00008, max: 0.00025 }, description: t('Distribution très étroite, excellente atomisation') }
  };

  // Water types mapping
  const waterTypeLabels = {
    'eau potable': t('Eau potable'),
    'eau de refroidissement': t('Eau de refroidissement'),
    'eau déminéralisée': t('Eau déminéralisée'),
    'eau adoucie': t('Eau adoucie'),
    'eau de rivière': t('Eau de rivière')
  };

  const opexData = getOpexData() || {};
  const { waterPrices = {} } = opexData;

  // State management
  const [PDC_calcul, setPDC_calcul] = useState({
    'Pression aéraulique [mmCE]': getInitialValue('P_OUT', 0),
    'PDC [mmCE]': getInitialValue('PDC_mmCE_QUENCH', 150),
  });

  const [Design_parameters, setDesign_parameters] = useState({
    'Quench diameter [m]': getInitialValue('Quench_diameter', 1.5),
    'Pression pulverisation [bar]': getInitialValue('Pression_pulverisation', 3),
    'Type de buse': getInitialValue('Type_buse', 'cone creux'),
    'Type d\'eau': getInitialValue('Type_eau', 'eau potable'),
  });

  const [Parametres_conso_Elec, setParametres_conso_Elec] = useState({
    'Puissance pompe [kW]': getInitialValue('Puissance_pompe_quench', 15),
    'Rendement pompe [%]': getInitialValue('Rendement_pompe', 85),
  });

  // Input data with fallback values
  const P_in_mmCE = innerData?.P_OUT || PDC_calcul['Pression aéraulique [mmCE]'];
  const PDC_mmCE = PDC_calcul['PDC [mmCE]'];
  const P_out_mmCE = P_in_mmCE - PDC_mmCE;

  const T_IN = innerData?.T_OUT || 200;
  const T_sortie = innerData?.T_sortie || 80;
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_EAU_tot || 28000;
  const Eau_add = innerData?.Q_eau_kg_h || 5000;

  const DiameterQuench = Design_parameters['Quench diameter [m]'];
  const P_pulverisation = Design_parameters['Pression pulverisation [bar]'];
  const nozzleType = Design_parameters['Type de buse'];
  const waterType = Design_parameters['Type d\'eau'];

  const Puissance_pompe_kW = Parametres_conso_Elec['Puissance pompe [kW]'];
  const Rendement_pompe = Parametres_conso_Elec['Rendement pompe [%]'];

  // Calculations
  const Surface_Quench = 0.25 * Math.PI * DiameterQuench * DiameterQuench;
  const Q_eau_m3_h = Eau_add / 1000;
  const Q_eau_add_l_min = Eau_add / 60;
  const V_FG_m_s = (Debit_fumees_humide_Nm3_h / 3600) / Surface_Quench;

  const T_IN_K = T_IN + 273.159;
  const T_sortie_K = T_sortie + 273.159;

  const Conso_elec_pompe_reelle_kW = Puissance_pompe_kW / (Rendement_pompe / 100);

  // Water type mapping
  const getWaterPrice = (waterType) => {
    const prices = waterPrices || {};
    const priceMap = {
      'eau potable': prices.potable || 3,
      'eau de refroidissement': prices.cooling || 1,
      'eau déminéralisée': prices.demineralized || 5,
      'eau adoucie': prices.soft || 2,
      'eau de rivière': prices.river || 0.5,
    };
    return priceMap[waterType] || 3;
  };

  const currentWaterPrice = getWaterPrice(waterType);
  const waterCostPerHour = Q_eau_m3_h * currentWaterPrice;

  // Water consumption by type
  let Qv_eau_potable_m3 = 0, Qv_Eau_Refroidissement_m3 = 0, Qv_Eau_Riviere_m3 = 0;
  let Qv_Eau_Demin_m3 = 0, Qv_Eau_Adoucie_m3 = 0;

  switch(waterType) {
    case 'eau potable': Qv_eau_potable_m3 = Q_eau_m3_h; break;
    case 'eau de refroidissement': Qv_Eau_Refroidissement_m3 = Q_eau_m3_h; break;
    case 'eau de rivière': Qv_Eau_Riviere_m3 = Q_eau_m3_h; break;
    case 'eau déminéralisée': Qv_Eau_Demin_m3 = Q_eau_m3_h; break;
    case 'eau adoucie': Qv_Eau_Adoucie_m3 = Q_eau_m3_h; break;
    default: Qv_eau_potable_m3 = Q_eau_m3_h;
  }

  // Quench calculator functions
  const calculateDMean = (nozzleType, pressure) => {
    const nozzleInfo = nozzleTypes[nozzleType];
    const { min, max } = nozzleInfo.dMeanRange;
    const pressureFactor = Math.max(0, Math.min(1, (1 - pressure / 10)));
    return min + pressureFactor * (max - min);
  };

  const getSprayQuality = (dMean, n) => {
    const atomization = dMean < 0.0002 ? t('Excellente') : dMean < 0.0003 ? t('Bonne') : t('Moyenne');
    const uniformity = n > 3.0 ? t('Très uniforme') : n > 2.5 ? t('Uniforme') : t('Moins uniforme');
    const coverage = n < 2.2 ? t('Large couverture') : n < 2.8 ? t('Couverture moyenne') : t('Couverture concentrée');
    
    return { atomization, uniformity, coverage };
  };

  const calculateSprayCharacteristics = (dMean, n, pressure, flowRate) => {
    const smd = dMean * 0.693 * (1 + 1/n);
    const dropletVelocity = Math.sqrt(2 * pressure / 1000);
    const sprayAngle = 2 * Math.atan(0.2 * Math.sqrt(pressure / flowRate));
    
    return {
      smd,
      dropletVelocity,
      sprayAngle: sprayAngle * (180 / Math.PI)
    };
  };

  const calculateQuenchHeight = (vGas, dMean, n, tGasIn, tLiquid) => {
    const height = 1.2 * Math.abs(vGas - (-2.0)) * (tGasIn - tLiquid) / 100;
    return height;
  };

  // Quench calculations
  const currentNozzle = nozzleTypes[nozzleType];
  const dMean = calculateDMean(nozzleType, P_pulverisation);
  const n = currentNozzle.defaultN;
  const sprayQuality = getSprayQuality(dMean, n);
  const sprayCharacteristics = calculateSprayCharacteristics(dMean, n, P_pulverisation, Q_eau_add_l_min);
  const quenchHeight = calculateQuenchHeight(V_FG_m_s, dMean, n, T_IN, 293);

  // Event handlers
  const handleParametresChange = (name, value) => {
    const numericValue = parseFloat(value) || 0;

    if (name in PDC_calcul) {
      setPDC_calcul(prev => ({ ...prev, [name]: numericValue }));
    } else if (name in Parametres_conso_Elec) {
      let validatedValue = numericValue;
      if (name === 'Rendement pompe [%]') {
        validatedValue = Math.max(30, Math.min(95, numericValue));
      } else if (name === 'Puissance pompe [kW]') {
        validatedValue = Math.max(1, Math.min(500, numericValue));
      }
      setParametres_conso_Elec(prev => ({ ...prev, [name]: validatedValue }));
    } else if (name in Design_parameters) {
      let validatedValue = value;
      if (name === 'Quench diameter [m]') {
        validatedValue = Math.max(0.1, Math.min(10, numericValue));
      } else if (name === 'Pression pulverisation [bar]') {
        validatedValue = Math.max(0.5, Math.min(20, numericValue));
      }
      setDesign_parameters(prev => ({ ...prev, [name]: validatedValue }));
    }
  };

  const handleSpinnerChange = (parameterName, increment) => {
    setDesign_parameters((prevData) => {
      const currentValue = parseFloat(prevData[parameterName]) || 0;
      let newValue;
      
      if (parameterName === 'Quench diameter [m]') {
        newValue = Math.max(0.1, Math.min(10, currentValue + increment));
        newValue = Math.round(newValue * 10) / 10;
      } else if (parameterName === 'Pression pulverisation [bar]') {
        newValue = Math.max(0.5, Math.min(20, currentValue + increment));
        newValue = Math.round(newValue * 2) / 2;
      }
      
      return { ...prevData, [parameterName]: newValue };
    });
  };

  const clearMemory = useCallback(() => {
    setPDC_calcul({ 'Pression aéraulique [mmCE]': 0, 'PDC [mmCE]': 150 });
    setDesign_parameters({ 'Quench diameter [m]': 1.5, 'Pression pulverisation [bar]': 3, 'Type de buse': 'cone creux', 'Type d\'eau': 'eau potable' });
    setParametres_conso_Elec({ 'Puissance pompe [kW]': 15, 'Rendement pompe [%]': 85 });
  }, []);

  // Update innerData
  useEffect(() => {
    if (setInnerData && typeof setInnerData === 'function') {
      const toSignificantFigures = (value, figures = 2) => {
        if (value === 0 || value === null || value === undefined || !isFinite(value)) return 0;
        return parseFloat(value.toPrecision(figures));
      };

      setInnerData(prevData => ({
        ...prevData,
        P_out_mmCE,
        consoElec1: toSignificantFigures(Conso_elec_pompe_reelle_kW),
        labelElec1: t('pompe quench'),
        Conso_EauPotable_m3: toSignificantFigures(Qv_eau_potable_m3),
        Conso_EauRefroidissement_m3: toSignificantFigures(Qv_Eau_Refroidissement_m3),
        Conso_EauDemin_m3: toSignificantFigures(Qv_Eau_Demin_m3),
        Conso_EauRiviere_m3: toSignificantFigures(Qv_Eau_Riviere_m3),
        Conso_EauAdoucie_m3: toSignificantFigures(Qv_Eau_Adoucie_m3),
        Quench_diameter: DiameterQuench,
        Pression_pulverisation: P_pulverisation,
        Type_buse: nozzleType,
        Type_eau: waterType,
        Puissance_pompe_quench: Puissance_pompe_kW,
        Rendement_pompe,
        PDC_mmCE_QUENCH: PDC_mmCE,
      }));
    }
  }, [Conso_elec_pompe_reelle_kW, Puissance_pompe_kW, Rendement_pompe, Eau_add, waterType, P_out_mmCE, DiameterQuench, P_pulverisation, nozzleType, PDC_mmCE, setInnerData, t]);

  // UI Components
  const Section = ({ title, results, children }) => (
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

  const ParameterInput = ({ translationKey, value, onChange, type = 'number', options = null, disabled = false, step = '1' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
        {t(translationKey)}:
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          step={step}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
        />
      )}
    </div>
  );

  const ParameterInputWithSpinner = ({ translationKey, value, onChange, increment }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
        {t(translationKey)}:
      </label>
      <div style={{ display: 'flex', gap: '8px', flex: '0 0 150px' }}>
        <button
          onClick={() => handleSpinnerChange(translationKey, -increment)}
          style={{ padding: '6px 12px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center', fontSize: '14px' }}
        />
        <button
          onClick={() => handleSpinnerChange(translationKey, increment)}
          style={{ padding: '6px 12px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
    </div>
  );

  // Elements for tables
  const elements_PDC = [{ text: t('Pression de sortie [mmCE]'), value: P_out_mmCE.toFixed(2) }];

  const elements_conso_pompe = [
    { text: t('Puissance pompe nominale [kW]'), value: Puissance_pompe_kW.toFixed(2) },
    { text: t('Rendement pompe [%]'), value: Rendement_pompe.toFixed(1) },
    { text: t('Consommation réelle [kW]'), value: Conso_elec_pompe_reelle_kW.toFixed(2) },
  ];

  const elementsGeneric = [
    { text: t('Temperature inlet QUENCH [°C]'), value: T_IN.toFixed(1) },
    { text: t('Temperature outlet QUENCH [°C]'), value: T_sortie.toFixed(1) },
    { text: t('Inlet temperature [K]'), value: T_IN_K.toFixed(0) },
    { text: t('Outlet temperature [K]'), value: T_sortie_K.toFixed(0) },
    { text: t('Quench surface area [m2]'), value: Surface_Quench.toFixed(2) },
    { text: t('Sprayed/cooling water [kg/h]'), value: Eau_add.toFixed(0) },
    { text: t('Spray pressure [bar]'), value: P_pulverisation.toFixed(0) },
    { text: t('Débit eau [L/min]'), value: Q_eau_add_l_min.toFixed(2) },
    { text: t('Vitesse des gaz [m/s]'), value: V_FG_m_s.toFixed(2) },
    { text: t('Prix de l\'eau [€/m³]'), value: currentWaterPrice.toFixed(2) },
    { text: t('Coût eau par heure [€/h]'), value: waterCostPerHour.toFixed(2) },
  ];

  const quenchResultsElements = [
    { text: t('Hauteur minimale du quench [m]'), value: quenchHeight.toFixed(2) },
    { text: t('SMD (Sauter Mean Diameter) [µm]'), value: (sprayCharacteristics.smd * 1e6).toFixed(2) },
    { text: t('Vitesse des gouttes [m/s]'), value: sprayCharacteristics.dropletVelocity.toFixed(2) },
    { text: t('Angle du spray [°]'), value: sprayCharacteristics.sprayAngle.toFixed(2) },
    { text: t('Qualité du spray - Atomisation'), value: sprayQuality.atomization },
    { text: t('Qualité du spray - Uniformité'), value: sprayQuality.uniformity },
    { text: t('Qualité du spray - Couverture'), value: sprayQuality.coverage },
    { text: t('Type de buse - Description'), value: currentNozzle.description },
    { text: t('Paramètre n (distribution)'), value: n.toFixed(2) },
    { text: t('Taille moyenne des gouttes [µm]'), value: (dMean * 1e6).toFixed(2) },
  ];

  const elementsGenericSummary = [
    { text: t('Quench diameter [m]'), value: DiameterQuench.toFixed(2) },
    { text: t('Pression pulvérisation [bar]'), value: P_pulverisation.toFixed(1) },
    { text: t('Type de buse'), value: nozzleType },
    { text: t('Type d\'eau'), value: waterTypeLabels[waterType] },
    { text: t('Surface quench [m²]'), value: Surface_Quench.toFixed(2) },
    { text: t('Hauteur quench [m]'), value: quenchHeight.toFixed(2) },
    { text: t('Puissance pompe [kW]'), value: Puissance_pompe_kW.toFixed(2) },
    { text: t('Consommation eau [kg/h]'), value: Eau_add.toFixed(0) },
  ];

  return (
    <div className="cadre_pour_onglet">
      {/* PDC aéraulique */}
      <Section title={t('Pertes de charge aéraulique')} results={elements_PDC}>
        <ParameterInput translationKey="Pression aéraulique [mmCE]" value={PDC_calcul['Pression aéraulique [mmCE]']} 
          onChange={(v) => handleParametresChange('Pression aéraulique [mmCE]', v)} />
        <ParameterInput translationKey="PDC [mmCE]" value={PDC_calcul['PDC [mmCE]']} 
          onChange={(v) => handleParametresChange('PDC [mmCE]', v)} />
      </Section>

      {/* Dimensionnement du Quench */}
      <Section 
        title={t('Dimensionnement du Quench')}
        results={elementsGeneric}
      >
        <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <img src={reactImage} alt="Quench" style={{ width: '100%', maxWidth: '300px', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, display: 'grid', gap: '15px' }}>
            <ParameterInputWithSpinner translationKey="Quench diameter [m]" value={DiameterQuench} 
              onChange={(v) => handleParametresChange('Quench diameter [m]', v)} increment={0.1} />
            <ParameterInputWithSpinner translationKey="Pression pulverisation [bar]" value={P_pulverisation} 
              onChange={(v) => handleParametresChange('Pression pulverisation [bar]', v)} increment={0.5} />
            <ParameterInput translationKey="Type de buse" value={nozzleType} 
              onChange={(v) => handleParametresChange('Type de buse', v)}
              options={Object.keys(nozzleTypes)} />
            <ParameterInput translationKey="Type d'eau" value={waterType} 
              onChange={(v) => handleParametresChange('Type d\'eau', v)}
              options={Object.keys(waterTypeLabels)} />
          </div>
        </div>
      </Section>

      {/* Résultats du Quench */}
      <Section title={t('Résultats du Quench')} results={quenchResultsElements} />

      {/* Consommation électrique de la pompe */}
      <Section title={t('Consommation électrique de la pompe')} results={elements_conso_pompe}>
        <ParameterInput translationKey="Puissance pompe [kW]" value={Puissance_pompe_kW} 
          onChange={(v) => handleParametresChange('Puissance pompe [kW]', v)} />
        <ParameterInput translationKey="Rendement pompe [%]" value={Rendement_pompe} 
          onChange={(v) => handleParametresChange('Rendement pompe [%]', v)} />
      </Section>

      {/* Résumé */}
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
        <h3>{t('Résumé des paramètres principaux')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <p><strong>{t('Diamètre quench')}:</strong> {DiameterQuench} m</p>
          <p><strong>{t('Pression pulvérisation')}:</strong> {P_pulverisation} bar</p>
          <p><strong>{t('Type de buse')}:</strong> {nozzleType}</p>
          <p><strong>{t('Type d\'eau')}:</strong> {waterTypeLabels[waterType]}</p>
          <p><strong>{t('Surface quench')}:</strong> {Surface_Quench.toFixed(2)} m²</p>
          <p><strong>{t('Hauteur quench')}:</strong> {quenchHeight.toFixed(2)} m</p>
          <p><strong>{t('Puissance pompe')}:</strong> {Puissance_pompe_kW} kW</p>
          <p><strong>{t('Consommation eau')}:</strong> {Eau_add.toFixed(0)} kg/h</p>
        </div>
        <h4>{t('Paramètres calculés détaillés')}</h4>
        <TableGeneric elements={elementsGenericSummary} />
      </div>

      {/* Boutons d'action */}
      <div style={{ textAlign: 'center', gap: '10px', marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => window.print()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {t('Export')} QUENCHDesign
        </button>
        <button 
          onClick={clearMemory}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {t('Clear memory')}
        </button>
      </div>
    </div>
  );
};

export default QUENCHDesign;