import {dataArray_CO2} from '../D_Data_base/dataCO2';
import {dataArray_H2O} from '../D_Data_base/dataH2O';
import {dataArray_CO} from '../D_Data_base/dataCO';
import {dataArray_CO2_H2O} from '../D_Data_base/dataCO2_H2O';
import {dataArray_CO2_CO} from '../D_Data_base/dataCO2_CO';
import {dataArray_H2O_CO} from '../D_Data_base/dataH2O_CO';




const Liste_des_valeurs_pL = [
  0.005,	0.01,	0.01382,	0.01909,	0.02638,	0.03645,	0.05037,	0.0696,	0.09618,	0.1329,	0.1836,	0.2537,	0.3506,	0.4845,	0.6694,	0.925,	1.278,	1.766,	2.44,	3.372,	4.66,	6.438,	8.896,	12.29,	16.99,	23.47,	32.43,	44.81,	61.92,	85.56,	118.2,	163.4	,225.7	,311.9,	431,	595.6,	822.9	,1137	,1571,	2171,	3000,	6000];
const Liste_des_valeurs_pL_superposees = [0.0100,	0.02089	,0.04364,	0.09117,	0.1905	,0.3979	,0.8313,	1.737,	3.628,	7.579	,15.83	,33.08,	69.1,	144.4	,301.6	,630,	1316	,2750	,5744,	12000];
const Liste_des_valeurs_Pt = [0.1,0.50663,1.01325,2.0265,5.06625,10.1325,20.265,30.3975,40.53];
const Liste_des_valeurs_MR = [0.01,0.03,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,0.95,0.97,0.99];

let Pe_inf = 0.1;
let Pe_sup = 0.3;






const trouverValeursEncadrement = (valeur, liste) => {
  let inf = liste[0];
  let sup = liste[liste.length - 1];

  if (valeur <= liste[0]) {
    inf = liste[0];sup = liste[1];return { inf, sup };}
  
    const index = liste.findIndex((v, i) => v <= valeur && liste[i + 1] >= valeur);
  if (index !== -1) {inf = liste[index];sup = liste[index + 1];}
  return { inf, sup };
};


const calculEpsilonExtrapolation = (Pe, Pe_sup, Pe_inf, Epsilon_Pe_sup, Epsilon_Pe_inf) => {
  if (Pe_sup === Pe_inf) return Epsilon_Pe_inf;
  if (Epsilon_Pe_sup <= 0 || Epsilon_Pe_inf <= 0) return 0;
  if (Pe_sup <= 0 || Pe_inf <= 0) return 0;

  let coeffA = Pe / Pe_sup;
  let coeffB = Math.log10(Epsilon_Pe_sup / Epsilon_Pe_inf);
  let coeffC = Math.log10(Pe_sup / Pe_inf);

  let coeffD = coeffB / coeffC;
  return Epsilon_Pe_sup * Math.pow(coeffA, coeffD);
};

export const calculateMR = (param1, param2) => {
  if (param1 + param2 === 0) {
    return 0;
  }
  return param1 / (param1 + param2);
};

// Define the findValue function
const findValue = (Pe, T, pL, dataArray) => {
  const result = dataArray.find(item => 
    item.Pe === Pe && 
    item.T === T && 
    item.pL === pL
  );
  
  return result ? result.valeur : null;
};

// Define the findValue function for superposition
const findValue_superposition = (MR, T, pL, Pt, dataArray) => {
  const result = dataArray.find(item =>  
    item.MR === MR && 
    item.T === T && 
    item.pL === pL &&
    item.Pt === Pt 
  );
  
  return result ? result.valeur : null;
};

// Fonction auxiliaire pour calculer l'extrapolation epsilon pour MR
const calculEpsilonExtrapolationMR = (MR, MR_sup, MR_inf, Epsilon_sup, Epsilon_inf) => {
  if (MR_sup === MR_inf) return Epsilon_inf;
  return Epsilon_inf + (Epsilon_sup - Epsilon_inf) * (MR - MR_inf) / (MR_sup - MR_inf);
};

export let Emissivite_CO2 = (Pe, T, pL) => {return findValue(Pe, T, pL, dataArray_CO2)};
export let Emissivite_CO = (Pe, T, pL) => {return findValue(Pe, T, pL, dataArray_CO)};
export let Emissivite_H2O = (Pe, T, pL) => {return findValue(Pe, T, pL, dataArray_H2O)};
export let Emissivite_CO2_H2O = (MR, T, pL, Pt) => {return findValue_superposition(MR, T, pL, Pt, dataArray_CO2_H2O)};
export let Emissivite_CO2_CO = (MR, T, pL, Pt) => {return findValue_superposition(MR, T, pL, Pt, dataArray_CO2_CO)};
export let Emissivite_H2O_CO = (MR, T, pL, Pt) => {return findValue_superposition(MR, T, pL, Pt, dataArray_H2O_CO)};

//// POUR LIMITER LA BASE DE DONNEES, ON FAIT L'HYPOTHE QUE Pe = Pt

export let Emissivite_CO2_T = (Pe, T, pL) => {
  let lower_T = Math.floor(T / 25) * 25;
  let upper_T = Math.ceil(T / 25) * 25;
  if (upper_T === lower_T) {upper_T = lower_T + 25};
  let { inf: pL_inf, sup: pL_sup } = trouverValeursEncadrement(pL, Liste_des_valeurs_pL);

  let Pe_inf_T_inf_pL_inf = Emissivite_CO2(Pe_inf, lower_T, pL_inf);
  let Pe_inf_T_inf_pL_sup = Emissivite_CO2(Pe_inf, lower_T, pL_sup);
  let Pe_inf_T_sup_pL_inf = Emissivite_CO2(Pe_inf, upper_T, pL_inf);
  let Pe_inf_T_sup_pL_sup = Emissivite_CO2(Pe_inf, upper_T, pL_sup);

  let Pe_sup_T_inf_pL_inf = Emissivite_CO2(Pe_sup, lower_T, pL_inf);
  let Pe_sup_T_inf_pL_sup = Emissivite_CO2(Pe_sup, lower_T, pL_sup);
  let Pe_sup_T_sup_pL_inf = Emissivite_CO2(Pe_sup, upper_T, pL_inf);
  let Pe_sup_T_sup_pL_sup = Emissivite_CO2(Pe_sup, upper_T, pL_sup);

  // Vérifier si les valeurs sont nulles
  if ([Pe_inf_T_inf_pL_inf, Pe_inf_T_inf_pL_sup, Pe_inf_T_sup_pL_inf, Pe_inf_T_sup_pL_sup,
       Pe_sup_T_inf_pL_inf, Pe_sup_T_inf_pL_sup, Pe_sup_T_sup_pL_inf, Pe_sup_T_sup_pL_sup]
       .some(val => val === null)) {
    return 0;
  }

  let T_inf_pL_inf_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_inf_pL_inf, Pe_inf_T_inf_pL_inf);
  let T_inf_pL_sup_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_inf_pL_sup, Pe_inf_T_inf_pL_sup);
  let T_sup_pL_inf_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_sup_pL_inf, Pe_inf_T_sup_pL_inf);
  let T_sup_pL_sup_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_sup_pL_sup, Pe_inf_T_sup_pL_sup);

  let pL_ratio = pL / pL_inf;

  let determinant;
  if (pL_inf === pL_sup) {
    determinant = 1;
  } else {
    determinant = Math.log10(pL_sup / pL_inf);
  }

  let interpolate_pL1, interpolate_pL2;

  if (pL_inf === pL_sup) {
    interpolate_pL1 = T_inf_pL_inf_corrige;
    interpolate_pL2 = T_sup_pL_inf_corrige;
  } else {
    if (T_inf_pL_sup_corrige > 0 && T_inf_pL_inf_corrige > 0) {
      interpolate_pL1 = T_inf_pL_inf_corrige * Math.pow(pL_ratio, (Math.log10(T_inf_pL_sup_corrige / T_inf_pL_inf_corrige) / determinant));
    } else {
      interpolate_pL1 = T_inf_pL_inf_corrige;
    }

    if (T_sup_pL_sup_corrige > 0 && T_sup_pL_inf_corrige > 0) {
      interpolate_pL2 = T_sup_pL_inf_corrige * Math.pow(pL_ratio, (Math.log10(T_sup_pL_sup_corrige / T_sup_pL_inf_corrige) / determinant));
    } else {
      interpolate_pL2 = T_sup_pL_inf_corrige;
    }
  }

  let interpolate_T;

  if (upper_T === lower_T) {
    interpolate_T = interpolate_pL1;
  } else if (pL === 0) {
    interpolate_T = 0;
  } else {
    interpolate_T = interpolate_pL1 + (interpolate_pL2 - interpolate_pL1) * (T - lower_T) / (upper_T - lower_T);
  }

  return interpolate_T;
};

