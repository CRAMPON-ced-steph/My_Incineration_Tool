import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MassCalculator from '../../../C_Components/Tableau_fumee_inverse';
import TableGeneric from '../../../C_Components/Tableau_generique';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../../A_Transverse_fonction/conv_calculation';
import { h_fumee } from '../../../A_Transverse_fonction/enthalpy_mix_gas';
import { getLanguageCode } from '../../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './SEP21_traduction';

const SEP21FlueGasMixer = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {

  // État pour la composition manuelle à ajouter
  const [manualComposition_SEP21, setManualComposition_SEP21] = useState(() => {
    const saved = localStorage.getItem('manualComposition_SEP21');
    return saved ? JSON.parse(saved) : {
      'CO2 [kg/h]': 100,
      'H2O [kg/h]': 50,
      'O2 [kg/h]': 200,
      'N2 [kg/h]': 1000,
      'Temperature [°C]': 20,
    };
  });

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  useEffect(() => {
    localStorage.setItem('manualComposition_SEP21', JSON.stringify(manualComposition_SEP21));
  }, [manualComposition_SEP21]);

  // Données d'entrée du nœud précédent - NE PAS DÉPENDRE DE innerData POUR LES CALCULS LOCAUX
  const T_IN_1 = innerData?.T_OUT || 200;
  const FG_IN_1 = innerData?.FG_OUT_kg_h || { CO2: 1, H2O: 1, O2: 1, N2: 1 };

  // Composition manuelle à ajouter - EXTRAIRE LES VALEURS SEULEMENT
  const T_IN_2 = manualComposition_SEP21['Temperature [°C]'];
  const CO2_manual = manualComposition_SEP21['CO2 [kg/h]'];
  const H2O_manual = manualComposition_SEP21['H2O [kg/h]'];
  const O2_manual = manualComposition_SEP21['O2 [kg/h]'];
  const N2_manual = manualComposition_SEP21['N2 [kg/h]'];

  // ✅ CALCULS LOCAUX - PAS DE MISE À JOUR DE innerData ICI
  const calculatedData = useMemo(() => {
    // Mélange des deux flux
    const FG_OUT_CO2_kg_h = FG_IN_1.CO2 + CO2_manual;
    const FG_OUT_H2O_kg_h = FG_IN_1.H2O + H2O_manual;
    const FG_OUT_O2_kg_h = FG_IN_1.O2 + O2_manual;
    const FG_OUT_N2_kg_h = FG_IN_1.N2 + N2_manual;

    // Débit massique total
    const FG_total_kg_h = FG_OUT_CO2_kg_h + FG_OUT_H2O_kg_h + FG_OUT_O2_kg_h + FG_OUT_N2_kg_h;

    // Fractions massiques
    const x_CO2 = FG_total_kg_h > 0 ? FG_OUT_CO2_kg_h / FG_total_kg_h : 0;
    const x_H2O = FG_total_kg_h > 0 ? FG_OUT_H2O_kg_h / FG_total_kg_h : 0;
    const x_O2 = FG_total_kg_h > 0 ? FG_OUT_O2_kg_h / FG_total_kg_h : 0;
    const x_N2 = FG_total_kg_h > 0 ? FG_OUT_N2_kg_h / FG_total_kg_h : 0;

    // Température moyenne pondérée
    const FG_1_total = FG_IN_1.CO2 + FG_IN_1.H2O + FG_IN_1.O2 + FG_IN_1.N2;
    const FG_2_total = CO2_manual + H2O_manual + O2_manual + N2_manual;
    const T_OUT_mixed = FG_total_kg_h > 0 ? (T_IN_1 * FG_1_total + T_IN_2 * FG_2_total) / FG_total_kg_h : T_IN_1;

    // Conversion en débits volumétriques
    const FG_CO2_m3_h = CO2_kg_m3(FG_OUT_CO2_kg_h);
    const FG_H2O_m3_h = H2O_kg_m3(FG_OUT_H2O_kg_h);
    const FG_O2_m3_h = O2_kg_m3(FG_OUT_O2_kg_h);
    const FG_N2_m3_h = N2_kg_m3(FG_OUT_N2_kg_h);

    const FG_humide_tot_m3_h = FG_CO2_m3_h + FG_H2O_m3_h + FG_O2_m3_h + FG_N2_m3_h;
    const FG_sec_tot_m3_h = FG_CO2_m3_h + FG_O2_m3_h + FG_N2_m3_h;

    return {
      FG_OUT_CO2_kg_h,
      FG_OUT_H2O_kg_h,
      FG_OUT_O2_kg_h,
      FG_OUT_N2_kg_h,
      FG_total_kg_h,
      x_CO2,
      x_H2O,
      x_O2,
      x_N2,
      T_OUT_mixed,
      FG_humide_tot_m3_h,
      FG_sec_tot_m3_h,
    };
  }, [FG_IN_1.CO2, FG_IN_1.H2O, FG_IN_1.O2, FG_IN_1.N2, CO2_manual, H2O_manual, O2_manual, N2_manual, T_IN_1, T_IN_2]);

  // ✅ MISE À JOUR DE innerData - SEULEMENT QUAND APPEL "SEND DATA" (dans la MainPage)
  // NE PAS LE FAIRE ICI POUR ÉVITER LA BOUCLE INFINIE
  
  // Composition en entrée du flux 1
  const masses_FG_in_1 = {
    CO2: FG_IN_1.CO2,
    O2: FG_IN_1.O2,
    H2O: FG_IN_1.H2O,
    N2: FG_IN_1.N2,
  };

  // Composition en entrée du flux 2 (manuel)
  const masses_FG_in_2 = {
    CO2: CO2_manual,
    O2: O2_manual,
    H2O: H2O_manual,
    N2: N2_manual,
  };

  // Composition du mélange de sortie
  const masses_FG_out = {
    CO2: calculatedData.FG_OUT_CO2_kg_h,
    O2: calculatedData.FG_OUT_O2_kg_h,
    H2O: calculatedData.FG_OUT_H2O_kg_h,
    N2: calculatedData.FG_OUT_N2_kg_h,
  };


  const FG_CO2_Nm3_h = CO2_kg_m3(masses_FG_out.CO2)
  const FG_H2O_Nm3_h = H2O_kg_m3(masses_FG_out.H2O)
  const FG_O2_Nm3_h = O2_kg_m3(masses_FG_out.O2)
  const FG_N2_Nm3_h = N2_kg_m3(masses_FG_out.N2)
const FG_dry_Nm3_h = FG_CO2_Nm3_h+FG_O2_Nm3_h+FG_N2_Nm3_h;
const FG_wet_Nm3_h = FG_dry_Nm3_h+FG_H2O_Nm3_h;

  const volume_FG_out = {
    CO2: FG_CO2_Nm3_h,
    O2: FG_O2_Nm3_h,
    H2O: FG_H2O_Nm3_h,
    N2: FG_N2_Nm3_h,
    dry: FG_dry_Nm3_h,
    wet: FG_wet_Nm3_h
  };

  const elementsGeneric = [
    { text: t('Inlet stream 1 temperature [°C]'), value: T_IN_1.toFixed(1) },
    { text: t('Inlet stream 2 temperature [°C]'), value: T_IN_2.toFixed(1) },
    { text: t('Mixed outlet temperature [°C]'), value: calculatedData.T_OUT_mixed.toFixed(1) },
    { text: t('Total mass flow [kg/h]'), value: calculatedData.FG_total_kg_h.toFixed(0) },
    { text: t('Outlet volumetric flow (wet) [Nm3/h]'), value: calculatedData.FG_humide_tot_m3_h.toFixed(2) },
    { text: t('Outlet volumetric flow (dry) [Nm3/h]'), value: calculatedData.FG_sec_tot_m3_h.toFixed(2) },
    { text: t('CO2 mass fraction [%]'), value: (calculatedData.x_CO2 * 100).toFixed(2) },
    { text: t('H2O mass fraction [%]'), value: (calculatedData.x_H2O * 100).toFixed(2) },
    { text: t('O2 mass fraction [%]'), value: (calculatedData.x_O2 * 100).toFixed(2) },
    { text: t('N2 mass fraction [%]'), value: (calculatedData.x_N2 * 100).toFixed(2) },
  ];


  // Mise à jour des données innerData
  innerData['FG_OUT_kg_h'] = masses_FG_out;
  innerData['FG_RK_OUT_Nm3_h'] = volume_FG_out;
  //innerData['O2_calcule'] = O2_sec_pourcent;
  innerData['T_OUT'] = calculatedData.T_OUT_mixed;

  const handleManualChange = (name, value) => {
    setManualComposition_SEP21((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('manualComposition_SEP21');
    setManualComposition_SEP21({
      'CO2 [kg/h]': 100,
      'H2O [kg/h]': 50,
      'O2 [kg/h]': 200,
      'N2 [kg/h]': 1000,
      'Temperature [°C]': 20,
    });
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('SEP21 - Flue Gas Mixer')}</h3>

      {/* Section Flux 1 - Du nœud précédent */}
      <h4>{t('Inlet Stream 1 (from previous node)')}</h4>
      <div className="cadre_param_bilan">
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ flex: '1', minWidth: '250px', textAlign: 'right', fontWeight: '500', color: '#333' }}>
              {t('Temperature')} [°C]:
            </label>
            <input
              type="number"
              value={T_IN_1.toFixed(1)}
              disabled
              style={{
                flex: '0 0 150px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#f5f5f5',
              }}
            />
          </div>
        </div>
        <TableGeneric elements={[
          { text: 'CO2 [kg/h]', value: FG_IN_1.CO2.toFixed(2) },
          { text: 'H2O [kg/h]', value: FG_IN_1.H2O.toFixed(2) },
          { text: 'O2 [kg/h]', value: FG_IN_1.O2.toFixed(2) },
          { text: 'N2 [kg/h]', value: FG_IN_1.N2.toFixed(2) },
        ]} />
      </div>

      {/* Section Flux 2 - Composition manuelle */}
      <h4>{t('Inlet Stream 2 (manual composition)')}</h4>
      <div className="cadre_param_bilan">
        <button 
          onClick={clearMemory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '15px'
          }}
        >
          {t('Clear memory')}
        </button>

        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(manualComposition_SEP21).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <label
                style={{
                  flex: '1',
                  minWidth: '250px',
                  textAlign: 'right',
                  fontWeight: '500',
                  color: '#333',
                }}
              >
                {t(key)}:
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleManualChange(key, parseFloat(e.target.value) || 0)}
                style={{
                  flex: '0 0 150px',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Résultats du mélange */}
      <h3>{t('Mixing Results')}</h3>
      <TableGeneric elements={elementsGeneric} />

      {/* Composition des flux */}
      <h3>{t('Flue gas composition')}</h3>

      <h4>{t('Inlet Stream 1')} ({T_IN_1.toFixed(1)}°C)</h4>
      <MassCalculator masses={masses_FG_in_1} TemperatureImposee={T_IN_1} />

      <h4>{t('Inlet Stream 2')} ({T_IN_2.toFixed(1)}°C)</h4>
      <MassCalculator masses={masses_FG_in_2} TemperatureImposee={T_IN_2} />

      <h4>{t('Mixed Outlet')} ({calculatedData.T_OUT_mixed.toFixed(1)}°C)</h4>
      <MassCalculator masses={masses_FG_out} TemperatureImposee={calculatedData.T_OUT_mixed} />
    </div>
  );
};

export default SEP21FlueGasMixer;