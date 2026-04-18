import React, { useState, useEffect } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import '../../index.css';
import stack_hauteur_hp from '../../B_Images/stack/Stack_hauteur_hp.png';
import stack_multistack from '../../B_Images/stack/Stack_dependante_autre_cheminee.png';
import stack_obstacles from '../../B_Images/stack/Stack_obstacle.png';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './STACK_traduction';

const STACKdesign = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  // Translation setup
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // ✅ CLÉS STABLES POUR PARAMETRES PRIMAIRES
  const PARAM_KEYS = {
    wetFlueGasFlow: 'wetFlueGasFlow',
    pollutantFlow: 'pollutantFlow',
    outletTemperature: 'outletTemperature',
    temperatureDifference: 'temperatureDifference',
  };

  // ✅ CLÉS STABLES POUR MULTI-STACK
  const MULTISTACK_KEYS = {
    distanceBetweenStacks: 'distanceBetweenStacks',
    secondaryStackHeight: 'secondaryStackHeight',
    secondaryStackDiameter: 'secondaryStackDiameter',
    secondaryStackFlow: 'secondaryStackFlow',
    secondaryStackTemperature: 'secondaryStackTemperature',
  };

  // ✅ CLÉS STABLES POUR OBSTACLES
  const OBSTACLE_KEYS = {
    obstacleDistance: 'obstacleDistance',
    obstacleHeight: 'obstacleHeight',
    obstacleWidth: 'obstacleWidth',
    obstacleAngle: 'obstacleAngle',
  };

  // ✅ STATE POUR PARAMETRES PRIMAIRES AVEC CLÉS STABLES
  const [parametres, setParametres] = useState(() => {
    const saved = localStorage.getItem('parametres_STACKdesign');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Si localStorage est corrompue, réinitialiser
      }
    }
    return {
      [PARAM_KEYS.wetFlueGasFlow]: 100000,
      [PARAM_KEYS.pollutantFlow]: 5,
      [PARAM_KEYS.outletTemperature]: 150,
      [PARAM_KEYS.temperatureDifference]: 50,
    };
  });

  // ✅ STATE POUR MULTI-STACK AVEC CLÉS STABLES
  const [multiStackParams, setMultiStackParams] = useState({
    [MULTISTACK_KEYS.distanceBetweenStacks]: 10,
    [MULTISTACK_KEYS.secondaryStackHeight]: 30,
    [MULTISTACK_KEYS.secondaryStackDiameter]: 0.8,
    [MULTISTACK_KEYS.secondaryStackFlow]: 0,
    [MULTISTACK_KEYS.secondaryStackTemperature]: 100,
  });

  // ✅ STATE POUR OBSTACLES AVEC CLÉS STABLES
  const [obstacleParams, setObstacleParams] = useState({
    [OBSTACLE_KEYS.obstacleDistance]: 10,
    [OBSTACLE_KEYS.obstacleHeight]: 30,
    [OBSTACLE_KEYS.obstacleWidth]: 0.8,
    [OBSTACLE_KEYS.obstacleAngle]: 0,
  });

  // State for toggle buttons
  const [isGaz, setIsGaz] = useState(true);
  const [zone, setZone] = useState(1);
  const [polluantType, setPolluantType] = useState('SO2');

  // Get opex data
  const { truck15TPrice } = getOpexData();

  // Save parameters to localStorage
  useEffect(() => {
    localStorage.setItem('parametres_STACKdesign', JSON.stringify(parametres));
  }, [parametres]);

  // Helper function to safely extract parameter values
  const getParameterValue = (obj, key) => obj[key] || 0;

  // Primary stack calculations
  const Qm_FG_kg_h = getParameterValue(parametres, PARAM_KEYS.wetFlueGasFlow);
  const Qm_pollutant_kg_h = getParameterValue(parametres, PARAM_KEYS.pollutantFlow);
  const temperatureSortie = getParameterValue(parametres, PARAM_KEYS.outletTemperature);
  const Delta_T = getParameterValue(parametres, PARAM_KEYS.temperatureDifference);

  // Calculate concentration
  const concentration = (Qm_pollutant_kg_h * 1000) / Qm_FG_kg_h;
  const Qv_FG_Nm3_h = Qm_FG_kg_h / 1.29;
  const Qv_FG_m3_h = Qv_FG_Nm3_h * (temperatureSortie + 273.15) / 273.15;

  // Determine k based on pollutant type
  const k = isGaz ? 340 : 680;

  // Set cr based on pollutant type
  let cr;
  if (polluantType === 'SO2') cr = 0.15;
  else if (polluantType === 'NOx') cr = 0.14;
  else if (polluantType === 'Poussieres') cr = 0.15;

  // Set co based on pollutant type and zone
  let co;
  if (polluantType === 'SO2') {
    co = 0.01;
  } else if (polluantType === 'NOx') {
    if (zone === 1) co = 0.04;
    else if (zone === 2) co = 0.05;
    else if (zone === 3) co = 0.04;
  } else if (polluantType === 'Poussieres') {
    if (zone === 1) co = 0.07;
    else if (zone === 2) co = 0.1;
    else if (zone === 3) co = 0.08;
  }

  const cm = cr - co;
  const s = k * Qm_pollutant_kg_h / cm;
  let R = Qv_FG_m3_h;
  let hp = Math.pow(s, 0.5) * Math.pow(R * Delta_T, -1/6);

  // Results for primary stack
  const hauteur_cheminee_resultat = [
    { text: t('pollutantConcentration'), value: concentration.toFixed(2) },
    { text: t('minimumStackHeight'), value: hp.toFixed(2) }
  ];

  // Multi-stack calculations
  const Distance_axe_hi_hj = getParameterValue(multiStackParams, MULTISTACK_KEYS.distanceBetweenStacks);
  const hi = hp;
  const hj = getParameterValue(multiStackParams, MULTISTACK_KEYS.secondaryStackHeight);
  const Qv_FG2_Nm3_h = getParameterValue(multiStackParams, MULTISTACK_KEYS.secondaryStackFlow);
  const Tf2 = getParameterValue(multiStackParams, MULTISTACK_KEYS.secondaryStackTemperature);

  const R2 = Qv_FG2_Nm3_h * (Tf2 + 273.15) / 273.15;
  let hp2 = hp;
  if (Distance_axe_hi_hj < (hi + hj + 10)) {
    if (hi > hj/2 || hj > hi/2) {
      const combinedR = R + R2;
      hp2 = Math.pow(s, 0.5) * Math.pow(combinedR * Delta_T, -1/6);
    }
  }

  const hauteur_multi_stack = [
    { text: t('correctedStackHeight'), value: hp2.toFixed(2) },
    { text: t('heightDifferenceInitial'), value: (hp2 - hp).toFixed(2) }
  ];

  // Obstacle calculations
  const obstacleDistance = getParameterValue(obstacleParams, OBSTACLE_KEYS.obstacleDistance);
  const obstacleHeight = getParameterValue(obstacleParams, OBSTACLE_KEYS.obstacleHeight);
  const obstacleWidth = getParameterValue(obstacleParams, OBSTACLE_KEYS.obstacleWidth);
  const obstacleAngle = getParameterValue(obstacleParams, OBSTACLE_KEYS.obstacleAngle);

  let hp3 = hp2;
  if (obstacleDistance < (10 * hp2 + 50)) {
    if (obstacleWidth > 2 && obstacleAngle > 15) {
      if (obstacleDistance <= (2 * hp2 + 10)) {
        hp3 = hp2 + 5;
      } else if (obstacleDistance > (2 * hp2 + 10) && obstacleDistance < (10 * hp2 + 50)) {
        hp3 = (5/4) * (hp2 + 5) * (1 - (obstacleDistance / (10 * hp2 + 50)));
      }
    }
  }

  const hauteur_obstacle = [
    { text: t('stackHeightWithObstacles'), value: hp3.toFixed(2) },
    { text: t('heightDifferenceMultiStack'), value: (hp3 - hp2).toFixed(2) }
  ];

  // Determine emission limit
  const getValeurLimite = () => {
    if (isGaz) {
      if (polluantType === 'SO2') return zone === 1 ? 500 : zone === 2 ? 300 : 150;
      else if (polluantType === 'NOx') return zone === 1 ? 500 : zone === 2 ? 400 : 200;
    } else {
      return zone === 1 ? 100 : zone === 2 ? 50 : 30;
    }
    return 0;
  };

  const valeurLimite = getValeurLimite();
  const conformite = concentration <= valeurLimite ? t('compliant') : t('nonCompliant');
  const pourcentageVLE = ((concentration / valeurLimite) * 100).toFixed(1);

  // Write design results to innerData whenever computed values change
  useEffect(() => {
    if (!setInnerData) return;
    setInnerData(prev => ({
      ...prev,
      stack_hp_min: hp,
      stack_hp_multistack: hp2,
      stack_hp_obstacles: hp3,
      stack_concentration_mg_Nm3: concentration,
      stack_emission_limit_mg_Nm3: valeurLimite,
      stack_compliant_pct: parseFloat(pourcentageVLE),
      stack_compliant: concentration <= valeurLimite,
      stack_pollutant_type: polluantType,
      stack_is_gaz: isGaz,
      stack_zone: zone,
      stack_Qv_Nm3_h: Qv_FG_Nm3_h,
      stack_Qv_m3_h: Qv_FG_m3_h,
      stack_Qm_kg_h: Qm_FG_kg_h,
    }));
  }, [hp, hp2, hp3, concentration, valeurLimite, pourcentageVLE, polluantType, isGaz, zone,
      Qv_FG_Nm3_h, Qv_FG_m3_h, Qm_FG_kg_h, setInnerData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to check for negative values
  const isNegative = (value) => {
    if (typeof value === 'number') return value < 0;
    if (typeof value === 'string') return /^-/.test(value.trim());
    return false;
  };

  // Handle parameter changes
  const handleParametresChange = (key, value) => {
    if (isNegative(value)) return;
    setParametres(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiStackChange = (key, value) => {
    if (isNegative(value)) return;
    setMultiStackParams(prev => ({ ...prev, [key]: value }));
  };

  const handleObstacleChange = (key, value) => {
    if (isNegative(value)) return;
    setObstacleParams(prev => ({ ...prev, [key]: value }));
  };

  // Update innerData
  useEffect(() => {
    if (innerData && setInnerData) {
      setInnerData(prevData => ({
        ...prevData,
        consoElec1: 0,
        consoElec2: 0,
        consoElec3: 0,
        consoElec4: 0,
        consoElec5: 0,
        labelElec1: '',
        labelElec2: '',
        labelElec3: '',
        labelElec4: '',
        labelElec5: '',
        conso_air_co_N_m3: 0,
        Conso_EauPotable_m3: 0,
        Conso_EauRefroidissement_m3: 0,
        Conso_EauDemin_m3: 0,
        Conso_EauRiviere_m3: 0,
        Conso_EauAdoucie_m3: 0,
        Conso_CaCO3_kg: 0,
        Conso_CaO_kg: 0,
        Conso_CaOH2_dry_kg: 0,
        Conso_CaOH2_wet_kg: 0,
        Conso_NaOH_kg: 0,
        Conso_NaOHCO3_kg: 0,
        Conso_Ammonia_kg: 0,
        Conso_NaBrCaBr2_kg: 0,
        truck15TPrice,
        conso_gaz_H_MW: 0,
        conso_gaz_L_MW: 0,
        conso_gaz_Process_MW: 0,
        conso_fuel: 0,
        conso_incineration_ash_kg_h: 0,
        conso_boiler_ash_kg_h: 0,
        conso_fly_ash_kg_h: 0,
        CO2_transport_incineratino_ash: 0,
        CO2_transport_boiler_ash: 0,
        CO2_transport_fly_ash: 0,
        cout_transport_incineratino_ash: 0,
        cout_transport_boiler_ash: 0,
        cout_transport_fly_ash: 0
      }));
    }
  }, [innerData, setInnerData, truck15TPrice]);

  return (
    <div style={{ padding: '20px' }}>
      {/* Primary Stack Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start',   background: '#f5f5f5', }}>
          <div>
            <img src={stack_hauteur_hp} alt={t('stackTheoreticHeight')} style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}/>
          </div>

          <div>
            <h3>{t('stackTheoreticHeight')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {Object.entries(PARAM_KEYS).map(([displayKey, stableKey]) => (
                <div key={stableKey} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ flex: 1, fontWeight: '500', fontSize: '14px',  }}>
                    {t(stableKey)}
                  </label>
                  <input
                    type="number"
                    value={parametres[stableKey]}
                    onChange={(e) => handleParametresChange(stableKey, Number(e.target.value))}
                    style={{ flex: '0 0 100px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', }}
                  />
                </div>
              ))}
            </div>

            {/* Pollutant Type Toggle */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>{t('pollutantType')}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setIsGaz(true)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: '4px',
                    background: isGaz ? '#4CAF50' : '#e0e0e0',
                    color: isGaz ? 'white' : 'black',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  {t('gas')}
                </button>
                <button
                  onClick={() => setIsGaz(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: '4px',
                    background: !isGaz ? '#4CAF50' : '#e0e0e0',
                    color: !isGaz ? 'white' : 'black',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  {t('dust')}
                </button>
              </div>
            </div>

            {/* Zone Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>{t('zone')}</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {[1, 2, 3].map((z) => (
                  <button
                    key={z}
                    onClick={() => setZone(z)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: 'none',
                      borderRadius: '4px',
                      background: zone === z ? '#4CAF50' : '#e0e0e0',
                      color: zone === z ? 'white' : 'black',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                  >
                    {t('zone')} {z}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                {zone === 1 && t('zoneDescription1')}
                {zone === 2 && t('zoneDescription2')}
                {zone === 3 && t('zoneDescription3')}
              </div>
            </div>

            {/* Gas Type Dropdown */}
            {isGaz && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>{t('gasType')}</label>
                <select
                  value={polluantType}
                  onChange={(e) => setPolluantType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    background: 'white'
                  }}
                >
                  <option value="SO2">SO2</option>
                  <option value="NOx">NOx</option>
                  <option value="Poussieres">{t('dust')}</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      <h3>{t('calculatedResults')}</h3>
      <TableGeneric elements={hauteur_cheminee_resultat} />

      {/* Multi-Stack Section */}
      <section style={{ marginBottom: '40px', marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start',   background: '#f5f5f5', }}>
          <div>
            <img src={stack_multistack} alt={t('multiStackConfiguration')} style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}/>
          </div>

          <div>
            <h3>{t('multiStackConfiguration')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {Object.entries(MULTISTACK_KEYS).map(([displayKey, stableKey]) => (
                <div key={stableKey} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>
                    {t(stableKey)}
                  </label>
                  <input
                    type="number"
                    value={multiStackParams[stableKey]}
                    onChange={(e) => handleMultiStackChange(stableKey, Number(e.target.value))}
                    style={{ flex: '0 0 100px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '5px', fontSize: '13px' }}>
              <strong>{t('note')}:</strong> {t('secondaryStackHeightNote')}
            </div>
          </div>
        </div>
      </section>

      <h3>{t('multiStackCorrection')}</h3>
      <TableGeneric elements={hauteur_multi_stack} />

      {/* Obstacle Section */}
      <section style={{ marginBottom: '40px', marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start',   background: '#f5f5f5', }}>
          <div>
            <img src={stack_obstacles} alt={t('obstacleCalculation')} style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}/>
          </div>

          <div>
            <h3>{t('obstacleCalculation')}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {Object.entries(OBSTACLE_KEYS).map(([displayKey, stableKey]) => (
                <div key={stableKey} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>
                    {t(stableKey)}
                  </label>
                  <input
                    type="number"
                    value={obstacleParams[stableKey]}
                    onChange={(e) => handleObstacleChange(stableKey, Number(e.target.value))}
                    style={{ flex: '0 0 100px', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '5px', fontSize: '13px' }}>
              <strong>{t('note')}:</strong> {t('obstacleNoteText')}
            </div>
          </div>
        </div>
      </section>

      <h3>{t('obstacleCorrection')}</h3>
      <TableGeneric elements={hauteur_obstacle} />

      {/* Regulatory Compliance */}
      <section style={{ marginTop: '40px', padding: '20px', background: pourcentageVLE > 100 ? '#ffebee' : '#e8f5e9', borderRadius: '8px' }}>
        <h3>{t('regulatoryCompliance')}</h3>
        <p><strong>{t('emissionLimit')}:</strong> {valeurLimite} mg/Nm³</p>
        <p><strong>{t('calculatedConcentration')}:</strong> {concentration.toFixed(2)} mg/Nm³ ({pourcentageVLE}%)</p>
        <p><strong>{t('status')}:</strong> <span style={{ color: pourcentageVLE > 100 ? 'red' : 'green', fontWeight: 'bold' }}>{conformite}</span></p>
      </section>
    </div>
  );
};

export default STACKdesign;