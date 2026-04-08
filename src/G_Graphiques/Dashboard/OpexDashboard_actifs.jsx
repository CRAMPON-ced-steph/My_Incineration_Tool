

//dans ce code, je n'affiche toujours pas les couts dans le tableau des couts. J'ai également des valeurs calculés mais qui apparaissent =0 dna sle tableau CO2 :





import React, { useState, useEffect } from 'react';
import { getOpexData } from '../../A_Transverse_fonction/opexDataService';

const OpexDashboard = ({ 
  equipmentType, 
  innerData, 
  setInnerData,
  equipmentConfig = {} 
}) => {
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
    fuelTypes, 
    reagentsTypes, 
    steamPrices, 
    waterPrices, 
    byproducts 
  } = getOpexData();

  // Configuration par défaut simple
  const defaultConfig = {
    title: `${equipmentType} Opex Dashboard`,
    color: '#1a73e8',
    electricLabels: [
      'Équipement 1',
      'Équipement 2', 
      'Équipement 3',
      'Équipement 4',
      'Équipement 5',
      'Équipement 6',
      'Équipement 7',
      'Équipement 8'
    ]
  };

  // Fusionner la configuration par défaut avec la configuration personnalisée
  const config = { ...defaultConfig, ...equipmentConfig };

  // Fonction utilitaire pour limiter à 2 chiffres significatifs
  const toSignificantFigures = (value, figures = 2) => {
    if (value === 0 || value === null || value === undefined) return 0;
    return parseFloat(value.toPrecision(figures));
  };


  // Fonction pour récupérer les paramètres d'entrée depuis innerData
  const getInputParameters = () => {
    const consoElec1 = toSignificantFigures(innerData?.consoElec1 || 0);
    const consoElec2 = toSignificantFigures(innerData?.consoElec2 || 0);
    const consoElec3 = toSignificantFigures(innerData?.consoElec3 || 0);
    const consoElec4 = toSignificantFigures(innerData?.consoElec4 || 0);
    const consoElec5 = toSignificantFigures(innerData?.consoElec5 || 0);
    const consoElec6 = toSignificantFigures(innerData?.consoElec6 || 0);
    const consoElec7 = toSignificantFigures(innerData?.consoElec7 || 0);
    const consoElec8 = toSignificantFigures(innerData?.consoElec8 || 0);

    const labelElec1 = innerData?.labelElec1 || config.electricLabels[0] || 'Équipement 1';
    const labelElec2 = innerData?.labelElec2 || config.electricLabels[1] || 'Équipement 2';
    const labelElec3 = innerData?.labelElec3 || config.electricLabels[2] || 'Équipement 3';
    const labelElec4 = innerData?.labelElec4 || config.electricLabels[3] || 'Équipement 4';
    const labelElec5 = innerData?.labelElec5 || config.electricLabels[4] || 'Équipement 5';
    const labelElec6 = innerData?.labelElec6 || config.electricLabels[5] || 'Équipement 6';
    const labelElec7 = innerData?.labelElec7 || config.electricLabels[6] || 'Équipement 7';
    const labelElec8 = innerData?.labelElec8 || config.electricLabels[7] || 'Équipement 8';

    const conso_air_co_N_m3 = toSignificantFigures(innerData?.conso_air_co_N_m3 || 0);

    const Conso_EauPotable_m3 = toSignificantFigures(innerData?.Conso_EauPotable_m3 || 0);
    const Conso_EauRefroidissement_m3 = toSignificantFigures(innerData?.Conso_EauRefroidissement_m3 || 0);
    const Conso_EauDemin_m3 = toSignificantFigures(innerData?.Conso_EauDemin_m3 || 0);
    const Conso_EauRiviere_m3 = toSignificantFigures(innerData?.Conso_EauRiviere_m3 || 0);
    const Conso_EauAdoucie_m3 = toSignificantFigures(innerData?.Conso_EauAdoucie_m3 || 0);

    const Conso_CaCO3_kg = toSignificantFigures(innerData?.Conso_CaCO3_kg || 0);
    const Conso_CaO_kg = toSignificantFigures(innerData?.Conso_CaO_kg || 0);
    const Conso_CaOH2_dry_kg = toSignificantFigures(innerData?.Conso_CaOH2_dry_kg || 0);
    const Conso_CaOH2_wet_kg = toSignificantFigures(innerData?.Conso_CaOH2_wet_kg || 0);
    const Conso_NaOH_kg = toSignificantFigures(innerData?.Conso_NaOH_kg || 0);
    const Conso_NaOHCO3_kg = toSignificantFigures(innerData?.Conso_NaOHCO3_kg || 0);
    const Conso_Ammonia_kg = toSignificantFigures(innerData?.Conso_Ammonia_kg || 0);
    const Conso_CAP_kg = toSignificantFigures(innerData?.Conso_CAP_kg || 0);
    const Conso_NaBrCaBr2_kg = toSignificantFigures(innerData?.Conso_NaBrCaBr2_kg || 0);
   
    // CORRECTION: Cohérence des unités - tout en MW
    const conso_gaz_H_MW = toSignificantFigures(innerData?.conso_gaz_H_MW || 0);
    const conso_gaz_L_MW = toSignificantFigures(innerData?.conso_gaz_L_MW || 0);
    const conso_gaz_Process_MW = toSignificantFigures(innerData?.conso_gaz_Process_MW || 0);

    const conso_fuel_MW = toSignificantFigures(innerData?.conso_fuel_MW || 0);

    // CORRECTION: Valeurs par défaut à 0 pour rester générique
    const conso_incineration_ash_kg_h = toSignificantFigures(innerData?.conso_incineration_ash_kg_h || 0);
    const conso_boiler_ash_kg_h = toSignificantFigures(innerData?.conso_boiler_ash_kg_h || 0);
    const conso_fly_ash_kg_h = toSignificantFigures(innerData?.conso_fly_ash_kg_h || 0);

    const CO2_transport_incineratino_ash = toSignificantFigures(innerData?.CO2_transport_incineratino_ash || 0);
    const CO2_transport_boiler_ash = toSignificantFigures(innerData?.CO2_transport_boiler_ash || 0);
    const CO2_transport_fly_ash = toSignificantFigures(innerData?.CO2_transport_fly_ash || 0);

    const cout_transport_incineratino_ash = toSignificantFigures(innerData?.cout_transport_incineratino_ash || 0);
    const cout_transport_boiler_ash = toSignificantFigures(innerData?.cout_transport_boiler_ash || 0);
    const cout_transport_fly_ash = toSignificantFigures(innerData?.cout_transport_fly_ash || 0);
    const cout_transport_reactifs = toSignificantFigures(innerData?.cout_transport_reactifs || 0);



    return {
      consoElec1, consoElec2, consoElec3, consoElec4, consoElec5, consoElec6, consoElec7, consoElec8,
      labelElec1, labelElec2, labelElec3, labelElec4, labelElec5, labelElec6, labelElec7, labelElec8,
      conso_air_co_N_m3, Conso_EauPotable_m3, Conso_EauRefroidissement_m3, Conso_EauDemin_m3, 
      Conso_EauRiviere_m3, Conso_EauAdoucie_m3, Conso_CaCO3_kg, Conso_CaO_kg, Conso_CaOH2_dry_kg,
      Conso_CaOH2_wet_kg, Conso_NaOH_kg, Conso_NaOHCO3_kg, Conso_Ammonia_kg, Conso_NaBrCaBr2_kg, Conso_CAP_kg, 
      conso_gaz_H_MW, conso_gaz_L_MW, conso_gaz_Process_MW, conso_fuel_MW,
      conso_incineration_ash_kg_h, conso_boiler_ash_kg_h, conso_fly_ash_kg_h,
      CO2_transport_incineratino_ash, CO2_transport_boiler_ash, CO2_transport_fly_ash,
      cout_transport_incineratino_ash, cout_transport_boiler_ash, cout_transport_fly_ash, cout_transport_reactifs
    };
  };

  // Fonction pour calculer tous les paramètres dérivés
  const calculateDerivedParameters = (params) => {
    const cout_air_co = params.conso_air_co_N_m3/1000 * airConsumptionPrice;
    const CO2_air_co_kg = toSignificantFigures(params.conso_air_co_N_m3 * powerRatio * ratioElec/1000);

    const cout_EauPotable = params.Conso_EauPotable_m3 * waterPrices.potable;
    const cout_EauRefroidissement = params.Conso_EauRefroidissement_m3 * waterPrices.cooling;
    const cout_EauDemin = params.Conso_EauDemin_m3 * waterPrices.demineralized;
    const cout_EauRiviere = params.Conso_EauRiviere_m3 * waterPrices.river;
    const cout_EauAdoucie = params.Conso_EauAdoucie_m3 * waterPrices.soft;
    const cout_Eau = cout_EauAdoucie + cout_EauDemin + cout_EauPotable + cout_EauRefroidissement + cout_EauRiviere;

    const conso_reactifs_tot = params.Conso_CaCO3_kg + params.Conso_CaO_kg + params.Conso_CaOH2_dry_kg + params.Conso_CaOH2_wet_kg + params.Conso_NaOH_kg + params.Conso_NaOHCO3_kg + params.Conso_Ammonia_kg + params.Conso_NaBrCaBr2_kg;
    const cout_transport_reactifs = conso_reactifs_tot * params.cout_transport;

    const cout_CaCO3 = params.Conso_CaCO3_kg * reagentsTypes.CaCO3.cost;
    const cout_CaO = params.Conso_CaO_kg * reagentsTypes.CaO.cost;
    const cout_CaOH2_dry = params.Conso_CaOH2_dry_kg * reagentsTypes.CaOH2.cost;
    const cout_CaOH2_wet = params.Conso_CaOH2_wet_kg * reagentsTypes.CaOH2.cost;
    const cout_NaOH = params.Conso_NaOH_kg * reagentsTypes.NaOH.cost;
    const cout_NaOHCO3 = params.Conso_NaOHCO3_kg * reagentsTypes.NaOHCO3.cost;
    const cout_Ammonia = params.Conso_Ammonia_kg * reagentsTypes.NH3.cost;
    const cout_NaBrCaBr2 = params.Conso_NaBrCaBr2_kg * reagentsTypes.NaBr_CaBr2.cost;
    const cout_reactifs = cout_CaCO3 + cout_CaO + cout_CaOH2_dry + cout_CaOH2_wet + cout_NaOH + cout_NaOHCO3 + cout_Ammonia + cout_NaBrCaBr2;

    const CO2_CaCO3 = params.Conso_CaCO3_kg/1000 * reagentsTypes.CaCO3.co2PerTrip;
    const CO2_CaO = params.Conso_CaO_kg/1000 * reagentsTypes.CaO.co2PerTrip;
    const CO2_CaOH2_dry = params.Conso_CaOH2_dry_kg/1000 * reagentsTypes.CaOH2.co2PerTrip;
    const CO2_CaOH2_wet = params.Conso_CaOH2_wet_kg/1000 * reagentsTypes.CaOH2.co2PerTrip;
    const CO2_NaOH = params.Conso_NaOH_kg/1000 * reagentsTypes.NaOH.co2PerTrip;
    const CO2_NaOHCO3 = params.Conso_NaOHCO3_kg/1000 * reagentsTypes.NaOHCO3.co2PerTrip;
    const CO2_Ammonia = params.Conso_Ammonia_kg/1000 * reagentsTypes.NH3.co2PerTrip;
    const CO2_NaBrCaBr2 = params.Conso_NaBrCaBr2_kg/1000 * reagentsTypes.NaBr_CaBr2.co2PerTrip;
    const CO2_transport_reactifs = CO2_CaCO3 + CO2_CaO + CO2_CaOH2_dry + CO2_CaOH2_wet + CO2_NaOH + CO2_NaOHCO3 + CO2_Ammonia + CO2_NaBrCaBr2;

    // CORRECTION: Utilisation cohérente des unités MW
    const cout_gaz_H = params.conso_gaz_H_MW * gasTypes.naturalGasH.molecule;
    const cout_gaz_L = params.conso_gaz_L_MW * gasTypes.naturalGasL.molecule;
    const cout_gaz_Process = params.conso_gaz_Process_MW * gasTypes.processGas.molecule;
    const cout_gaz = cout_gaz_H + cout_gaz_L + cout_gaz_Process;

    const CO2_conso_gaz_H = gasTypes.naturalGasH.co2Emission * params.conso_gaz_H_MW;
    const CO2_conso_gaz_L = gasTypes.naturalGasL.co2Emission * params.conso_gaz_L_MW;
    const CO2_conso_gaz_Process = gasTypes.processGas.co2Emission * params.conso_gaz_Process_MW;
    const CO2_conso_gaz = (CO2_conso_gaz_H + CO2_conso_gaz_L + CO2_conso_gaz_Process).toFixed(1);

    const cout_fuel = params.conso_fuel_MW * fuelTypes.FOD.liquid;
    const CO2_fuel = params.conso_fuel_MW * fuelTypes.FOD.co2Emission;

    const conso_elec_kW = params.consoElec1 + params.consoElec2 + params.consoElec3 + params.consoElec4 + params.consoElec5 + params.consoElec6 + params.consoElec7 + params.consoElec8;


    
    const CO2_conso_elec_kg = (ratioElec * conso_elec_kW / 1000).toFixed(2);
    const cout_conso_elec = (conso_elec_kW/1000 * purchaseElectricityPrice).toFixed(2);

    console.log('DEBUG - Calculs coût électrique:', {
      conso_elec_kW,
      purchaseElectricityPrice,
      cout_conso_elec,
      
    });

    const conso_transport_refidis_kg_h = params.conso_incineration_ash_kg_h + params.conso_boiler_ash_kg_h + params.conso_fly_ash_kg_h;
    const CO2_transport_refidis_kg = params.conso_incineration_ash_kg_h * params.CO2_transport_incineratino_ash + params.conso_boiler_ash_kg_h * params.CO2_transport_boiler_ash + params.conso_fly_ash_kg_h * params.CO2_transport_fly_ash;
    const cout_transport_refidis = params.conso_incineration_ash_kg_h * params.cout_transport_incineratino_ash + params.conso_boiler_ash_kg_h * params.cout_transport_boiler_ash + params.conso_fly_ash_kg_h * params.cout_transport_fly_ash;

    return {
      cout_air_co, CO2_air_co_kg, cout_Eau, cout_reactifs, CO2_transport_reactifs,
      cout_gaz, CO2_conso_gaz, cout_fuel, CO2_fuel, conso_elec_kW, CO2_conso_elec_kg,
      cout_conso_elec, CO2_transport_refidis_kg, cout_transport_refidis, cout_transport_reactifs
    };
  };

  // Fonction pour générer les données initiales des tableaux
  const generateInitialData = () => {
    const params = getInputParameters();
    const derived = calculateDerivedParameters(params);

    const initialElecData = [
      { key: 'row1', label: params.labelElec1, value: params.consoElec1.toString() },
      { key: 'row2', label: params.labelElec2, value: params.consoElec2.toString() },
      { key: 'row3', label: params.labelElec3, value: params.consoElec3.toString() },
      { key: 'row4', label: params.labelElec4, value: params.consoElec4.toString() },
      { key: 'row5', label: params.labelElec5, value: params.consoElec5.toString() },
      { key: 'row6', label: params.labelElec6, value: params.consoElec6.toString() },
      { key: 'row7', label: params.labelElec7, value: params.consoElec7.toString() },
      { key: 'row8', label: params.labelElec8, value: params.consoElec8.toString() },
    ];

    const initialEauData = [
      { key: 'row1', label: 'eau potable', value: params.Conso_EauPotable_m3.toString() },
      { key: 'row2', label: 'eau de refroidissement', value: params.Conso_EauRefroidissement_m3.toString() },
      { key: 'row3', label: 'eau déminéralisée', value: params.Conso_EauDemin_m3.toString() },
      { key: 'row4', label: 'eau de rivière', value: params.Conso_EauRiviere_m3.toString() },
      { key: 'row5', label: 'eau adoucie', value: params.Conso_EauAdoucie_m3.toString() },
    ];

    const initialReactifsData = [
      { key: 'row1', label: 'CaCO3', value: params.Conso_CaCO3_kg.toString() },
      { key: 'row2', label: 'CaO', value: params.Conso_CaO_kg.toString() },
      { key: 'row3', label: 'CaOH2_dry', value: params.Conso_CaOH2_dry_kg.toString() },
      { key: 'row4', label: 'CaOH2_wet', value: params.Conso_CaOH2_wet_kg.toString() },
      { key: 'row5', label: 'NaOH', value: params.Conso_NaOH_kg.toString() },
      { key: 'row6', label: 'NaOHCO3', value: params.Conso_NaOHCO3_kg.toString() },
      { key: 'row7', label: 'Ammonia', value: params.Conso_Ammonia_kg.toString() },
      { key: 'row8', label: 'NaBr/CaBr2', value: params.Conso_NaBrCaBr2_kg.toString() },
    ];
    
    const initialEnergieData = [
      { key: 'row1', label: 'gaz H', value: params.conso_gaz_H_MW.toString() },
      { key: 'row2', label: 'gaz L', value: params.conso_gaz_L_MW.toString() },
      { key: 'row3', label: 'gaz process', value: params.conso_gaz_Process_MW.toString() },
      { key: 'row4', label: 'fuel', value: params.conso_fuel_MW.toString() },
    ];

    const initialCo2Data = [
      { key: 'row1', label: 'Conso élec', value: derived.CO2_conso_elec_kg.toString() },
      { key: 'row2', label: 'Conso gaz/fuel', value: (derived.CO2_conso_gaz + derived.CO2_fuel).toString() },
      { key: 'row3', label: 'Conso air comprimé', value: derived.CO2_air_co_kg.toString() },
      { key: 'row4', label: 'Transport réactifs', value: derived.CO2_transport_reactifs.toString() },
      { key: 'row5', label: 'Transport Refidis/cendres', value: derived.CO2_transport_refidis_kg.toString() },
    ];

    // CORRECTION: Ajout du coût fuel dans gaz/fuel
    const initialcoutData = [
      { key: 'row1', label: 'Conso élec', value: derived.cout_conso_elec.toString() },
      { key: 'row2', label: 'Conso gaz/fuel', value: (derived.cout_gaz + derived.cout_fuel).toString() },
      { key: 'row3', label: 'Conso air comprimé', value: derived.cout_air_co.toString() },
      { key: 'row4', label: 'Conso Eau', value: derived.cout_Eau.toString() },
      { key: 'row5', label: 'Conso réactifs', value: derived.cout_reactifs.toString() },
      { key: 'row6', label: 'Transport réactifs', value: derived.cout_transport_reactifs.toString() },
      { key: 'row7', label: 'Transport Refidis/cendres', value: derived.cout_transport_refidis.toString() },
    ];

    return {
      initialElecData,
      initialEauData,
      initialReactifsData,
      initialEnergieData,
      initialCo2Data,
      initialcoutData
    };
  };

  // État pour le mode annuel/horaire
  const [isAnnualMode, setIsAnnualMode] = useState(false);

  // Données de consommation brutes (toujours en valeurs horaires)
  const [rawConsumptionData, setRawConsumptionData] = useState({
    elec: 0,
    eau: 0,
    reactifs: 0,
    energie: 0,
    gaz: 0,
    co2: 0,
    cout: 0
  });

  // Générer les données initiales
  const initialData = generateInitialData();

  // États pour chaque catégorie de données
  const [elecData, setElecData] = useState([...initialData.initialElecData]);
  const [eauData, setEauData] = useState([...initialData.initialEauData]);
  const [reactifsData, setReactifsData] = useState([...initialData.initialReactifsData]);
  const [energieData, setEnergieData] = useState([...initialData.initialEnergieData]);
  const [co2Data, setCo2Data] = useState([...initialData.initialCo2Data]);
  const [coutData, setCoutData] = useState([...initialData.initialcoutData]);

  // Données de consommation affichées (converties selon le mode)
  const [activeNodes_Elec, setActiveNodes_Elec] = useState([{ label: equipmentType, data: { consommationElec: 0 } }]);
  const [activeNodes_Eau, setActiveNodes_Eau] = useState([{ label: equipmentType, data: { consommationEau: 0 } }]);
  const [activeNodes_Reactifs, setActiveNodes_Reactifs] = useState([{ label: equipmentType, data: { consommationReactifs: 0 } }]);
  const [activeNodes_Energie, setActiveNodes_Energie] = useState([{ label: equipmentType, data: { consommationEnergie: 0 } }]);
  const [activeNodes_CO2, setActiveNodes_CO2] = useState([{ label: equipmentType, data: { emissionsCO2: 0 } }]);
  const [activeNodes_cout, setActiveNodes_cout] = useState([{ label: equipmentType, data: { cout: 0 } }]);

  // EFFET POUR MISE À JOUR AUTOMATIQUE QUAND innerData CHANGE
  useEffect(() => {
    if (innerData) {
      const newInitialData = generateInitialData();
      
      setElecData([...newInitialData.initialElecData]);
      setEauData([...newInitialData.initialEauData]);
      setReactifsData([...newInitialData.initialReactifsData]);
      setEnergieData([...newInitialData.initialEnergieData]);
      setCo2Data([...newInitialData.initialCo2Data]);
      setCoutData([...newInitialData.initialcoutData]);
    }
  }, [
    innerData?.consoElec1, innerData?.consoElec2, innerData?.consoElec3, innerData?.consoElec4, 
    innerData?.consoElec5, innerData?.consoElec6, innerData?.consoElec7, innerData?.consoElec8,
    innerData?.labelElec1, innerData?.labelElec2, innerData?.labelElec3, innerData?.labelElec4,
    innerData?.labelElec5, innerData?.labelElec6, innerData?.labelElec7, innerData?.labelElec8,
    innerData?.conso_air_co_N_m3, 
    innerData?.Conso_EauPotable_m3, innerData?.Conso_EauRefroidissement_m3, innerData?.Conso_EauDemin_m3,
    innerData?.Conso_EauRiviere_m3, innerData?.Conso_EauAdoucie_m3,
    innerData?.Conso_CaCO3_kg, innerData?.Conso_CaO_kg, innerData?.Conso_CaOH2_dry_kg,
    innerData?.Conso_CaOH2_wet_kg, innerData?.Conso_NaOH_kg, innerData?.Conso_NaOHCO3_kg,
    innerData?.Conso_Ammonia_kg, innerData?.Conso_NaBrCaBr2_kg,
    innerData?.Conso_CAP_kg, innerData?.Conso_CAP_kg,
    innerData?.conso_gaz_H_MW, innerData?.conso_gaz_L_MW, innerData?.conso_gaz_Process_MW,
    innerData?.conso_fuel,
    innerData?.conso_incineration_ash_kg_h, innerData?.conso_boiler_ash_kg_h, innerData?.conso_fly_ash_kg_h,
    innerData?.CO2_transport_incineratino_ash, innerData?.CO2_transport_boiler_ash, innerData?.CO2_transport_fly_ash, , innerData?.CO2_transport_reactifs,
    innerData?.cout_transport_incineratino_ash, innerData?.cout_transport_boiler_ash, innerData?.cout_transport_fly_ash, , innerData?.cout_transport_reactifs
  ]);

  // Fonction pour filtrer les lignes avec valeur 0 (pour l'affichage uniquement)
  const getVisibleRows = (data) => {
    return data.filter(row => {
      const value = parseFloat(row.value) || 0;
      // Afficher si la ligne a un label ET (une valeur non nulle OU un label significatif)
      return row.label && (value !== 0 || row.label.trim() !== '');
    });
  };

  // Fonction pour calculer la somme des valeurs
  const calculateSum = (data) => {
    return data.reduce((sum, row) => {
      const value = row.value === '' ? 0 : (parseFloat(row.value) || 0);
      return sum + value;
    }, 0);
  };

  // Mettre à jour les valeurs brutes de consommation lorsque les données des tableaux changent
  useEffect(() => {
    const sum = calculateSum(elecData);
    setRawConsumptionData(prev => ({ ...prev, elec: sum }));
  }, [elecData]);

  useEffect(() => {
    const sum = calculateSum(eauData);
    setRawConsumptionData(prev => ({ ...prev, eau: sum }));
  }, [eauData]);

  useEffect(() => {
    const sum = calculateSum(reactifsData);
    setRawConsumptionData(prev => ({ ...prev, reactifs: sum }));
  }, [reactifsData]);

  useEffect(() => {
    const sum = calculateSum(energieData);
    setRawConsumptionData(prev => ({ ...prev, energie: sum }));
  }, [energieData]);

  useEffect(() => {
    const sum = calculateSum(co2Data);
    setRawConsumptionData(prev => ({ ...prev, co2: sum }));
  }, [co2Data]);

  useEffect(() => {
    const sum = calculateSum(coutData);
    setRawConsumptionData(prev => ({ ...prev, cout: sum }));
  }, [coutData]);

  // Fonction pour convertir les valeurs selon le mode
  const convertValue = (value, type) => {
    const numValue = parseFloat(value) || 0;
    if (isAnnualMode) {
      const annualValue = numValue * availability;
      
      if (type === 'reactifs' || type === 'co2') {
        return annualValue / 1000;
      }
      
      if ((type === 'elec' || type === 'energie') && annualValue >= 1000) {
        return annualValue / 1000;
      }
      
      return annualValue;
    }
    return numValue;
  };

  // Fonction pour obtenir l'unité selon le mode
  const getUnit = (type) => {
    if (isAnnualMode) {
      switch (type) {
        case 'reactifs':
        case 'co2':
          return 'T';
        case 'elec':
          return rawConsumptionData.elec * availability >= 1000 ? 'MWé' : 'kWé';
        case 'energie':
          return rawConsumptionData.energie * availability >= 1000 ? 'MW' : 'MW';
        case 'eau':
          return 'm3';
        case 'cout':
          return currency;
        default:
          return '';
      }
    } else {
      switch (type) {
        case 'reactifs':
        case 'co2':
          return 'kg';
        case 'elec':
          return 'kWé';
        case 'energie':
          return 'kW';
        case 'eau':
          return 'm3';
        case 'cout':
          return currency;
        default:
          return '';
      }
    }
  };

  // Mettre à jour les valeurs de consommation affichées lorsque le mode ou les données brutes changent
  useEffect(() => {
    const elecValue = convertValue(rawConsumptionData.elec, 'elec');
    setActiveNodes_Elec([{ label: equipmentType, data: { consommationElec: elecValue } }]);
    
    const eauValue = convertValue(rawConsumptionData.eau, 'eau');
    setActiveNodes_Eau([{ label: equipmentType, data: { consommationEau: eauValue } }]);
    
    const reactifsValue = convertValue(rawConsumptionData.reactifs, 'reactifs');
    setActiveNodes_Reactifs([{ label: equipmentType, data: { consommationReactifs: reactifsValue } }]);
    
    const energieValue = convertValue(rawConsumptionData.energie, 'energie');
    setActiveNodes_Energie([{ label: equipmentType, data: { consommationEnergie: energieValue } }]);
    
    const co2Value = convertValue(rawConsumptionData.co2, 'co2');
    setActiveNodes_CO2([{ label: equipmentType, data: { emissionsCO2: co2Value } }]);
    
    const coutValue = convertValue(rawConsumptionData.cout, 'cout');
    setActiveNodes_cout([{ label: equipmentType, data: { cout: coutValue } }]);
  }, [isAnnualMode, rawConsumptionData, availability, equipmentType]);

  // Synchronisation des données avec innerData
  useEffect(() => {
    if (setInnerData) {
      setInnerData(prevData => ({
        ...prevData,
        activeNodes_Elec,
        activeNodes_Eau,
        activeNodes_Reactifs,
        activeNodes_Energie,
        activeNodes_CO2,
        activeNodes_cout
      }));
    }
  }, [activeNodes_Elec, activeNodes_Eau, activeNodes_Reactifs, activeNodes_Energie, activeNodes_CO2, activeNodes_cout, setInnerData]);

  // Fonction pour mettre à jour les données du tableau
  const handleTableChange = (setter, index, field, value) => {
    setter(prevData => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  // Fonction pour ajouter une ligne à un tableau
  const addRow = (data, setter) => {
    const newRow = { 
      key: `row${Date.now()}`,
      label: '', 
      value: ''
    };
    setter([...data, newRow]);
  };

  // Fonction pour supprimer une ligne d'un tableau
  const deleteRow = (data, setter, index) => {
    if (data.length > 1) {
      setter(data.filter((_, i) => i !== index));
    }
  };

  // Fonction pour réinitialiser les données
  const resetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données?')) {
      const newInitialData = generateInitialData();
      setElecData([...newInitialData.initialElecData]);
      setEauData([...newInitialData.initialEauData]);
      setReactifsData([...newInitialData.initialReactifsData]);
      setEnergieData([...newInitialData.initialEnergieData]);
      setCo2Data([...newInitialData.initialCo2Data]);
      setCoutData([...newInitialData.initialcoutData]);
      setRawConsumptionData({
        elec: 0, eau: 0, reactifs: 0, energie: 0, gaz: 0, co2: 0, cout: 0
      });
      setIsAnnualMode(false);
    }
  };

  // Composant pour une cellule de tableau éditable
  const EditableCell = ({ initialValue, onSave, type = "text" }) => {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    const handleChange = (e) => {
      setValue(e.target.value);
    };

    const handleBlur = () => {
      setIsEditing(false);
      onSave(value);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        setIsEditing(false);
        onSave(value);
      }
    };

    return isEditing ? (
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        style={{
          width: '100%',
          padding: '6px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
    ) : (
      <div 
        onClick={() => setIsEditing(true)}
        style={{
          padding: '6px',
          height: '34px',
          cursor: 'text',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {value || ""}
      </div>
    );
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ isOn, handleToggle }) => {
    return (
      <div style={{
        position: 'relative',
        width: '50px',
        height: '24px',
        backgroundColor: isOn ? '#4CAF50' : '#ccc',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }} onClick={handleToggle}>
        <div style={{
          position: 'absolute',
          left: isOn ? '26px' : '2px',
          top: '2px',
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    );
  };

  // Composant pour un tableau de données
  const DataTable = ({ title, color, data, setData, type }) => {
    const sum = calculateSum(data);
    const displaySum = convertValue(sum, type);
    const unit = getUnit(type);
    
    const visibleRows = getVisibleRows(data);
    
    return (
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: color, 
          padding: '10px 15px', 
          borderRadius: '5px 5px 0 0',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{title} {unit && `[${unit}]`}</span>
          <span>Total: {displaySum.toFixed(2)}</span>
        </div>
        <div style={{ 
          border: `1px solid ${color}`, 
          borderTop: 'none', 
          padding: '15px',
          borderRadius: '0 0 5px 5px'
        }}>
          {visibleRows.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Valeur</th>
                  <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, visibleIndex) => {
                  const realIndex = data.findIndex(item => item.key === row.key);
                  return (
                    <tr key={row.key}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <EditableCell 
                          initialValue={row.label} 
                          onSave={(value) => handleTableChange(setData, realIndex, 'label', value)} 
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        <EditableCell 
                          initialValue={row.value} 
                          onSave={(value) => handleTableChange(setData, realIndex, 'value', value)}
                          type="text" 
                        />
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <button
                          onClick={() => deleteRow(data, setData, realIndex)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ff5252',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              Aucune donnée à afficher (toutes les valeurs sont à 0)
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px'
          }}>
            <button
              onClick={() => addRow(data, setData)}
              style={{
                padding: '8px 12px',
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Ajouter une ligne
            </button>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '16px',
              padding: '8px 12px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              Total: {displaySum.toFixed(2)} {unit}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Afficher les valeurs de consommation actuelles
  const ConsumptionSummary = () => {
    return (
      <div style={{ 
        marginBottom: '30px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '5px',
        border: '1px solid #ddd'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Résumé des Consommations - {equipmentType}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: !isAnnualMode ? config.color : '#666', fontWeight: !isAnnualMode ? 'bold' : 'normal' }}>Horaire</span>
            <ToggleSwitch 
              isOn={isAnnualMode} 
              handleToggle={() => setIsAnnualMode(!isAnnualMode)}
            />
            <span style={{ color: isAnnualMode ? '#4CAF50' : '#666', fontWeight: isAnnualMode ? 'bold' : 'normal' }}>Annuel</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ 
            flex: '1 1 30%', 
            padding: '10px', 
            backgroundColor: '#4a90e2', 
            color: 'white', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <div>Électricité [{getUnit('elec')}]</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeNodes_Elec[0].data.consommationElec.toFixed(2)}
            </div>
          </div>
          <div style={{ 
            flex: '1 1 30%', 
            padding: '10px', 
            backgroundColor: '#2ecc71', 
            color: 'white', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <div>Eau [{getUnit('eau')}]</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeNodes_Eau[0].data.consommationEau.toFixed(2)}
            </div>
          </div>
          <div style={{ 
            flex: '1 1 30%', 
            padding: '10px', 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <div>Réactifs [{getUnit('reactifs')}]</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeNodes_Reactifs[0].data.consommationReactifs.toFixed(2)}
            </div>
          </div>
          <div style={{ 
            flex: '1 1 30%', 
            padding: '10px', 
            backgroundColor: '#f39c12', 
            color: 'white', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <div>Énergie [{getUnit('energie')}]</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeNodes_Energie[0].data.consommationEnergie.toFixed(2)}
            </div>
          </div>
          <div style={{ 
            flex: '1 1 30%', 
            padding: '10px', 
            backgroundColor: '#9b59b6', 
            color: 'white', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <div>CO2 [{getUnit('co2')}]</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeNodes_CO2[0].data.emissionsCO2.toFixed(2)}
            </div>
          </div>
          <div style={{ 
            flex: '1 1 30%', 
            padding: '10px', 
            backgroundColor: '#34495e', 
            color: 'white', 
            borderRadius: '4px',
            minWidth: '150px'
          }}>
            <div>Coût [{getUnit('cout')}]</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {activeNodes_cout[0].data.cout.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: config.color }}>{config.title}</h1>
        <button
          onClick={resetData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff5252',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Réinitialiser
        </button>
      </div>

      <ConsumptionSummary />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <DataTable 
            title="Électricité" 
            color="#4a90e2" 
            data={elecData} 
            setData={setElecData}
            type="elec"
          />
        </div>
        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <DataTable 
            title="Eau" 
            color="#2ecc71" 
            data={eauData} 
            setData={setEauData}
            type="eau"
          />
        </div>
        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <DataTable 
            title="Réactifs" 
            color="#e74c3c" 
            data={reactifsData} 
            setData={setReactifsData}
            type="reactifs"
          />
        </div>
        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <DataTable 
            title="Énergie" 
            color="#f39c12" 
            data={energieData} 
            setData={setEnergieData}
            type="energie"
          />
        </div>
        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <DataTable 
            title="CO2" 
            color="#9b59b6" 
            data={co2Data} 
            setData={setCo2Data}
            type="co2"
          />
        </div>
        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
          <DataTable 
            title="Coût" 
            color="#34495e" 
            data={coutData} 
            setData={setCoutData}
            type="cout"
          />
        </div>
      </div>

      <button
        onClick={() => window.print()}
        style={{
          width: '100%',
          padding: '12px',
          background: config.color,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Export {equipmentType}opex
      </button>
    </div>
  );
};

export default OpexDashboard;