export let Emissivite_H2O_T = (Pe, T, pL) => {
  let lower_T = Math.floor(T / 25) * 25;
  let upper_T = Math.ceil(T / 25) * 25;
  if (upper_T === lower_T) {upper_T = lower_T + 25};
  let { inf: pL_inf, sup: pL_sup } = trouverValeursEncadrement(pL, Liste_des_valeurs_pL);

  let Pe_inf_T_inf_pL_inf = Emissivite_H2O(Pe_inf, lower_T, pL_inf);
  let Pe_inf_T_inf_pL_sup = Emissivite_H2O(Pe_inf, lower_T, pL_sup);
  let Pe_inf_T_sup_pL_inf = Emissivite_H2O(Pe_inf, upper_T, pL_inf);
  let Pe_inf_T_sup_pL_sup = Emissivite_H2O(Pe_inf, upper_T, pL_sup);

  let Pe_sup_T_inf_pL_inf = Emissivite_H2O(Pe_sup, lower_T, pL_inf);
  let Pe_sup_T_inf_pL_sup = Emissivite_H2O(Pe_sup, lower_T, pL_sup);
  let Pe_sup_T_sup_pL_inf = Emissivite_H2O(Pe_sup, upper_T, pL_inf);
  let Pe_sup_T_sup_pL_sup = Emissivite_H2O(Pe_sup, upper_T, pL_sup);

  // Vérifier si les valeurs sont nulles
  if ([Pe_inf_T_inf_pL_inf, Pe_inf_T_inf_pL_sup, Pe_inf_T_sup_pL_inf, Pe_inf_T_sup_pL_sup,
       Pe_sup_T_inf_pL_inf, Pe_sup_T_inf_pL_sup, Pe_sup_T_sup_pL_inf, Pe_sup_T_sup_pL_sup]
       .some(val => val === null)) {
    return 0;
  }

  let T_inf_pL_inf_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_inf_pL_inf, Pe_inf_T_inf_pL_inf);
  let T_inf_pL_sup_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_inf_pL_sup, Pe_inf_T_inf_pL_sup);
  let T_sup_pL_inf_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_sup_pL_inf, Pe_inf_T_sup_pL_inf);
  let T_sup_pL_sup_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_sup_pL_sup, Pe_inf_T_sup_pL_sup);

  let pL_ratio = pL / pL_inf;

  let determinant;
  if (pL_inf === pL_sup) {
    determinant = 1;
  } else {
    determinant = Math.log10(pL_sup / pL_inf);
  }

  let interpolate_pL1, interpolate_pL2;

  if (pL_inf === pL_sup) {
    interpolate_pL1 = T_inf_pL_inf_corrige;
    interpolate_pL2 = T_sup_pL_inf_corrige;
  } else {
    if (T_inf_pL_sup_corrige > 0 && T_inf_pL_inf_corrige > 0) {
      interpolate_pL1 = T_inf_pL_inf_corrige * Math.pow(pL_ratio, (Math.log10(T_inf_pL_sup_corrige / T_inf_pL_inf_corrige) / determinant));
    } else {
      interpolate_pL1 = T_inf_pL_inf_corrige;
    }

    if (T_sup_pL_sup_corrige > 0 && T_sup_pL_inf_corrige > 0) {
      interpolate_pL2 = T_sup_pL_inf_corrige * Math.pow(pL_ratio, (Math.log10(T_sup_pL_sup_corrige / T_sup_pL_inf_corrige) / determinant));
    } else {
      interpolate_pL2 = T_sup_pL_inf_corrige;
    }
  }

  let interpolate_T;

  if (upper_T === lower_T) {
    interpolate_T = interpolate_pL1;
  } else if (pL === 0) {
    interpolate_T = 0;
  } else {
    interpolate_T = interpolate_pL1 + (interpolate_pL2 - interpolate_pL1) * (T - lower_T) / (upper_T - lower_T);
  }

  return interpolate_T;
};

export let Emissivite_CO_T = (Pe, T, pL) => {
  let lower_T = Math.floor(T / 25) * 25;
  let upper_T = Math.ceil(T / 25) * 25;
  if (upper_T === lower_T) {upper_T = lower_T + 25};
  let { inf: pL_inf, sup: pL_sup } = trouverValeursEncadrement(pL, Liste_des_valeurs_pL);

  let Pe_inf_T_inf_pL_inf = Emissivite_CO(Pe_inf, lower_T, pL_inf);
  let Pe_inf_T_inf_pL_sup = Emissivite_CO(Pe_inf, lower_T, pL_sup);
  let Pe_inf_T_sup_pL_inf = Emissivite_CO(Pe_inf, upper_T, pL_inf);
  let Pe_inf_T_sup_pL_sup = Emissivite_CO(Pe_inf, upper_T, pL_sup);

  let Pe_sup_T_inf_pL_inf = Emissivite_CO(Pe_sup, lower_T, pL_inf);
  let Pe_sup_T_inf_pL_sup = Emissivite_CO(Pe_sup, lower_T, pL_sup);
  let Pe_sup_T_sup_pL_inf = Emissivite_CO(Pe_sup, upper_T, pL_inf);
  let Pe_sup_T_sup_pL_sup = Emissivite_CO(Pe_sup, upper_T, pL_sup);

  // Vérifier si les valeurs sont nulles
  if ([Pe_inf_T_inf_pL_inf, Pe_inf_T_inf_pL_sup, Pe_inf_T_sup_pL_inf, Pe_inf_T_sup_pL_sup,
       Pe_sup_T_inf_pL_inf, Pe_sup_T_inf_pL_sup, Pe_sup_T_sup_pL_inf, Pe_sup_T_sup_pL_sup]
       .some(val => val === null)) {
    return 0;
  }

  let T_inf_pL_inf_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_inf_pL_inf, Pe_inf_T_inf_pL_inf);
  let T_inf_pL_sup_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_inf_pL_sup, Pe_inf_T_inf_pL_sup);
  let T_sup_pL_inf_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_sup_pL_inf, Pe_inf_T_sup_pL_inf);
  let T_sup_pL_sup_corrige = calculEpsilonExtrapolation(Pe, Pe_sup, Pe_inf, Pe_sup_T_sup_pL_sup, Pe_inf_T_sup_pL_sup);

  let pL_ratio = pL / pL_inf;

  let determinant;
  if (pL_inf === pL_sup) {
    determinant = 1;
  } else {
    determinant = Math.log10(pL_sup / pL_inf);
  }

  let interpolate_pL1, interpolate_pL2;

  if (pL_inf === pL_sup) {
    interpolate_pL1 = T_inf_pL_inf_corrige;
    interpolate_pL2 = T_sup_pL_inf_corrige;
  } else {
    if (T_inf_pL_sup_corrige > 0 && T_inf_pL_inf_corrige > 0) {
      interpolate_pL1 = T_inf_pL_inf_corrige * Math.pow(pL_ratio, (Math.log10(T_inf_pL_sup_corrige / T_inf_pL_inf_corrige) / determinant));
    } else {
      interpolate_pL1 = T_inf_pL_inf_corrige;
    }

    if (T_sup_pL_sup_corrige > 0 && T_sup_pL_inf_corrige > 0) {
      interpolate_pL2 = T_sup_pL_inf_corrige * Math.pow(pL_ratio, (Math.log10(T_sup_pL_sup_corrige / T_sup_pL_inf_corrige) / determinant));
    } else {
      interpolate_pL2 = T_sup_pL_inf_corrige;
    }
  }

  let interpolate_T;

  if (upper_T === lower_T) {
    interpolate_T = interpolate_pL1;
  } else if (pL === 0) {
    interpolate_T = 0;
  } else {
    interpolate_T = interpolate_pL1 + (interpolate_pL2 - interpolate_pL1) * (T - lower_T) / (upper_T - lower_T);
  }

  return interpolate_T;
};

