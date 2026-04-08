import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FG_emissivity } from '../../A_Transverse_fonction/FG_emissivite';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const WHBDesign = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  // ===== ÉTATS PRINCIPAUX =====
  const getInitialValue = (paramName, defaultValue = 0) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  const {
    availability,
    ratioElec,
    purchaseElectricityPrice,
    selectedCountryCode,
    currency,
    truck15TCO2,
    truck15TPrice,
    truck20TCO2,
    truck20TPrice,
    truck25TCO2,
    truck25TPrice,
    airPressure,
    compressorType,
    powerRatio,
    airConsumptionPrice,
    sellingElectricityPrice,
    gasTypes,
    steamPrices,
    waterPrices,
    byproducts
  } = getOpexData();

  const stepMmTranslationKey = 'Step_mm';

  const [parametres, setParametres] = useState({
    T_fumee_init_C: innerData?.T_inlet_WHB || 0,
    CO2_kg: parseFloat(innerData?.FG_OUT_kg_h?.CO2?.toFixed(2)) || 0,
    H2O_kg: parseFloat(innerData?.FG_OUT_kg_h?.H2O?.toFixed(2)) || 0,
    N2_kg: parseFloat(innerData?.FG_OUT_kg_h?.N2?.toFixed(2)) || 0,
    O2_kg: parseFloat(innerData?.FG_OUT_kg_h?.O2?.toFixed(2)) || 0,
    CO_kg: 0,
    step_mm: 100,
    Height_pass1: 20.2,
    Wide_pass1: 10.1,
    Lenght_pass1: 3.35,
    Height_pass2: 17.1,
    Wide_pass2: 10.1,
    Lenght_pass2: 3.25,
    Height_pass3: 15.7,
    Wide_pass3: 10.1,
    Lenght_pass3: 3.25,
    T_apres_surchauffeur: 600,
    T_apres_echangeur: innerData?.T_OUT || 0,
    T_apres_economiseur: 200
  });

  const [resultats, setResultats] = useState(null);
  const [donneesGraphique, setDonneesGraphique] = useState([]);
  const [erreur, setErreur] = useState('');

  // ===== STYLES CSS =====
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '10px',
      backgroundColor: '#f5f5f5'
    },
    header: {
      backgroundColor: '#d0d0d0',
      color: '#666666',
      padding: '15px',
      marginBottom: '10px',
      textAlign: 'center'
    },
    title: {
      margin: 0,
      fontSize: '18px',
      fontWeight: 'normal'
    },
    content: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px'
    },
    section: {
      border: '1px solid #d5d5d5',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9'
    },
    sectionHeader: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '10px',
      borderBottom: '1px solid #d5d5d5',
      paddingBottom: '3px',
      color: '#666666'
    },
    inputGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 100px',
      gap: '8px',
      alignItems: 'center',
      marginBottom: '8px'
    },
    input: {
      padding: '4px',
      border: '1px solid #d5d5d5',
      fontSize: '12px',
      backgroundColor: '#ffffff'
    },
    label: {
      fontSize: '12px',
      color: '#666666'
    },
    geometryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '5px',
      marginBottom: '8px'
    },
    geometryInput: {
      padding: '3px',
      border: '1px solid #d5d5d5',
      fontSize: '11px',
      backgroundColor: '#ffffff'
    },
    geometryLabel: {
      fontSize: '10px',
      marginBottom: '2px',
      color: '#666666'
    },
    passageTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#666666'
    },
    resultsSection: {
      border: '1px solid #d5d5d5',
      padding: '10px',
      backgroundColor: '#f9f9f9'
    },
    resultsHeader: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#666666'
    },
    exportButton: {
      backgroundColor: '#c0c0c0',
      color: '#666666',
      border: 'none',
      padding: '4px 8px',
      cursor: 'pointer',
      fontSize: '11px'
    },
    performanceCard: {
      border: '1px solid #e0e0e0',
      padding: '8px',
      marginBottom: '8px',
      backgroundColor: '#ffffff'
    },
    performanceTitle: {
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '6px',
      color: '#666666'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '4px',
      fontSize: '11px'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    statValue: {
      fontFamily: 'monospace'
    },
    passageDetail: {
      border: '1px solid #e0e0e0',
      padding: '5px',
      marginBottom: '4px',
      backgroundColor: '#ffffff'
    },
    passageDetailTitle: {
      fontSize: '11px',
      fontWeight: 'bold',
      marginBottom: '3px',
      color: '#666666'
    },
    passageStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '3px',
      fontSize: '10px'
    },
    graphCard: {
      border: '1px solid #d5d5d5',
      marginTop: '15px',
      backgroundColor: '#f9f9f9'
    },
    graphHeader: {
      backgroundColor: '#d0d0d0',
      color: '#666666',
      padding: '10px'
    },
    graphTitle: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 'normal'
    },
    graphContent: {
      padding: '15px'
    },
    graphSection: {
      marginBottom: '20px'
    },
    graphSectionTitle: {
      fontSize: '13px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#666666'
    },
    errorMessage: {
      backgroundColor: '#f0f0f0',
      border: '1px solid #d5d5d5',
      padding: '8px',
      margin: '10px 0',
      fontSize: '12px',
      color: '#666666'
    },
    pdcSection: {
      border: '1px solid #d5d5d5',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9'
    },
    pdcTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#666666'
    }
  };

  // ===== FONCTIONS UTILITAIRES =====
  const calculerFractionsMolaires = (CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg) => {
    const M_CO2 = 44.01;
    const M_H2O = 18.015;
    const M_CO = 28.01;
    const M_N2 = 28.014;
    const M_O2 = 31.998;

    const n_CO2 = CO2_kg / M_CO2;
    const n_H2O = H2O_kg / M_H2O;
    const n_CO = CO_kg / M_CO;
    const n_N2 = N2_kg / M_N2;
    const n_O2 = O2_kg / M_O2;
    const n_total = n_CO2 + n_H2O + n_CO + n_N2 + n_O2;

    return {
      frac_mol_CO2: n_total > 0 ? n_CO2 / n_total : 0.4,
      frac_mol_H2O: n_total > 0 ? n_H2O / n_total : 0.3,
      frac_mol_CO: n_total > 0 ? n_CO / n_total : 0.2,
      frac_mol_N2: n_total > 0 ? n_N2 / n_total : 0.1,
      frac_mol_O2: n_total > 0 ? n_O2 / n_total : 0.1
    };
  };

  const Emissivite_fumee = (Tfumee, Height_pass, Wide_pass, Lenght_pass, CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg) => {
    const V = Height_pass * Wide_pass * Lenght_pass;
    const A = Height_pass * 2 * (Wide_pass + Lenght_pass);
    const L_optique = 3.6 * V / A * 1000;

    const fractions = calculerFractionsMolaires(CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg);

    let T_epsilon = Tfumee;
    let epsilon = FG_emissivity(T_epsilon, L_optique, fractions.frac_mol_CO2, fractions.frac_mol_H2O, fractions.frac_mol_CO);

    return epsilon;
  };

  const H_cedee_par_radiation = (Surface_d_echange, Emissivite, Temperature) => {
    const stefanBoltzmann = 5.67e-8;
    const T_amb = 253;
    return (Surface_d_echange * Emissivite * stefanBoltzmann *
      (Math.pow(Temperature + 273, 4) - Math.pow(T_amb + 273, 4))) * (3600 / 1000);
  };

  const Tend_section = (Tfumee_in, H_cedee_par_radiation, H_fume_init) => {
    if (H_fume_init === 0) return Tfumee_in;
    return Tfumee_in - (H_cedee_par_radiation / H_fume_init) * Tfumee_in;
  };

  const h_fumee = (temperature, CO2_kg, H2O_kg, O2_kg, N2_kg, CO_kg) => {
    const cp_CO2 = 0.846 + 6.9e-4 * temperature;
    const cp_H2O = 1.86 + 1.0e-3 * temperature;
    const cp_O2 = 0.918 + 1.5e-4 * temperature;
    const cp_N2 = 1.040 + 1.0e-4 * temperature;
    const cp_CO = 1.040 + 1.0e-4 * temperature;

    const masse_totale = CO2_kg + H2O_kg + O2_kg + N2_kg + CO_kg;
    if (masse_totale === 0) return 0;

    const cp_moyen = (CO2_kg * cp_CO2 + H2O_kg * cp_H2O + O2_kg * cp_O2 + N2_kg * cp_N2 + CO_kg * cp_CO) / masse_totale;
    return masse_totale * cp_moyen * temperature;
  };

  // ===== FONCTION DE CALCUL PRINCIPALE =====
  const calculerWHB = () => {
    try {
      setErreur('');

      const {
        T_fumee_init_C, CO2_kg, H2O_kg, N2_kg, O2_kg, CO_kg, step_mm,
        Height_pass1, Wide_pass1, Lenght_pass1,
        Height_pass2, Wide_pass2, Lenght_pass2,
        Height_pass3, Wide_pass3, Lenght_pass3,
        T_apres_surchauffeur, T_apres_echangeur, T_apres_economiseur
      } = parametres;

      const step = step_mm / 1000;
      const H_in = h_fumee(T_fumee_init_C, CO2_kg, H2O_kg, O2_kg, N2_kg, CO_kg);

      const resultatsPassages = [];
      const donneesGraph = [];

      // PASSAGE 1
      const perimetre1_m = (Wide_pass1 + Lenght_pass1) * 2;
      const surface_radiente1_m2 = step * perimetre1_m;
      const n_step1 = Math.floor(Height_pass1 / step) + 1;

      const pass1_data = [];
      let position_cumulative = 0;

      for (let i = 1; i <= n_step1; i++) {
        const data = {
          step: 0,
          heat_exchanged: 0,
          H_end_section: 0,
          emissivity: 0,
          T_end_section: 0,
          position: 0
        };

        if (i === 1) {
          data.step = 0;
          data.heat_exchanged = 0;
          data.H_end_section = H_in;
          data.emissivity = 0;
          data.T_end_section = T_fumee_init_C;
          data.position = position_cumulative;
        } else {
          const prev = pass1_data[i - 2];
          data.step = prev.step + step;
          data.emissivity = Emissivite_fumee(prev.T_end_section, Height_pass1, Wide_pass1, Lenght_pass1, CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg);
          data.heat_exchanged = H_cedee_par_radiation(surface_radiente1_m2, data.emissivity, prev.T_end_section);
          data.H_end_section = prev.H_end_section - data.heat_exchanged;
          data.T_end_section = Tend_section(prev.T_end_section, data.heat_exchanged, prev.H_end_section);
          data.position = position_cumulative + data.step;
        }

        pass1_data.push(data);
        donneesGraph.push({
          position: data.position,
          temperature: data.T_end_section,
          passage: t('pressureLevel1'),
          emissivity: data.emissivity,
          heat_exchanged: data.heat_exchanged
        });
      }

      position_cumulative += Height_pass1;

      // PASSAGE 2
      const T_fumee_init_pass2_C = pass1_data[pass1_data.length - 1].T_end_section;
      const H_fumee_init_pass2 = pass1_data[pass1_data.length - 1].H_end_section;
      const perimetre2_m = (Wide_pass2 + Lenght_pass2) * 2;
      const surface_radiente2_m2 = step * perimetre2_m;
      const n_step2 = Math.floor(Height_pass2 / step);

      const pass2_data = [];

      for (let i = 1; i <= n_step2; i++) {
        const data = {
          step: 0,
          heat_exchanged: 0,
          H_end_section: 0,
          emissivity: 0,
          T_end_section: 0,
          position: 0
        };

        if (i === 1) {
          data.step = step;
          data.emissivity = Emissivite_fumee(T_fumee_init_pass2_C, Height_pass2, Wide_pass2, Lenght_pass2, CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg);
          data.heat_exchanged = H_cedee_par_radiation(surface_radiente2_m2, data.emissivity, T_fumee_init_pass2_C);
          data.H_end_section = H_fumee_init_pass2 - data.heat_exchanged;
          data.T_end_section = Tend_section(T_fumee_init_pass2_C, data.heat_exchanged, H_fumee_init_pass2);
          data.position = position_cumulative + data.step;
        } else {
          const prev = pass2_data[i - 2];
          data.step = prev.step + step;
          data.emissivity = Emissivite_fumee(prev.T_end_section, Height_pass2, Wide_pass2, Lenght_pass2, CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg);
          data.heat_exchanged = H_cedee_par_radiation(surface_radiente2_m2, data.emissivity, prev.T_end_section);
          data.H_end_section = prev.H_end_section - data.heat_exchanged;
          data.T_end_section = Tend_section(prev.T_end_section, data.heat_exchanged, prev.H_end_section);
          data.position = position_cumulative + data.step;
        }

        pass2_data.push(data);
        donneesGraph.push({
          position: data.position,
          temperature: data.T_end_section,
          passage: t('pressureLevel2'),
          emissivity: data.emissivity,
          heat_exchanged: data.heat_exchanged
        });
      }

      position_cumulative += Height_pass2;

      // PASSAGE 3
      const T_fumee_init_pass3_C = pass2_data[pass2_data.length - 1].T_end_section;
      const H_fumee_init_pass3 = pass2_data[pass2_data.length - 1].H_end_section;
      const perimetre3_m = (Wide_pass3 + Lenght_pass3) * 2;
      const surface_radiente3_m2 = step * perimetre3_m;
      const n_step3 = Math.floor(Height_pass3 / step);

      const pass3_data = [];

      for (let i = 1; i <= n_step3; i++) {
        const data = {
          step: 0,
          heat_exchanged: 0,
          H_end_section: 0,
          emissivity: 0,
          T_end_section: 0,
          position: 0
        };

        if (i === 1) {
          data.step = step;
          data.emissivity = Emissivite_fumee(T_fumee_init_pass3_C, Height_pass3, Wide_pass3, Lenght_pass3, CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg);
          data.heat_exchanged = H_cedee_par_radiation(surface_radiente3_m2, data.emissivity, T_fumee_init_pass3_C);
          data.H_end_section = H_fumee_init_pass3 - data.heat_exchanged;
          data.T_end_section = Tend_section(T_fumee_init_pass3_C, data.heat_exchanged, H_fumee_init_pass3);
          data.position = position_cumulative + data.step;
        } else {
          const prev = pass3_data[i - 2];
          data.step = prev.step + step;
          data.emissivity = Emissivite_fumee(prev.T_end_section, Height_pass3, Wide_pass3, Lenght_pass3, CO2_kg, H2O_kg, CO_kg, N2_kg, O2_kg);
          data.heat_exchanged = H_cedee_par_radiation(surface_radiente3_m2, data.emissivity, prev.T_end_section);
          data.H_end_section = prev.H_end_section - data.heat_exchanged;
          data.T_end_section = Tend_section(prev.T_end_section, data.heat_exchanged, prev.H_end_section);
          data.position = position_cumulative + data.step;
        }

        pass3_data.push(data);
        donneesGraph.push({
          position: data.position,
          temperature: data.T_end_section,
          passage: t('pressureLevel3'),
          emissivity: data.emissivity,
          heat_exchanged: data.heat_exchanged
        });
      }

      // CALCUL DES PERFORMANCES
      const temperature_finale = pass3_data[pass3_data.length - 1].T_end_section;
      const chute_temperature = T_fumee_init_C - temperature_finale;
      const efficacite_thermique = (chute_temperature / T_fumee_init_C) * 100;

      const chaleur_totale_recuperee = donneesGraph.reduce((sum, point) => sum + (point.heat_exchanged || 0), 0);

      const surface_totale_pass1 = perimetre1_m * Height_pass1;
      const surface_totale_pass2 = perimetre2_m * Height_pass2;
      const surface_totale_pass3 = perimetre3_m * Height_pass3;
      const surface_totale = surface_totale_pass1 + surface_totale_pass2 + surface_totale_pass3;

      resultatsPassages.push({
        nom: t('pressureLevel1'),
        temperature_entree: T_fumee_init_C,
        temperature_sortie: pass1_data[pass1_data.length - 1].T_end_section,
        chute_temperature: T_fumee_init_C - pass1_data[pass1_data.length - 1].T_end_section,
        surface_echange: surface_totale_pass1,
        chaleur_recuperee: pass1_data.reduce((sum, d) => sum + d.heat_exchanged, 0),
        emissivite_moyenne: pass1_data.reduce((sum, d) => sum + d.emissivity, 0) / pass1_data.length
      });

      resultatsPassages.push({
        nom: t('pressureLevel2'),
        temperature_entree: T_fumee_init_pass2_C,
        temperature_sortie: pass2_data[pass2_data.length - 1].T_end_section,
        chute_temperature: T_fumee_init_pass2_C - pass2_data[pass2_data.length - 1].T_end_section,
        surface_echange: surface_totale_pass2,
        chaleur_recuperee: pass2_data.reduce((sum, d) => sum + d.heat_exchanged, 0),
        emissivite_moyenne: pass2_data.reduce((sum, d) => sum + d.emissivity, 0) / pass2_data.length
      });

      resultatsPassages.push({
        nom: t('pressureLevel3'),
        temperature_entree: T_fumee_init_pass3_C,
        temperature_sortie: pass3_data[pass3_data.length - 1].T_end_section,
        chute_temperature: T_fumee_init_pass3_C - pass3_data[pass3_data.length - 1].T_end_section,
        surface_echange: surface_totale_pass3,
        chaleur_recuperee: pass3_data.reduce((sum, d) => sum + d.heat_exchanged, 0),
        emissivite_moyenne: pass3_data.reduce((sum, d) => sum + d.emissivity, 0) / pass3_data.length
      });

      // CALCUL DES ÉCHANGEURS SUPPLÉMENTAIRES
      const deltaT_surchauffeur = temperature_finale - T_apres_surchauffeur;
      const H_avant_surchauffeur = h_fumee(temperature_finale, CO2_kg, H2O_kg, O2_kg, N2_kg, CO_kg);
      const H_apres_surchauffeur = h_fumee(T_apres_surchauffeur, CO2_kg, H2O_kg, O2_kg, N2_kg, CO_kg);
      const Q_surchauffeur = H_avant_surchauffeur - H_apres_surchauffeur;

      const deltaT_echangeur = T_apres_surchauffeur - T_apres_echangeur;
      const H_apres_echangeur = h_fumee(T_apres_echangeur, CO2_kg, H2O_kg, O2_kg, N2_kg, CO_kg);
      const Q_echangeur = H_apres_surchauffeur - H_apres_echangeur;

      const deltaT_economiseur = T_apres_echangeur - T_apres_economiseur;
      const H_apres_economiseur = h_fumee(T_apres_economiseur, CO2_kg, H2O_kg, O2_kg, N2_kg, CO_kg);
      const Q_economiseur = H_apres_echangeur - H_apres_economiseur;

      setResultats({
        temperature_initiale: T_fumee_init_C,
        temperature_finale: temperature_finale,
        chute_temperature: chute_temperature,
        efficacite_thermique: efficacite_thermique,
        chaleur_totale_recuperee: chaleur_totale_recuperee,
        surface_totale: surface_totale,
        passages: resultatsPassages,
        nombre_sections_total: n_step1 + n_step2 + n_step3,
        hauteur_totale: Height_pass1 + Height_pass2 + Height_pass3,
        echangeurs: {
          surchauffeur: { deltaT: deltaT_surchauffeur, Q: Q_surchauffeur / 1000 },
          echangeur: { deltaT: deltaT_echangeur, Q: Q_echangeur / 1000 },
          economiseur: { deltaT: deltaT_economiseur, Q: Q_economiseur / 1000 }
        }
      });

      setDonneesGraphique(donneesGraph);

    } catch (error) {
      console.error('Erreur calcul WHB:', error);
      setErreur('Erreur de calcul: ' + error.message);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculerWHB();
    }, 300);

    return () => clearTimeout(timer);
  }, [parametres]);

  useEffect(() => {
    if (resultats && resultats.temperature_finale) {
      const tempFinale = resultats.temperature_finale;
      if (parametres.T_apres_surchauffeur === 600 && parametres.T_apres_echangeur === (innerData?.T_OUT || 0) && parametres.T_apres_economiseur === 200) {
        setParametres(prev => ({
          ...prev,
          T_apres_surchauffeur: tempFinale,
          T_apres_echangeur: tempFinale,
          T_apres_economiseur: tempFinale
        }));
      }
    }
  }, [resultats?.temperature_finale]);

  const formatNumber = (value, decimals = 2) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return '---';
    return value.toFixed(decimals);
  };

  const exporterResultats = () => {
    if (!resultats || donneesGraphique.length === 0) return;

    const csvData = donneesGraphique.map(point => ({
      Position: point.position.toFixed(3),
      Temperature: point.temperature.toFixed(2),
      Passage: point.passage,
      Emissivite: point.emissivity.toFixed(4),
      Chaleur_Echangee: point.heat_exchanged.toFixed(2)
    }));

    const csvContent = "data:text/csv;charset=utf-8," +
      "Position(m),Temperature(°C),Passage,Emissivite,Chaleur_Echangee(kW)\n" +
      csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "resultats_WHB.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [PDC_calcul, setPDC_calcul] = useState({
    'PDC [mmCE]': getInitialValue('PDC_mmCE', 0),
  });

  const P_in_mmCE = innerData?.P_OUT || 0;
  const PDC_mmCE = PDC_calcul['PDC [mmCE]'];
  const P_out_mmCE = P_in_mmCE - PDC_mmCE;

  const elements_PDC = [
    { text: t('poutMmce'), value: P_out_mmCE },
  ];

  const handleParametresChange = (name, value) => {
    if (name in PDC_calcul) {
      setPDC_calcul(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const elements_eau_WHB = [
    { text: t('waterPurgeLosses'), value: innerData?.Eau_purge_kg_h || 0 }
  ];
  const Eau_demin_m3_h = (innerData?.Eau_purge_kg_h || 0) / 1000;

  const Q_eau_m3_h = innerData?.Debit_eau_m3_h || 0;
  const Hmt = (innerData?.Pression_vapeur_bar || 0) + 20;
  const P_pompe_alim_kW = Q_eau_m3_h * Hmt / (36 * 0.7);

  const elements_Pompe_alim = [
    { text: 'Puissance_pompe_alimentaire', value: P_pompe_alim_kW },
  ];

  const type_camion = '15t';
  const distance_km = 100;

  let CO2_transport_kg_km = truck15TCO2;
  let cout_transport_euro_km = truck15TPrice;

  switch(type_camion) {
    case '15t':
      CO2_transport_kg_km = truck15TCO2;
      cout_transport_euro_km = truck15TPrice;
      break;
    case '20t':
      CO2_transport_kg_km = truck20TCO2;
      cout_transport_euro_km = truck20TPrice;
      break;
    case '25t':
      CO2_transport_kg_km = truck25TCO2;
      cout_transport_euro_km = truck25TPrice;
      break;
    default:
      break;
  }

  const Refidis_kg_h = innerData?.Boiler_ash || 0;

  const CO2_transport_refidis = CO2_transport_kg_km * distance_km * (Refidis_kg_h / 1000);
  const cout_transport_refidis = cout_transport_euro_km * distance_km;

  useEffect(() => {
    if (innerData && setInnerData) {
      const toSignificantFigures = (value, figures = 2) => {
        if (value === 0 || value === null || value === undefined) return 0;
        return parseFloat(value.toPrecision(figures));
      };

      const consoElec1 = P_pompe_alim_kW;
      const consoElec2 = 0;
      const consoElec3 = 0;
      const consoElec4 = 0;
      const consoElec5 = 0;

      const labelElec1 = 'Pompe alimentation';
      const labelElec2 = 'Air comprimé';
      const labelElec3 = '';
      const labelElec4 = '';
      const labelElec5 = '';

      const conso_air_co_N_m3 = 1;

      const Conso_EauPotable_m3 = 0;
      const Conso_EauRefroidissement_m3 = 0;
      const Conso_EauDemin_m3 = Eau_demin_m3_h;
      const Conso_EauRiviere_m3 = 0;
      const Conso_EauAdoucie_m3 = 0;

      const Conso_CaCO3_kg = innerData?.Conso_reactifs?.CaCO3 || 0;
      const Conso_CaO_kg = innerData?.Conso_reactifs?.CaO || 0;
      const Conso_CaOH2_dry_kg = innerData?.Conso_reactifs?.CaOH2_dry || 0;
      const Conso_CaOH2_wet_kg = innerData?.Conso_reactifs?.CaOH2_wet || 0;
      const Conso_NaOH_kg = innerData?.Conso_reactifs?.NaOH || 0;
      const Conso_NaOHCO3_kg = innerData?.Conso_reactifs?.NaOHCO3 || 0;
      const Conso_Ammonia_kg = innerData?.Conso_reactifs?.Ammonia || 0;
      const Conso_NaBrCaBr2_kg = innerData?.Conso_reactifs?.NaBrCaBr2 || 0;
      const Conso_CAP_kg = innerData?.Conso_reactifs?.CAP || 0;

      const conso_gaz_H_MW = 0;
      const conso_gaz_L_MW = 0;
      const conso_gaz_Process_MW = 0;
      const conso_fuel = 0;

      const conso_incineration_ash_kg_h = 0;
      const conso_boiler_ash_kg_h = Refidis_kg_h;
      const conso_fly_ash_kg_h = 0;

      const CO2_transport_incineratino_ash = 0;
      const CO2_transport_boiler_ash = CO2_transport_refidis;
      const CO2_transport_fly_ash = 0;
      const CO2_transport_reactifs = innerData?.Conso_reactifs?.CO2_transport || 0;

      const cout_transport_incineratino_ash = 0;
      const cout_transport_boiler_ash = cout_transport_refidis;
      const cout_transport_fly_ash = 0;
      const cout_transport_reactifs = innerData?.Conso_reactifs?.cout || 0;

      const production_electrique_kW = toSignificantFigures(Math.abs(innerData?.puissance_electrique_kW || 0));
      const debit_vapeur_HP_th = toSignificantFigures(innerData?.debit_vapeur_HP_kg_h || 0);
      const debit_vapeur_MP_th = toSignificantFigures(innerData?.debit_vapeur_MP_kg_h || 0);
      const debit_vapeur_BP_th = toSignificantFigures(innerData?.debit_vapeur_BP_kg_h || 0);

      const gain_production_electrique = toSignificantFigures(Math.abs(innerData?.puissance_electrique_kW || 0) / 1000) * sellingElectricityPrice;
      const gain_debit_vapeur_HP = toSignificantFigures(innerData?.debit_vapeur_HP_kg_h || 0) / 1000 * steamPrices.highPressure;
      const gain_debit_vapeur_MP = toSignificantFigures(innerData?.debit_vapeur_MP_kg_h || 0) / 1000 * steamPrices.lowPressure1;
      const gain_debit_vapeur_BP = toSignificantFigures(innerData?.debit_vapeur_BP_kg_h || 0) / 1000 * steamPrices.lowPressure2;

      setInnerData(prevData => ({
        ...prevData,
        consoElec1,
        consoElec2,
        consoElec3,
        consoElec4,
        consoElec5,
        labelElec1,
        labelElec2,
        labelElec3,
        labelElec4,
        labelElec5,
        conso_air_co_N_m3,
        Conso_EauPotable_m3,
        Conso_EauRefroidissement_m3,
        Conso_EauDemin_m3,
        Conso_EauRiviere_m3,
        Conso_EauAdoucie_m3,
        Conso_CaCO3_kg,
        Conso_CaO_kg,
        Conso_CaOH2_dry_kg,
        Conso_CaOH2_wet_kg,
        Conso_NaOH_kg,
        Conso_NaOHCO3_kg,
        Conso_Ammonia_kg,
        Conso_NaBrCaBr2_kg,
        truck15TPrice: cout_transport_reactifs,
        conso_gaz_H_MW,
        conso_gaz_L_MW,
        conso_gaz_Process_MW,
        conso_fuel,
        conso_incineration_ash_kg_h,
        conso_boiler_ash_kg_h,
        conso_fly_ash_kg_h,
        CO2_transport_incineratino_ash,
        CO2_transport_boiler_ash,
        CO2_transport_fly_ash,
        CO2_transport_reactifs,
        cout_transport_incineratino_ash,
        cout_transport_boiler_ash,
        cout_transport_fly_ash,
        cout_transport_reactifs,
        production_electrique_kW,
        debit_vapeur_HP_th,
        debit_vapeur_MP_th,
        debit_vapeur_BP_th,
        gain_production_electrique,
        gain_debit_vapeur_HP,
        gain_debit_vapeur_MP,
        gain_debit_vapeur_BP
      }));
    }
  }, [
    innerData,
    setInnerData,
    P_pompe_alim_kW,
    Eau_demin_m3_h,
    Refidis_kg_h,
    CO2_transport_refidis,
    cout_transport_refidis
  ]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{t('aeraulicPressureLoss')}</h1>
      </div>

      {erreur && (
        <div style={styles.errorMessage}>
          {t('errorMessage')}{erreur}
        </div>
      )}

      <div style={styles.content}>
        <div>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>{t('thermicalLossParameters')}</div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>{t('flueGasTemperatureInlet')} (°C)</span>
              <input
                type="number"
                value={parametres.T_fumee_init_C}
                onChange={(e) => setParametres({...parametres, T_fumee_init_C: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>CO₂ (kg/h)</span>
              <input
                type="number"
                value={parametres.CO2_kg}
                onChange={(e) => setParametres({...parametres, CO2_kg: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>H₂O (kg/h)</span>
              <input
                type="number"
                value={parametres.H2O_kg}
                onChange={(e) => setParametres({...parametres, H2O_kg: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>N₂ (kg/h)</span>
              <input
                type="number"
                value={parametres.N2_kg}
                onChange={(e) => setParametres({...parametres, N2_kg: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>O₂ (kg/h)</span>
              <input
                type="number"
                value={parametres.O2_kg}
                onChange={(e) => setParametres({...parametres, O2_kg: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>CO (kg/h)</span>
              <input
                type="number"
                value={parametres.CO_kg}
                onChange={(e) => setParametres({...parametres, CO_kg: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={{...styles.inputGroup, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #d5d5d5'}}>
              <span style={styles.label}>frac_mol_CO₂</span>
              <input
                type="text"
                value={calculerFractionsMolaires(parametres.CO2_kg, parametres.H2O_kg, parametres.CO_kg, parametres.N2_kg, parametres.O2_kg).frac_mol_CO2.toFixed(4)}
                readOnly
                style={{...styles.input, backgroundColor: '#f0f0f0', color: '#666666'}}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>frac_mol_H₂O</span>
              <input
                type="text"
                value={calculerFractionsMolaires(parametres.CO2_kg, parametres.H2O_kg, parametres.CO_kg, parametres.N2_kg, parametres.O2_kg).frac_mol_H2O.toFixed(4)}
                readOnly
                style={{...styles.input, backgroundColor: '#f0f0f0', color: '#666666'}}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>frac_mol_CO</span>
              <input
                type="text"
                value={calculerFractionsMolaires(parametres.CO2_kg, parametres.H2O_kg, parametres.CO_kg, parametres.N2_kg, parametres.O2_kg).frac_mol_CO.toFixed(4)}
                readOnly
                style={{...styles.input, backgroundColor: '#f0f0f0', color: '#666666'}}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>frac_mol_N₂</span>
              <input
                type="text"
                value={calculerFractionsMolaires(parametres.CO2_kg, parametres.H2O_kg, parametres.CO_kg, parametres.N2_kg, parametres.O2_kg).frac_mol_N2.toFixed(4)}
                readOnly
                style={{...styles.input, backgroundColor: '#f0f0f0', color: '#666666'}}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>frac_mol_O₂</span>
              <input
                type="text"
                value={calculerFractionsMolaires(parametres.CO2_kg, parametres.H2O_kg, parametres.CO_kg, parametres.N2_kg, parametres.O2_kg).frac_mol_O2.toFixed(4)}
                readOnly
                style={{...styles.input, backgroundColor: '#f0f0f0', color: '#666666'}}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>{t('stepMM')} (mm)</span>
              <input
                type="number"
                value={parametres.step_mm}
                onChange={(e) => setParametres({...parametres, step_mm: parseFloat(e.target.value) || 100})}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>{t('sccThermicalLosses')}</div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>{t('superheating')} (°C)</span>
              <input
                type="number"
                value={parseFloat(parametres.T_apres_surchauffeur.toFixed(2))}
                onChange={(e) => setParametres({...parametres, T_apres_surchauffeur: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>{t('deltaEnthalpies')} (°C)</span>
              <input
                type="number"
                value={parseFloat(parametres.T_apres_echangeur.toFixed(2))}
                onChange={(e) => setParametres({...parametres, T_apres_echangeur: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}>{t('lanceEstimation')} (°C)</span>
              <input
                type="number"
                value={parseFloat(parametres.T_apres_economiseur.toFixed(2))}
                onChange={(e) => setParametres({...parametres, T_apres_economiseur: parseFloat(e.target.value) || 0})}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>{t('rotaryKilnDesign')}</div>

            <div style={styles.passageTitle}>{t('pressureLevel1')}</div>
            <div style={styles.geometryGrid}>
              <div>
                <div style={styles.geometryLabel}>{t('bodyLength')} (m)</div>
                <input
                  type="number"
                  value={parametres.Height_pass1}
                  onChange={(e) => setParametres({...parametres, Height_pass1: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
              <div>
                <div style={styles.geometryLabel}>{t('bodyInnerDiameter')} (m)</div>
                <input
                  type="number"
                  value={parametres.Wide_pass1}
                  onChange={(e) => setParametres({...parametres, Wide_pass1: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
              <div>
                <div style={styles.geometryLabel}>{t('tubeInnerDiameter')} (m)</div>
                <input
                  type="number"
                  value={parametres.Lenght_pass1}
                  onChange={(e) => setParametres({...parametres, Lenght_pass1: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
            </div>

            <div style={styles.passageTitle}>{t('pressureLevel2')}</div>
            <div style={styles.geometryGrid}>
              <div>
                <div style={styles.geometryLabel}>{t('bodyLength')} (m)</div>
                <input
                  type="number"
                  value={parametres.Height_pass2}
                  onChange={(e) => setParametres({...parametres, Height_pass2: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
              <div>
                <div style={styles.geometryLabel}>{t('bodyInnerDiameter')} (m)</div>
                <input
                  type="number"
                  value={parametres.Wide_pass2}
                  onChange={(e) => setParametres({...parametres, Wide_pass2: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
              <div>
                <div style={styles.geometryLabel}>{t('tubeInnerDiameter')} (m)</div>
                <input
                  type="number"
                  value={parametres.Lenght_pass2}
                  onChange={(e) => setParametres({...parametres, Lenght_pass2: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
            </div>

            <div style={styles.passageTitle}>{t('pressureLevel3')}</div>
            <div style={styles.geometryGrid}>
              <div>
                <div style={styles.geometryLabel}>{t('bodyLength')} (m)</div>
                <input
                  type="number"
                  value={parametres.Height_pass3}
                  onChange={(e) => setParametres({...parametres, Height_pass3: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
              <div>
                <div style={styles.geometryLabel}>{t('bodyInnerDiameter')} (m)</div>
                <input
                  type="number"
                  value={parametres.Wide_pass3}
                  onChange={(e) => setParametres({...parametres, Wide_pass3: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
              <div>
                <div style={styles.geometryLabel}>{t('tubeInnerDiameter')} (m)</div>
                <input
                  type="number"
                  value={parametres.Lenght_pass3}
                  onChange={(e) => setParametres({...parametres, Lenght_pass3: parseFloat(e.target.value) || 0})}
                  style={styles.geometryInput}
                />
              </div>
            </div>
          </div>
        </div>

        {resultats && (
          <div style={styles.resultsSection}>
            <div style={styles.resultsHeader}>
              <span>{t('performanceResults')}</span>
              <button onClick={exporterResultats} style={styles.exportButton}>
                Export CSV
              </button>
            </div>

            <div style={styles.performanceCard}>
              <div style={styles.performanceTitle}>{t('globalEfficiency')}</div>
              <div style={styles.statsGrid}>
                <div style={styles.statRow}>
                  <span>{t('flueGasTemperatureInlet')}:</span>
                  <span style={styles.statValue}>{formatNumber(resultats.temperature_initiale)} °C</span>
                </div>
                <div style={styles.statRow}>
                  <span>{t('flueGasTemperatureOutlet')}:</span>
                  <span style={styles.statValue}>{formatNumber(resultats.temperature_finale)} °C</span>
                </div>
                <div style={styles.statRow}>
                  <span>{t('deltaEnthalpies')}:</span>
                  <span style={styles.statValue}>{formatNumber(resultats.chute_temperature)} °C</span>
                </div>
                <div style={styles.statRow}>
                  <span>{t('estimatedThermalLoss')}:</span>
                  <span style={styles.statValue}>{formatNumber(resultats.efficacite_thermique)} %</span>
                </div>
                <div style={styles.statRow}>
                  <span>{t('chaleurRecuperee')}:</span>
                  <span style={styles.statValue}>{formatNumber(resultats.chaleur_totale_recuperee / 1000)} MW</span>
                </div>
                <div style={styles.statRow}>
                  <span>{t('surfaceTotal')}:</span>
                  <span style={styles.statValue}>{formatNumber(resultats.surface_totale)} m²</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#666666'}}>
                {t('extractionDetails')}
              </div>
              {resultats.passages.map((passage, index) => (
                <div key={index} style={styles.passageDetail}>
                  <div style={styles.passageDetailTitle}>{passage.nom}</div>
                  <div style={styles.passageStats}>
                    <div>
                      <span style={{color: '#888888'}}>ΔT: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(passage.chute_temperature)}°C</span>
                    </div>
                    <div>
                      <span style={{color: '#888888'}}>{t('bodyInnerDiameter')}: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(passage.surface_echange)}m²</span>
                    </div>
                    <div>
                      <span style={{color: '#888888'}}>Q: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(passage.chaleur_recuperee / 1000)}MW</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {resultats.echangeurs && (
              <div>
                <div style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#666666', marginTop: '10px'}}>
                  {t('sccBurners')}
                </div>

                <div style={styles.passageDetail}>
                  <div style={styles.passageDetailTitle}>{t('superheating')}</div>
                  <div style={styles.passageStats}>
                    <div>
                      <span style={{color: '#888888'}}>ΔT: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(resultats.echangeurs.surchauffeur.deltaT)}°C</span>
                    </div>
                    <div>
                      <span style={{color: '#888888'}}>Q: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(resultats.echangeurs.surchauffeur.Q)}MW</span>
                    </div>
                  </div>
                </div>

                <div style={styles.passageDetail}>
                  <div style={styles.passageDetailTitle}>{t('deltaEnthalpies')}</div>
                  <div style={styles.passageStats}>
                    <div>
                      <span style={{color: '#888888'}}>ΔT: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(resultats.echangeurs.echangeur.deltaT)}°C</span>
                    </div>
                    <div>
                      <span style={{color: '#888888'}}>Q: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(resultats.echangeurs.echangeur.Q)}MW</span>
                    </div>
                  </div>
                </div>

                <div style={styles.passageDetail}>
                  <div style={styles.passageDetailTitle}>{t('lanceEstimation')}</div>
                  <div style={styles.passageStats}>
                    <div>
                      <span style={{color: '#888888'}}>ΔT: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(resultats.echangeurs.economiseur.deltaT)}°C</span>
                    </div>
                    <div>
                      <span style={{color: '#888888'}}>Q: </span>
                      <span style={{fontFamily: 'monospace'}}>{formatNumber(resultats.echangeurs.economiseur.Q)}MW</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {donneesGraphique.length > 0 && (
        <div style={styles.graphCard}>
          <div style={styles.graphHeader}>
            <h2 style={styles.graphTitle}>{t('performanceCurves')}</h2>
          </div>

          <div style={styles.graphContent}>
            <div style={{...styles.graphSection, height: '350px'}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donneesGraphique}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5d5d5" />
                  <XAxis
                    dataKey="position"
                    type="number"
                    scale="linear"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => value.toFixed(1)}
                    label={{ value: 'Position (m)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: t('degreeC'), angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(2) : value,
                      name
                    ]}
                    labelFormatter={(value) => `Position: ${value.toFixed(1)} m`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#888888"
                    strokeWidth={2}
                    name={t('inletTemperature')}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{...styles.graphSection, height: '250px'}}>
              <h3 style={styles.graphSectionTitle}>{t('sccThermicalLosses')}</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={donneesGraphique}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5d5d5" />
                  <XAxis
                    dataKey="position"
                    type="number"
                    scale="linear"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(value) => value.toFixed(1)}
                    label={{ value: 'Position (m)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: t('estimatedThermalLoss'), angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toFixed(4) : value,
                      name
                    ]}
                    labelFormatter={(value) => `Position: ${value.toFixed(1)} m`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="emissivity"
                    stroke="#888888"
                    strokeWidth={2}
                    name={t('estimatedThermalLoss')}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SECTION PDC - Sans DisplayDesignComponent */}
      <div style={styles.pdcSection}>
        <div style={styles.pdcTitle}>{t('aeraulicPressureLoss')}</div>
        <div style={styles.inputGroup}>
          <span style={styles.label}>PDC [mmCE]</span>
          <input
            type="number"
            value={PDC_calcul['PDC [mmCE]']}
            onChange={(e) => handleParametresChange('PDC [mmCE]', parseFloat(e.target.value) || 0)}
            style={styles.input}
          />
        </div>
        <div style={{marginTop: '10px', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0'}}>
          <div style={{fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: '#666666'}}>
            {t('aeraulicPressureLoss')}
          </div>
          <div style={{fontSize: '10px', display: 'flex', justifyContent: 'space-between', padding: '4px 0'}}>
            <span>{t('poutMmce')}:</span>
            <span style={{fontFamily: 'monospace', fontWeight: 'bold'}}>{formatNumber(P_out_mmCE)} mmCE</span>
          </div>
        </div>
      </div>

      {/* SECTION EAU */}
      <div style={styles.pdcSection}>
        <div style={styles.pdcTitle}>{t('waterRecallConsumption')}</div>
        <TableGeneric elements={elements_eau_WHB} />
      </div>
    </div>
  );
};

export default WHBDesign;