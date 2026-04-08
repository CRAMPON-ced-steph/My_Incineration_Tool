import {fh_CO2,fh_H2O, fh_O2,fh_N2,fh_AIR} from '../A_Transverse_fonction/enthalpy_gas';

export const H_in_systemB = (Mass_kg_h, cvw_kj_kg, M_dry_air_kg_h, T_air, M_steam_water_kg_h, T_water, T_waste, Head_los) => {
  const a = Mass_kg_h * cvw_kj_kg;
  const b = M_dry_air_kg_h * fh_AIR(T_air);
  const c = M_steam_water_kg_h * fh_H2O(T_water);
  const d = Mass_kg_h * 0.25 * 4.186 * T_waste;
  
  return a + b + c + d;
};


export const H_in_systemA = (Mass_kg_h, cvw_kj_kg, M_dry_air_kg_h, T_air, M_steam_water_kg_h, T_water, T_waste, Head_los, Tair_prechauffe, poucentage_prechauffe) => {
  const a = Mass_kg_h * cvw_kj_kg;
  const b = M_dry_air_kg_h * ((1 - poucentage_prechauffe) * fh_AIR(T_air) + poucentage_prechauffe * fh_AIR(Tair_prechauffe));
  const c = M_steam_water_kg_h * fh_H2O(T_water);
  const d = Mass_kg_h * 0.25 * 4.186 * T_waste;
  
  return (a + b + c + d) * (1 - Head_los / 100);
};


export const H_in_system = (Mass_kg_h, cvw_kj_kg, M_dry_air_kg_h, T_air, M_steam_water_kg_h, T_water, T_waste, Head_los, M_inert, Tf_init) => {
  const a = Mass_kg_h * cvw_kj_kg;
  const b = M_dry_air_kg_h * fh_AIR(T_air);
  const c = M_steam_water_kg_h * fh_H2O(T_water);
  const d = Mass_kg_h * 0.25 * 4.186 * T_waste;
  const e = Mass_kg_h * 0.25 * 4.186 * Tf_init;
  
  // Pertes par les imbrules
  const PCI_imb_kj_kg = 33000;
  const imb_pourcent = 0.03;
  const f = M_inert * imb_pourcent * PCI_imb_kj_kg;
  
  return a + b + c + d - e - f;
};


export const Pa_four = (D, L, N, C) => {
  const a = Math.pow(D * Math.sin(40 * Math.PI / 180), 3);
  
  let cValue;
  if (C === "oui") {
    cValue = 0.0018;
  } else {
    cValue = 0.00092;
  }
  
  return (86.4 * a * L * N * cValue) / 0.85;
};