// Fonction principale corrigée
export const Emissivite_CO2_H2O_T = (MR, T, pL, Pt) => {
  // Calcul des bornes de température
  let lower_T = Math.floor(T / 100) * 100;
  let upper_T = Math.ceil(T / 100) * 100;
  if (upper_T === lower_T) {
    upper_T = lower_T + 100;
  }

  if (Liste_des_valeurs_MR.includes(MR)) {
    MR = MR + 0.0000001;
}

  let { inf: Pt_inf, sup: Pt_sup } = trouverValeursEncadrement(Pt, Liste_des_valeurs_Pt);
  let { inf: MR_inf, sup: MR_sup } = trouverValeursEncadrement(MR, Liste_des_valeurs_MR);
  let { inf: pL_inf, sup: pL_sup } = trouverValeursEncadrement(pL, Liste_des_valeurs_pL_superposees);

  // ON CHERCHE LES VALEURS BRUTES
  let T_inf_MR_inf_pL_inf_Pt_inf = Emissivite_CO2_H2O(MR_inf, lower_T, pL_inf, Pt_inf);
  let T_inf_MR_inf_pL_inf_Pt_sup = Emissivite_CO2_H2O(MR_inf, lower_T, pL_inf, Pt_sup);
  let T_inf_MR_inf_pL_sup_Pt_inf = Emissivite_CO2_H2O(MR_inf, lower_T, pL_sup, Pt_inf);
  let T_inf_MR_inf_pL_sup_Pt_sup = Emissivite_CO2_H2O(MR_inf, lower_T, pL_sup, Pt_sup);

  let T_sup_MR_inf_pL_inf_Pt_inf = Emissivite_CO2_H2O(MR_inf, upper_T, pL_inf, Pt_inf);
  let T_sup_MR_inf_pL_inf_Pt_sup = Emissivite_CO2_H2O(MR_inf, upper_T, pL_inf, Pt_sup);
  let T_sup_MR_inf_pL_sup_Pt_inf = Emissivite_CO2_H2O(MR_inf, upper_T, pL_sup, Pt_inf);
  let T_sup_MR_inf_pL_sup_Pt_sup = Emissivite_CO2_H2O(MR_inf, upper_T, pL_sup, Pt_sup);

  let T_inf_MR_sup_pL_inf_Pt_inf = Emissivite_CO2_H2O(MR_sup, lower_T, pL_inf, Pt_inf);
  let T_inf_MR_sup_pL_inf_Pt_sup = Emissivite_CO2_H2O(MR_sup, lower_T, pL_inf, Pt_sup);
  let T_inf_MR_sup_pL_sup_Pt_inf = Emissivite_CO2_H2O(MR_sup, lower_T, pL_sup, Pt_inf);
  let T_inf_MR_sup_pL_sup_Pt_sup = Emissivite_CO2_H2O(MR_sup, lower_T, pL_sup, Pt_sup);

  let T_sup_MR_sup_pL_inf_Pt_inf = Emissivite_CO2_H2O(MR_sup, upper_T, pL_inf, Pt_inf);
  let T_sup_MR_sup_pL_inf_Pt_sup = Emissivite_CO2_H2O(MR_sup, upper_T, pL_inf, Pt_sup);
  let T_sup_MR_sup_pL_sup_Pt_inf = Emissivite_CO2_H2O(MR_sup, upper_T, pL_sup, Pt_inf);
  let T_sup_MR_sup_pL_sup_Pt_sup = Emissivite_CO2_H2O(MR_sup, upper_T, pL_sup, Pt_sup);

  // Vérifier si des valeurs sont nulles
  const allValues = [
    T_inf_MR_inf_pL_inf_Pt_inf, T_inf_MR_inf_pL_inf_Pt_sup, T_inf_MR_inf_pL_sup_Pt_inf, T_inf_MR_inf_pL_sup_Pt_sup,
    T_sup_MR_inf_pL_inf_Pt_inf, T_sup_MR_inf_pL_inf_Pt_sup, T_sup_MR_inf_pL_sup_Pt_inf, T_sup_MR_inf_pL_sup_Pt_sup,
    T_inf_MR_sup_pL_inf_Pt_inf, T_inf_MR_sup_pL_inf_Pt_sup, T_inf_MR_sup_pL_sup_Pt_inf, T_inf_MR_sup_pL_sup_Pt_sup,
    T_sup_MR_sup_pL_inf_Pt_inf, T_sup_MR_sup_pL_inf_Pt_sup, T_sup_MR_sup_pL_sup_Pt_inf, T_sup_MR_sup_pL_sup_Pt_sup
  ];

  // Remplacer les valeurs nulles par 0
  if (T_inf_MR_inf_pL_inf_Pt_inf === null) T_inf_MR_inf_pL_inf_Pt_inf = 0;
  if (T_inf_MR_inf_pL_inf_Pt_sup === null) T_inf_MR_inf_pL_inf_Pt_sup = 0;
  if (T_inf_MR_inf_pL_sup_Pt_inf === null) T_inf_MR_inf_pL_sup_Pt_inf = 0;
  if (T_inf_MR_inf_pL_sup_Pt_sup === null) T_inf_MR_inf_pL_sup_Pt_sup = 0;
  if (T_sup_MR_inf_pL_inf_Pt_inf === null) T_sup_MR_inf_pL_inf_Pt_inf = 0;
  if (T_sup_MR_inf_pL_inf_Pt_sup === null) T_sup_MR_inf_pL_inf_Pt_sup = 0;
  if (T_sup_MR_inf_pL_sup_Pt_inf === null) T_sup_MR_inf_pL_sup_Pt_inf = 0;
  if (T_sup_MR_inf_pL_sup_Pt_sup === null) T_sup_MR_inf_pL_sup_Pt_sup = 0;
  if (T_inf_MR_sup_pL_inf_Pt_inf === null) T_inf_MR_sup_pL_inf_Pt_inf = 0;
  if (T_inf_MR_sup_pL_inf_Pt_sup === null) T_inf_MR_sup_pL_inf_Pt_sup = 0;
  if (T_inf_MR_sup_pL_sup_Pt_inf === null) T_inf_MR_sup_pL_sup_Pt_inf = 0;
  if (T_inf_MR_sup_pL_sup_Pt_sup === null) T_inf_MR_sup_pL_sup_Pt_sup = 0;
  if (T_sup_MR_sup_pL_inf_Pt_inf === null) T_sup_MR_sup_pL_inf_Pt_inf = 0;
  if (T_sup_MR_sup_pL_inf_Pt_sup === null) T_sup_MR_sup_pL_inf_Pt_sup = 0;
  if (T_sup_MR_sup_pL_sup_Pt_inf === null) T_sup_MR_sup_pL_sup_Pt_inf = 0;
  if (T_sup_MR_sup_pL_sup_Pt_sup === null) T_sup_MR_sup_pL_sup_Pt_sup = 0;

  // SUR BASE DES VALEURS PRECEDENTES, ON EXTRAPOLE A LA TEMPERATURE REELLE
  const ratio_T = (T - lower_T) / (upper_T - lower_T);

  let MR_inf_pL_inf_Pt_inf;
  let MR_inf_pL_inf_Pt_sup;
  let MR_inf_pL_sup_Pt_inf;
  let MR_inf_pL_sup_Pt_sup;
  let MR_sup_pL_inf_Pt_inf;
  let MR_sup_pL_inf_Pt_sup;
  let MR_sup_pL_sup_Pt_inf;
  let MR_sup_pL_sup_Pt_sup;

  if (T > lower_T && upper_T > lower_T) {
    MR_inf_pL_inf_Pt_inf = T_inf_MR_inf_pL_inf_Pt_inf + (T_sup_MR_inf_pL_inf_Pt_inf - T_inf_MR_inf_pL_inf_Pt_inf) * ratio_T;
    MR_inf_pL_inf_Pt_sup = T_inf_MR_inf_pL_inf_Pt_sup + (T_sup_MR_inf_pL_inf_Pt_sup - T_inf_MR_inf_pL_inf_Pt_sup) * ratio_T;
    MR_inf_pL_sup_Pt_inf = T_inf_MR_inf_pL_sup_Pt_inf + (T_sup_MR_inf_pL_sup_Pt_inf - T_inf_MR_inf_pL_sup_Pt_inf) * ratio_T;
    MR_inf_pL_sup_Pt_sup = T_inf_MR_inf_pL_sup_Pt_sup + (T_sup_MR_inf_pL_sup_Pt_sup - T_inf_MR_inf_pL_sup_Pt_sup) * ratio_T;
    MR_sup_pL_inf_Pt_inf = T_inf_MR_sup_pL_inf_Pt_inf + (T_sup_MR_sup_pL_inf_Pt_inf - T_inf_MR_sup_pL_inf_Pt_inf) * ratio_T;
    MR_sup_pL_inf_Pt_sup = T_inf_MR_sup_pL_inf_Pt_sup + (T_sup_MR_sup_pL_inf_Pt_sup - T_inf_MR_sup_pL_inf_Pt_sup) * ratio_T;
    MR_sup_pL_sup_Pt_inf = T_inf_MR_sup_pL_sup_Pt_inf + (T_sup_MR_sup_pL_sup_Pt_inf - T_inf_MR_sup_pL_sup_Pt_inf) * ratio_T;
    MR_sup_pL_sup_Pt_sup = T_inf_MR_sup_pL_sup_Pt_sup + (T_sup_MR_sup_pL_sup_Pt_sup - T_inf_MR_sup_pL_sup_Pt_sup) * ratio_T;
  } else {
    MR_inf_pL_inf_Pt_inf = T_inf_MR_inf_pL_inf_Pt_inf;
    MR_inf_pL_inf_Pt_sup = T_inf_MR_inf_pL_inf_Pt_sup;
    MR_inf_pL_sup_Pt_inf = T_inf_MR_inf_pL_sup_Pt_inf;
    MR_inf_pL_sup_Pt_sup = T_inf_MR_inf_pL_sup_Pt_sup;
    MR_sup_pL_inf_Pt_inf = T_inf_MR_sup_pL_inf_Pt_inf;
    MR_sup_pL_inf_Pt_sup = T_inf_MR_sup_pL_inf_Pt_sup;
    MR_sup_pL_sup_Pt_inf = T_inf_MR_sup_pL_sup_Pt_inf;
    MR_sup_pL_sup_Pt_sup = T_inf_MR_sup_pL_sup_Pt_sup;
  }

  // SUR BASE DES VALEURS PRECEDENTES, ON EXTRAPOLE ET CON CORRIGE EN FONCTION DE LA PRESSION Pt RELLE
  let Pt_ratio = Pt / Pt_inf;

  if (Pt === Pt_inf) {Pt_ratio = 1};
  const Pt_delta = Math.log10(Pt_sup) - Math.log10(Pt_inf);

  let MR_inf_pL_inf;
  let MR_inf_pL_sup;
  let MR_sup_pL_inf;
  let MR_sup_pL_sup;

  if (Pt > Pt_inf && Pt_sup > Pt_inf) {
    if (MR_inf_pL_inf_Pt_sup > 0 && MR_inf_pL_inf_Pt_inf > 0) {
      MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_inf_pL_inf_Pt_sup / MR_inf_pL_inf_Pt_inf)) / Pt_delta);
    } else {
      MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf;
    }
    
    if (MR_inf_pL_sup_Pt_sup > 0 && MR_inf_pL_sup_Pt_inf > 0) {
      MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_inf_pL_sup_Pt_sup / MR_inf_pL_sup_Pt_inf)) / Pt_delta);
    } else {
      MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf;
    }
    
    if (MR_sup_pL_inf_Pt_sup > 0 && MR_sup_pL_inf_Pt_inf > 0) {
      MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_sup_pL_inf_Pt_sup / MR_sup_pL_inf_Pt_inf)) / Pt_delta);
    } else {
      MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf;
    }
    
    if (MR_sup_pL_sup_Pt_sup > 0 && MR_sup_pL_sup_Pt_inf > 0) {
      MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_sup_pL_sup_Pt_sup / MR_sup_pL_sup_Pt_inf)) / Pt_delta);
    } else {
      MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf;
    }
  } else {
    MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf;
    MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf;
    MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf;
    MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf;
  }

  let interpolate1, interpolate2;

  if (MR_sup > MR_inf) {
    interpolate1 = MR_inf_pL_inf + (MR_sup_pL_inf - MR_inf_pL_inf) / (MR_sup - MR_inf) * (MR - MR_inf);
    interpolate2 = MR_inf_pL_sup + (MR_sup_pL_sup - MR_inf_pL_sup) / (MR_sup - MR_inf) * (MR - MR_inf);
  } else {
    interpolate1 = MR_inf_pL_inf;
    interpolate2 = MR_inf_pL_sup;
  }

  let emissivite_CO2H20;

  if (interpolate1 === interpolate2) {
    emissivite_CO2H20 = interpolate1;
  } else if (interpolate1 === 0) {
    emissivite_CO2H20 = 0;
  } else if (pL_inf === pL_sup) {
    emissivite_CO2H20 = interpolate1;
  } else {
    if (interpolate2 > 0 && interpolate1 > 0) {
      let exposant = Math.log10(interpolate2 / interpolate1) / Math.log10(pL_sup / pL_inf);
      emissivite_CO2H20 = interpolate1 * Math.pow(pL / pL_inf, exposant);
    } else {
      emissivite_CO2H20 = interpolate1;
    }
  }

  return emissivite_CO2H20;
};

