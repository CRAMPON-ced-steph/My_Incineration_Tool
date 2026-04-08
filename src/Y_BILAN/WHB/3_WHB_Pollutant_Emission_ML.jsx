import React, { useState, useEffect, useCallback } from 'react';
import PollutantCalculator from '../../C_Components/Tableau_polluants';
import FGT from '../../C_Components/Traitement_fumées';
import TableGeneric from '../../C_Components/Tableau_generique';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import PrintButton from '../../C_Components/Windows_print';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WHB_traduction';

const WHBFlueGasPollutantEmission = ({ innerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  // Mapping clés originales vers clés de traduction
  const parameterTranslationKeys = {
    'Fly ashes content outlet [g/Nm3]': 'flyAshesContentOutlet',
    'siccity bottom ash [%]': 'siccityBottomAsh',
    'O2 ref [%]': 'o2Ref',
  };

  const initialEmissions2 = {
    'Fly ashes content outlet [g/Nm3]': 1,
    'siccity bottom ash [%]': 66,
    'O2 ref [%]': 11,
  };

  const [emissions2, setEmissions2] = useState(() => {
    const savedEmissions = localStorage.getItem('emissions2_WHB');
    return savedEmissions ? JSON.parse(savedEmissions) : initialEmissions2;
  });

  useEffect(() => {
    localStorage.setItem('emissions2_WHB', JSON.stringify(emissions2));
  }, [emissions2]);

  const FlyAsh_g_Nm3 = emissions2['Fly ashes content outlet [g/Nm3]'];
  const O2ref = emissions2['O2 ref [%]'];
  const Debit_fumees_humide_Nm3_h = innerData?.FG_humide_tot || 1;
  const Debit_fumees_sec_Nm3_h = innerData?.FG_sec_tot || 1;
  const FG_O2_calcule = innerData?.O2calcul || 12;
  const masse_dechets = innerData?.MasseDechet || 1;
  const Inert_kg_h = innerData?.Inertmass || 0;

  const masses_pollutant_input = innerData?.PollutantOutput || {};

  const {
    availability, ratioElec, purchaseElectricityPrice, selectedCountryCode, currency, truck15TCO2, truck15TPrice, truck20TCO2, truck20TPrice, truck25TCO2, truck25TPrice, airPressure, compressorType, powerRatio, airConsumptionPrice, sellingElectricityPrice, gasTypes, steamPrices, waterPrices, reagentsTypes, byproducts
  } = getOpexData();

  const Residus_IN = innerData?.ResidusOutput || {
    FlyAsh_kg_h: 0,
    mass_residus_tot: 0,
    WetBottomAsh_kg_h: 0
  };

  const Fly_ash_in_kg_h = Residus_IN.FlyAsh_kg_h;
  const Fly_ash_out_kg_h = Debit_fumees_sec_Nm3_h * FlyAsh_g_Nm3 / 1000;

  const WHB_Ash_kg_h = Fly_ash_in_kg_h - Fly_ash_out_kg_h;

  const masses_pollutant_output = masses_pollutant_input;

  let DryBottomAsh_kg_h = Fly_ash_in_kg_h;
  let FlyAsh_kg_h = Fly_ash_in_kg_h;
  let WetBottomAsh_kg_h = 0;

  if (Inert_kg_h !== 0) {
    FlyAsh_kg_h = Fly_ash_out_kg_h;
    DryBottomAsh_kg_h = Fly_ash_out_kg_h;
    WetBottomAsh_kg_h = DryBottomAsh_kg_h / 0.66;
  }

  // Calcul des consommations totales par réactif (kg/h)
  const Conso_CaCO3_kg = 0;
  const Conso_CaO_kg = 0;
  const Conso_CaOH2wet_kg = 0;
  const Conso_CaOH2dry_kg = 0;
  const Conso_NaOH_kg = 0;
  const Conso_NaOHCO3_kg = 0;
  const Conso_Ammonia_kg = 0;
  const Conso_NaBrCaBr2_kg = 0;
  const Conso_CAP_kg = 0;

  // Calcul des coûts pour chaque réactif (en €)
  const Cout_CaCO3 = reagentsTypes?.CaCO3 ? (Conso_CaCO3_kg / 1000 * reagentsTypes.CaCO3.cost) : 0;
  const Cout_CaO = reagentsTypes?.CaO ? (Conso_CaO_kg / 1000 * reagentsTypes.CaO.cost) : 0;
  const Cout_CaOH2wet = reagentsTypes?.CaOH2wet ? (Conso_CaOH2wet_kg / 1000 * reagentsTypes.CaOH2wet.cost) : 0;
  const Cout_CaOH2dry = reagentsTypes?.CaOH2dry ? (Conso_CaOH2dry_kg / 1000 * reagentsTypes.CaOH2dry.cost) : 0;
  const Cout_NaOH = reagentsTypes?.NaOH ? (Conso_NaOH_kg / 1000 * reagentsTypes.NaOH.cost) : 0;
  const Cout_NaOHCO3 = reagentsTypes?.NaOHCO3 ? (Conso_NaOHCO3_kg / 1000 * reagentsTypes.NaOHCO3.cost) : 0;
  const Cout_Ammonia = reagentsTypes?.Ammonia ? (Conso_Ammonia_kg / 1000 * reagentsTypes.Ammonia.cost) : 0;
  const Cout_NaBrCaBr2 = reagentsTypes?.NaBr_CaBr2 ? (Conso_NaBrCaBr2_kg / 1000 * reagentsTypes.NaBr_CaBr2.cost) : 0;
  const Cout_CAP = reagentsTypes?.CAP ? (Conso_CAP_kg / 1000 * reagentsTypes.CAP.cost) : 0;

  // Calcul des émissions CO2 pour chaque réactif (en kg CO2)
  const CO2_CaCO3 = reagentsTypes?.CaCO3 ? (Conso_CaCO3_kg / 1000 * reagentsTypes.CaCO3.co2PerTrip) : 0;
  const CO2_CaO = reagentsTypes?.CaO ? (Conso_CaO_kg / 1000 * reagentsTypes.CaO.co2PerTrip) : 0;
  const CO2_CaOH2wet = reagentsTypes?.CaOH2wet ? (Conso_CaOH2wet_kg / 1000 * reagentsTypes.CaOH2wet.co2PerTrip) : 0;
  const CO2_CaOH2dry = reagentsTypes?.CaOH2dry ? (Conso_CaOH2dry_kg / 1000 * reagentsTypes.CaOH2dry.co2PerTrip) : 0;
  const CO2_NaOH = reagentsTypes?.NaOH ? (Conso_NaOH_kg / 1000 * reagentsTypes.NaOH.co2PerTrip) : 0;
  const CO2_NaOHCO3 = reagentsTypes?.NaOHCO3 ? (Conso_NaOHCO3_kg / 1000 * reagentsTypes.NaOHCO3.co2PerTrip) : 0;
  const CO2_Ammonia = reagentsTypes?.Ammonia ? (Conso_Ammonia_kg / 1000 * reagentsTypes.Ammonia.co2PerTrip) : 0;
  const CO2_NaBrCaBr2 = reagentsTypes?.NaBr_CaBr2 ? (Conso_NaBrCaBr2_kg / 1000 * reagentsTypes.NaBr_CaBr2.co2PerTrip) : 0;
  const CO2_CAP = reagentsTypes?.CAP ? (Conso_CAP_kg / 1000 * reagentsTypes.CAP.co2PerTrip) : 0;

  // Coût total de consommation des réactifs
  const cout_conso_reactifs = Cout_CaCO3 + Cout_CaO + Cout_CaOH2wet + Cout_CaOH2dry +
    Cout_NaOH + Cout_NaOHCO3 + Cout_Ammonia + Cout_NaBrCaBr2 + Cout_CAP;

  // Émissions CO2 totales des réactifs
  const CO2_total_reactifs = CO2_CaCO3 + CO2_CaO + CO2_CaOH2wet + CO2_CaOH2dry +
    CO2_NaOH + CO2_NaOHCO3 + CO2_Ammonia + CO2_NaBrCaBr2 + CO2_CAP;

  // Objet de consommation des réactifs
  const Conso_Reactifs = {
    CaCO3: Conso_CaCO3_kg,
    CaO: Conso_CaO_kg,
    CaOH2wet: Conso_CaOH2wet_kg,
    CaOH2dry: Conso_CaOH2dry_kg,
    NaOH: Conso_NaOH_kg,
    NaOHCO3: Conso_NaOHCO3_kg,
    Ammonia: Conso_Ammonia_kg,
    NaBrCaBr2: Conso_NaBrCaBr2_kg,
    CAP: Conso_CAP_kg,
    cout: cout_conso_reactifs,
    CO2_transport: CO2_total_reactifs,
  };

  const Residus = {
    DryBottomAsh_kg_h,
    WetBottomAsh_kg_h,
    FlyAsh_kg_h,
  };

  const elementsGeneric = [
    { text: t('wasteFlow'), value: masse_dechets },
    { text: t('flueGasFlowWet'), value: Debit_fumees_humide_Nm3_h },
    { text: t('flueGasFlowDry'), value: Debit_fumees_sec_Nm3_h },
    { text: t('o2Calculated'), value: FG_O2_calcule },
    { text: t('flyAshesContentOutlet'), value: FlyAsh_g_Nm3 },
  ];

  const residusCalculations = [
    { text: t('boilerAsh'), value: WHB_Ash_kg_h },
  ];

  // Mise à jour de innerData
  if (innerData) {
    innerData['Residus'] = Residus;
    innerData['PInput'] = masses_pollutant_input;
    innerData['Poutput'] = masses_pollutant_output;
    innerData['Conso_reactifs'] = Conso_Reactifs;
    innerData['Boiler_ash'] = WHB_Ash_kg_h;
  }

  const handleChange = (name, value) => {
    let newValue = value;

    if (name === 'Fly ashes content outlet [g/Nm3]') {
      newValue = Math.max(0, Math.min(40, value));
    } else if (name === 'siccity bottom ash [%]') {
      newValue = Math.max(0, Math.min(100, value));
    } else if (name === 'O2 ref [%]') {
      newValue = Math.max(0, Math.min(21, value));
    }

    setEmissions2((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const clearMemory = useCallback(() => {
    localStorage.removeItem('emissions2_WHB');
    setEmissions2(initialEmissions2);
  }, []);

  return (
    <div className="cadre_pour_onglet">
      <h3>{t('calculationParameters')}</h3>

      {/* GRILLE 2 COLONNES SANS CADRE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        <div>
          <button onClick={clearMemory} style={{
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {t('clearMemory')}
          </button>
        </div>

        {Object.entries(emissions2).map(([key, value]) => (
          <div key={key}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}>
              {t(parameterTranslationKeys[key]) || key}:
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}
      </div>

      <h3>{t('calculatedParameters')}</h3>
      <TableGeneric elements={elementsGeneric} />

      <h3>{t('flueGasComposition')}</h3>
      <h4>{t('inputFlueGas')}</h4>
      <PollutantCalculator masses={masses_pollutant_input} O2_mesure={FG_O2_calcule} O2_ref={O2ref} Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h} />

      <h4>{t('outputFlueGas')}</h4>
      <PollutantCalculator masses={masses_pollutant_output} O2_mesure={FG_O2_calcule} O2_ref={O2ref} Debit_fumees_sec_Nm3_h={Debit_fumees_sec_Nm3_h} />

      <h3>{t('residuesCalculated')}</h3>
      <TableGeneric elements={residusCalculations} />
    </div>
  );
};

export default WHBFlueGasPollutantEmission;