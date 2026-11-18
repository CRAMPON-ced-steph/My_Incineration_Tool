import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import { coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import BagFilterSynoptic from '../../B_Images/electrofilter_img.jsx';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './ELECTROFILTER_traduction';

import { fmt } from '../../A_Transverse_fonction/formatNumber';

const EFDesignCtx = React.createContext((k) => k);

const Section = ({ title, results, children }) => {
  const t = React.useContext(EFDesignCtx);
  return (
    <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, borderBottom: '2px solid #4a90e2', paddingBottom: '10px' }}>
        {t(title)}
      </h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {children}
        {results && results.length > 0 && (
          <>
            <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>{t('Results')}</h4>
            <TableGeneric elements={results} />
          </>
        )}
      </div>
    </div>
  );
};

const ParameterInput = ({ translationKey, value, onChange, options = null }) => {
  const t = React.useContext(EFDesignCtx);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ flex: 1, minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
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
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      )}
    </div>
  );
};

const ELECTROFILTER_Design = ({ innerData = {}, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  
  // t stable : une fonction recréée à chaque rendu relançait l'effet d'écriture en boucle.
  const t = useCallback(
    (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key,
    [languageCode]
  );

  // Fonction helper pour obtenir les valeurs initiales
  const getInitialValue = (paramName, defaultValue) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  // Récupération sécurisée des données OPEX
  const opexData = getOpexData() || {};
  const { 
    truck15TCO2 = 0.5, 
    truck15TPrice = 2, 
    truck20TCO2 = 0.6, 
    truck20TPrice = 2.5, 
    truck25TCO2 = 0.7, 
    truck25TPrice = 3, 
    powerRatio = 0.1, 
  } = opexData;

  // Valeurs par défaut sécurisées pour les débits de fumées
  const Debit_fumees_sec_Nm3_h = innerData?.FG_RK_OUT_Nm3_h?.dry || 28666;
  const Debit_fumees_humide_Nm3_h = innerData?.FG_RK_OUT_Nm3_h?.wet || 28666;

  // PDC calcul
  const [PDC_calcul, setPDC_calcul] = useState({
    'Pression aéraulique [mmCE]': getInitialValue('P_OUT', 0),
    'PDC [mmCE]': getInitialValue('PDC_mmCE', 30),
  });
  
  const P_in_mmCE = innerData?.P_OUT || PDC_calcul['Pression aéraulique [mmCE]'];
  const PDC_mmCE = PDC_calcul['PDC [mmCE]'];
  const P_out_mmCE = P_in_mmCE - PDC_mmCE;
  
  const T_IN = innerData?.T_OUT || 200;
  const Qv_humide_m3_h = coeff_Nm3_to_m3(P_in_mmCE, T_IN) * Debit_fumees_humide_Nm3_h;

  // Paramètres du dimensionnement de l'électrofiltre
  const [parametres, setParametres] = useState({
    'Rendement de capture [%]': getInitialValue('Rendement_capture', 99.9),
    'Vitesse de migration [m/s]': getInitialValue('Vitesse_migration', 20),
    'PDC électrofiltre [mmCE]': getInitialValue('PDC_electrofiltre', 30),
  });

  const Rdt_capture = parametres['Rendement de capture [%]'];
  const Vitesse_migration = parametres['Vitesse de migration [m/s]'];
  const PDC = parametres['PDC électrofiltre [mmCE]'];
  const Qv_Nm3_h = innerData?.FG_humide_tot || 10000;
  const P_inlet = innerData.P_OUT || 0;
  const surfacePlaques = Math.abs(Qv_Nm3_h / (Vitesse_migration * 3600) * Math.log(1 - Rdt_capture / 100));
  const nombrePlaques = Math.ceil(surfacePlaques / 9);
  const nombreChamps = 2;
  const nombreRueChamps = surfacePlaques / nombrePlaques / nombreChamps;
  const pressionSortie = P_inlet - PDC;

  // Consommation électrique vis de transport
  const [Estimation_conso_Electrofiltre, setEstimation_conso_Electrofiltre] = useState({
    'consommation vis de transport [kW]': getInitialValue('Vis_de_transport', 4),
  });

  const conso_elec_champs_kW = Math.ceil(nombreRueChamps * 3.6);
  const conso_vis_transport_kW = Estimation_conso_Electrofiltre['consommation vis de transport [kW]'];
  const conso_elec_marteau_debatissage_kW = 2 * nombreChamps;

  // Consommation air comprimé
  const [conso_air_comprime, setConso_air_comprime] = useState({
    'Nombre de cycles de nettoyage [Nb]': getInitialValue('Nombre_cycles', 60),
    'Pression air comprimé [Bar]': getInitialValue('Pression_air_comprime', '7'),
    'Air comprime par cycle [Nm3/cycle]': getInitialValue('Air_comprime_cycle', 28),
  });

  const nombre_cycle_nb = conso_air_comprime['Nombre de cycles de nettoyage [Nb]'];
  const pression_air_comprime_bar = parseFloat(conso_air_comprime['Pression air comprimé [Bar]'] || '7');
  const air_comprime_par_cycle = conso_air_comprime['Air comprime par cycle [Nm3/cycle]'];
  const conso_air_co_Nm3_h = air_comprime_par_cycle * nombre_cycle_nb;
  const Conso_elec_air_co_kW = conso_air_co_Nm3_h * powerRatio;

  // Évacuation des résidus
  const [evacuation_electrofiltre_ash, setEvacuation_electrofiltre_ash] = useState({
    'Type de camion': getInitialValue('Type_camion', '15t'),
    'Distance [km]': getInitialValue('Distance_transport', 50),
  });

  const residus_a_evacuer = innerData?.Residus || {
    DryBottomAsh_kg_h: 0,
    WetBottomAsh_kg_h: 0,
  };

  const type_camion = evacuation_electrofiltre_ash['Type de camion'];
  const distance_km = evacuation_electrofiltre_ash['Distance [km]'];
  const cendres_kg_h = residus_a_evacuer.WetBottomAsh_kg_h;

  let CO2_transport_kg_km, cout_transport_euro_km;
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
      CO2_transport_kg_km = truck15TCO2; 
      cout_transport_euro_km = truck15TPrice;
  }

  let CO2_transport_total = CO2_transport_kg_km * distance_km * (cendres_kg_h / 1000);
  let cout_transport_total = cendres_kg_h === 0 ? 0 : cout_transport_euro_km * distance_km;

  // Fonction pour gérer les changements de paramètres
  const handleParametresChange = (name, value) => {
    const numericValue = parseFloat(value) || 0;

    if (name === 'Rendement de capture [%]') {
      const validatedValue = Math.max(0, Math.min(100, numericValue));
      setParametres(prev => ({ ...prev, [name]: validatedValue }));
      return;
    }
    
    if (name === 'Vitesse de migration [m/s]') {
      const validatedValue = Math.max(0, Math.min(30, numericValue));
      setParametres(prev => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name === 'PDC électrofiltre [mmCE]') {
      const validatedValue = Math.max(0, Math.min(100, numericValue));
      setParametres(prev => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name in PDC_calcul) {
      setPDC_calcul(prev => ({ ...prev, [name]: numericValue }));
    } else if (name in Estimation_conso_Electrofiltre) {
      setEstimation_conso_Electrofiltre(prev => ({ ...prev, [name]: numericValue }));
    } else if (name in conso_air_comprime) {
      setConso_air_comprime(prev => ({ ...prev, [name]: value }));
    } else if (name in evacuation_electrofiltre_ash) {
      setEvacuation_electrofiltre_ash(prev => ({
        ...prev,
        [name]: typeof value === 'string' ? value : numericValue,
      }));
    }
  };

  // Éléments génériques pour le tableau de résumé
  const elementsGeneric = [
    { text: t('Surface des plaques [m²]'), value: fmt(surfacePlaques, 2) },
    { text: t('Nombre de plaques [Nb]'), value: nombrePlaques },
    { text: t('Consommation air comprimé [Nm3/h]'), value: fmt(conso_air_co_Nm3_h, 2) },
    { text: t('Pression air comprimé [Bar]'), value: fmt(pression_air_comprime_bar, 1) },
    { text: t('Residus électrofiltre [kg/h]'), value: fmt(cendres_kg_h, 2) },
    { text: t('CO2 transport total [kg]'), value: fmt(CO2_transport_total, 2) },
    { text: t('Coût transport total [€]'), value: fmt(cout_transport_total, 2) },
  ];

  // Réactifs calculés dans l'onglet Polluants (injection sèche en amont du filtre)
  const reactifs = innerData?.Conso_reactifs || {};

  // ─── Écriture dans innerData (onglet OPEX et rapport) ───
  // Toutes les clés OPEX standard sont écrites : celles que l'électrofiltre ne
  // consomme pas sont remises à 0 (pas de valeur héritée d'un autre nœud).
  const opexPayload = useMemo(() => ({
    P_out_mmCE,
    consoElec1: conso_elec_champs_kW,
    consoElec2: conso_vis_transport_kW,
    consoElec3: conso_elec_marteau_debatissage_kW,
    consoElec4: Conso_elec_air_co_kW,
    labelElec1: t('Consommation élec des champs'),
    labelElec2: t('Consommation vis de transport'),
    labelElec3: t('Consommation élec des marteaux débatisseurs'),
    labelElec4: t('Air comprimé'),
    ...Object.fromEntries([5, 6, 7, 8].flatMap((i) => [[`consoElec${i}`, 0], [`labelElec${i}`, '']])),
    conso_air_co_N_m3: conso_air_co_Nm3_h,
    pression_air_comprime_bar,
    Conso_EauPotable_m3: 0, Conso_EauRefroidissement_m3: 0, Conso_EauDemin_m3: 0, Conso_EauRiviere_m3: 0, Conso_EauAdoucie_m3: 0,
    Conso_CaCO3_kg: reactifs.CaCO3 || 0,
    Conso_CaO_kg: reactifs.CaO || 0,
    Conso_CaOH2_dry_kg: reactifs.CaOH2dry || 0,
    Conso_CaOH2_wet_kg: reactifs.CaOH2wet || 0,
    Conso_NaOH_kg: reactifs.NaOH || 0,
    Conso_NaOHCO3_kg: reactifs.NaOHCO3 || 0,
    Conso_Ammonia_kg: 0, Conso_NaBrCaBr2_kg: 0, Conso_CAP_kg: 0,
    conso_gaz_H_MW: 0, conso_gaz_L_MW: 0, conso_gaz_Process_MW: 0, conso_fuel_MW: 0,
    conso_incineration_ash_kg_h: 0, conso_boiler_ash_kg_h: 0,
    conso_fly_ash_kg_h: cendres_kg_h,
    CO2_transport_incineratino_ash: 0, CO2_transport_boiler_ash: 0,
    CO2_transport_fly_ash: CO2_transport_total,
    CO2_transport_reactifs: 0,
    cout_transport_incineratino_ash: 0, cout_transport_boiler_ash: 0,
    cout_transport_fly_ash: cout_transport_total,
    cout_transport_reactifs: 0,
    ESP_design: {
      surface_plaques_m2: surfacePlaques,
      nombre_plaques: nombrePlaques,
      nombre_champs: nombreChamps,
      rendement_capture_pct: Rdt_capture,
      vitesse_migration: Vitesse_migration,
      type_camion,
      distance_km,
    },
  }), [
    P_out_mmCE, conso_elec_champs_kW, conso_vis_transport_kW, conso_elec_marteau_debatissage_kW,
    Conso_elec_air_co_kW, conso_air_co_Nm3_h, pression_air_comprime_bar, reactifs.CaCO3, reactifs.CaO,
    reactifs.CaOH2dry, reactifs.CaOH2wet, reactifs.NaOH, reactifs.NaOHCO3, cendres_kg_h,
    CO2_transport_total, cout_transport_total, surfacePlaques, nombrePlaques, nombreChamps,
    Rdt_capture, Vitesse_migration, type_camion, distance_km, t,
  ]);

  const lastSync = useRef('');
  useEffect(() => {
    if (!setInnerData || typeof setInnerData !== 'function') return;
    const json = JSON.stringify(opexPayload);
    if (json === lastSync.current) return;
    lastSync.current = json;
    setInnerData((prevData) => ({ ...prevData, ...opexPayload }));
  }, [opexPayload, setInnerData]);

  return (
    <EFDesignCtx.Provider value={t}>
    <div className="cadre_pour_onglet">
      {/* Pertes de charge aéraulique */}
      <Section 
        title="Pertes de charge aéraulique" 
        results={[{ text: t('Pression de sortie [mmCE]'), value: P_out_mmCE.toFixed(2) }]}
      >
        <ParameterInput 
          translationKey="Pression aéraulique [mmCE]" 
          value={PDC_calcul['Pression aéraulique [mmCE]']} 
          onChange={(v) => handleParametresChange('Pression aéraulique [mmCE]', v)} 
        />
        <ParameterInput 
          translationKey="PDC [mmCE]" 
          value={PDC_calcul['PDC [mmCE]']} 
          onChange={(v) => handleParametresChange('PDC [mmCE]', v)} 
        />
      </Section>

      {/* Dimensionnement électrofiltre */}
      <Section 
        title="Dimensionnement de l'électrofiltre"
        results={[
          { text: t('Surface des plaques [m²]'), value: fmt(surfacePlaques, 2) },
          { text: t('Nombre de plaques [Nb]'), value: nombrePlaques },
          { text: t('Pression de sortie [mmCE]'), value: fmt(pressionSortie, 2) },
        ]}
      >
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '100%', maxWidth: '300px' }}><BagFilterSynoptic /></div>
          </div>
          <div style={{ flex: 1, display: 'grid', gap: '15px' }}>
            <ParameterInput 
              translationKey="Rendement de capture [%]" 
              value={Rdt_capture} 
              onChange={(v) => handleParametresChange('Rendement de capture [%]', v)} 
            />
            <ParameterInput 
              translationKey="Vitesse de migration [m/s]" 
              value={Vitesse_migration} 
              onChange={(v) => handleParametresChange('Vitesse de migration [m/s]', v)} 
            />
            <ParameterInput 
              translationKey="PDC électrofiltre [mmCE]" 
              value={PDC} 
              onChange={(v) => handleParametresChange('PDC électrofiltre [mmCE]', v)} 
            />
          </div>
        </div>
      </Section>

      {/* Consommation électrique */}
      <Section 
        title="Estimation des consommations électriques"
        results={[
          { text: t('Consommation élec des champs [kW]'), value: fmt(conso_elec_champs_kW, 2) },
          { text: t('Consommation vis de transport [kW]'), value: fmt(conso_vis_transport_kW, 2) },
          { text: t('Consommation élec des marteaux débatisseurs [kW]'), value: fmt(conso_elec_marteau_debatissage_kW, 2) },
        ]}
      >
        <ParameterInput 
          translationKey="consommation vis de transport [kW]" 
          value={conso_vis_transport_kW} 
          onChange={(v) => handleParametresChange('consommation vis de transport [kW]', v)} 
        />
      </Section>

      {/* Consommation air comprimé */}
      <Section 
        title="Consommation d'air comprimé"
        results={[
          { text: t('Consommation air comprimé [Nm3/h]'), value: fmt(conso_air_co_Nm3_h, 2) },
          { text: t('Conso élec air comprimé [kW]'), value: fmt(Conso_elec_air_co_kW, 2) },
        ]}
      >
        <ParameterInput 
          translationKey="Nombre de cycles de nettoyage [Nb]" 
          value={nombre_cycle_nb} 
          onChange={(v) => handleParametresChange('Nombre de cycles de nettoyage [Nb]', v)} 
        />
        <ParameterInput 
          translationKey="Pression air comprimé [Bar]" 
          value={pression_air_comprime_bar} 
          onChange={(v) => handleParametresChange('Pression air comprimé [Bar]', v)}
          options={['7', '10', '13', '15']} 
        />
        <ParameterInput 
          translationKey="Air comprime par cycle [Nm3/cycle]" 
          value={air_comprime_par_cycle} 
          onChange={(v) => handleParametresChange('Air comprime par cycle [Nm3/cycle]', v)} 
        />
      </Section>

      {/* Évacuation résidus */}
      <Section 
        title="Évacuation des résidus électrofiltre"
        results={[
          { text: t('Residus électrofiltre [kg/h]'), value: fmt(cendres_kg_h, 2) },
          { text: t('Type de camion'), value: type_camion },
          { text: t('Distance [km]'), value: fmt(distance_km, 0) },
          { text: t('CO2 transport total [kg]'), value: fmt(CO2_transport_total, 2) },
          { text: t('Coût transport total [€]'), value: fmt(cout_transport_total, 2) },
        ]}
      >
        <ParameterInput 
          translationKey="Type de camion" 
          value={type_camion} 
          onChange={(v) => handleParametresChange('Type de camion', v)}
          options={['15t', '20t', '25t']} 
        />
        <ParameterInput 
          translationKey="Distance [km]" 
          value={distance_km} 
          onChange={(v) => handleParametresChange('Distance [km]', v)} 
        />
      </Section>

      {/* Résumé */}
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
        <h3>{t('Résumé des paramètres principaux')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <p><strong>{t('Surface des plaques [m²]')}:</strong> {fmt(surfacePlaques, 2)} m²</p>
          <p><strong>{t('Rendement de capture [%]')}:</strong> {Rdt_capture}%</p>
          <p><strong>{t('Vitesse de migration [m/s]')}:</strong> {Vitesse_migration} m/s</p>
          <p><strong>{t('Nombre de plaques [Nb]')}:</strong> {nombrePlaques}</p>
          <p><strong>{t('Pression air comprimé [Bar]')}:</strong> {pression_air_comprime_bar} Bar</p>
          <p><strong>{t('Consommation air comprimé [Nm3/h]')}:</strong> {fmt(conso_air_co_Nm3_h, 2)} Nm³/h</p>
          <p><strong>{t('Residus électrofiltre [kg/h]')}:</strong> {fmt(cendres_kg_h, 2)} kg/h</p>
          <p><strong>{t('Type de camion')}:</strong> {type_camion}</p>
        </div>
        <h4>{t('Paramètres calculés détaillés')}</h4>
        <TableGeneric elements={elementsGeneric} />
      </div>
    </div>
    </EFDesignCtx.Provider>
  );
};

export default ELECTROFILTER_Design;