// Fonction principale corrigée
export const Emissivite_CO2_CO_T = (MR, T, pL, Pt) => {
  // Calcul des bornes de température
  let lower_T = Math.floor(T / 100) * 100;
  let upper_T = Math.ceil(T / 100) * 100;
  if (upper_T === lower_T) {
    upper_T = lower_T + 100;
  }

  if (Liste_des_valeurs_MR.includes(MR)) {
    MR = MR + 0.0000001;
}


  let { inf: Pt_inf, sup: Pt_sup } = trouverValeursEncadrement(Pt, Liste_des_valeurs_Pt);
  let { inf: MR_inf, sup: MR_sup } = trouverValeursEncadrement(MR, Liste_des_valeurs_MR);
  let { inf: pL_inf, sup: pL_sup } = trouverValeursEncadrement(pL, Liste_des_valeurs_pL_superposees);

  // ON CHERCHE LES VALEURS BRUTES
  let T_inf_MR_inf_pL_inf_Pt_inf = Emissivite_CO2_CO(MR_inf, lower_T, pL_inf, Pt_inf);
  let T_inf_MR_inf_pL_inf_Pt_sup = Emissivite_CO2_CO(MR_inf, lower_T, pL_inf, Pt_sup);
  let T_inf_MR_inf_pL_sup_Pt_inf = Emissivite_CO2_CO(MR_inf, lower_T, pL_sup, Pt_inf);
  let T_inf_MR_inf_pL_sup_Pt_sup = Emissivite_CO2_CO(MR_inf, lower_T, pL_sup, Pt_sup);

  let T_sup_MR_inf_pL_inf_Pt_inf = Emissivite_CO2_CO(MR_inf, upper_T, pL_inf, Pt_inf);
  let T_sup_MR_inf_pL_inf_Pt_sup = Emissivite_CO2_CO(MR_inf, upper_T, pL_inf, Pt_sup);
  let T_sup_MR_inf_pL_sup_Pt_inf = Emissivite_CO2_CO(MR_inf, upper_T, pL_sup, Pt_inf);
  let T_sup_MR_inf_pL_sup_Pt_sup = Emissivite_CO2_CO(MR_inf, upper_T, pL_sup, Pt_sup);

  let T_inf_MR_sup_pL_inf_Pt_inf = Emissivite_CO2_CO(MR_sup, lower_T, pL_inf, Pt_inf);
  let T_inf_MR_sup_pL_inf_Pt_sup = Emissivite_CO2_CO(MR_sup, lower_T, pL_inf, Pt_sup);
  let T_inf_MR_sup_pL_sup_Pt_inf = Emissivite_CO2_CO(MR_sup, lower_T, pL_sup, Pt_inf);
  let T_inf_MR_sup_pL_sup_Pt_sup = Emissivite_CO2_CO(MR_sup, lower_T, pL_sup, Pt_sup);

  let T_sup_MR_sup_pL_inf_Pt_inf = Emissivite_CO2_CO(MR_sup, upper_T, pL_inf, Pt_inf);
  let T_sup_MR_sup_pL_inf_Pt_sup = Emissivite_CO2_CO(MR_sup, upper_T, pL_inf, Pt_sup);
  let T_sup_MR_sup_pL_sup_Pt_inf = Emissivite_CO2_CO(MR_sup, upper_T, pL_sup, Pt_inf);
  let T_sup_MR_sup_pL_sup_Pt_sup = Emissivite_CO2_CO(MR_sup, upper_T, pL_sup, Pt_sup);

  // Remplacer les valeurs nulles par 0
  if (T_inf_MR_inf_pL_inf_Pt_inf === null) T_inf_MR_inf_pL_inf_Pt_inf = 0;
  if (T_inf_MR_inf_pL_inf_Pt_sup === null) T_inf_MR_inf_pL_inf_Pt_sup = 0;
  if (T_inf_MR_inf_pL_sup_Pt_inf === null) T_inf_MR_inf_pL_sup_Pt_inf = 0;
  if (T_inf_MR_inf_pL_sup_Pt_sup === null) T_inf_MR_inf_pL_sup_Pt_sup = 0;
  if (T_sup_MR_inf_pL_inf_Pt_inf === null) T_sup_MR_inf_pL_inf_Pt_inf = 0;
  if (T_sup_MR_inf_pL_inf_Pt_sup === null) T_sup_MR_inf_pL_inf_Pt_sup = 0;
  if (T_sup_MR_inf_pL_sup_Pt_inf === null) T_sup_MR_inf_pL_sup_Pt_inf = 0;
  if (T_sup_MR_inf_pL_sup_Pt_sup === null) T_sup_MR_inf_pL_sup_Pt_sup = 0;
  if (T_inf_MR_sup_pL_inf_Pt_inf === null) T_inf_MR_sup_pL_inf_Pt_inf = 0;
  if (T_inf_MR_sup_pL_inf_Pt_sup === null) T_inf_MR_sup_pL_inf_Pt_sup = 0;
  if (T_inf_MR_sup_pL_sup_Pt_inf === null) T_inf_MR_sup_pL_sup_Pt_inf = 0;
  if (T_inf_MR_sup_pL_sup_Pt_sup === null) T_inf_MR_sup_pL_sup_Pt_sup = 0;
  if (T_sup_MR_sup_pL_inf_Pt_inf === null) T_sup_MR_sup_pL_inf_Pt_inf = 0;
  if (T_sup_MR_sup_pL_inf_Pt_sup === null) T_sup_MR_sup_pL_inf_Pt_sup = 0;
  if (T_sup_MR_sup_pL_sup_Pt_inf === null) T_sup_MR_sup_pL_sup_Pt_inf = 0;
  if (T_sup_MR_sup_pL_sup_Pt_sup === null) T_sup_MR_sup_pL_sup_Pt_sup = 0;


  console.log('T_inf_MR_inf_pL_inf_Pt_inf:', T_inf_MR_inf_pL_inf_Pt_inf);
  console.log('T_inf_MR_inf_pL_inf_Pt_sup:', T_inf_MR_inf_pL_inf_Pt_sup);
  console.log('T_inf_MR_inf_pL_sup_Pt_inf:', T_inf_MR_inf_pL_sup_Pt_inf);
  console.log('T_inf_MR_inf_pL_sup_Pt_sup:', T_inf_MR_inf_pL_sup_Pt_sup);
  console.log('T_sup_MR_inf_pL_inf_Pt_inf:', T_sup_MR_inf_pL_inf_Pt_inf);
  console.log('T_sup_MR_inf_pL_inf_Pt_sup:', T_sup_MR_inf_pL_inf_Pt_sup);
  console.log('T_sup_MR_inf_pL_sup_Pt_inf:', T_sup_MR_inf_pL_sup_Pt_inf);
  console.log('T_sup_MR_inf_pL_sup_Pt_sup:', T_sup_MR_inf_pL_sup_Pt_sup);
  console.log('T_inf_MR_sup_pL_inf_Pt_inf:', T_inf_MR_sup_pL_inf_Pt_inf);
  console.log('T_inf_MR_sup_pL_inf_Pt_sup:', T_inf_MR_sup_pL_inf_Pt_sup);
  console.log('T_inf_MR_sup_pL_sup_Pt_inf:', T_inf_MR_sup_pL_sup_Pt_inf);
  console.log('T_inf_MR_sup_pL_sup_Pt_sup:', T_inf_MR_sup_pL_sup_Pt_sup);
  console.log('T_sup_MR_sup_pL_inf_Pt_inf:', T_sup_MR_sup_pL_inf_Pt_inf);
  console.log('T_sup_MR_sup_pL_inf_Pt_sup:', T_sup_MR_sup_pL_inf_Pt_sup);
  console.log('T_sup_MR_sup_pL_sup_Pt_inf:', T_sup_MR_sup_pL_sup_Pt_inf);
  console.log('T_sup_MR_sup_pL_sup_Pt_sup:', T_sup_MR_sup_pL_sup_Pt_sup);





  // SUR BASE DES VALEURS PRECEDENTES, ON EXTRAPOLE A LA TEMPERATURE REELLE
  const ratio_T = (T - lower_T) / (upper_T - lower_T);

  let MR_inf_pL_inf_Pt_inf;
  let MR_inf_pL_inf_Pt_sup;
  let MR_inf_pL_sup_Pt_inf;
  let MR_inf_pL_sup_Pt_sup;
  let MR_sup_pL_inf_Pt_inf;
  let MR_sup_pL_inf_Pt_sup;
  let MR_sup_pL_sup_Pt_inf;
  let MR_sup_pL_sup_Pt_sup;

  if (T > lower_T && upper_T > lower_T) {
    MR_inf_pL_inf_Pt_inf = T_inf_MR_inf_pL_inf_Pt_inf + (T_sup_MR_inf_pL_inf_Pt_inf - T_inf_MR_inf_pL_inf_Pt_inf) * ratio_T;
    MR_inf_pL_inf_Pt_sup = T_inf_MR_inf_pL_inf_Pt_sup + (T_sup_MR_inf_pL_inf_Pt_sup - T_inf_MR_inf_pL_inf_Pt_sup) * ratio_T;
    MR_inf_pL_sup_Pt_inf = T_inf_MR_inf_pL_sup_Pt_inf + (T_sup_MR_inf_pL_sup_Pt_inf - T_inf_MR_inf_pL_sup_Pt_inf) * ratio_T;
    MR_inf_pL_sup_Pt_sup = T_inf_MR_inf_pL_sup_Pt_sup + (T_sup_MR_inf_pL_sup_Pt_sup - T_inf_MR_inf_pL_sup_Pt_sup) * ratio_T;
    MR_sup_pL_inf_Pt_inf = T_inf_MR_sup_pL_inf_Pt_inf + (T_sup_MR_sup_pL_inf_Pt_inf - T_inf_MR_sup_pL_inf_Pt_inf) * ratio_T;
    MR_sup_pL_inf_Pt_sup = T_inf_MR_sup_pL_inf_Pt_sup + (T_sup_MR_sup_pL_inf_Pt_sup - T_inf_MR_sup_pL_inf_Pt_sup) * ratio_T;
    MR_sup_pL_sup_Pt_inf = T_inf_MR_sup_pL_sup_Pt_inf + (T_sup_MR_sup_pL_sup_Pt_inf - T_inf_MR_sup_pL_sup_Pt_inf) * ratio_T;
    MR_sup_pL_sup_Pt_sup = T_inf_MR_sup_pL_sup_Pt_sup + (T_sup_MR_sup_pL_sup_Pt_sup - T_inf_MR_sup_pL_sup_Pt_sup) * ratio_T;
  } else {
    MR_inf_pL_inf_Pt_inf = T_inf_MR_inf_pL_inf_Pt_inf;
    MR_inf_pL_inf_Pt_sup = T_inf_MR_inf_pL_inf_Pt_sup;
    MR_inf_pL_sup_Pt_inf = T_inf_MR_inf_pL_sup_Pt_inf;
    MR_inf_pL_sup_Pt_sup = T_inf_MR_inf_pL_sup_Pt_sup;
    MR_sup_pL_inf_Pt_inf = T_inf_MR_sup_pL_inf_Pt_inf;
    MR_sup_pL_inf_Pt_sup = T_inf_MR_sup_pL_inf_Pt_sup;
    MR_sup_pL_sup_Pt_inf = T_inf_MR_sup_pL_sup_Pt_inf;
    MR_sup_pL_sup_Pt_sup = T_inf_MR_sup_pL_sup_Pt_sup;
  }

  // SUR BASE DES VALEURS PRECEDENTES, ON EXTRAPOLE ET CON CORRIGE EN FONCTION DE LA PRESSION Pt RELLE
  let Pt_ratio = Pt / Pt_inf;

  if (Pt === Pt_inf) {Pt_ratio = 1};
  const Pt_delta = Math.log10(Pt_sup) - Math.log10(Pt_inf);

  let MR_inf_pL_inf;
  let MR_inf_pL_sup;
  let MR_sup_pL_inf;
  let MR_sup_pL_sup;

  if (Pt > Pt_inf && Pt_sup > Pt_inf) {
    if (MR_inf_pL_inf_Pt_sup > 0 && MR_inf_pL_inf_Pt_inf > 0) {
      MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_inf_pL_inf_Pt_sup / MR_inf_pL_inf_Pt_inf)) / Pt_delta);
    } else {
      MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf;
    }
    
    if (MR_inf_pL_sup_Pt_sup > 0 && MR_inf_pL_sup_Pt_inf > 0) {
      MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_inf_pL_sup_Pt_sup / MR_inf_pL_sup_Pt_inf)) / Pt_delta);
    } else {
      MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf;
    }
    
    if (MR_sup_pL_inf_Pt_sup > 0 && MR_sup_pL_inf_Pt_inf > 0) {
      MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_sup_pL_inf_Pt_sup / MR_sup_pL_inf_Pt_inf)) / Pt_delta);
    } else {
      MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf;
    }
    
    if (MR_sup_pL_sup_Pt_sup > 0 && MR_sup_pL_sup_Pt_inf > 0) {
      MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_sup_pL_sup_Pt_sup / MR_sup_pL_sup_Pt_inf)) / Pt_delta);
    } else {
      MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf;
    }
  } else {
    MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf;
    MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf;
    MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf;
    MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf;
  }

  let interpolate1, interpolate2;

  if (MR_sup > MR_inf) {
    interpolate1 = MR_inf_pL_inf + (MR_sup_pL_inf - MR_inf_pL_inf) / (MR_sup - MR_inf) * (MR - MR_inf);
    interpolate2 = MR_inf_pL_sup + (MR_sup_pL_sup - MR_inf_pL_sup) / (MR_sup - MR_inf) * (MR - MR_inf);
  } else {
    interpolate1 = MR_inf_pL_inf;
    interpolate2 = MR_inf_pL_sup;
  }

  let emissivite_CO2CO;

  if (interpolate1 === interpolate2) {
    emissivite_CO2CO = interpolate1;
  } else if (interpolate1 === 0) {
    emissivite_CO2CO = 0;
  } else if (pL_inf === pL_sup) {
    emissivite_CO2CO = interpolate1;
  } else {
    if (interpolate2 > 0 && interpolate1 > 0) {
      let exposant = Math.log10(interpolate2 / interpolate1) / Math.log10(pL_sup / pL_inf);
      emissivite_CO2CO = interpolate1 * Math.pow(pL / pL_inf, exposant);
    } else {
      emissivite_CO2CO = interpolate1;
    }
  }

  return emissivite_CO2CO;
};


