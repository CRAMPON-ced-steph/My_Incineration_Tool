import React, { useState, useEffect } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SCRUBBER_traduction';

// ===== CONSTANTES =====
const constantes = {
  chaleurAbs: 850,
  cpHCl: 0.96,
  MHCl: 36.5,
  MH2O: 18.0,
  MN2: 28.02,
  MCO2: 44.01,
  MO2: 32,
  MSO2: 64.07
};

// ===== FONCTIONS UTILITAIRES =====
const Nm3_to_m3 = (Qv, t, p) => {
  return Qv * ((t + 273.159) / 273.159) * (760 / p);
};

const Sd_m2 = (D) => {
  return Math.PI * D * D * 0.25;
};

const H_fumee_chonscl = (temp, FG_chonscl_kg_h) => {
  const firstTerm = temp * (
    0.226 * (FG_chonscl_kg_h.CO2 || 0) +
    0.427 * (FG_chonscl_kg_h.H2O || 0) +
    0.225 * (FG_chonscl_kg_h.O2 || 0) +
    0.239 * (FG_chonscl_kg_h.N2 || 0) +
    0.164 * (FG_chonscl_kg_h.SO2 || 0) +
    0.19 * (FG_chonscl_kg_h.HCl || 0)
  );
  const secondTerm = Math.pow(temp, 2) * (
    46.5e-6 * (FG_chonscl_kg_h.CO2 || 0) +
    80.5e-6 * (FG_chonscl_kg_h.H2O || 0) +
    24.5e-6 * (FG_chonscl_kg_h.O2 || 0) +
    27e-6 * (FG_chonscl_kg_h.N2 || 0) +
    25.5e-6 * (FG_chonscl_kg_h.SO2 || 0) +
    11.5e-6 * (FG_chonscl_kg_h.HCl || 0)
  );
  const thirdTerm = (FG_chonscl_kg_h.H2O || 0) * 597;
  return firstTerm + secondTerm + thirdTerm;
};

const TensVapH2O = (ts) => {
  return Math.pow(10, (7.9688 - (1668.21 / (228 + ts))));
};

const calcPpHCl = (ts, ConcHClRec) => {
  const AT = Math.exp(-13.83 + 0.108032 * ts);
  const BT = Math.exp(1.03684 - 0.00467532 * ts);
  return AT * Math.pow(ConcHClRec, BT);
};

const calcPincond = (p, TensVapH2O, PHCl) => {
  return p - TensVapH2O - PHCl;
};

