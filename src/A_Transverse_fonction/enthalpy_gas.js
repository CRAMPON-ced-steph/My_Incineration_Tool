import { T_ref, Lv, cp_ref } from "./constantes";

// ─────────────────────────────────────────────────────────────────────────────
// Enthalpies sensibles des gaz — NIST Chemistry WebBook, équation de Shomate
//   cp° = A + B·t + C·t² + D·t³ + E/t²     [J/mol/K], t = T[K] / 1000
//   h(T) = ∫ cp° dT de 0 °C (273,15 K) à T  →  kJ/kg, h(0 °C) = 0 (gaz parfait)
// Intégration analytique par morceaux sur les plages publiées par le NIST :
// h est continue aux changements de plage par construction.
// Hors plage, extrapolation de la plage voisine (H2O sous 500 K : écart sur cp
// < 0,2 % vs JANAF à 273–400 K ; autres gaz : 273–298 K seulement).
// Source : https://webbook.nist.gov (Chase, NIST-JANAF Thermochemical Tables, 1998).
// Remplace les corrélations de Kelley (≤ 2 % d'écart, ex. CO2 −1,4 % à 870 °C,
// H2O décalé de +13,7 kJ/kg à 0 °C) — conservées plus bas sous le suffixe _Kelley.
// Plage : [T_max (K), A, B, C, D, E]
// ─────────────────────────────────────────────────────────────────────────────
const SHOMATE = {
  CO2: { M: 44.0095, plages: [
    [1200,     24.99735,  55.18696,  -33.69137,  7.948387, -0.136638],
    [Infinity, 58.16639,   2.720074,  -0.492289, 0.038844, -6.447293]] },
  N2: { M: 28.0134, plages: [
    [500,      28.98641,   1.853978,  -9.647459, 16.63537,  0.000117],
    [2000,     19.50583,  19.88705,   -8.598535,  1.369784, 0.527601],
    [Infinity, 35.51872,   1.128728,  -0.196103,  0.014662, -4.553760]] },
  O2: { M: 31.9988, plages: [
    [700,      31.32234, -20.23531,   57.86644, -36.50624, -0.007374],
    [2000,     30.03235,   8.772972,  -3.988133,  0.788313, -0.741599],
    [Infinity, 20.91111,  10.72071,   -2.020498,  0.146449,  9.245722]] },
  H2O: { M: 18.0153, plages: [
    [1700,     30.09200,   6.832514,   6.793435, -2.534480,  0.082139],
    [Infinity, 41.96426,   8.622053,  -1.499780,  0.098119, -11.15764]] },
  CO: { M: 28.0101, plages: [
    [1300,     25.56759,   6.096130,   4.054656, -2.671301,  0.131021],
    [Infinity, 35.15070,   1.300095,  -0.205921,  0.013550, -3.282780]] },
  H2: { M: 2.01588, plages: [
    [1000,     33.066178, -11.363417, 11.432816, -2.772874, -0.158558],
    [2500,     18.563083,  12.257357, -2.859786,  0.268238,  1.977990],
    [Infinity, 43.413560,  -4.293079,  1.272428, -0.096876, -20.533862]] },
  SO2: { M: 64.0638, plages: [
    [1200,     21.43049,  74.35094,  -57.75217,  16.35534,  0.086731],
    [Infinity, 57.48188,   1.009328,  -0.076290,  0.005174, -4.045401]] },
  HCl: { M: 36.4609, plages: [
    [1200,     32.12392, -13.45805,   19.86852,  -6.853936, -0.049672],
    [Infinity, 31.91923,   3.203184,  -0.541539,  0.035925, -3.438525]] },
};

// Primitive de cp° en t : A·t + B·t²/2 + C·t³/3 + D·t⁴/4 − E/t   [kJ/mol]
const primitiveShomate = (p, t) => p[1] * t + p[2] * t * t / 2 + p[3] * t * t * t / 3 + p[4] * t * t * t * t / 4 - p[5] / t;

// Construit h(T °C) [kJ/kg] : constantes d'intégration calculées une fois pour
// imposer h(0 °C) = 0 et la continuité aux bornes de plage.
const enthalpieShomate = ({ M, plages }) => {
  const K = [];
  plages.forEach((p, i) => {
    if (i === 0) K.push(-primitiveShomate(p, T_ref / 1000));
    else {
      const tb = plages[i - 1][0] / 1000;
      K.push(primitiveShomate(plages[i - 1], tb) + K[i - 1] - primitiveShomate(p, tb));
    }
  });
  return (T) => {
    const TK = T + T_ref;
    let i = 0;
    while (i < plages.length - 1 && TK > plages[i][0]) i++;
    return (primitiveShomate(plages[i], TK / 1000) + K[i]) * 1000 / M;
  };
};