export const Emissivite_H2O_CO2_CO_T = (Emissivite_H2O_T, Emissivite_CO2_T, Emissivite_CO_T, Emissivite_H2O_CO_T, Emissivite_CO2_CO_T) => {
  const firstValue = Emissivite_H2O_T * Emissivite_CO2_T * Emissivite_CO_T;
  const secondValue = Math.max(0, Emissivite_CO2_CO_T + Emissivite_H2O_CO_T -Emissivite_CO_T);
  return Math.max(firstValue, secondValue);
};

export const Emissivite_H2O_CO_T = (MR, T, pL, Pt) => {
  // Calcul des bornes de température
  let lower_T = Math.floor(T / 100) * 100;
  let upper_T = Math.ceil(T / 100) * 100;
  if (upper_T === lower_T) {
    upper_T = lower_T + 100;
  }

  if (Liste_des_valeurs_MR.includes(MR)) {
    MR = MR + 0.0000001;
}
  let { inf: Pt_inf, sup: Pt_sup } = trouverValeursEncadrement(Pt, Liste_des_valeurs_Pt);
  let { inf: MR_inf, sup: MR_sup } = trouverValeursEncadrement(MR, Liste_des_valeurs_MR);
  let { inf: pL_inf, sup: pL_sup } = trouverValeursEncadrement(pL, Liste_des_valeurs_pL_superposees);

  // ON CHERCHE LES VALEURS BRUTES
  let T_inf_MR_inf_pL_inf_Pt_inf = Emissivite_H2O_CO(MR_inf, lower_T, pL_inf, Pt_inf);
  let T_inf_MR_inf_pL_inf_Pt_sup = Emissivite_H2O_CO(MR_inf, lower_T, pL_inf, Pt_sup);
  let T_inf_MR_inf_pL_sup_Pt_inf = Emissivite_H2O_CO(MR_inf, lower_T, pL_sup, Pt_inf);
  let T_inf_MR_inf_pL_sup_Pt_sup = Emissivite_H2O_CO(MR_inf, lower_T, pL_sup, Pt_sup);

  let T_sup_MR_inf_pL_inf_Pt_inf = Emissivite_H2O_CO(MR_inf, upper_T, pL_inf, Pt_inf);
  let T_sup_MR_inf_pL_inf_Pt_sup = Emissivite_H2O_CO(MR_inf, upper_T, pL_inf, Pt_sup);
  let T_sup_MR_inf_pL_sup_Pt_inf = Emissivite_H2O_CO(MR_inf, upper_T, pL_sup, Pt_inf);
  let T_sup_MR_inf_pL_sup_Pt_sup = Emissivite_H2O_CO(MR_inf, upper_T, pL_sup, Pt_sup);

  let T_inf_MR_sup_pL_inf_Pt_inf = Emissivite_H2O_CO(MR_sup, lower_T, pL_inf, Pt_inf);
  let T_inf_MR_sup_pL_inf_Pt_sup = Emissivite_H2O_CO(MR_sup, lower_T, pL_inf, Pt_sup);
  let T_inf_MR_sup_pL_sup_Pt_inf = Emissivite_H2O_CO(MR_sup, lower_T, pL_sup, Pt_inf);
  let T_inf_MR_sup_pL_sup_Pt_sup = Emissivite_H2O_CO(MR_sup, lower_T, pL_sup, Pt_sup);

  let T_sup_MR_sup_pL_inf_Pt_inf = Emissivite_H2O_CO(MR_sup, upper_T, pL_inf, Pt_inf);
  let T_sup_MR_sup_pL_inf_Pt_sup = Emissivite_H2O_CO(MR_sup, upper_T, pL_inf, Pt_sup);
  let T_sup_MR_sup_pL_sup_Pt_inf = Emissivite_H2O_CO(MR_sup, upper_T, pL_sup, Pt_inf);
  let T_sup_MR_sup_pL_sup_Pt_sup = Emissivite_H2O_CO(MR_sup, upper_T, pL_sup, Pt_sup);
  
  // Remplacer les valeurs nulles par 0
  if (T_inf_MR_inf_pL_inf_Pt_inf === null) T_inf_MR_inf_pL_inf_Pt_inf = 0;
  if (T_inf_MR_inf_pL_inf_Pt_sup === null) T_inf_MR_inf_pL_inf_Pt_sup = 0;
  if (T_inf_MR_inf_pL_sup_Pt_inf === null) T_inf_MR_inf_pL_sup_Pt_inf = 0;
  if (T_inf_MR_inf_pL_sup_Pt_sup === null) T_inf_MR_inf_pL_sup_Pt_sup = 0;
  if (T_sup_MR_inf_pL_inf_Pt_inf === null) T_sup_MR_inf_pL_inf_Pt_inf = 0;
  if (T_sup_MR_inf_pL_inf_Pt_sup === null) T_sup_MR_inf_pL_inf_Pt_sup = 0;
  if (T_sup_MR_inf_pL_sup_Pt_inf === null) T_sup_MR_inf_pL_sup_Pt_inf = 0;
  if (T_sup_MR_inf_pL_sup_Pt_sup === null) T_sup_MR_inf_pL_sup_Pt_sup = 0;
  if (T_inf_MR_sup_pL_inf_Pt_inf === null) T_inf_MR_sup_pL_inf_Pt_inf = 0;
  if (T_inf_MR_sup_pL_inf_Pt_sup === null) T_inf_MR_sup_pL_inf_Pt_sup = 0;
  if (T_inf_MR_sup_pL_sup_Pt_inf === null) T_inf_MR_sup_pL_sup_Pt_inf = 0;
  if (T_inf_MR_sup_pL_sup_Pt_sup === null) T_inf_MR_sup_pL_sup_Pt_sup = 0;
  if (T_sup_MR_sup_pL_inf_Pt_inf === null) T_sup_MR_sup_pL_inf_Pt_inf = 0;
  if (T_sup_MR_sup_pL_inf_Pt_sup === null) T_sup_MR_sup_pL_inf_Pt_sup = 0;
  if (T_sup_MR_sup_pL_sup_Pt_inf === null) T_sup_MR_sup_pL_sup_Pt_inf = 0;
  if (T_sup_MR_sup_pL_sup_Pt_sup === null) T_sup_MR_sup_pL_sup_Pt_sup = 0;

  // SUR BASE DES VALEURS PRECEDENTES, ON EXTRAPOLE A LA TEMPERATURE REELLE
  const ratio_T = (T - lower_T) / (upper_T - lower_T);

  let MR_inf_pL_inf_Pt_inf;
  let MR_inf_pL_inf_Pt_sup;
  let MR_inf_pL_sup_Pt_inf;
  let MR_inf_pL_sup_Pt_sup;
  let MR_sup_pL_inf_Pt_inf;
  let MR_sup_pL_inf_Pt_sup;
  let MR_sup_pL_sup_Pt_inf;
  let MR_sup_pL_sup_Pt_sup;

  if (T > lower_T && upper_T > lower_T) {
    MR_inf_pL_inf_Pt_inf = T_inf_MR_inf_pL_inf_Pt_inf + (T_sup_MR_inf_pL_inf_Pt_inf - T_inf_MR_inf_pL_inf_Pt_inf) * ratio_T;

    MR_inf_pL_inf_Pt_sup = T_inf_MR_inf_pL_inf_Pt_sup + (T_sup_MR_inf_pL_inf_Pt_sup - T_inf_MR_inf_pL_inf_Pt_sup) * ratio_T;
    MR_inf_pL_sup_Pt_inf = T_inf_MR_inf_pL_sup_Pt_inf + (T_sup_MR_inf_pL_sup_Pt_inf - T_inf_MR_inf_pL_sup_Pt_inf) * ratio_T;
    MR_inf_pL_sup_Pt_sup = T_inf_MR_inf_pL_sup_Pt_sup + (T_sup_MR_inf_pL_sup_Pt_sup - T_inf_MR_inf_pL_sup_Pt_sup) * ratio_T;
    MR_sup_pL_inf_Pt_inf = T_inf_MR_sup_pL_inf_Pt_inf + (T_sup_MR_sup_pL_inf_Pt_inf - T_inf_MR_sup_pL_inf_Pt_inf) * ratio_T;
    MR_sup_pL_inf_Pt_sup = T_inf_MR_sup_pL_inf_Pt_sup + (T_sup_MR_sup_pL_inf_Pt_sup - T_inf_MR_sup_pL_inf_Pt_sup) * ratio_T;
    MR_sup_pL_sup_Pt_inf = T_inf_MR_sup_pL_sup_Pt_inf + (T_sup_MR_sup_pL_sup_Pt_inf - T_inf_MR_sup_pL_sup_Pt_inf) * ratio_T;
    MR_sup_pL_sup_Pt_sup = T_inf_MR_sup_pL_sup_Pt_sup + (T_sup_MR_sup_pL_sup_Pt_sup - T_inf_MR_sup_pL_sup_Pt_sup) * ratio_T;
  } else {
    MR_inf_pL_inf_Pt_inf = T_inf_MR_inf_pL_inf_Pt_inf;
    MR_inf_pL_inf_Pt_sup = T_inf_MR_inf_pL_inf_Pt_sup;
    MR_inf_pL_sup_Pt_inf = T_inf_MR_inf_pL_sup_Pt_inf;
    MR_inf_pL_sup_Pt_sup = T_inf_MR_inf_pL_sup_Pt_sup;
    MR_sup_pL_inf_Pt_inf = T_inf_MR_sup_pL_inf_Pt_inf;
    MR_sup_pL_inf_Pt_sup = T_inf_MR_sup_pL_inf_Pt_sup;
    MR_sup_pL_sup_Pt_inf = T_inf_MR_sup_pL_sup_Pt_inf;
    MR_sup_pL_sup_Pt_sup = T_inf_MR_sup_pL_sup_Pt_sup;
  }

  // SUR BASE DES VALEURS PRECEDENTES, ON EXTRAPOLE ET CON CORRIGE EN FONCTION DE LA PRESSION Pt RELLE
  let Pt_ratio = Pt / Pt_inf;

  if (Pt === Pt_inf) {Pt_ratio = 1};
  const Pt_delta = Math.log10(Pt_sup) - Math.log10(Pt_inf);

  let MR_inf_pL_inf;
  let MR_inf_pL_sup;
  let MR_sup_pL_inf;
  let MR_sup_pL_sup;

  if (Pt > Pt_inf && Pt_sup > Pt_inf) {
    if (MR_inf_pL_inf_Pt_sup > 0 && MR_inf_pL_inf_Pt_inf > 0) {
      MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_inf_pL_inf_Pt_sup / MR_inf_pL_inf_Pt_inf)) / Pt_delta);
    } else {
      MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf;
    }
    
    if (MR_inf_pL_sup_Pt_sup > 0 && MR_inf_pL_sup_Pt_inf > 0) {
      MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_inf_pL_sup_Pt_sup / MR_inf_pL_sup_Pt_inf)) / Pt_delta);
    } else {
      MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf;
    }
    
    if (MR_sup_pL_inf_Pt_sup > 0 && MR_sup_pL_inf_Pt_inf > 0) {
      MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_sup_pL_inf_Pt_sup / MR_sup_pL_inf_Pt_inf)) / Pt_delta);
    } else {
      MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf;
    }
    
    if (MR_sup_pL_sup_Pt_sup > 0 && MR_sup_pL_sup_Pt_inf > 0) {
      MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf * Math.pow(Pt_ratio, (Math.log10(MR_sup_pL_sup_Pt_sup / MR_sup_pL_sup_Pt_inf)) / Pt_delta);
    } else {
      MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf;
    }
  } else {
    MR_inf_pL_inf = MR_inf_pL_inf_Pt_inf;
    MR_inf_pL_sup = MR_inf_pL_sup_Pt_inf;
    MR_sup_pL_inf = MR_sup_pL_inf_Pt_inf;
    MR_sup_pL_sup = MR_sup_pL_sup_Pt_inf;
  }

  let interpolate1, interpolate2;

  if (MR_sup > MR_inf) {
    interpolate1 = MR_inf_pL_inf + (MR_sup_pL_inf - MR_inf_pL_inf) / (MR_sup - MR_inf) * (MR - MR_inf);
    interpolate2 = MR_inf_pL_sup + (MR_sup_pL_sup - MR_inf_pL_sup) / (MR_sup - MR_inf) * (MR - MR_inf);
  } else {
    interpolate1 = MR_inf_pL_inf;
    interpolate2 = MR_inf_pL_sup;
  }

  let emissivite_H2OCO;

  if (interpolate1 === interpolate2) {
    emissivite_H2OCO = interpolate1;
  } else if (interpolate1 === 0) {
    emissivite_H2OCO = 0;
  } else if (pL_inf === pL_sup) {
    emissivite_H2OCO = interpolate1;
  } else {
    if (interpolate2 > 0 && interpolate1 > 0) {
      let exposant = Math.log10(interpolate2 / interpolate1) / Math.log10(pL_sup / pL_inf);
      emissivite_H2OCO = interpolate1 * Math.pow(pL / pL_inf, exposant);
    } else {
      emissivite_H2OCO = interpolate1;
    }
  }

  return emissivite_H2OCO;
};

