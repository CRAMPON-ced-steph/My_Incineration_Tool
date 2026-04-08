import React, { useState, useEffect } from 'react';
import TableGeneric from '../../C_Components/Tableau_generique';
import DisplayDesignComponent from '../../C_Components/Display_design';
import Input_bilan from '../../C_Components/MiseEnFormeInputParamBilan';

import { coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';

import { Emissivite_CO2_T, Emissivite_H2O_T, Emissivite_CO_T, Emissivite_CO2_H2O_T, Emissivite_H2O_CO_T, Emissivite_CO2_CO_T, Emissivite_H2O_CO2_CO_T, calculateMR, FG_emissivity } from '../../A_Transverse_fonction/FG_emissivite';

import '../../index.css';

import { Tsat_p, hL_T, hL_p, hV_p, hV_T, h_pT, CpL_T } from '../../A_Transverse_fonction/steam_table3';

// Import images
import RK_tps_sejour from '../../B_Images/RK/RK_tps_sejour.png';
import RK_front_shield from '../../B_Images/RK/RK_front_shield.png';
import RK_pertes_thermiques from '../../B_Images/RK/RK_pertes_thermiques.png';
import FondTransparent from '../../B_Images/fond_transparent.jpg';

import SCC_img from '../../B_Images/SCC/SCC_img.png';
import SCC_extracteur from '../../B_Images/SCC/SCC_extracteur.png';
import SCC_formule from '../../B_Images/SCC/SCC_formule.png';

import fond_transparent from '../../B_Images/fond_transparent.jpg';

import { getOpexData } from '../../A_Transverse_fonction/opexDataService';
import { dataArray_CO2 } from '../../D_Data_base/dataCO2';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './RK_traduction';

const RKdesign = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {

  // Fonction de traduction
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  // Fonction utilitaire pour initialiser avec innerData ou valeurs par défaut
  const getInitialValue = (paramName, defaultValue) => {
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

  //CALCUL DU DESIGN

  const Debit_fumee_humide_Nm3_h = innerData?.FG_RK_OUT_Nm3_h?.wet || 10000;
  const WetBottomAsh_kg_h = innerData?.Residus?.WetBottomAsh_kg_h || 0;

  // Utility function to check for negative values
  const isNegative = (value) => value < 0;

  // PDC calcul avec state et persistance
  const [PDC_calcul, setPDC_calcul] = useState({
    pressionAeraulique: getInitialValue('PDC_pression_aeraulique', 0),
    pdcMmCE: getInitialValue('PDC_mmCE', 20),
  });

  const P_in_mmCE = PDC_calcul.pressionAeraulique;
  const PDC_mmCE = PDC_calcul.pdcMmCE;
  const P_out_mmCE = P_in_mmCE - PDC_mmCE;

  // CORRECTION: Mise à jour sécurisée de innerData
  if (innerData) {
    innerData['P_out_mmCE'] = P_out_mmCE;
  }

  const elements_PDC = [
    { text: 'P_out_mmCE', value: P_out_mmCE },
  ];

  // DIMENSIONNEMENT DU FOUR avec persistance
  const [Parametres_dimensionnement, setParametres_dimensionnement] = useState({
    diametreInterne: getInitialValue('RK_diametre_interne', 5),
    diametreExterne: getInitialValue('RK_diametre_externe', 5.8),
    longueur: getInitialValue('RK_longueur', 10),
    pente: getInitialValue('RK_pente', 2),
    beta: getInitialValue('RK_beta', 35),
    nombreTours: getInitialValue('RK_tours', 0.7),
    hauteurDechets: getInitialValue('RK_hauteur_dechets', 0.5),
    masseVolumiqueDechets: getInitialValue('RK_rho_dechets', 700),
    debitDechetsSolides: getInitialValue('RK_debit_dechets_solides', 1000)
  });

  const Diametre_interne_m = Parametres_dimensionnement.diametreInterne;
  const Diametre_externe_m = Parametres_dimensionnement.diametreExterne;
  const Longueur_four_m = Parametres_dimensionnement.longueur;
  const pente = Parametres_dimensionnement.pente;
  const Beta = Parametres_dimensionnement.beta;
  const n = Parametres_dimensionnement.nombreTours;

  const rho_dechets_kg_m3 = Parametres_dimensionnement.masseVolumiqueDechets;
  const Qm_dechet_solides_kg_h = Parametres_dimensionnement.debitDechetsSolides;

  // Calculations
  const L_D = Longueur_four_m / Diametre_interne_m;
  const P = Diametre_interne_m ** 2 * Longueur_four_m * 0.21;
  const vitesse_m_s = Debit_fumee_humide_Nm3_h / ((Math.PI * Diametre_interne_m ** 2) / 4) / 3600;
  const pente_mm_m = Math.tan((pente * Math.PI) / 180) * 1000;
  const R_m = Diametre_interne_m / 2;
  const Theta = pente;
  const Temps_sejour_sullivan_min = (1.77 * Longueur_four_m * Math.sqrt(Beta)) / (2 * R_m * n * Theta);
  const Taux_remplissage_Freeman_pourcent = ((Qm_dechet_solides_kg_h / rho_dechets_kg_m3) / 60) / ((Longueur_four_m / Temps_sejour_sullivan_min) * (Math.PI * Math.pow(Diametre_interne_m, 2)) / 4) * 100;

  const P_elec_mise_en_rotation_du_RK_kW = 0.167 * Math.pow(Diametre_externe_m, 2) * Longueur_four_m * 2.25;

  // Results for obstacle adjustment
  const elements_puissance = [
    { text: 'Rapport L/D', value: L_D.toFixed(2) },
    { text: 'Puissance du four [MW]', value: P.toFixed(2) },
    { text: 'Vitesse des fumées [m/s]', value: vitesse_m_s.toFixed(2) },
    { text: 'Pente [mm/m]', value: pente_mm_m.toFixed(2) },
    { text: 'Rayon du four [m]', value: R_m.toFixed(2) },
    { text: 'Temps de séjour (Sullivan) [min]', value: Temps_sejour_sullivan_min.toFixed(2) },
    { text: 'Taux_remplissage du four [%]', value: Taux_remplissage_Freeman_pourcent.toFixed(2) },
    { text: 'Consommation électrique estimée de mise en rotation [kW]', value: P_elec_mise_en_rotation_du_RK_kW.toFixed(2) },
  ];

  // CALCUL DU NOMBRE DE LANCES avec persistance
  const [Parametres_EstimationBruleurLances, setParametres_EstimationBruleurLances] = useState({
    debitDechetsLiquides: getInitialValue('RK_debit_dechets_liquides', 1200),
    typeCombustible: getInitialValue('RK_type_combustible', 'gaz'),
    typeAtomisation: getInitialValue('RK_type_atomisation', 'air')
  });

  const Qm_dechet_kg_h = Parametres_EstimationBruleurLances.debitDechetsLiquides;
  const typeDeCombustible = Parametres_EstimationBruleurLances.typeCombustible;
  const typeAtomisation = Parametres_EstimationBruleurLances.typeAtomisation;

  const puissanceBruleur = P / 2;
  const flammePilote = 1000 * 0.005 * puissanceBruleur;
  const nbLances = Math.ceil(Qm_dechet_kg_h / 1000 / 1.2);
  const nbLancesBackup = Math.ceil(nbLances / 3);
  const volumeAir = nbLances * 0.5;
  const volumeVapeur = nbLances * 0.125;

  let P_gaz_RK_kW = 0;
  let P_fuel_RK_kW = 0;
  if (typeDeCombustible === 'gaz') {
    P_gaz_RK_kW = flammePilote;
  } else if (typeDeCombustible === 'fuel') {
    P_fuel_RK_kW = flammePilote;
  }

  let Qv_air_atomisation_Nm3_h = 0;
  let Qv_vapeur_atomisation_t_h = 0;
  let puissance_elec_Air_co_RK_kW = 0;
  if (typeAtomisation === 'air') {
    Qv_air_atomisation_Nm3_h = volumeAir;
    puissance_elec_Air_co_RK_kW = Qv_air_atomisation_Nm3_h * powerRatio;
  } else if (typeAtomisation === 'vapeur') {
    Qv_vapeur_atomisation_t_h = volumeVapeur;
  }

  const elements_bruleurs_lances = [
    { text: 'Débit déchets liquides [kg/h]', value: Qm_dechet_kg_h.toFixed(0) },
    { text: 'Puissance brûleur [MW]', value: puissanceBruleur.toFixed(2) },
    { text: 'Flamme pilote [kW]', value: flammePilote.toFixed(2) },
    { text: 'Nombre de lances', value: nbLances },
    { text: 'Nombre de lances backup', value: nbLancesBackup },
    { text: 'Volume d\'air [Nm³/h]', value: Qv_air_atomisation_Nm3_h.toFixed(2) },
    { text: 'Volume de vapeur [t/h]', value: Qv_vapeur_atomisation_t_h.toFixed(2) },
    { text: 'Conso élec pour air co [kW]', value: puissance_elec_Air_co_RK_kW.toFixed(2) },
  ];

  // CALCULE REFROIDISSEMENT FACADE avec persistance
  const [Parametres_refroidissement, setParametres_refroidissement] = useState({
    typeEau: getInitialValue('RK_type_eau', 'eau potable'),
    debitEau: getInitialValue('RK_debit_eau', 25),
    temperatureEntree: getInitialValue('RK_temp_entree', 30),
    temperatureSortie: getInitialValue('RK_temp_sortie', 60),
  });

  const TypEau = Parametres_refroidissement.typeEau;
  const Q_eau_m3_h = Parametres_refroidissement.debitEau;
  const T_in_C = Parametres_refroidissement.temperatureEntree;
  const T_out_C = Parametres_refroidissement.temperatureSortie;

  const perteEau_m3_h = Q_eau_m3_h * 0.01;
  const enthalpie_kW = (Q_eau_m3_h * 1000 * CpL_T((T_in_C + T_out_C) / 2) * (T_out_C - T_in_C)) / 3600;
  const puissance_Elec_Pompe_kW = (Q_eau_m3_h / 3600) * 1.5 * 1e5 / 1000;

  let Qv_eau_potable_m3 = 0;
  let Qv_Eau_Refroidissement_m3 = 0;
  let Qv_Eau_Riviere_m3 = 0;
  let Qv_Eau_Demin_m3 = 0;
  let Qv_Eau_Adoucie_m3 = 0;

  switch (TypEau) {
    case 'eau potable':
      Qv_eau_potable_m3 = Q_eau_m3_h;
      break;
    case 'eau de refroidissement':
      Qv_Eau_Refroidissement_m3 = Q_eau_m3_h;
      break;
    case 'eau de rivière':
      Qv_Eau_Riviere_m3 = Q_eau_m3_h;
      break;
    case 'eau déminéralisée':
      Qv_Eau_Demin_m3 = Q_eau_m3_h;
      break;
    case 'eau adoucie':
      Qv_Eau_Adoucie_m3 = Q_eau_m3_h;
      break;
  }

  const Refroidissement_elements = [
    { text: 'Perte en eau [m3/h]', value: perteEau_m3_h.toFixed(2) },
    { text: 'Enthalpie de refroidissement [MW]', value: (enthalpie_kW / 1000).toFixed(2) },
    { text: 'Puissance de la pompe de circulation eau refroidissement [kW]', value: puissance_Elec_Pompe_kW.toFixed(2) },
  ];

  // CALCULE DES PERTES THERMIQUES DE LA PAROI avec persistance
  const [Parametres_pertes_radiatives, setParametres_pertes_radiatives] = useState({
    epaisseurRefractaire: getInitialValue('RK_epaisseur_refractaire', 0.4),
    temperaturePeau: getInitialValue('RK_temp_peau', 300),
  });

  const Epaisseur_refractaire_m = Parametres_pertes_radiatives.epaisseurRefractaire;
  const Temperature_peau_C = Parametres_pertes_radiatives.temperaturePeau;

  const surfaceParoi_m2 = 2 * Math.PI * (Diametre_interne_m + 2 * Epaisseur_refractaire_m) / 2 * Longueur_four_m;
  const pertesRad_MW = (0.9 * 5.67e-8 * ((Temperature_peau_C + 273.159) ** 4 - (10 + 273.159) ** 4) * surfaceParoi_m2) / 1e6;
  const pertesConv_MW = (9 * surfaceParoi_m2 * (Temperature_peau_C - 10)) / 1e6;
  const pertesTotales_MW = pertesRad_MW + pertesConv_MW;

  const part_PertesThermiques = pertesTotales_MW / P * 100;

  const elements_Pertes_Radiatives = [
    { text: 'Surface extérieure du four [m2]', value: surfaceParoi_m2.toFixed(2) },
    { text: 'Pertes thermiques radiatives [MW]', value: pertesRad_MW.toFixed(2) },
    { text: 'Pertes thermiques convectives [MW]', value: pertesConv_MW.toFixed(2) },
    { text: 'Pertes thermiques totales [MW]', value: pertesTotales_MW.toFixed(2) },
    { text: 'Part des Pertes thermiques [%]', value: part_PertesThermiques.toFixed(2) },
  ];

  // CALCULE DU REFROIDISSEMENT DE LA VIROLE avec persistance
  const [Parametres_refroidissement_virole, setParametres_refroidissement_virole] = useState({
    dtRefroidissement: getInitialValue('RK_DT_virole', 80),
  });

  const DT_virole = Parametres_refroidissement_virole.dtRefroidissement;
  const Pertes_radiatives_virole = (0.9 * 5.67e-8 * ((DT_virole + 273.159) ** 4 - (10 + 273.159) ** 4) * surfaceParoi_m2) / 1e6;
  const Pertes_convectives_virole = (7 * surfaceParoi_m2 * (DT_virole - 10)) / 1e6;
  const Pertes_convectives_virole_totale_MW = Pertes_radiatives_virole + Pertes_convectives_virole;
  const Conso_elec_Refroidissement_virole_kW = Pertes_convectives_virole_totale_MW * 1000 / 10;
  const Nb_de_ventilateurs = Math.floor(Conso_elec_Refroidissement_virole_kW / 1.5);

  const elements_Refroidissement_virole = [
    { text: 'Pertes_radiatives_virole [MW]', value: Pertes_radiatives_virole.toFixed(2) },
    { text: 'Pertes_convectives_virole [MW]', value: Pertes_convectives_virole.toFixed(2) },
    { text: 'Pertes_convectives_virole_totale [MW]', value: Pertes_convectives_virole_totale_MW.toFixed(2) },
    { text: 'Consommation électrique pour refroidir la virole [kW]', value: Conso_elec_Refroidissement_virole_kW.toFixed(2) },
    { text: 'Nombre de ventilateurs', value: Nb_de_ventilateurs.toFixed(0) },
  ];

  //CALCULE DIMENSIONNEMENT SCC avec persistance
  const [Parametres_dimensionnement_SCC, setParametres_dimensionnement_SCC] = useState({
    debitHumideFumees: getInitialValue('SCC_debit_fumees', 40722),
    temperatureSCC: getInitialValue('SCC_temperature', 1200),
    diametreSCC: getInitialValue('SCC_diametre', 6),
    tempsSejourDesire: getInitialValue('SCC_temps_sejour', 4)
  });

  const Qv_humide_Nm3_h = Parametres_dimensionnement_SCC.debitHumideFumees;
  const Diametre_SCC_m = Parametres_dimensionnement_SCC.diametreSCC;
  const Tps_sejour_SCC_s = Parametres_dimensionnement_SCC.tempsSejourDesire;
  const T_SCC_C = Parametres_dimensionnement_SCC.temperatureSCC;

  const Qv_humide_m3_h = coeff_Nm3_to_m3(1, T_SCC_C) * Qv_humide_Nm3_h;

  //mettre une limite/alerte à la vitesse calculée du SCC à 3 m/s
  const Vitesse_fumees_SCC_m_s = (Qv_humide_m3_h / 3600) * (1 / Math.pow(Diametre_SCC_m, 2)) * (4 / Math.PI);
  const Hauteur_SCC_m = Vitesse_fumees_SCC_m_s * Tps_sejour_SCC_s;

  const elements_Dimensionnement_SCC = [
    { text: 'Débit des fumées [m3/h]', value: Qv_humide_m3_h.toFixed(2) },
    { text: 'Vitesse des fumées [m/s]', value: Vitesse_fumees_SCC_m_s.toFixed(2) },
    { text: 'Hauteur de la SCC [m]', value: Hauteur_SCC_m.toFixed(2) },
  ];

  // BRULEURS DE LA SCC avec persistance
  const [Parametres_bruleurs_SCC, setParametres_bruleurs_SCC] = useState({
    debitDechetsLiquides: getInitialValue('SCC_debit_dechets', 1000),
    typeCombustibleSCC: getInitialValue('SCC_type_combustible', 'gaz'),
    typeAtomisationSCC: getInitialValue('SCC_type_atomisation', 'air'),
  });

  const typeAtomisationSCC = Parametres_bruleurs_SCC.typeAtomisationSCC;
  const typeDeCombustibleSCC = Parametres_bruleurs_SCC.typeCombustibleSCC;
  const Qm_dechet_liquides_scc_kg_h = Parametres_bruleurs_SCC.debitDechetsLiquides;

  const P_bruleur_SCC_MW = puissanceBruleur / 2;
  const P_flamme_pilote_scc_kW = P_bruleur_SCC_MW * 0.005 * 1000;
  const Nb_lances_SCC = Math.ceil(Qm_dechet_liquides_scc_kg_h / 1000 / 1.2);
  const Nb_lances_backup_SCC = Math.ceil(Nb_lances_SCC / 3);

  let P_gaz_SCC_kW = 0;
  let P_fuel_SCC_kW = 0;
  if (typeDeCombustibleSCC === 'gaz') {
    P_gaz_SCC_kW = P_flamme_pilote_scc_kW;
  } else if (typeDeCombustibleSCC === 'fuel') {
    P_fuel_SCC_kW = P_flamme_pilote_scc_kW;
  }

  const volumeAirSCC = Nb_lances_SCC * 0.5;
  const volumeVapeurSCC = Nb_lances_SCC * 0.125;

  let Qv_air_atomisation_SCC_Nm3_h = 0;
  let Qv_vapeur_atomisation_SCC_t_h = 0;
  let puissance_elec_Air_co_SCC_kW = 0;

  switch (typeAtomisationSCC) {
    case 'air':
      Qv_air_atomisation_SCC_Nm3_h = volumeAirSCC;
      puissance_elec_Air_co_SCC_kW = Qv_air_atomisation_SCC_Nm3_h * powerRatio;
      break;
    case 'vapeur':
      Qv_vapeur_atomisation_SCC_t_h = volumeVapeurSCC;
      break;
    default:
      // Déjà initialisées à 0
      break;
  }

  const elements_bruleurs_SCC = [
    { text: 'Puissance du brûleur SCC [MW]', value: P_bruleur_SCC_MW.toFixed(2) },
    { text: 'Puissance de la flamme pilote [kW]', value: P_flamme_pilote_scc_kW.toFixed(2) },
    { text: 'Nombre de lances [Nb]', value: Nb_lances_SCC.toFixed(0) },
    { text: 'Nombre de lances back-up [Nb]', value: Nb_lances_backup_SCC.toFixed(0) },
    { text: 'Volume air atomisation [Nm3/h]', value: Qv_air_atomisation_SCC_Nm3_h.toFixed(2) },
    { text: 'Volume vapeur atomisation [t/h]', value: Qv_vapeur_atomisation_SCC_t_h.toFixed(2) },
    { text: 'Conso elec air co [kW]', value: puissance_elec_Air_co_SCC_kW.toFixed(2) },
  ];

  // SCC : estimation des pertes thermiques
  const [Estimation_pertes_thermiques_SCC, setEstimation_pertes_thermiques_SCC] = useState({});

  const Surface_SCC_m2 = 2 * Math.PI * Diametre_SCC_m / 2 * Hauteur_SCC_m;
  const Pth_radiatives_SCC_MW = (0.9 * 5.67e-8 * ((T_SCC_C + 273.159) ** 4 - (10 + 273.159) ** 4) * Surface_SCC_m2) / 1e6;
  const Pth_Conv_SCC_MW = (9 * Surface_SCC_m2 * (T_SCC_C - 10)) / 1e6;
  const Pth_totales_SCC_MW = Pth_radiatives_SCC_MW + Pth_Conv_SCC_MW;

  const elements_Pertes_thermiques_SCC = [
    { text: 'Température paroi SCC [°C]', value: T_SCC_C.toFixed(2) },
    { text: 'Hauteur de la SCC [m]', value: Hauteur_SCC_m.toFixed(2) },
    { text: 'Surface SCC [m2]', value: Surface_SCC_m2.toFixed(2) },
    { text: 'Pth_radiatives_SCC_MW', value: Pth_radiatives_SCC_MW.toFixed(2) },
    { text: 'Pth_Conv_SCC_MW', value: Pth_Conv_SCC_MW.toFixed(2) },
    { text: 'Pth_totales_SCC_MW', value: Pth_totales_SCC_MW.toFixed(2) },
  ];

  // Estimation consommation extracteur avec persistance
  const [Estimation_conso_extracteur, setEstimation_conso_extracteur] = useState({
    nbTrappes: getInitialValue('EXT_nb_trappes', 2),
    puissanceUnite: getInitialValue('EXT_puissance_unite', 4),
    masseImbrulees: getInitialValue('EXT_masse_imbrulees', WetBottomAsh_kg_h || 1000),
    typeCamion: getInitialValue('EXT_type_camion', '15t'),
    distance: getInitialValue('EXT_distance', 50),
  });

  const Nb_trappes = Estimation_conso_extracteur.nbTrappes;
  const P_elec_U = Estimation_conso_extracteur.puissanceUnite;
  const Masse_imbrûlees_kg_h = Estimation_conso_extracteur.masseImbrulees;
  const type_camion = Estimation_conso_extracteur.typeCamion;
  const distance_km = Estimation_conso_extracteur.distance;

  const P_elec_extracteur_kW = P_elec_U * Nb_trappes;

  // Calculs liés au transport des matières imbrûlées
  let CO2_transport_kg_km = truck15TCO2;
  let cout_transport_euro_km = truck15TPrice;

  switch (type_camion) {
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
      // Déjà initialisées avec les valeurs par défaut
      break;
  }

  const CO2_transport_total = CO2_transport_kg_km * distance_km * (Masse_imbrûlees_kg_h / 1000);
  const cout_transport_total = cout_transport_euro_km * distance_km;

  const elements_Conso_extracteur = [
    { text: 'Consommation électrique extracteur [kW]', value: P_elec_extracteur_kW.toFixed(2) },
    { text: 'Masse des imbrûlées [kg/h]', value: Masse_imbrûlees_kg_h.toFixed(2) },
    { text: 'CO2 transport [kg/km]', value: CO2_transport_kg_km.toFixed(2) },
    { text: 'Coût transport [€/km]', value: cout_transport_euro_km.toFixed(2) },
    { text: 'CO2 transport total [kg]', value: CO2_transport_total.toFixed(2) },
    { text: 'Coût transport total [€]', value: cout_transport_total.toFixed(2) },
  ];

  // ESTIMATION CONSOMMATEUR ELECTRIQUE VENTILATEUR AIR DE COMBUSTION avec persistance
  const [Estimation_conso_ventilateur_air_combustion, setEstimation_conso_ventilateur_air_combustion] = useState({
    debitVentilateur: getInitialValue('VENT_debit', 1000),
    rendementVentilateur: getInitialValue('VENT_rendement', 0.6),
  });

  const Qv_air_comb_Nm3_h = Estimation_conso_ventilateur_air_combustion.debitVentilateur;
  const Rdt_elec = Estimation_conso_ventilateur_air_combustion.rendementVentilateur;
  const P_elec_ventilo_air_combustion_kW = (Math.abs(100) * Qv_air_comb_Nm3_h * 9.81) / (3600 * 1000 * Rdt_elec);

  const elements_Conso_ventilateur_air_combustion = [
    { text: 'Consommation électrique ventilateur combustion [kW]', value: P_elec_ventilo_air_combustion_kW.toFixed(2) },
  ];

  //estimation de l'eau évaporée avec persistance
  const [Estimation_eau_evap, setEstimation_eau_evap] = useState({
    h2oPourcent: getInitialValue('EAU_H2O_pourcent', 30.5),
    co2Pourcent: getInitialValue('EAU_CO2_pourcent', 8.28),
    tfumProvisoire: getInitialValue('EAU_Tfum', 1200),
    emissiviteFume: getInitialValue('EAU_emissivite', 0.1),
    teauExtracteur: getInitialValue('EAU_T_extracteur', 100),
  });

  const H20pourcent = Estimation_eau_evap.h2oPourcent;
  const CO2pourcent = Estimation_eau_evap.co2Pourcent;
  const Tfum_provisoire = Estimation_eau_evap.tfumProvisoire;
  const emissivitefume = Estimation_eau_evap.emissiviteFume;
  const Teau_extracteur = Estimation_eau_evap.teauExtracteur;
  const S_echange = Math.PI * Math.pow(Diametre_interne_m, 2) / 4;
  const coeff_a = 1;
  const coeff_b = Diametre_interne_m - 2 * coeff_a;
  const coeff_c = Diametre_interne_m;
  const coeff_B = coeff_b / coeff_a;
  const coeff_C = coeff_c / coeff_a;
  const F = (1 + coeff_B ** 2 + coeff_C ** 2 - ((1 + coeff_B ** 2 + coeff_C ** 2) ** 2 - 4 * coeff_B ** 2 * coeff_C ** 2) ** 0.5) / (2 * coeff_B ** 2);
  const FLux_radiatif_kW = F * emissivitefume * 5.67e-8 * ((Tfum_provisoire + 273.159) ** 4 - (Teau_extracteur + 273.159) ** 4) * S_echange / 1000;
  const Eau_evap_extracteur_kg_h = FLux_radiatif_kW / (((hV_T(Teau_extracteur) - hL_T(Teau_extracteur))) / 3600);
  const Eau_evap_elements = [
    { text: 'H20pourcent', value: H20pourcent.toFixed(2) },
    { text: 'CO2pourcent', value: CO2pourcent.toFixed(2) },
    { text: 'Tfum_provisoire', value: Tfum_provisoire.toFixed(2) },
    { text: 'emissivitefume', value: emissivitefume.toFixed(2) },
    { text: 'Teau_extracteur', value: Teau_extracteur.toFixed(2) },
    { text: 'S_echange', value: S_echange.toFixed(2) },
    { text: 'coeff_a', value: coeff_a.toFixed(2) },
    { text: 'coeff_b', value: coeff_b.toFixed(2) },
    { text: 'coeff_c', value: coeff_c.toFixed(2) },
    { text: 'coeff_B', value: coeff_B.toFixed(2) },
    { text: 'coeff_C', value: coeff_C.toFixed(2) },
    { text: 'F', value: F.toFixed(2) },
    { text: 'FLux_radiatif_kW', value: FLux_radiatif_kW.toFixed(2) },
    { text: 'Eau_evap_extracteur_kg_h', value: Eau_evap_extracteur_kg_h.toFixed(2) },
  ];

  // Update parameters handler
  const handleParametresChange = (name, value) => {
    if (isNegative(value)) return;

    // Déterminer quel objet de paramètres mettre à jour
    if (name in PDC_calcul) {
      setPDC_calcul(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_dimensionnement) {
      setParametres_dimensionnement(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_EstimationBruleurLances) {
      setParametres_EstimationBruleurLances(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_refroidissement) {
      setParametres_refroidissement(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_pertes_radiatives) {
      setParametres_pertes_radiatives(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_refroidissement_virole) {
      setParametres_refroidissement_virole(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_dimensionnement_SCC) {
      setParametres_dimensionnement_SCC(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Parametres_bruleurs_SCC) {
      setParametres_bruleurs_SCC(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Estimation_pertes_thermiques_SCC) {
      setEstimation_pertes_thermiques_SCC(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Estimation_conso_extracteur) {
      setEstimation_conso_extracteur(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Estimation_conso_ventilateur_air_combustion) {
      setEstimation_conso_ventilateur_air_combustion(prev => ({
        ...prev,
        [name]: value,
      }));
    } else if (name in Estimation_eau_evap) {
      setEstimation_eau_evap(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // CORRECTION: Gestion sécurisée des consommations de réactifs
  const consommation_reactifs = innerData?.Conso_reactifs || {
    CaCO3: 0,
    CaO: 0,
    CaOH2wet: 0,
    CaOH2dry: 0,
    NaOH: 0,
    NaOHCO3: 0,
    Ammonia: 0,
    NaBrCaBr2: 0,
    CAP: 0,
    cout: 0,
    CO2_transport: 0,
  };

  useEffect(() => {
    if (innerData && setInnerData) {
      // Fonction utilitaire pour limiter à 2 chiffres significatifs
      const toSignificantFigures = (value, figures = 2) => {
        if (value === 0 || value === null || value === undefined) return 0;
        return parseFloat(value.toPrecision(figures));
      };

      // Variables électriques avec limitation à 2 chiffres significatifs
      const consoElec1 = toSignificantFigures(P_elec_mise_en_rotation_du_RK_kW);
      const consoElec2 = toSignificantFigures(puissance_Elec_Pompe_kW);
      const consoElec3 = toSignificantFigures(puissance_elec_Air_co_RK_kW + puissance_elec_Air_co_SCC_kW);
      const consoElec4 = toSignificantFigures(P_elec_ventilo_air_combustion_kW);
      const consoElec5 = toSignificantFigures(Conso_elec_Refroidissement_virole_kW);
      const consoElec6 = toSignificantFigures(P_elec_extracteur_kW);
      const consoElec7 = toSignificantFigures(10); // Pompe à boue
      const consoElec8 = toSignificantFigures(2);  // Tapis

      const labelElec1 = 'Mise_en_rotation du RK';
      const labelElec2 = 'Pompe d\'alimentation des lances';
      const labelElec3 = 'Air comprimé';
      const labelElec4 = 'Ventilateur air de combustion';
      const labelElec5 = 'Ventilateur refroidissement virole';
      const labelElec6 = 'Extracteur';
      const labelElec7 = 'Pompe à boue';
      const labelElec8 = 'Tapis';

      const conso_air_co_N_m3 = toSignificantFigures(Qv_air_atomisation_Nm3_h + Qv_air_atomisation_SCC_Nm3_h);

      const Conso_EauPotable_m3 = toSignificantFigures(Qv_eau_potable_m3);
      const Conso_EauRefroidissement_m3 = toSignificantFigures(Qv_Eau_Refroidissement_m3);
      const Conso_EauDemin_m3 = toSignificantFigures(Qv_Eau_Demin_m3);
      const Conso_EauRiviere_m3 = toSignificantFigures(Qv_Eau_Riviere_m3);
      const Conso_EauAdoucie_m3 = toSignificantFigures(Qv_Eau_Adoucie_m3);

      const Conso_CaCO3_kg = toSignificantFigures(consommation_reactifs.CaCO3);
      const Conso_CaO_kg = toSignificantFigures(consommation_reactifs.CaO);
      const Conso_CaOH2_dry_kg = toSignificantFigures(consommation_reactifs.CaOH2dry);
      const Conso_CaOH2_wet_kg = toSignificantFigures(consommation_reactifs.CaOH2wet);
      const Conso_NaOH_kg = toSignificantFigures(consommation_reactifs.NaOH);
      const Conso_NaOHCO3_kg = toSignificantFigures(consommation_reactifs.NaOHCO3);
      const Conso_Ammonia_kg = toSignificantFigures(consommation_reactifs.Ammonia);
      const Conso_NaBrCaBr2_kg = toSignificantFigures(consommation_reactifs.NaBrCaBr2);
      const Conso_CAP_kg = toSignificantFigures(consommation_reactifs.CAP);

      const conso_gaz_H_MW = toSignificantFigures((P_gaz_RK_kW + P_gaz_SCC_kW) / 1000);
      const conso_gaz_L_MW = toSignificantFigures(0);
      const conso_gaz_Process_MW = toSignificantFigures(0);

      const conso_fuel_MW = toSignificantFigures((P_fuel_RK_kW + P_fuel_SCC_kW) / 1000);

      const conso_incineration_ash_kg_h = toSignificantFigures(Masse_imbrûlees_kg_h);
      const conso_boiler_ash_kg_h = toSignificantFigures(0);
      const conso_fly_ash_kg_h = toSignificantFigures(0);

      const CO2_transport_incineratino_ash = toSignificantFigures(CO2_transport_total);
      const CO2_transport_boiler_ash = toSignificantFigures(0);
      const CO2_transport_fly_ash = toSignificantFigures(0);
      const CO2_transport_reactifs = toSignificantFigures(consommation_reactifs.CO2_transport);

      const cout_transport_incineratino_ash = toSignificantFigures(cout_transport_total);
      const cout_transport_boiler_ash = toSignificantFigures(0);
      const cout_transport_fly_ash = toSignificantFigures(0);
      const cout_transport_reactifs = toSignificantFigures(consommation_reactifs.cout);

      // Paramètres à sauvegarder pour la persistance
      const parametersToSave = {
        // PDC
        PDC_pression_aeraulique: PDC_calcul.pressionAeraulique,
        PDC_mmCE: PDC_calcul.pdcMmCE,

        // Dimensionnement
        RK_diametre_interne: Parametres_dimensionnement.diametreInterne,
        RK_diametre_externe: Parametres_dimensionnement.diametreExterne,
        RK_longueur: Parametres_dimensionnement.longueur,
        RK_pente: Parametres_dimensionnement.pente,
        RK_beta: Parametres_dimensionnement.beta,
        RK_tours: Parametres_dimensionnement.nombreTours,
        RK_hauteur_dechets: Parametres_dimensionnement.hauteurDechets,
        RK_rho_dechets: Parametres_dimensionnement.masseVolumiqueDechets,
        RK_debit_dechets_solides: Parametres_dimensionnement.debitDechetsSolides,

        // Brûleurs
        RK_debit_dechets_liquides: Parametres_EstimationBruleurLances.debitDechetsLiquides,
        RK_type_combustible: Parametres_EstimationBruleurLances.typeCombustible,
        RK_type_atomisation: Parametres_EstimationBruleurLances.typeAtomisation,

        // Refroidissement
        RK_type_eau: Parametres_refroidissement.typeEau,
        RK_debit_eau: Parametres_refroidissement.debitEau,
        RK_temp_entree: Parametres_refroidissement.temperatureEntree,
        RK_temp_sortie: Parametres_refroidissement.temperatureSortie,

        // Pertes radiatives
        RK_epaisseur_refractaire: Parametres_pertes_radiatives.epaisseurRefractaire,
        RK_temp_peau: Parametres_pertes_radiatives.temperaturePeau,

        // Virole
        RK_DT_virole: Parametres_refroidissement_virole.dtRefroidissement,

        // SCC
        SCC_debit_fumees: Parametres_dimensionnement_SCC.debitHumideFumees,
        SCC_temperature: Parametres_dimensionnement_SCC.temperatureSCC,
        SCC_diametre: Parametres_dimensionnement_SCC.diametreSCC,
        SCC_temps_sejour: Parametres_dimensionnement_SCC.tempsSejourDesire,

        // Brûleurs SCC
        SCC_debit_dechets: Parametres_bruleurs_SCC.debitDechetsLiquides,
        SCC_type_combustible: Parametres_bruleurs_SCC.typeCombustibleSCC,
        SCC_type_atomisation: Parametres_bruleurs_SCC.typeAtomisationSCC,

        // Extracteur
        EXT_nb_trappes: Estimation_conso_extracteur.nbTrappes,
        EXT_puissance_unite: Estimation_conso_extracteur.puissanceUnite,
        EXT_masse_imbrulees: Estimation_conso_extracteur.masseImbrulees,
        EXT_type_camion: Estimation_conso_extracteur.typeCamion,
        EXT_distance: Estimation_conso_extracteur.distance,

        // Ventilateur
        VENT_debit: Estimation_conso_ventilateur_air_combustion.debitVentilateur,
        VENT_rendement: Estimation_conso_ventilateur_air_combustion.rendementVentilateur,

        // Eau évaporée
        EAU_H2O_pourcent: Estimation_eau_evap.h2oPourcent,
        EAU_CO2_pourcent: Estimation_eau_evap.co2Pourcent,
        EAU_Tfum: Estimation_eau_evap.tfumProvisoire,
        EAU_emissivite: Estimation_eau_evap.emissiviteFume,
        EAU_T_extracteur: Estimation_eau_evap.teauExtracteur,
      };

      // Mise à jour des données via setInnerData
      setInnerData(prevData => ({
        ...prevData,
        // Variables de résultats pour RK_Opex
        consoElec1,
        consoElec2,
        consoElec3,
        consoElec4,
        consoElec5,
        consoElec6,
        consoElec7,
        consoElec8,
        labelElec1,
        labelElec2,
        labelElec3,
        labelElec4,
        labelElec5,
        labelElec6,
        labelElec7,
        labelElec8,
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
        Conso_CAP_kg,
        cout_transport_total,
        conso_gaz_H_MW,
        conso_gaz_L_MW,
        conso_gaz_Process_MW,
        conso_fuel_MW,
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

        // Paramètres pour la persistance
        ...parametersToSave
      }));
    }
  }, [
    // Dépendances principales
    innerData,
    setInnerData,
    // Variables électriques
    P_elec_mise_en_rotation_du_RK_kW,
    puissance_Elec_Pompe_kW,
    puissance_elec_Air_co_RK_kW,
    puissance_elec_Air_co_SCC_kW,
    P_elec_ventilo_air_combustion_kW,
    Conso_elec_Refroidissement_virole_kW,
    P_elec_extracteur_kW,
    // Variables de débit
    Qv_air_atomisation_Nm3_h,
    Qv_air_atomisation_SCC_Nm3_h,
    // Variables eau
    Qv_eau_potable_m3,
    Qv_Eau_Refroidissement_m3,
    Qv_Eau_Demin_m3,
    Qv_Eau_Riviere_m3,
    Qv_Eau_Adoucie_m3,
    // Variables gaz et fuel
    P_gaz_RK_kW,
    P_gaz_SCC_kW,
    P_fuel_RK_kW,
    P_fuel_SCC_kW,
    // Variables liées à l'extracteur
    Masse_imbrûlees_kg_h,
    type_camion,
    distance_km,
    CO2_transport_total,
    cout_transport_total,
    consommation_reactifs,
    // États pour la persistance
    PDC_calcul,
    Parametres_dimensionnement,
    Parametres_EstimationBruleurLances,
    Parametres_refroidissement,
    Parametres_pertes_radiatives,
    Parametres_refroidissement_virole,
    Parametres_dimensionnement_SCC,
    Parametres_bruleurs_SCC,
    Estimation_conso_extracteur,
    Estimation_conso_ventilateur_air_combustion,
    Estimation_eau_evap
  ]);

  return (
    <div className="cadre_pour_onglet">

      <DisplayDesignComponent
        title={t('aeraulicPressureLoss')}
        imageSrc={fond_transparent}
        imageAlt={t('aeraulicPressureLoss')}
        imageWidth=""
        direction="column"
        parametersObject={PDC_calcul}
        resultsTitle={t('aeraulicPressureLoss')}
        resultsElements={elements_PDC}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('thermicalLossParameters')}
        imageSrc={RK_tps_sejour}
        imageAlt={t('rotaryKilnDesign')}
        imageWidth="80%"
        direction="column"
        parametersObject={Parametres_dimensionnement}
        resultsTitle={t('rotaryKilnDesign')}
        resultsElements={elements_puissance}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      {pente > 5 && (
        <div style={{
          backgroundColor: '#ffebee',
          color: 'red',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          border: '1px solid red'
        }}>
          {t('warningSlope')}
        </div>
      )}

      {Taux_remplissage_Freeman_pourcent > 5 && (
        <div style={{
          backgroundColor: '#ffebee',
          color: 'red',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          border: '1px solid red'
        }}>
          {t('warningFillRate')}
        </div>
      )}

      <DisplayDesignComponent
        title={t('lanceEstimation')}
        imageSrc={RK_front_shield}
        imageAlt={t('lanceEstimation')}
        imageWidth="80%"
        direction="row"
        parametersObject={Parametres_EstimationBruleurLances}
        resultsTitle={t('lanceEstimation')}
        resultsElements={elements_bruleurs_lances}
        onParameterChange={handleParametresChange}
        selectOptions={{
          typeCombustible: ['gaz', 'fuel'],
          typeAtomisation: ['air', 'vapeur']
        }}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('facadeCooling')}
        imageSrc={fond_transparent}
        imageAlt={t('facadeCooling')}
        imageWidth="0%"
        direction="column"
        parametersObject={Parametres_refroidissement}
        resultsTitle={t('facadeCooling')}
        resultsElements={Refroidissement_elements}
        onParameterChange={handleParametresChange}
        selectOptions={{
          typeEau: ['eau potable', 'eau de refroidissement', 'eau déminéralisée', 'eau de rivière', 'eau adoucie'],
        }}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('facadeThermicalLosses')}
        imageSrc={RK_pertes_thermiques}
        imageAlt={t('facadeThermicalLosses')}
        imageWidth="60%"
        direction="column"
        parametersObject={Parametres_pertes_radiatives}
        resultsTitle={t('facadeThermicalLosses')}
        resultsElements={elements_Pertes_Radiatives}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('shellCooling')}
        imageSrc={fond_transparent}
        imageAlt={t('shellCooling')}
        imageWidth="0%"
        direction="column"
        parametersObject={Parametres_refroidissement_virole}
        resultsTitle={t('shellCooling')}
        resultsElements={elements_Refroidissement_virole}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('sccDimensioning')}
        imageSrc={SCC_img}
        imageAlt={t('sccDimensioning')}
        imageWidth="60%"
        direction="row"
        parametersObject={Parametres_dimensionnement_SCC}
        resultsTitle={t('sccDimensioning')}
        resultsElements={elements_Dimensionnement_SCC}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      {Vitesse_fumees_SCC_m_s > 3 && (
        <div style={{
          backgroundColor: '#ffebee',
          color: 'red',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          border: '1px solid red'
        }}>
          {t('warningVelocity')}
        </div>
      )}

      <DisplayDesignComponent
        title={t('sccBurners')}
        imageSrc={fond_transparent}
        imageAlt={t('sccBurners')}
        imageWidth=""
        direction="column"
        parametersObject={Parametres_bruleurs_SCC}
        resultsTitle={t('sccBurners')}
        resultsElements={elements_bruleurs_SCC}
        onParameterChange={handleParametresChange}
        selectOptions={{
          typeCombustibleSCC: ['gaz', 'fuel'],
          typeAtomisationSCC: ['air', 'vapeur']
        }}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('sccThermicalLosses')}
        imageSrc={FondTransparent}
        imageAlt={t('sccThermicalLosses')}
        imageWidth="0%"
        direction="column"
        parametersObject={Estimation_pertes_thermiques_SCC}
        resultsTitle={t('sccThermicalLosses')}
        resultsElements={elements_Pertes_thermiques_SCC}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('extractorConsumption')}
        imageSrc={SCC_extracteur}
        imageAlt={t('extractorConsumption')}
        imageWidth="60%"
        direction="row"
        parametersObject={Estimation_conso_extracteur}
        resultsTitle={t('extractorConsumption')}
        resultsElements={elements_Conso_extracteur}
        onParameterChange={handleParametresChange}
        selectOptions={{
          typeCamion: ['15t', '20t', '25t']
        }}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('combustionAirFan')}
        imageSrc={fond_transparent}
        imageAlt={t('combustionAirFan')}
        imageWidth="0%"
        direction="column"
        parametersObject={Estimation_conso_ventilateur_air_combustion}
        resultsTitle={t('combustionAirFan')}
        resultsElements={elements_Conso_ventilateur_air_combustion}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

      <DisplayDesignComponent
        title={t('extractorWaterEvaporation')}
        imageSrc={SCC_formule}
        imageAlt={t('extractorWaterEvaporation')}
        imageWidth="30%"
        direction="column"
        parametersObject={Estimation_eau_evap}
        resultsTitle={t('extractorWaterEvaporation')}
        resultsElements={Eau_evap_elements}
        onParameterChange={handleParametresChange}
        currentLanguage={languageCode}
        translations={translations}
      />

    </div>

  );
};

export default RKdesign;