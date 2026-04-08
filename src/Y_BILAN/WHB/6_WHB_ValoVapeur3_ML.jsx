import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const TurbineCalculator = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  const [parameters, setParameters] = useState({
    turbineType: 'contrepression',
    debitVapeur: innerData?.Q_steam_kg_h / 1000 || 1000,
    pressionEntree: innerData?.Pression_vapeur_bar || 10,
    temperatureEntree: innerData?.Temperature_vapeur_C || 180,
    pressionSortie: 3,
    temperatureAmbiante: 25,
    rendementTurbine: 85,
    rendementGenerateur: 97,
    rendementMecanique: 98,
    soutirage1Active: false,
    soutirage1Pression: 15,
    soutirage1Debit: 5,
    soutirage2Active: false,
    soutirage2Pression: 8,
    soutirage2Debit: 5,
    soutirage3Active: false,
    soutirage3Pression: 4,
    soutirage3Debit: 5,
    niveau1Pression: 15,
    niveau1Debit: 30,
    niveau2Pression: 8,
    niveau2Debit: 40,
    niveau3Pression: 3,
    niveau3Debit: 30
  });

  const [results, setResults] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  const turbineTypes = {
    sansTurbine: {
      name: t('sansTurbine'),
      description: t('sansTurbineDesc'),
      pressionSortieMin: 0,
      pressionSortieMax: 0,
      pressionSortieDefaut: 0,
      rendementTypique: 0,
      maxSoutirages: 0
    },
    contrepression: {
      name: t('contrepression'),
      description: t('contrepressionDesc'),
      pressionSortieMin: 1,
      pressionSortieMax: 10,
      pressionSortieDefaut: 3,
      rendementTypique: 85,
      maxSoutirages: 1
    },
    deuxEtages: {
      name: t('deuxEtages'),
      description: t('deuxEtagesDesc'),
      pressionSortieMin: 0.5,
      pressionSortieMax: 5,
      pressionSortieDefaut: 1.5,
      rendementTypique: 88,
      maxSoutirages: 2
    },
    troisEtages: {
      name: t('troisEtages'),
      description: t('troisEtagesDesc'),
      pressionSortieMin: 0.2,
      pressionSortieMax: 3,
      pressionSortieDefaut: 0.8,
      rendementTypique: 90,
      maxSoutirages: 3
    },
    vide: {
      name: t('condensationVide'),
      description: t('condensationVideDesc'),
      pressionSortieMin: 0.05,
      pressionSortieMax: 0.2,
      pressionSortieDefaut: 0.08,
      rendementTypique: 92,
      maxSoutirages: 3
    }
  };

  const calculerEnthalpieVapeur = (pression, temperature) => {
    if (pression <= 0) return 0;
    const Tsat = 100 + 28.96 * Math.log(pression);
    const surchauffe = Math.max(0, temperature - Tsat);
    const hfg = 2256.4 - 2.3 * (Tsat - 100);
    const hf = 4.18 * Tsat;
    const hg = hf + hfg;
    const cpVapeur = 2.1;
    const enthalpie = hg + cpVapeur * surchauffe;
    return Math.max(enthalpie, 2500);
  };

  const calculerEntropieVapeur = (pression, temperature) => {
    if (pression <= 0) return 0;
    const Tsat = 100 + 28.96 * Math.log(pression);
    const surchauffe = Math.max(0, temperature - Tsat);
    const sfg = 6.048 - 0.0157 * Tsat;
    const sf = 4.18 * Math.log((273 + Tsat) / 273);
    const sg = sf + sfg;
    const cpVapeur = 2.1;
    const entropie = sg + cpVapeur * Math.log((273 + temperature) / (273 + Tsat));
    return entropie;
  };

  const calculerEnthalpieIsentropique = (pressionSortie, entropieEntree) => {
    if (pressionSortie <= 0) return 0;
    const TsatSortie = 100 + 28.96 * Math.log(pressionSortie);
    const hfSortie = 4.18 * TsatSortie;
    const hfgSortie = 2256.4 - 2.3 * (TsatSortie - 100);
    const sfSortie = 4.18 * Math.log((273 + TsatSortie) / 273);
    const sfgSortie = 6.048 - 0.0157 * TsatSortie;
    const titre = Math.min(1, Math.max(0, (entropieEntree - sfSortie) / sfgSortie));
    return hfSortie + titre * hfgSortie;
  };

  const calculerTemperatureSaturation = (pression) => {
    if (pression <= 0) return 0;
    return 100 + 28.96 * Math.log(pression);
  };

  const calculerPerformances = () => {
    try {
      if (parameters.turbineType === 'sansTurbine') {
        const h1 = calculerEnthalpieVapeur(parameters.pressionEntree, parameters.temperatureEntree);
        const s1 = calculerEntropieVapeur(parameters.pressionEntree, parameters.temperatureEntree);
        
        const niveaux = [
          {
            nom: t('pressureLevel1'),
            pression: parameters.niveau1Pression,
            debitPct: parameters.niveau1Debit,
            debitKgH: parameters.debitVapeur * 1000 * parameters.niveau1Debit / 100
          },
          {
            nom: t('pressureLevel2'),
            pression: parameters.niveau2Pression,
            debitPct: parameters.niveau2Debit,
            debitKgH: parameters.debitVapeur * 1000 * parameters.niveau2Debit / 100
          },
          {
            nom: t('pressureLevel3'),
            pression: parameters.niveau3Pression,
            debitPct: parameters.niveau3Debit,
            debitKgH: parameters.debitVapeur * 1000 * parameters.niveau3Debit / 100
          }
        ];

        niveaux.forEach(niveau => {
          niveau.temperatureSaturation = calculerTemperatureSaturation(niveau.pression);
          if (niveau.pression < parameters.pressionEntree) {
            niveau.enthalpie = calculerEnthalpieIsentropique(niveau.pression, s1);
            niveau.entropie = s1;
            niveau.surchauffe = 0;
            niveau.titre = Math.min(1, Math.max(0, (niveau.enthalpie - 4.18 * niveau.temperatureSaturation) / (2256.4 - 2.3 * (niveau.temperatureSaturation - 100))));
          } else {
            niveau.enthalpie = calculerEnthalpieVapeur(niveau.pression, parameters.temperatureEntree);
            niveau.entropie = calculerEntropieVapeur(niveau.pression, parameters.temperatureEntree);
            niveau.surchauffe = parameters.temperatureEntree - niveau.temperatureSaturation;
            niveau.titre = 1;
          }
        });
        
        const resultats = {
          enthalpieEntree: h1,
          entropieEntree: s1,
          temperatureSaturation: calculerTemperatureSaturation(parameters.pressionEntree),
          surchauffe: parameters.temperatureEntree - calculerTemperatureSaturation(parameters.pressionEntree),
          puissanceElectrique: 0,
          puissanceMecanique: 0,
          travailSpecifique: 0,
          consommationSpecifique: 0,
          rendementGlobal: 0,
          niveaux: niveaux,
          totalDebitPct: parameters.niveau1Debit + parameters.niveau2Debit + parameters.niveau3Debit
        };
        
        setResults(resultats);

        if (setInnerData) {
          setInnerData(prev => ({
            ...prev,
            turbine_type: 'sansTurbine',
            niveau1_pression_bar: parameters.niveau1Pression,
            niveau1_debit_kg_h: niveaux[0].debitKgH,
            niveau1_debit_pct: parameters.niveau1Debit,
            niveau2_pression_bar: parameters.niveau2Pression,
            niveau2_debit_kg_h: niveaux[1].debitKgH,
            niveau2_debit_pct: parameters.niveau2Debit,
            niveau3_pression_bar: parameters.niveau3Pression,
            niveau3_debit_kg_h: niveaux[2].debitKgH,
            niveau3_debit_pct: parameters.niveau3Debit,
            total_debit_pct: resultats.totalDebitPct,
            puissance_electrique_kW: 0,
            puissance_electrique_MW: 0
          }));
        }

        setPerformanceData([]);
        return;
      }

      const debitKgH = parameters.debitVapeur * 1000;
      const debitKgS = debitKgH / 3600;

      const h1 = calculerEnthalpieVapeur(parameters.pressionEntree, parameters.temperatureEntree);
      const s1 = calculerEntropieVapeur(parameters.pressionEntree, parameters.temperatureEntree);

      const soutirages = [];
      const maxSoutirages = turbineTypes[parameters.turbineType].maxSoutirages;
      
      let debitRestant = 100;
      let enthalpieAvantDetente = h1;
      let entropieAvantDetente = s1;
      let travailSpecifiqueTotal = 0;

      const soutiragesOrdonnes = [];
      
      if (parameters.soutirage1Active && maxSoutirages >= 1 && parameters.soutirage1Pression > parameters.pressionSortie) {
        soutiragesOrdonnes.push({
          nom: t('extraction1'),
          pression: parameters.soutirage1Pression,
          debitPct: parameters.soutirage1Debit
        });
      }
      
      if (parameters.soutirage2Active && maxSoutirages >= 2 && parameters.soutirage2Pression > parameters.pressionSortie) {
        soutiragesOrdonnes.push({
          nom: t('extraction2'),
          pression: parameters.soutirage2Pression,
          debitPct: parameters.soutirage2Debit
        });
      }
      
      if (parameters.soutirage3Active && maxSoutirages >= 3 && parameters.soutirage3Pression > parameters.pressionSortie) {
        soutiragesOrdonnes.push({
          nom: t('extraction3'),
          pression: parameters.soutirage3Pression,
          debitPct: parameters.soutirage3Debit
        });
      }

      soutiragesOrdonnes.sort((a, b) => b.pression - a.pression);

      for (const soutirage of soutiragesOrdonnes) {
        const hSoutirage = calculerEnthalpieIsentropique(soutirage.pression, entropieAvantDetente);
        const hSoutirageReel = enthalpieAvantDetente - (parameters.rendementTurbine / 100) * (enthalpieAvantDetente - hSoutirage);
        
        const travailSpecifiqueSoutirage = (enthalpieAvantDetente - hSoutirageReel) * (debitRestant / 100);
        travailSpecifiqueTotal += travailSpecifiqueSoutirage;
        
        const temperatureSoutirage = calculerTemperatureSaturation(soutirage.pression);
        
        soutirages.push({
          nom: soutirage.nom,
          pression: soutirage.pression,
          temperature: temperatureSoutirage,
          enthalpie: hSoutirageReel,
          debitPct: soutirage.debitPct,
          debitKgH: debitKgH * soutirage.debitPct / 100,
          travailSpecifique: travailSpecifiqueSoutirage
        });

        debitRestant -= soutirage.debitPct;
        if (debitRestant < 0) debitRestant = 0;
        
        enthalpieAvantDetente = hSoutirageReel;
        entropieAvantDetente = calculerEntropieVapeur(soutirage.pression, temperatureSoutirage);
      }

      const h2s = calculerEnthalpieIsentropique(parameters.pressionSortie, entropieAvantDetente);
      const h2 = enthalpieAvantDetente - (parameters.rendementTurbine / 100) * (enthalpieAvantDetente - h2s);
      
      const travailSpecifiqueFinale = (enthalpieAvantDetente - h2) * (debitRestant / 100);
      travailSpecifiqueTotal += travailSpecifiqueFinale;

      const puissanceMecanique = debitKgS * travailSpecifiqueTotal;
      const rendementGlobal = (parameters.rendementMecanique / 100) * (parameters.rendementGenerateur / 100);
      const puissanceElectrique = puissanceMecanique * rendementGlobal;

      const T1 = parameters.temperatureEntree + 273.15;
      const T2 = calculerTemperatureSaturation(parameters.pressionSortie) + 273.15;
      const efficaciteCarnot = (T1 - T2) / T1 * 100;

      const consommationSpecifique = puissanceElectrique > 0 ? debitKgH / puissanceElectrique : 0;

      const resultats = {
        enthalpieEntree: h1,
        enthalpieSortie: h2,
        enthalpieSortieIsentropique: h2s,
        travailSpecifique: travailSpecifiqueTotal,
        puissanceMecanique,
        puissanceElectrique,
        efficaciteCarnot,
        consommationSpecifique,
        rendementThermodynamique: h1 > 0 ? (travailSpecifiqueTotal / h1) * 100 : 0,
        rendementGlobal: rendementGlobal * 100,
        rapportDetente: parameters.pressionSortie > 0 ? parameters.pressionEntree / parameters.pressionSortie : 0,
        debitRestantPct: debitRestant,
        soutirages: soutirages
      };

      setResults(resultats);

      if (setInnerData) {
        setInnerData(prev => ({
          ...prev,
          turbine_type: parameters.turbineType,
          puissance_electrique_kW: Math.round(puissanceElectrique),
          puissance_electrique_MW: Math.round(puissanceElectrique / 1000 * 100) / 100,
          puissance_mecanique_kW: Math.round(puissanceMecanique),
          puissance_mecanique_MW: Math.round(puissanceMecanique / 1000 * 100) / 100,
          travail_specifique_kJ_kg: Math.round(travailSpecifiqueTotal * 100) / 100,
          rendement_global_pct: Math.round(rendementGlobal * 100 * 100) / 100,
          consommation_specifique_kg_kWh: Math.round(consommationSpecifique * 100) / 100,
          pression_entree_bar: parameters.pressionEntree,
          pression_sortie_bar: parameters.pressionSortie,
          temperature_entree_C: parameters.temperatureEntree,
          debit_vapeur_kg_h: debitKgH,
          debit_vapeur_t_h: parameters.debitVapeur,
          nb_soutirages_actifs: soutirages.length,
          ...(soutirages.length > 0 && {
            soutirages_data: soutirages.map(s => ({
              nom: s.nom,
              pression_bar: s.pression,
              temperature_C: Math.round(s.temperature),
              debit_kg_h: Math.round(s.debitKgH),
              debit_pct: s.debitPct
            }))
          })
        }));
      }

      const performanceArray = [];
      for (let debit = 10; debit <= 100; debit += 10) {
        const debitKgSTemp = (debit * 1000) / 3600;
        const puissanceMecTemp = debitKgSTemp * travailSpecifiqueTotal;
        const puissanceElecTemp = puissanceMecTemp * rendementGlobal;
        
        performanceArray.push({
          debit: debit,
          puissanceElectrique: puissanceElecTemp / 1000,
          puissanceMecanique: puissanceMecTemp / 1000,
          rendement: rendementGlobal * 100
        });
      }
      setPerformanceData(performanceArray);

    } catch (error) {
      console.error('Erreur de calcul:', error);
      setResults(null);
    }
  };

  useEffect(() => {
    calculerPerformances();
  }, [parameters]);

  const handleParameterChange = (name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleBooleanChange = (name, value) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTurbineTypeChange = (type) => {
    const turbineConfig = turbineTypes[type];
    setParameters(prev => ({
      ...prev,
      turbineType: type,
      pressionSortie: turbineConfig.pressionSortieDefaut,
      rendementTurbine: turbineConfig.rendementTypique,
      soutirage1Active: turbineConfig.maxSoutirages >= 1 ? prev.soutirage1Active : false,
      soutirage2Active: turbineConfig.maxSoutirages >= 2 ? prev.soutirage2Active : false,
      soutirage3Active: turbineConfig.maxSoutirages >= 3 ? prev.soutirage3Active : false
    }));
  };

  const styles = {
    container: { fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto', padding: '20px', backgroundColor: '#f5f7fa' },
    header: { backgroundColor: '#2c5aa0', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
    title: { margin: 0, fontSize: '24px', fontWeight: 'bold' },
    subtitle: { margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 },
    content: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' },
    section: { backgroundColor: 'white', border: '1px solid #e1e5e9', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    sectionHeader: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#2c5aa0', borderBottom: '2px solid #e1e5e9', paddingBottom: '8px' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '10px', border: '2px solid #e1e5e9', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
    turbineGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '15px' },
    turbineOption: { padding: '10px', border: '2px solid #e1e5e9', borderRadius: '6px', cursor: 'pointer', textAlign: 'center', backgroundColor: 'white', fontSize: '12px' },
    turbineOptionActive: { borderColor: '#2c5aa0', backgroundColor: '#f0f4ff', color: '#2c5aa0' },
    resultCard: { padding: '15px', backgroundColor: '#f8fafc', border: '1px solid #e1e5e9', borderRadius: '6px' },
    resultTitle: { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '5px', fontWeight: '600' },
    resultValue: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937' },
    resultUnit: { fontSize: '12px', color: '#6b7280', marginLeft: '5px' },
    chartContainer: { backgroundColor: 'white', border: '1px solid #e1e5e9', borderRadius: '8px', padding: '20px', marginTop: '20px' },
    chartTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#2c5aa0' }
  };

  const maxSoutirages = turbineTypes[parameters.turbineType].maxSoutirages;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t('electricalProductionCalculator')}</h1>
        <p style={styles.subtitle}>{t('turbineVaporWithTaps')}</p>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>{t('turbineConfiguration')}</h2>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('turbineType')}</label>
            <div style={styles.turbineGrid}>
              {Object.entries(turbineTypes).map(([key, config]) => (
                <div key={key} style={{...styles.turbineOption, ...(parameters.turbineType === key ? styles.turbineOptionActive : {})}} onClick={() => handleTurbineTypeChange(key)}>
                  <div style={{fontWeight: 'bold', marginBottom: '3px'}}>{config.name}</div>
                  <div style={{fontSize: '10px'}}>{config.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('steamFlow')} ({t('tonperH')})</label>
            <input type="number" value={parameters.debitVapeur} onChange={(e) => handleParameterChange('debitVapeur', e.target.value)} style={styles.input} min="1" max="1000" step="0.1" />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('inletPressure')} ({t('bar')})</label>
            <input type="number" value={parameters.pressionEntree} onChange={(e) => handleParameterChange('pressionEntree', e.target.value)} style={styles.input} min="1" max="200" step="0.1" />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('inletTemperature')} ({t('degreeC')})</label>
            <input type="number" value={parameters.temperatureEntree} onChange={(e) => handleParameterChange('temperatureEntree', e.target.value)} style={styles.input} min="100" max="600" step="1" />
          </div>

          {parameters.turbineType !== 'sansTurbine' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('outletPressure')} ({t('bar')})</label>
              <input type="number" value={parameters.pressionSortie} onChange={(e) => handleParameterChange('pressionSortie', e.target.value)} style={styles.input} min={turbineTypes[parameters.turbineType].pressionSortieMin} max={turbineTypes[parameters.turbineType].pressionSortieMax} step="0.01" />
            </div>
          )}
        </div>

        {parameters.turbineType !== 'sansTurbine' && (
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>{t('efficiencyParameters')}</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('turbineEfficiency')} ({t('percent')})</label>
              <input type="number" value={parameters.rendementTurbine} onChange={(e) => handleParameterChange('rendementTurbine', e.target.value)} style={styles.input} min="70" max="95" step="0.1" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('mechanicalEfficiency')} ({t('percent')})</label>
              <input type="number" value={parameters.rendementMecanique} onChange={(e) => handleParameterChange('rendementMecanique', e.target.value)} style={styles.input} min="90" max="99" step="0.1" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('generatorEfficiency')} ({t('percent')})</label>
              <input type="number" value={parameters.rendementGenerateur} onChange={(e) => handleParameterChange('rendementGenerateur', e.target.value)} style={styles.input} min="90" max="99" step="0.1" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('ambientTemperature')} ({t('degreeC')})</label>
              <input type="number" value={parameters.temperatureAmbiante} onChange={(e) => handleParameterChange('temperatureAmbiante', e.target.value)} style={styles.input} min="-20" max="50" step="1" />
            </div>
          </div>
        )}

        {parameters.turbineType === 'sansTurbine' && (
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>{t('pressureLevelsConfiguration')}</h2>
            <div style={{marginBottom: '15px'}}>
              <label style={styles.label}>{t('pressureLevel1')}</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px'}}>
                <input type="number" value={parameters.niveau1Pression} onChange={(e) => handleParameterChange('niveau1Pression', e.target.value)} style={styles.input} min="0.1" max="200" step="0.1" />
                <input type="number" value={parameters.niveau1Debit} onChange={(e) => handleParameterChange('niveau1Debit', e.target.value)} style={styles.input} min="1" max="100" step="1" />
                <span style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}> = {(parameters.debitVapeur * parameters.niveau1Debit / 100).toFixed(1)} {t('tonperH')}</span>
              </div>
            </div>
            <div style={{marginBottom: '15px'}}>
              <label style={styles.label}>{t('pressureLevel2')}</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px'}}>
                <input type="number" value={parameters.niveau2Pression} onChange={(e) => handleParameterChange('niveau2Pression', e.target.value)} style={styles.input} min="0.1" max="200" step="0.1" />
                <input type="number" value={parameters.niveau2Debit} onChange={(e) => handleParameterChange('niveau2Debit', e.target.value)} style={styles.input} min="1" max="100" step="1" />
                <span style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}> = {(parameters.debitVapeur * parameters.niveau2Debit / 100).toFixed(1)} {t('tonperH')}</span>
              </div>
            </div>
            <div style={{marginBottom: '15px'}}>
              <label style={styles.label}>{t('pressureLevel3')}</label>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px'}}>
                <input type="number" value={parameters.niveau3Pression} onChange={(e) => handleParameterChange('niveau3Pression', e.target.value)} style={styles.input} min="0.05" max="200" step="0.01" />
                <input type="number" value={parameters.niveau3Debit} onChange={(e) => handleParameterChange('niveau3Debit', e.target.value)} style={styles.input} min="1" max="100" step="1" />
                <span style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}> = {(parameters.debitVapeur * parameters.niveau3Debit / 100).toFixed(1)} {t('tonperH')}</span>
              </div>
            </div>
            <div style={{fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginTop: '10px'}}>
              {t('totalFlows')}: {(parameters.niveau1Debit + parameters.niveau2Debit + parameters.niveau3Debit).toFixed(0)}{t('percent')}
              {(parameters.niveau1Debit + parameters.niveau2Debit + parameters.niveau3Debit) !== 100 && <span style={{color: '#dc2626', fontWeight: '500'}}> (≠ 100%)</span>}
            </div>
          </div>
        )}

        {parameters.turbineType !== 'sansTurbine' && (
          <div style={styles.section}>
            <h2 style={styles.sectionHeader}>{t('extractionConfiguration')}</h2>
            {maxSoutirages >= 1 && (
              <div>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px'}}>
                  <input type="checkbox" style={{width: '18px', height: '18px'}} checked={parameters.soutirage1Active} onChange={(e) => handleBooleanChange('soutirage1Active', e.target.checked)} />
                  <label style={styles.label}>{t('extraction1')}</label>
                </div>
                {parameters.soutirage1Active && (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginLeft: '28px', marginBottom: '10px'}}>
                    <input type="number" value={parameters.soutirage1Pression} onChange={(e) => handleParameterChange('soutirage1Pression', e.target.value)} style={styles.input} min={parameters.pressionSortie + 0.1} max={parameters.pressionEntree - 0.1} step="0.1" />
                    <input type="number" value={parameters.soutirage1Debit} onChange={(e) => handleParameterChange('soutirage1Debit', e.target.value)} style={styles.input} min="1" max="50" step="0.5" />
                    <span style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}> = {(parameters.debitVapeur * parameters.soutirage1Debit / 100).toFixed(1)} {t('tonperH')}</span>
                  </div>
                )}
              </div>
            )}
            {maxSoutirages >= 2 && (
              <div>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px'}}>
                  <input type="checkbox" style={{width: '18px', height: '18px'}} checked={parameters.soutirage2Active} onChange={(e) => handleBooleanChange('soutirage2Active', e.target.checked)} />
                  <label style={styles.label}>{t('extraction2')}</label>
                </div>
                {parameters.soutirage2Active && (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginLeft: '28px', marginBottom: '10px'}}>
                    <input type="number" value={parameters.soutirage2Pression} onChange={(e) => handleParameterChange('soutirage2Pression', e.target.value)} style={styles.input} min={parameters.pressionSortie + 0.1} max={parameters.pressionEntree - 0.1} step="0.1" />
                    <input type="number" value={parameters.soutirage2Debit} onChange={(e) => handleParameterChange('soutirage2Debit', e.target.value)} style={styles.input} min="1" max="50" step="0.5" />
                    <span style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}> = {(parameters.debitVapeur * parameters.soutirage2Debit / 100).toFixed(1)} {t('tonperH')}</span>
                  </div>
                )}
              </div>
            )}
            {maxSoutirages >= 3 && (
              <div>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px'}}>
                  <input type="checkbox" style={{width: '18px', height: '18px'}} checked={parameters.soutirage3Active} onChange={(e) => handleBooleanChange('soutirage3Active', e.target.checked)} />
                  <label style={styles.label}>{t('extraction3')}</label>
                </div>
                {parameters.soutirage3Active && (
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginLeft: '28px', marginBottom: '10px'}}>
                    <input type="number" value={parameters.soutirage3Pression} onChange={(e) => handleParameterChange('soutirage3Pression', e.target.value)} style={styles.input} min={parameters.pressionSortie + 0.1} max={parameters.pressionEntree - 0.1} step="0.1" />
                    <input type="number" value={parameters.soutirage3Debit} onChange={(e) => handleParameterChange('soutirage3Debit', e.target.value)} style={styles.input} min="1" max="50" step="0.5" />
                    <span style={{fontSize: '12px', color: '#6b7280', fontWeight: '500'}}> = {(parameters.debitVapeur * parameters.soutirage3Debit / 100).toFixed(1)} {t('tonperH')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {results && (
        <div style={styles.section}>
          <h2 style={styles.sectionHeader}>{t('performanceResults')}</h2>
          
          {parameters.turbineType === 'sansTurbine' ? (
            <>
              <div style={{marginBottom: '20px'}}>
                <h3 style={{...styles.sectionHeader, fontSize: '16px', marginBottom: '15px'}}>{t('steamVaporProperties')}</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px'}}>
                  <div style={styles.resultCard}>
                    <div style={styles.resultTitle}>{t('inletEnthalpy')}</div>
                    <div style={styles.resultValue}>{results.enthalpieEntree.toFixed(0)}<span style={styles.resultUnit}>{t('kJperKg')}</span></div>
                  </div>
                  <div style={styles.resultCard}>
                    <div style={styles.resultTitle}>{t('inletEntropy')}</div>
                    <div style={styles.resultValue}>{results.entropieEntree.toFixed(2)}<span style={styles.resultUnit}>{t('kJperKgK')}</span></div>
                  </div>
                  <div style={styles.resultCard}>
                    <div style={styles.resultTitle}>{t('saturationTemperature')}</div>
                    <div style={styles.resultValue}>{results.temperatureSaturation.toFixed(0)}<span style={styles.resultUnit}>{t('degreeC')}</span></div>
                  </div>
                  <div style={styles.resultCard}>
                    <div style={styles.resultTitle}>{t('superheating')}</div>
                    <div style={styles.resultValue}>{results.surchauffe.toFixed(0)}<span style={styles.resultUnit}>{t('degreeC')}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{...styles.sectionHeader, fontSize: '16px', marginBottom: '15px'}}>
                  {t('steamVaporPropertiesByPressure')} ({t('total')}: {results.totalDebitPct}{t('percent')})
                </h3>
                {results.niveaux && results.niveaux.map((niveau, index) => (
                  <div key={index} style={{padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', marginBottom: '10px'}}>
                    <div style={{fontSize: '14px', fontWeight: 'bold', color: '#0369a1', marginBottom: '8px'}}>
                      {niveau.nom} - {niveau.pression} {t('bar')} ({niveau.debitPct}{t('percent')} = {(niveau.debitKgH/1000).toFixed(1)} {t('tonperH')})
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px'}}>
                      <div style={{fontSize: '12px', color: '#374151'}}><strong>T sat:</strong> {niveau.temperatureSaturation.toFixed(0)}{t('degreeC')}</div>
                      <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('steamEnthalpy')}:</strong> {niveau.enthalpie.toFixed(0)} {t('kJperKg')}</div>
                      <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('inletEntropy')}:</strong> {niveau.entropie.toFixed(2)} {t('kJperKgK')}</div>
                      <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('superheating')}:</strong> {niveau.surchauffe}{t('degreeC')}</div>
                      <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('quality')}:</strong> {(niveau.titre * 100).toFixed(1)}{t('percent')}</div>
                    </div>
                    {niveau.titre < 1 && <div style={{fontSize: '11px', color: '#dc2626', marginTop: '5px', fontStyle: 'italic'}}>⚠️ {t('wetSteamWarning')}</div>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px'}}>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('electricPower')}</div>
                  <div style={styles.resultValue}>{(results.puissanceElectrique / 1000).toFixed(2)}<span style={styles.resultUnit}>{t('MW')}</span></div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('mechanicalPower')}</div>
                  <div style={styles.resultValue}>{(results.puissanceMecanique / 1000).toFixed(2)}<span style={styles.resultUnit}>{t('MW')}</span></div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('specificWork')}</div>
                  <div style={styles.resultValue}>{results.travailSpecifique.toFixed(0)}<span style={styles.resultUnit}>{t('kJperKg')}</span></div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('specificConsumption')}</div>
                  <div style={styles.resultValue}>{results.consommationSpecifique.toFixed(2)}<span style={styles.resultUnit}>{t('kgperKWh')}</span></div>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px'}}>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('globalEfficiency')}</div>
                  <div style={styles.resultValue}>{results.rendementGlobal.toFixed(1)}<span style={styles.resultUnit}>{t('percent')}</span></div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('expansionRatio')}</div>
                  <div style={styles.resultValue}>{results.rapportDetente.toFixed(1)}<span style={styles.resultUnit}>:1</span></div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('carnotEfficiency')}</div>
                  <div style={styles.resultValue}>{results.efficaciteCarnot.toFixed(1)}<span style={styles.resultUnit}>{t('percent')}</span></div>
                </div>
                <div style={styles.resultCard}>
                  <div style={styles.resultTitle}>{t('remainingFlow')}</div>
                  <div style={styles.resultValue}>{results.debitRestantPct.toFixed(1)}<span style={styles.resultUnit}>{t('percent')}</span></div>
                </div>
              </div>

              {results.soutirages && results.soutirages.length > 0 && (
                <div>
                  <h3 style={{...styles.sectionHeader, fontSize: '16px', marginTop: '20px'}}>{t('extractionDetails')}</h3>
                  {results.soutirages.map((soutirage, index) => (
                    <div key={index} style={{padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', marginBottom: '10px'}}>
                      <div style={{fontSize: '14px', fontWeight: 'bold', color: '#0369a1', marginBottom: '8px'}}>{soutirage.nom}</div>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'}}>
                        <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('inletPressure')}:</strong> {soutirage.pression} {t('bar')}</div>
                        <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('inletTemperature')}:</strong> {soutirage.temperature.toFixed(0)}{t('degreeC')}</div>
                        <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('steamFlow')}:</strong> {soutirage.debitKgH.toFixed(0)} kg/h ({soutirage.debitPct}{t('percent')})</div>
                        <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('steamEnthalpy')}:</strong> {soutirage.enthalpie.toFixed(0)} {t('kJperKg')}</div>
                        <div style={{fontSize: '12px', color: '#374151'}}><strong>{t('specificWork')}:</strong> {soutirage.travailSpecifique.toFixed(0)} {t('kJperKg')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {performanceData.length > 0 && (
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>{t('performanceCurves')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e5e9" />
              <XAxis dataKey="debit" label={{ value: `${t('steamFlow')} (${t('tonperH')})`, position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: `${t('electricPower')} (${t('MW')})`, angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: `${t('globalEfficiency')} (${t('percent')})`, angle: 90, position: 'insideRight' }} />
              <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} labelFormatter={(value) => `${t('steamFlow')}: ${value} ${t('tonperH')}`} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="puissanceElectrique" stroke="#2c5aa0" strokeWidth={3} name={`${t('electricPower')} (${t('MW')})`} dot={{fill: '#2c5aa0', strokeWidth: 2, r: 4}} />
              <Line yAxisId="left" type="monotone" dataKey="puissanceMecanique" stroke="#10b981" strokeWidth={2} name={`${t('mechanicalPower')} (${t('MW')})`} dot={{fill: '#10b981', strokeWidth: 2, r: 3}} />
              <Line yAxisId="right" type="monotone" dataKey="rendement" stroke="#f59e0b" strokeWidth={2} name={`${t('globalEfficiency')} (${t('percent')})`} dot={{fill: '#f59e0b', strokeWidth: 2, r: 3}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TurbineCalculator;