export let FG_emissivity = (T_epsilon, L_optique, frac_mol_CO2, frac_mol_H2O, frac_mol_CO) => {


  let Pt = 0.1;
  let Pe_CO2 = Pt*(1+0.28*frac_mol_CO2);
  let Pe_H2O = Pt*(1+0.28*frac_mol_H2O);
  let Pe_CO = Pt*(1+0*frac_mol_CO);
  let MR ;
  
  
  let CO2_epsilon = Emissivite_CO2_T(Pe_CO2,T_epsilon,frac_mol_CO2*Pt*L_optique); 
  let H2O_epsilon = Emissivite_H2O_T(Pe_H2O, T_epsilon, frac_mol_H2O*Pt*L_optique);
  let CO_epsilon = Emissivite_CO_T(Pe_CO, T_epsilon, frac_mol_CO*Pt*L_optique);
  
  MR = calculateMR(frac_mol_H2O,frac_mol_CO2 );
  let CO2_H2O_epsilon = Emissivite_CO2_H2O_T(MR,T_epsilon,(frac_mol_CO2+frac_mol_H2O)*Pt*L_optique, Pt);
  
  MR = calculateMR(frac_mol_H2O, frac_mol_CO);
  
  let H2O_CO_epsilon = Emissivite_H2O_CO_T(MR, T_epsilon, (frac_mol_H2O+frac_mol_CO)*Pt*L_optique, Pt);
  
  MR = calculateMR(frac_mol_CO2, frac_mol_CO);
  let CO2_CO_epsilon = Emissivite_CO2_CO_T(MR, T_epsilon, (frac_mol_CO2+frac_mol_CO)*Pt*L_optique, Pt);
  
  
  let H2O_CO2_CO_epsilon = Emissivite_H2O_CO2_CO_T(H2O_epsilon , CO2_epsilon , CO_epsilon, H2O_CO_epsilon, CO2_CO_epsilon) ;
  
  
  let Epsilon_tot = CO2_epsilon+H2O_epsilon+CO_epsilon-CO2_H2O_epsilon-H2O_CO_epsilon-CO2_CO_epsilon-H2O_CO2_CO_epsilon ;
  
  



  return Epsilon_tot;
};