const parseValue = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// ===== COMPOSANT PRINCIPAL =====
const HClScrubberCalculator = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const getInitialValue = (paramName, defaultValue) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // Diamètres disponibles
  const diametreMap = {
    0.55: 5000,
    0.65: 7500,
    0.75: 9000,
    0.9: 10000,
    1.05: 15000,
    1.25: 20000,
    1.5: 25000
  };

  // ===== ÉTATS PRINCIPAUX =====
  const [fumeesEntree, setFumeesEntree] = useState({
    'Température (°C)': getInitialValue('T_OUT', 180),
    'CO₂ (kg/h)': getInitialValue('FG_out_CO2', 3804),
    'H₂O (kg/h)': getInitialValue('FG_out_H2O', 9576),
    'O₂ (kg/h)': getInitialValue('FG_out_O2', 1588),
    'N₂ (kg/h)': getInitialValue('FG_out_N2', 17435),
    'SO₂ (kg/h)': getInitialValue('FG_out_SO2', 29.7),
    'HCl (kg/h)': getInitialValue('FG_out_HCl', 130),
    'Pression (mmHg)': getInitialValue('pressionTotale', 908.4),
    'Pression amont (mmH2O)': getInitialValue('pressionAmont', 2018),
  });

  const [concentrations, setConcentrations] = useState({
    'Conc. HCl recirculation (%)': getInitialValue('ConcHClRec', 1.0),
    'Conc. HCl arrosage (%)': getInitialValue('ConcHClAr', 5.0)
  });

  const [parametres, setParametres] = useState({
    'Efficacité venturi': getInitialValue('Efficacite_venturi', 0.6),
    'Temp. eau appoint (°C)': getInitialValue('Temperature_eau', 25),
    'Diamètre Quench (m)': getInitialValue('Diametre_Quench', 1.25),
    'Diamètre cône (mm)': getInitialValue('Diametre_Cone', 900)
  });

  const [resultats, setResultats] = useState(null);
  const [erreur, setErreur] = useState('');
  const [avertissement, setAvertissement] = useState('');

  // ===== FONCTION DE CALCUL =====
  const calculerQuench = () => {
    try {
      setErreur('');
      setAvertissement('');

      const temperature = parseValue(fumeesEntree['Température (°C)']);
      const Qm_CO2 = parseValue(fumeesEntree['CO₂ (kg/h)']);
      const Qm_H2O = parseValue(fumeesEntree['H₂O (kg/h)']);
      const Qm_O2 = parseValue(fumeesEntree['O₂ (kg/h)']);
      const Qm_N2 = parseValue(fumeesEntree['N₂ (kg/h)']);
      const Qm_SO2 = parseValue(fumeesEntree['SO₂ (kg/h)']);
      const Qm_HCl = parseValue(fumeesEntree['HCl (kg/h)']);
      const pressionTotale = parseValue(fumeesEntree['Pression (mmHg)']);

      const ConcHClRec = parseValue(concentrations['Conc. HCl recirculation (%)']);
      const ConcHClAr = parseValue(concentrations['Conc. HCl arrosage (%)']);

      const Efficacite_venturi = parseValue(parametres['Efficacité venturi']);
      const Temperature_eau_appoint_C = parseValue(parametres['Temp. eau appoint (°C)']);
      const Diametre_Cone_mm = parseValue(parametres['Diamètre cône (mm)']);

      // Validation
      const Qm_total_in_kg_h = Qm_CO2 + Qm_H2O + Qm_O2 + Qm_N2 + Qm_SO2 + Qm_HCl;

      if (Qm_total_in_kg_h === 0 || isNaN(Qm_total_in_kg_h)) {
        setErreur(t('ERR_invalid_mass_flow'));
        setResultats(null);
        return;
      }

      if (temperature <= 0 || pressionTotale <= 0) {
        setErreur(t('ERR_positive_temp_pressure'));
        setResultats(null);
        return;
      }

      if (Efficacite_venturi <= 0 || Efficacite_venturi > 1) {
        setErreur(t('ERR_efficiency_range'));
        setResultats(null);
        return;
      }

      // CALCULS
      const Volume_CO2 = (Qm_CO2 / constantes.MCO2) * 22.4;
      const Volume_H2O = (Qm_H2O / constantes.MH2O) * 22.4;
      const Volume_O2 = (Qm_O2 / constantes.MO2) * 22.4;
      const Volume_N2 = (Qm_N2 / constantes.MN2) * 22.4;
      const Volume_SO2 = (Qm_SO2 / constantes.MSO2) * 22.4;
      const Volume_HCl = (Qm_HCl / constantes.MHCl) * 22.4;

      const Volume_fumee_total = Volume_CO2 + Volume_H2O + Volume_O2 + Volume_N2 + Volume_SO2 + Volume_HCl;
      const Volume_fumee_sec = Volume_fumee_total - Volume_H2O;

      const Section_quench = Sd_m2(parametres['Diamètre Quench (m)']);
      const Section_cone = Sd_m2(Diametre_Cone_mm / 1000);

      // Température de saturation (approximation)
      const ts = 60 + (temperature - 180) * 0.05;
      const temperatureFumeesSortie = ts + 5;

      // Efficacité HCl
      const HCl_capture = Qm_HCl * Efficacite_venturi;
      const HCl_sortie = Qm_HCl - HCl_capture;
      const efficaciteHCl = (HCl_capture / Qm_HCl) * 100;

      // Évaporation
      const enthalpieEvap = 597;
      const chaleurDisponible = Qm_total_in_kg_h * 0.25 * (temperature - temperatureFumeesSortie);
      const debMasEvap = chaleurDisponible / enthalpieEvap;

      // Débits d'eau
      const debMasEauAppoint = debMasEvap * 1.1;
      const Qm_total_in_kg_hPurge = debMasEauAppoint * 0.05;
      const debMasLiqAr = debMasEauAppoint * 100;

      // Débits de sortie
      const Qm_H2O_sortie = Qm_H2O + debMasEvap;
      const Qm_total_sortie = Qm_total_in_kg_h + debMasEvap;

      // Volumes de sortie
      const Volume_H2O_sortie = (Qm_H2O_sortie / constantes.MH2O) * 22.4;
      const Volume_fumee_total_sortie = Volume_CO2 + Volume_H2O_sortie + Volume_O2 + Volume_N2 + Volume_SO2 + (HCl_sortie / constantes.MHCl) * 22.4;

      // Conversion en conditions réelles
      const debVolTotalSortie = Nm3_to_m3(Volume_fumee_total_sortie, temperatureFumeesSortie, pressionTotale);
      const debVolTotalSortieSec = Nm3_to_m3(Volume_fumee_sec, temperatureFumeesSortie, pressionTotale);

      // Vitesses
      const Vitesse_m_s = (debVolTotalSortie / 3600) / Section_quench;
      const Vpassage_m_s = (debVolTotalSortie / 3600) / Section_cone;

      // Masse volumique
      const roEpuree = (Qm_total_sortie) / debVolTotalSortie;

      // Hauteur de saturation
      const zsat = (temperature - ts) / 50;

      // Concentrations de sortie
      const concHClSortieSec = (HCl_sortie * 1000000) / debVolTotalSortieSec;
      const concSO2SortieSec = (Qm_SO2 * 1000000) / debVolTotalSortieSec;

      // Pourcentage O2
      const pourcentO2Sortie = (Volume_O2 / Volume_fumee_total_sortie) * 100;

      // pH
      const pH = -Math.log10(ConcHClAr / 36.5);
      const pHRec = -Math.log10(ConcHClRec / 36.5);

      // Pressions partielles
      const tensVapH2O = TensVapH2O(ts);
      const pHCl = calcPpHCl(ts, ConcHClRec);
      const pincond = calcPincond(pressionTotale, tensVapH2O, pHCl);

      // Enthalpies
      const entEntree = H_fumee_chonscl(temperature, {
        CO2: Qm_CO2,
        H2O: Qm_H2O,
        O2: Qm_O2,
        N2: Qm_N2,
        SO2: Qm_SO2,
        HCl: Qm_HCl
      });

      const entSortie = H_fumee_chonscl(temperatureFumeesSortie, {
        CO2: Qm_CO2,
        H2O: Qm_H2O_sortie,
        O2: Qm_O2,
        N2: Qm_N2,
        SO2: Qm_SO2,
        HCl: HCl_sortie
      });

      const difference = Math.abs(temperatureFumeesSortie - ts);

      const simulatedResults = {
        temperatureFumeesSortie,
        ts,
        efficaciteHCl,
        Qm_HCl_in_kg_hSortie: HCl_sortie,
        concHClSortieSec,
        concSO2SortieSec,
        Vitesse_m_s,
        Vpassage_m_s,
        zsat,
        roEpuree,
        debMasEvap,
        debMasEauAppoint,
        Qm_total_in_kg_hPurge,
        debMasLiqAr,
        pH,
        pHRec,
        concHClAr: ConcHClAr,
        concHClRec: ConcHClRec,
        Qm_CO2_in_kg_hSortie: Qm_CO2,
        Qm_H2O_in_kg_hSortie: Qm_H2O_sortie,
        Qm_O2_in_kg_hSortie: Qm_O2,
        Qm_N2_in_kg_hSortie: Qm_N2,
        Qm_SO2_in_kg_hSortie: Qm_SO2,
        Qm_total_in_kg_hSortie: Qm_total_sortie,
        entEntree,
        entSortie,
        tensVapH2O,
        pHCl,
        pincond,
        debVolTotalSortie,
        pourcentO2Sortie,
        debVolTotalSortieSec,
        difference
      };

      setResultats(simulatedResults);

      // Avertissements avec traductions
      let avert = '';
      if (simulatedResults.Vitesse_m_s < 10 || simulatedResults.Vitesse_m_s > 15) {
        avert += `⚠️ ${t('WARN_column_speed')} ${simulatedResults.Vitesse_m_s.toFixed(2)} m/s ${t('WARN_out_of_range')} (10-15 m/s). `;
      }
      if (simulatedResults.Vpassage_m_s < 30 || simulatedResults.Vpassage_m_s > 40) {
        avert += `⚠️ ${t('WARN_cone_speed')} ${simulatedResults.Vpassage_m_s.toFixed(2)} m/s ${t('WARN_out_of_range')} (30-40 m/s). `;
      }
      const qmLiqArMax = diametreMap[parametres['Diamètre Quench (m)']] || 0;
      if (debMasLiqAr > qmLiqArMax) {
        avert += `⚠️ ${t('WARN_liquid_flow')} ${debMasLiqAr.toFixed(0)} kg/h ${t('WARN_exceeds_max')} ${qmLiqArMax} kg/h. `;
      }
      if (avert) setAvertissement(avert);

    } catch (error) {
      console.error('Erreur calcul:', error);
      setErreur(`${t('ERR_calculation_error')}: ${error.message}`);
      setResultats(null);
    }
  };

  // Déclencher le calcul à chaque changement
  useEffect(() => {
    calculerQuench();
  }, [fumeesEntree, parametres, concentrations]);

  // Synchronisation des données
  useEffect(() => {
    if (setInnerData && resultats) {
      setInnerData(prevData => ({
        ...prevData,
        T_FG_out_acid: resultats.temperatureFumeesSortie,
        FG_HCl_efficiency: resultats.efficaciteHCl,
      }));
    }
  }, [resultats, setInnerData]);

  const formatNumber = (value, decimals = 2) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return '---';
    return value.toFixed(decimals);
  };

  // ===== COMPOSANTS UI =====
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

  const ParameterInput = ({ translationKey, value, onChange, type = 'number', options = null, disabled = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <label style={{ flex: 1, minWidth: '200px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
        {t(translationKey)}:
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      )}
    </div>
  );

  // Résultats calculés
  const elementsEpuratoires = resultats ? [
    { text: t('Temp. sortie fumées'), value: formatNumber(resultats.temperatureFumeesSortie) + ' °C' },
    { text: t('Temp. saturation'), value: formatNumber(resultats.ts) + ' °C' },
    { text: t('Efficacité HCl'), value: formatNumber(resultats.efficaciteHCl) + ' %' },
    { text: t('HCl sortie'), value: formatNumber(resultats.Qm_HCl_in_kg_hSortie) + ' kg/h' },
    { text: t('HCl sec 11% O₂'), value: formatNumber(resultats.concHClSortieSec) + ' mg/Nm³' },
    { text: t('SO₂ sec 11% O₂'), value: formatNumber(resultats.concSO2SortieSec) + ' mg/Nm³' },
  ] : [];

  const elementsHydrauliques = resultats ? [
    { text: t('Vitesse colonne'), value: formatNumber(resultats.Vitesse_m_s) + ' m/s' },
    { text: t('Vitesse cône'), value: formatNumber(resultats.Vpassage_m_s) + ' m/s' },
    { text: t('Hauteur saturation'), value: formatNumber(resultats.zsat) + ' m' },
    { text: t('Masse vol. épurée'), value: formatNumber(resultats.roEpuree) + ' kg/m³' },
  ] : [];

  const elementsBilans = resultats ? [
    { text: t('Évaporation'), value: formatNumber(resultats.debMasEvap) + ' kg/h' },
    { text: t('Eau d\'appoint'), value: formatNumber(resultats.debMasEauAppoint) + ' kg/h' },
    { text: t('Purge'), value: formatNumber(resultats.Qm_total_in_kg_hPurge) + ' kg/h' },
    { text: t('Liquide arrosage'), value: formatNumber(resultats.debMasLiqAr) + ' kg/h' },
    { text: t('pH arrosage'), value: formatNumber(resultats.pH, 1) },
    { text: t('pH recirculation'), value: formatNumber(resultats.pHRec, 1) },
    { text: t('Conc. HCl arrosage'), value: formatNumber(resultats.concHClAr, 3) + ' %' },
    { text: t('Conc. HCl recirc.'), value: formatNumber(resultats.concHClRec, 3) + ' %' },
  ] : [];

  return (
    <div className="cadre_pour_onglet">
      {erreur && (
        <div style={{ padding: '12px', margin: '12px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
          ❌ {erreur}
        </div>
      )}

      {avertissement && (
        <div style={{ padding: '12px', margin: '12px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
          {avertissement}
        </div>
      )}

      {/* Fumées d'Entrée */}
      <Section title={t('Fumées d\'Entrée')}>
        {Object.entries(fumeesEntree).map(([key, value]) => (
          <ParameterInput
            key={key}
            translationKey={key}
            value={value}
            onChange={(v) => setFumeesEntree(prev => ({ ...prev, [key]: parseValue(v) }))}
            step="0.01"
          />
        ))}
      </Section>

      {/* Paramètres de Conception */}
      <Section title={t('Paramètres de Conception')}>
        {Object.entries(parametres).map(([key, value]) => {
          if (key === 'Diamètre Quench (m)') {
            return (
              <ParameterInput
                key={key}
                translationKey={key}
                value={value}
                onChange={(v) => setParametres(prev => ({ ...prev, [key]: v }))}
                options={Object.keys(diametreMap).map(d => parseFloat(d))}
              />
            );
          }
          return (
            <ParameterInput
              key={key}
              translationKey={key}
              value={value}
              onChange={(v) => setParametres(prev => ({ ...prev, [key]: parseValue(v) }))}
              step="0.01"
            />
          );
        })}
      </Section>

      {/* Concentrations HCl */}
      <Section title={t('Concentrations HCl')}>
        {Object.entries(concentrations).map(([key, value]) => (
          <ParameterInput
            key={key}
            translationKey={key}
            value={value}
            onChange={(v) => setConcentrations(prev => ({ ...prev, [key]: parseValue(v) }))}
            step="0.1"
          />
        ))}
      </Section>

      {/* Résultats */}
      {resultats && !erreur && (
        <>
          <Section title={t('Performances Épuratoires')} results={elementsEpuratoires} />
          <Section title={t('Performances Hydrauliques')} results={elementsHydrauliques} />
          <Section title={t('Bilans Eau et pH')} results={elementsBilans} />

          {/* Résumé */}
          <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
            <h3>{t('Résumé des Paramètres')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <p><strong>{t('Température (°C)')}:</strong> {formatNumber(fumeesEntree['Température (°C)'])}°C</p>
              <p><strong>{t('Efficacité HCl')}:</strong> {formatNumber(resultats.efficaciteHCl)}%</p>
              <p><strong>{t('Temp. sortie fumées')}:</strong> {formatNumber(resultats.temperatureFumeesSortie)}°C</p>
              <p><strong>{t('Temp. saturation')}:</strong> {formatNumber(resultats.ts)}°C</p>
              <p><strong>{t('Vitesse colonne')}:</strong> {formatNumber(resultats.Vitesse_m_s)} m/s</p>
              <p><strong>{t('Vitesse cône')}:</strong> {formatNumber(resultats.Vpassage_m_s)} m/s</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HClScrubberCalculator;