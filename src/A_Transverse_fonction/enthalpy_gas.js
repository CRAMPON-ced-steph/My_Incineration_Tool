import { T_ref } from "./constantes";

export const fh_CO2 = (T) => {
  T += T_ref;
  const A = 1.0034;
  const B = 0.000205;
  const C = 0;
  const d = -19400;
  const K = -352.6296;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_O2 = (T) => {
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

export const  fh_SO2 = (T) => {
  T += T_ref;
  const A = 0.678;
  const B = 0.000166;
  const C = 0;
  const d = -9270;
  const K = -225.2359;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_HCl = (T) => {
  T += T_ref;
  const A = 0.7279;
  const B = 0.000126;
  const C = 0;
  const d = 3000;
  const K = -192.423;
  const result = A * T + B * 0.5 * T * T + C * T * T * T / 3 - d / T + K;
  return result;
};

export const fh_N2 = (T) => {
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

export const fh_H2O = (T) => {
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
  const result = 4.186 * (10 * T + 0.00484 * T * T / 2 + 108000 / T - 3305.96) / 56;
  return result;
};

export const fs_CaO = (T) => {
  T += T_ref;
  const result = 4.186 * (10 * Math.log(T) + 0.00484 * T + 108000 / (T * T * 2) - 58.1406) / 56;
  return result;
};

export const fh_CaCO3 = (T) => {
  T += T_ref;
  const result = 4.186 * (19.68 * T + 0.01189 * T * T / 2 + 307600 / T - 6942.45) / 100;
  return result;
};


export const fs_CaCO3 = (T) => {
  T += T_ref;
  // Commenté dans l'original, décommenté ici :
   const result = 4.186 * (19.68 * Math.log(T) + 0.01189 * T + 307600 / (T * T * 2) - 115.7) / 100;
   return result;
};

export const fh_MgO = (T) => {
  T += T_ref;
  const result = 4.186 * (10.86 * T + 0.001197 * T * T / 2 + 208700 / T - 3773.85) / 40.3;
  return result;
};

export const fs_MgO = (T) => {
  T += T_ref;
  // Commenté dans l'original, décommenté ici :
   const result = 4.186 * (10.86 * Math.log(T) + 0.001197 * T + 208700 / (T * T * 2) - 62.6458) / 40.3;
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
  const result = 4.186 * (2.673 * T + 0.002617 * T * T / 2 + 116900 / T - 1255.45) / 12;

  return result;
};

export const fh_Al2O3 = (T) => {
  T += T_ref;
  const result = 4.186 * (22.08 * T + 0.08971 * T * T / 2 + 522500 / T - 11281) / 102;

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

export const fh_H2 = (T) => {
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
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * 4.186 / 16;
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
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * 4.186 / 26;
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
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * 4.186 / 28;
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
  const result = (A * T + B * T * T / 2 + C * T * T * T / 3 + d * T * T * T * T / 4 + e) * 4.186 / 30;
  T -= T_ref;
  return result;
};

export const fh_CO = (T) => {
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
  const H_H2O = (fh_H2O(T) + 540 * 4.1868) * m_H2O;
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