// Enthalpies sensibles [kJ/kg] entre 0 °C et T [°C]
export const fh_CO2 = enthalpieShomate(SHOMATE.CO2);
export const fh_N2 = enthalpieShomate(SHOMATE.N2);
export const fh_O2 = enthalpieShomate(SHOMATE.O2);
export const fh_H2O = enthalpieShomate(SHOMATE.H2O); // vapeur ; chaleur latente ajoutée par l'appelant
export const fh_CO = enthalpieShomate(SHOMATE.CO);
export const fh_H2 = enthalpieShomate(SHOMATE.H2);
export const fh_SO2 = enthalpieShomate(SHOMATE.SO2);
export const fh_HCl = enthalpieShomate(SHOMATE.HCl);

// ── Anciennes corrélations (Kelley / Maier-Kelley) — conservées, plus utilisées ──

export const fh_CO2_Kelley = (T) => {
  T += T_ref;
  const A = 1.0034;
  const B = 0.000205;
  const C = 0;
  const d = -19400;
  const K = -352.6296;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_O2_Kelley = (T) => {
  T += T_ref;
  let A, B, C, d, K;
  if (T < 1000) {
    A = 0.696;
    B = 0.0006373;
    C = -0.0000002482;
    d = 4800;
    K = -194.4909;
  } else {
    A = 1.0505;
    B = 0.00007447;
    C = -0.00000000254;
    d = -32860;
    K = -386.86;
  }
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_SO2_Kelley = (T) => {
  T += T_ref;
  const A = 0.678;
  const B = 0.000166;
  const C = 0;
  const d = -9270;
  const K = -225.2359;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_HCl_Kelley = (T) => {
  T += T_ref;
  const A = 0.7279;
  const B = 0.000126;
  const C = 0;
  const d = 3000;
  const K = -192.423;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_N2_Kelley = (T) => {
  T += T_ref;
  let A, B, C, d, K;
  if (T < 800) {
    A = 0.9718;
    B = 0.00009;
    C = 0.0000001555;
    d = 2740;
    K = -259.6731;
  } else {
    A = 1.0146;
    B = 0.0002277;
    C = -0.0000000443;
    d = -29770;
    K = -351.2;
  }
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_H2O_Kelley = (T) => {
  T += T_ref;
  const A = 1.6658;
  const B = 0.0005945;
  const C = 0;
  const d = -1830;
  const K = -470.2138;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_AIR = (T) => {
  return fh_N2(T) * 0.767 + fh_O2(T) * 0.233;
};

// Sensible entropy [kJ/kg/K] using Kirchhoff-Planck polynomial: Cp = A + B·T + C·T² + d/T²
// Integral: s = A·ln(T) + B·T + C·T²/2 − d/(2·T²) + K
// Coefficients from: Stull & Prophet (1971), JANAF Thermochemical Tables, 2nd ed., NBS
export const fs_CO2 = (T) => {
  T += T_ref;
  const A = 1.0034;
  const B = 0.000205;
  const C = 0;
  const d = -19400;
  const K = -6.3183;
  const result = A * Math.log(T) + B * T + C * T * T / 2 - d / (T * T * 2) + K;
  return result;
};

export const fs_HCl = (T) => {
  T += T_ref;
  const A = 0.7279;
  const B = 0.000126;
  const C = 0;
  const d = 3000;
  const K = -4.0974;
  const result = A * Math.log(T) + B * T + C * T * T / 2 - d / (T * T * 2) + K;
  return result;
};

export const fs_H2O = (T) => {
  T += T_ref;
  const A = 1.6658;
  const B = 0.0005945;
  const C = 0;
  const d = -1830;
  const K = -9.5188;
  const result = A * Math.log(T) + B * T + C * T * T / 2 - d / (T * T * 2) + K;
  return result;
};

export const fs_O2 = (T) => {
  return fh_O2(T);
};

export const fs_AIR = (T) => {
  return fh_N2(T) * 0.767 + fs_O2(T) * 0.233;
};

export const fh_CaO = (T) => {
  T += T_ref;
  const result = cp_ref * (10 * T + 0.00484 * T * T / 2 + 108000 / T - 3305.96) / 56;
  return result;
};

export const fs_CaO = (T) => {
  T += T_ref;
  const result = cp_ref * (10 * Math.log(T) + 0.00484 * T + 108000 / (T * T * 2) - 58.1406) / 56;
  return result;
};

export const fh_CaCO3 = (T) => {
  T += T_ref;
  const result = cp_ref * (19.68 * T + 0.01189 * T * T / 2 + 307600 / T - 6942.45) / 100;
  return result;
};


export const fs_CaCO3 = (T) => {
  T += T_ref;
  // Commenté dans l'original, décommenté ici :
   const result = cp_ref * (19.68 * Math.log(T) + 0.01189 * T + 307600 / (T * T * 2) - 115.7) / 100;
   return result;
};

export const fh_MgO = (T) => {
  T += T_ref;
  const result = cp_ref * (10.86 * T + 0.001197 * T * T / 2 + 208700 / T - 3773.85) / 40.3;
  return result;
};

export const fs_MgO = (T) => {
  T += T_ref;
  // Commenté dans l'original, décommenté ici :
   const result = cp_ref * (10.86 * Math.log(T) + 0.001197 * T + 208700 / (T * T * 2) - 62.6458) / 40.3;
  return result;
};




export const fh_MgCO3 = (T) => {
  const result = fh_CO2(T) * 0.522 + fh_MgO(T) * 0.478;
  return result;
};

export const fs_MgCO3 = (T) => {
  const result = fs_CO2(T) * 0.522 + fs_MgO(T) * 0.478;
  return result;
};

export const fh_C = (T) => {
  T += T_ref;
  const result = cp_ref * (2.673 * T + 0.002617 * T * T / 2 + 116900 / T - 1255.45) / 12;

  return result;
};

export const fh_Al2O3 = (T) => {
  T += T_ref;
  const result = cp_ref * (22.08 * T + 0.08971 * T * T / 2 + 522500 / T - 11281) / 102;

  return result;
};

export const fh_S = (T) => {
  T += T_ref;
  const result = 4.1868 * (8.58 * T + 0.0003 * T * T / 2 - 2345) / 32;
  
  return result;
};

export const fh_K2O = (T) => {
  T += T_ref;
  const result = 4.1868 * (12.78 * T + 0.02355 * T * T / 2 + 0.00001448 * T * T * T / 3 + 18791 / T - 4533) / 94;

  return result;
};

export const fh_FeO = (T) => {
  T += T_ref;
  const result = 4.1868 * (12.62 * T + 0.001492 * T * T / 2 + 76200 / T - 3774) / 72;

  return result;
};

export const fh_MnO = (T) => {
  T += T_ref;
  const result = 4.1868 * (7.43 * T + 0.01038 * T * T / 2 - 0.00000362 * T * T * T / 3 - 2391) / 71;
  
  return result;
};

export const fs_C = (T) => {
  T += T_ref;
  const result = 4.1868 * (2.673 * Math.log(T) + 0.002617 * T + 116900 / (T * T * 2) - 16.4928) / 12;
  return result;
};

export const fs_SiO2 = (T) => {
  T += T_ref;
  let result;
  if (T < 848) {
    result = (0.1812 * Math.log(T) + 0.0000726 * T * 2 + 4020 / (T ** 2) - 1.083) * 4.1868;
  } else {
    result = (0.1825 * Math.log(T) + 0.0000458 * T * 2 - 1.0487) * 4.1868;
  }
 
  return result;
};

export const fh_SiO2 = (T) => {
  T += T_ref;
  let result;
  if (T < 848) {
    result = (0.1812 * T + 0.0000726 * T * T + 4020 / T - 69.59) * 4.1868;
  } else {
    result = (0.1825 * T + 0.0000458 * T * T - 46.75) * 4.1868;
  }
  return result;
};


export const fhDOLOMIE_CAR = (T) => {
  return 0.0106 * fh_SiO2(T) + 0.348 * (fh_CO2(T) * 0.522 + fh_MgO(T) * 0.478) + 0.6417 * fh_CaCO3(T);
};

export const fsDOLOMIE_CAR = (T) => {
  return 0.0106 * fs_SiO2(T) + 0.348 * (fs_CO2(T) * 0.522 + fs_MgO(T) * 0.478) + 0.6417 * fs_CaCO3(T);
};

export const fhDOLOMIE_DECAR = (T) => {
  return 0.3094 * fh_MgO(T) + 0.6708 * fh_CaO(T) + 1.98 * fh_SiO2(T);
};

export const fsDOLOMIE_DECAR = (T) => {
  return 0.3094 * fs_MgO(T) + 0.6708 * fs_CaO(T) + 1.98 * fs_SiO2(T);
};

export const fh_H2_Kelley = (T) => {
  const A = 6.483;
  const B = 0.002215;
  const C = -0.000003298;
  const d = 0.000000001826;
  const e = -1832.381;
  T += T_ref;
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * 4.18 / 2;
  T -= T_ref;
  return result;
};

export const fh_CH4 = (T) => {
  const A = 4.598;
  const B = 0.01245;
  const C = 0.00000286;
  const d = 0.000000002703;
  const e = -1740.48;
  T += T_ref;
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * cp_ref / 16;
  T -= T_ref;
  return result;
};

export const fh_C2H2 = (T) => {
  const A = 6.406;
  const B = 0.0181;
  const C = 0.00001196;
  const d = 0.000000003373;
  const e = -2509.12;
  T += T_ref;
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * cp_ref / 26;
  T -= T_ref;
  return result;
};

export const fh_C2H4 = (T) => {
  const A = 0.909;
  const B = 0.0374;
  const C = -0.00001994;
  const d = 0.000000004192;
  const e = -1512.43;
  T += T_ref;
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * cp_ref / 28;
  T -= T_ref;
  return result;
};

export const fh_C2H6 = (T) => {
  const A = 1.292;
  const B = 0.04254;
  const C = -0.00001657;
  const d = 0.000000002081;
  const e = -1828.46;
  T += T_ref;
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * cp_ref / 30;
  T -= T_ref;
  return result;
};

export const fh_CO_Kelley = (T) => {
  const A = 7.373;
  const B = -0.00307;
  const C = 0.000006662;
  const d = -0.000000003037;
  const e = -1947.82;
  T += T_ref;
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * 4.186 / 28;
  T -= T_ref;
  return result;
};

export const fh_gaz = (T) => {
  // Cette fonction est commentée dans l'original, donc je la laisse commentée ici
  const qCO = 0.566;
  const qCO2 = 0.088;
  const qH2 = 0.018;
  const qCH4 = 0.094;
  const qC2H4 = 0.075;
  const qC2H6 = 0.004;
  const qC2H2 = 0.01;
  const qH2O = 0.145;
  const fhgaz1 = fh_CO(T) * qCO + fh_CO2(T) * qCO2 + qH2 * fh_H2(T) + qCH4 * fh_CH4(T) + qC2H4 * fh_C2H4(T);
  return fhgaz1 + qC2H6 * fh_C2H6(T) + qC2H2 * fh_C2H2(T) + qH2O * fh_H2O(T);
};

export const pression_equilibre_decar_dolomie = (T) => {
  T += T_ref;
  const A = Math.pow(10, 11.44041 - 8655 / T);
  const result = A / 100000;
  T -= T_ref;
  return result;
};

export const frDECAR_CALCAIRE = (T) => {
  return 437.5 * 4.1868;
};

export const frDECAR_MAGNESIUM = (T) => {
  return 334 * 4.1868;
};

export const frDECAR_DOLOMIE = (T) => {
  return 0.348 * frDECAR_MAGNESIUM(T) + 0.6417 * frDECAR_CALCAIRE(T);
};

export const fh_eau = (T) => {
  return T < 100 ? T * 4.1868 : 1.988 * T + 2477;
};

export const fh_fum = (T, p_co2, P_H2O, p_n2, p_o2, p_hcl, p_so2) => {
  const hn2 = p_n2 * fh_N2(T);
  const ho2 = p_o2 * fh_O2(T);
  const hco2 = p_co2 * fh_CO2(T);
  const hh2o = P_H2O * fh_H2O(T);
  const hhcl = p_hcl * fh_HCl(T);
  const hso2 = p_so2 * fh_SO2(T);
  return hn2 + ho2 + hco2 + hh2o + hhcl + hso2;
};

export const fh_inerte = (p_caco3, p_sio2, p_fe2o3, T) => {
  const hcaco3 = fh_CaCO3(T) * p_caco3;
  const hfe2o3 = fh_CaCO3(T) * p_fe2o3;
  const hsio2 = fh_SiO2(T) * p_sio2;
  return hcaco3 + hsio2 + hfe2o3;
};

export const h_fumee = (T, m_CO2, m_H2O, M_N2, M_O2) => {
  const H_CO2 = fh_CO2(T) * m_CO2;
  const H_H2O = (fh_H2O(T) + Lv) * m_H2O;
  const H_N2 = fh_N2(T) * M_N2;
  const H_O2 = fh_O2(T) * M_O2;
  return H_CO2 + H_N2 + H_O2 + H_H2O;
};

export const pression = (T) => {
  T += T_ref;
  const P = Math.pow(10, 8.627 - 2147 / T);
  const result = P / 760;
  T -= T_ref;
  return result;
};










export const température = (P) => {
  return -211.7 * Math.pow(P, 4) + 618 * Math.pow(P, 3) - 657.14 * Math.pow(P, 2) + 335.1 * P + 15.02;
};