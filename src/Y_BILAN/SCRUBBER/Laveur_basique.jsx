import React, { useState, useEffect, useCallback } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SCRUBBER_traduction';

// ===== CONSTANTES =====
const reactifConfig = {
  naoh: { masse: 40.0, stoechiometrie: 2, nom: 'NaOH' },
  na2co3: { masse: 105.99, stoechiometrie: 1, nom: 'Na2CO3' },
  nahco3: { masse: 84.01, stoechiometrie: 2, nom: 'NaHCO3' }
};

const MSO2 = 64.07;

// ===== COMPOSANT PRINCIPAL =====
const SO2ScrubberCalculator = ({ innerData = {}, setInnerData, currentLanguage = 'fr' }) => {
  const getInitialValue = (paramName, defaultValue) => {
    return innerData?.[paramName] !== undefined ? innerData[paramName] : defaultValue;
  };

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // ===== ÉTATS PRINCIPAUX =====
  const [fumeParams, setFumeParams] = useState({
    'Débit volumique fumées (Nm³/h)': getInitialValue('FG_humide_EAU_tot_Nm3_h', 1),
    'Concentration SO2 entrée (mg/Nm³)': getInitialValue('concSO2Entree', 1),
    'Concentration SO2 sortie souhaitée (mg/Nm³)': getInitialValue('concSO2Sortie', 0.1),
    'Température fumées (°C)': getInitialValue('T_FG_out_acid', 1),
    'Teneur O2 fumées (%)': getInitialValue('O2pourcent', 1),
    'Pression fumées (mbar)': getInitialValue('pressionFumees', 1013),
  });

  const [washParams, setWashParams] = useState({
    'Type de réactif': 'naoh',
    'Concentration solution (% massique)': getInitialValue('concSolution', 10),
    'pH solution souhaité': getInitialValue('phSolution', 9),
    'Température solution (°C)': getInitialValue('tempSolution', 25),
    'Rapport L/G (L/m³)': getInitialValue('rapportLG', 1.5)
  });

  const [designParams, setDesignParams] = useState({
    'Vitesse gaz colonne (m/s)': getInitialValue('vitesseGaz', 2.5),
    'Hauteur garnissage (m)': getInitialValue('hauteurGarnissage', 4),
    'Type de garnissage': 'anneaux_pall'
  });

  const [resultats, setResultats] = useState(null);
  const [erreur, setErreur] = useState('');

  // ===== UTILITAIRES =====
  const parseValue = (value) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatNumber = (value, decimals = 2) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return '---';
    return value.toFixed(decimals);
  };

  const validateInputs = (debit, concEntree, concSortie, vitesse) => {
    if (debit <= 0) return t('ERR_SO2_volume_flow_positive');
    if (concEntree <= 0) return t('ERR_SO2_inlet_concentration_positive');
    if (concEntree < concSortie) return t('ERR_SO2_inlet_outlet_concentration');
    if (vitesse <= 0) return t('ERR_SO2_gas_velocity_positive');
    return null;
  };

  // ===== FONCTION DE CALCUL - OPTIMISÉE =====
  const calculer = useCallback(() => {
    try {
      setErreur('');

      const debitFumees = parseValue(fumeParams['Débit volumique fumées (Nm³/h)']);
      const concSO2Entree = parseValue(fumeParams['Concentration SO2 entrée (mg/Nm³)']);
      const concSO2Sortie = parseValue(fumeParams['Concentration SO2 sortie souhaitée (mg/Nm³)']);
      const vitesseGaz = parseValue(designParams['Vitesse gaz colonne (m/s)']);
      const hauteurGarnissage = parseValue(designParams['Hauteur garnissage (m)']);
      const rapportLG = parseValue(washParams['Rapport L/G (L/m³)']);
      const concSolution = parseValue(washParams['Concentration solution (% massique)']);

      // Validation robuste
      const validationError = validateInputs(debitFumees, concSO2Entree, concSO2Sortie, vitesseGaz);
      if (validationError) {
        setErreur(validationError);
        setResultats(null);
        return;
      }

      if (hauteurGarnissage <= 0 || rapportLG <= 0 || concSolution <= 0) {
        setErreur(t('ERR_SO2_all_parameters_positive'));
        setResultats(null);
        return;
      }

      const reactif = reactifConfig[washParams['Type de réactif']];
      if (!reactif) {
        setErreur(t('ERR_SO2_invalid_reactant_type'));
        setResultats(null);
        return;
      }

      // ===== CALCULS PRINCIPAUX =====
      // Bilans matière SO2
      const chargeSO2Entree = (debitFumees * concSO2Entree) / 1000;
      const chargeSO2Sortie = (debitFumees * concSO2Sortie) / 1000;
      const chargeSO2Eliminee = chargeSO2Entree - chargeSO2Sortie;
      const efficacite = chargeSO2Entree !== 0 ? (chargeSO2Eliminee / chargeSO2Entree) * 100 : 0;

      // Consommation de réactif
      const consommationReactifTheorique = (chargeSO2Eliminee / MSO2) * reactif.stoechiometrie * reactif.masse;
      const consommationReactif = consommationReactifTheorique * 1.2; // 20% d'excès

      // Débits de solution
      const debitSolution = debitFumees * rapportLG;
      const debitSolutionM3h = debitSolution / 1000;

      // Dimensionnement colonne
      const debitFumeesM3s = debitFumees / 3600;
      const surfaceColonne = vitesseGaz !== 0 ? debitFumeesM3s / vitesseGaz : 0;
      const diametreColonne = surfaceColonne !== 0 ? Math.sqrt((4 * surfaceColonne) / Math.PI) : 0;
      const volumeGarnissage = surfaceColonne * hauteurGarnissage;

      // Paramètres de transfert
      const kLaSO2 = 0.01;
      const NTU = vitesseGaz !== 0 ? (hauteurGarnissage * kLaSO2 * 3600) / vitesseGaz : 0;
      const surfaceEchange = volumeGarnissage !== 0 ? volumeGarnissage * 150 : 0;
      const debitPurge = debitSolutionM3h * 0.05;
      const consommationSolution = concSolution !== 0 ? (consommationReactif / concSolution) * 100 : 0;

      const simulatedResults = {
        chargeSO2Entree,
        chargeSO2Sortie,
        chargeSO2Eliminee,
        efficacite,
        consommationReactif,
        diametreColonne,
        surfaceColonne,
        volumeGarnissage,
        debitSolution,
        debitSolutionM3h,
        debitPurge,
        kLaSO2,
        NTU,
        surfaceEchange,
        consommationSolution
      };

      setResultats(simulatedResults);

    } catch (error) {
      console.error('Erreur calcul:', error);
      setErreur(`${t('ERR_SO2_calculation_error')}: ${error.message}`);
      setResultats(null);
    }
  }, [fumeParams, washParams, designParams, t]);

  // Recalcul automatique avec dépendances correctes
  useEffect(() => {
    calculer();
  }, [calculer]);

  // Synchronisation des données avec innerData
  useEffect(() => {
    if (setInnerData && resultats) {
      setInnerData(prevData => ({
        ...prevData,
        SO2_efficiency: resultats.efficacite,
        SO2_consumption: resultats.consommationReactif,
        SO2_removed_load: resultats.chargeSO2Eliminee,
        column_diameter: resultats.diametreColonne,
        packing_volume: resultats.volumeGarnissage,
        wash_solution_flow: resultats.debitSolutionM3h,
      }));
    }
  }, [resultats, setInnerData]);

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

  const ParameterInput = ({ translationKey, value, onChange, type = 'number', options = null, step = '0.01' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <label style={{ flex: 1, minWidth: '200px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
        {t(translationKey)}:
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: '0 0 200px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={step}
          min="0"
          style={{ flex: '0 0 150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      )}
    </div>
  );

  // ===== CONSTRUCTION DES RÉSULTATS =====
  const bilansMatiere = resultats ? [
    { text: t('Charge SO2 éliminée'), value: formatNumber(resultats.chargeSO2Eliminee) + ' kg/h' },
    { text: t('Efficacité d\'épuration'), value: formatNumber(resultats.efficacite) + ' %' },
    { text: `${t('Consommation réactif')} ${reactifConfig[washParams['Type de réactif']].nom}`, value: formatNumber(resultats.consommationReactif) + ' kg/h' },
  ] : [];

  const dimensionnementColonne = resultats ? [
    { text: t('Diamètre colonne'), value: formatNumber(resultats.diametreColonne) + ' m' },
    { text: t('Surface section colonne'), value: formatNumber(resultats.surfaceColonne) + ' m²' },
    { text: t('Volume garnissage'), value: formatNumber(resultats.volumeGarnissage) + ' m³' },
  ] : [];

  const debitsolution = resultats ? [
    { text: t('Débit solution lavage'), value: formatNumber(resultats.debitSolutionM3h) + ' m³/h' },
    { text: `${t('Solution')} ${washParams['Concentration solution (% massique)']}%`, value: formatNumber(resultats.consommationSolution) + ' kg/h' },
    { text: t('Débit de purge estimé'), value: formatNumber(resultats.debitPurge) + ' m³/h' },
  ] : [];

  const parametresTransfert = resultats ? [
    { text: t('Coefficient KLa SO2'), value: formatNumber(resultats.kLaSO2, 4) + ' s⁻¹' },
    { text: t('Nombre d\'unités de transfert'), value: formatNumber(resultats.NTU, 2) + ' NTU' },
    { text: t('Surface d\'échange'), value: formatNumber(resultats.surfaceEchange) + ' m²' },
  ] : [];

  return (
    <div className="cadre_pour_onglet">
      {erreur && (
        <div style={{ padding: '12px', margin: '12px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
          ❌ {erreur}
        </div>
      )}

      {/* Section Fumées */}
      <Section title={t('Données des Fumées')}>
        {Object.entries(fumeParams).map(([key, value]) => (
          <ParameterInput
            key={key}
            translationKey={key}
            value={value}
            onChange={(v) => setFumeParams(prev => ({ ...prev, [key]: parseValue(v) }))}
            step="1"
          />
        ))}
      </Section>

      {/* Section Solution de Lavage */}
      <Section title={t('Solution de Lavage')}>
        <ParameterInput
          translationKey="Type de réactif"
          value={washParams['Type de réactif']}
          onChange={(v) => setWashParams(prev => ({ ...prev, 'Type de réactif': v }))}
          options={[
            { value: 'naoh', label: 'NaOH (Soude caustique)' },
            { value: 'na2co3', label: 'Na2CO3 (Carbonate de sodium)' },
            { value: 'nahco3', label: 'NaHCO3 (Bicarbonate de sodium)' }
          ]}
        />
        {Object.entries(washParams).map(([key, value]) => {
          if (key === 'Type de réactif') return null;
          return (
            <ParameterInput
              key={key}
              translationKey={key}
              value={value}
              onChange={(v) => setWashParams(prev => ({ ...prev, [key]: parseValue(v) }))}
              step="0.1"
            />
          );
        })}
      </Section>

      {/* Section Paramètres de Conception */}
      <Section title={t('Paramètres de Conception')}>
        {Object.entries(designParams).map(([key, value]) => {
          if (key === 'Type de garnissage') {
            return (
              <ParameterInput
                key={key}
                translationKey={key}
                value={value}
                onChange={(v) => setDesignParams(prev => ({ ...prev, [key]: v }))}
                options={[
                  { value: 'anneaux_pall', label: 'Anneaux de Pall' },
                  { value: 'anneaux_raschig', label: 'Anneaux de Raschig' },
                  { value: 'selles_berl', label: 'Selles de Berl' },
                  { value: 'garnissage_structure', label: 'Garnissage structuré' }
                ]}
              />
            );
          }
          return (
            <ParameterInput
              key={key}
              translationKey={key}
              value={value}
              onChange={(v) => setDesignParams(prev => ({ ...prev, [key]: parseValue(v) }))}
              step="0.1"
            />
          );
        })}
      </Section>

      {/* Résultats */}
      {resultats && !erreur && (
        <>
          <Section title={t('Bilans Matière')} results={bilansMatiere} />
          <Section title={t('Dimensionnement Colonne')} results={dimensionnementColonne} />
          <Section title={t('Débits de Solution')} results={debitsolution} />
          <Section title={t('Paramètres de Transfert')} results={parametresTransfert} />

          {/* Résumé */}
          <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
            <h3>{t('Résumé des Paramètres')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <p><strong>{t('Charge SO2 éliminée')}:</strong> {formatNumber(resultats.chargeSO2Eliminee)} kg/h</p>
              <p><strong>{t('Efficacité d\'épuration')}:</strong> {formatNumber(resultats.efficacite)}%</p>
              <p><strong>{t('Diamètre colonne')}:</strong> {formatNumber(resultats.diametreColonne)} m</p>
              <p><strong>{t('Volume garnissage')}:</strong> {formatNumber(resultats.volumeGarnissage)} m³</p>
              <p><strong>{t('Débit solution lavage')}:</strong> {formatNumber(resultats.debitSolutionM3h)} m³/h</p>
              <p><strong>{`${t('Consommation réactif')} ${reactifConfig[washParams['Type de réactif']].nom}`}:</strong> {formatNumber(resultats.consommationReactif)} kg/h</p>
            </div>
          </div>

          {/* Notes importantes */}
          <div style={{ padding: '20px', marginTop: '20px', backgroundColor: '#fefce8', border: '2px solid #eab308', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400e', marginTop: 0 }}>⚠️ {t('NOTE_important_notes')}</h3>
            <ul style={{ color: '#92400e', margin: 0, paddingLeft: '20px' }}>
              <li>{t('NOTE_SO2_1')}</li>
              <li>{t('NOTE_SO2_2')}</li>
              <li>{t('NOTE_SO2_3')}</li>
              <li>{t('NOTE_SO2_4')}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SO2ScrubberCalculator;