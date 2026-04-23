import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { T_ref } from "./constantes";

// ============================================================================
// FONCTION PURE DE CALCUL DE COMBUSTION - VERSION CORRIGÉE
// ============================================================================

export const calculerCombustion = (composition, O2_fumees, debit_gaz, temp_air) => {
  // Validation des paramètres
  if (!composition || typeof composition !== 'object') {
    throw new Error('La composition doit être un objet');
  }
  
  if (typeof O2_fumees !== 'number' || O2_fumees <= 0 || O2_fumees > 21) {
    throw new Error('O2_fumees doit être un nombre entre 0 et 21');
  }
  
  if (typeof debit_gaz !== 'number' || debit_gaz <= 0) {
    throw new Error('debit_gaz doit être un nombre positif');
  }
  
  if (typeof temp_air !== 'number') {
    throw new Error('temp_air doit être un nombre');
  }

  // Initialisation des composants
  const gas = {
    N2: composition.N2 || 0, CO2: composition.CO2 || 0,
    CH4: composition.CH4 || 0, C2H6: composition.C2H6 || 0,
    C3H8: composition.C3H8 || 0, nC4: composition.nC4 || 0,
    iC4: composition.iC4 || 0, nC5: composition.nC5 || 0,
    iC5: composition.iC5 || 0, nC6: composition.nC6 || 0,
    He: composition.He || 0, O2: composition.O2 || 0,
    H2: composition.H2 || 0, CO: composition.CO || 0
  };
  
  // Vérification somme = 100%
  const total = Object.values(gas).reduce((sum, val) => sum + val, 0);
  if (Math.abs(total - 100) > 0.1) {
    throw new Error(`La composition doit totaliser 100%. Actuel: ${total.toFixed(1)}%`);
  }

  // Fonctions de capacité calorifique (kJ/kg·K)
  const CpO2 = (T) => 1.299 + 0.000229147 * T - 0.0000000551924 * T * T + 4.77147e-12 * T * T * T;
  const CpCO2 = (T) => 1.62902 + 0.000960115 * T - 0.000000425414 * T * T + 7.33725e-11 * T * T * T;
  const CpN2 = (T) => 1.2942 + 0.0000576597 * T + 0.0000000618007 * T * T - 2.01169e-11 * T * T * T;
  const CpAr = () => 0.926;
  const CpH2O = (T) => 1.48542 + 0.000172552 * T + 0.0000000793311 * T * T - 2.47045e-11 * T * T * T;

  // Fonction de calcul du rendement Hi
  function calculerRendement(T) {
    // Facteur de compressibilité
    const zmix_term = (gas.N2/100) * 0.0224 + (gas.CO2/100) * 0.0819 + (gas.CH4/100) * 0.049 + 
                     (gas.C2H6/100) * 0.1 + (gas.C3H8/100) * 0.1453 + (gas.nC4/100) * 0.2069 + 
                     (gas.iC4/100) * 0.2049 + (gas.nC5/100) * 0.2864 + (gas.iC5/100) * 0.251 + 
                     (gas.nC6/100) * 0.3286 + (gas.He/100) * 0.0006 + (gas.O2/100) * 0.0316 + 
                     (gas.H2/100) * (-0.004) + (gas.CO/100) * 0.0265;
    
    const Zmix = 1 - zmix_term * zmix_term;

    // Masse molaire du mélange (g/mol)
    const M = gas.N2/100 * 28.0135 + gas.CO2/100 * 44.01 + gas.CH4/100 * 16.043 + gas.C2H6/100 * 30.07 + 
             gas.C3H8/100 * 44.097 + gas.nC4/100 * 58.123 + gas.iC4/100 * 58.123 + gas.nC5/100 * 72.15 + 
             gas.iC5/100 * 72.15 + gas.nC6/100 * 86.177 + gas.He/100 * 4.0026 + gas.O2/100 * 31.9988 + 
             gas.H2/100 * 2.0159 + gas.CO/100 * 28.01;

    // Pouvoir calorifique supérieur (MJ/m³)
    const hs_raw = (gas.N2/100) * 0 + (gas.CO2/100) * 0 + (gas.CH4/100) * 39.735 + (gas.C2H6/100) * 69.63 + 
                  (gas.C3H8/100) * 99.01 + (gas.nC4/100) * 128.37 + (gas.iC4/100) * 127.96 + (gas.nC5/100) * 157.75 + 
                  (gas.iC5/100) * 157.44 + (gas.nC6/100) * 187.16 + (gas.He/100) * 4.0026 + (gas.O2/100) * 0 + 
                  (gas.H2/100) * 12.752 + (gas.CO/100) * 12.63;
    
    const hs = (hs_raw / Zmix) / 3.6;

    // Pouvoir calorifique inférieur (MJ/m³)
    const hi_raw = (gas.N2/100) * 0 + (gas.CO2/100) * 0 + (gas.CH4/100) * 35.808 + (gas.C2H6/100) * 63.74 + 
                  (gas.C3H8/100) * 91.15 + (gas.nC4/100) * 118.56 + (gas.iC4/100) * 118.15 + (gas.nC5/100) * 145.96 + 
                  (gas.iC5/100) * 145.66 + (gas.nC6/100) * 173.41 + (gas.He/100) * 0 + (gas.O2/100) * 0 + 
                  (gas.H2/100) * 10.788 + (gas.CO/100) * 12.63;
    
    const Hi = (hi_raw / Zmix) / 3.6;

    // Densité du gaz (kg/m³)
    const Ro = (101.325 / 8.31451 / T_ref) * M / Zmix;
    const mol = 1000 * Ro / M;

    // Besoins stœchiométriques
    const O2m = (gas.CH4/100) * 2 * mol + (gas.C2H6/100) * 3.5 * mol + (gas.C3H8/100) * 5 * mol + 
                (gas.nC4/100) * 6.5 * mol + (gas.iC4/100) * 6.5 * mol + (gas.nC5/100) * 8 * mol + 
                (gas.iC5/100) * 8 * mol + (gas.nC6/100) * 9.5 * mol + (gas.O2/100) * (-1) * mol + 
                (gas.H2/100) * 0.5 * mol + (gas.CO/100) * 0.5 * mol;

    const CO2m = (gas.CO2/100) * 1 * mol + (gas.CH4/100) * 1 * mol + (gas.C2H6/100) * 2 * mol + 
                 (gas.C3H8/100) * 3 * mol + (gas.nC4/100) * 4 * mol + (gas.iC4/100) * 4 * mol + 
                 (gas.nC5/100) * 5 * mol + (gas.iC5/100) * 5 * mol + (gas.nC6/100) * 6 * mol + (gas.CO/100) * 1 * mol;

    const H2Om = (gas.CH4/100) * 2 * mol + (gas.C2H6/100) * 3 * mol + (gas.C3H8/100) * 4 * mol + 
                 (gas.nC4/100) * 5 * mol + (gas.iC4/100) * 5 * mol + (gas.nC5/100) * 6 * mol + 
                 (gas.iC5/100) * 6 * mol + (gas.nC6/100) * 7 * mol + (gas.H2/100) * 1 * mol;

    // Composition air sec (%)
    const O2sec = 20.936, CO2sec = 0.033, N2sec = 78.113, Arsec = 0.918;
    
    // Masses volumiques (kg/m³)
    const rho_O2 = 1.429, rho_CO2 = 1.977, rho_N2 = 1.25, rho_Ar = 1.784, rho_H2O = 0.833;
    
    const rho_air_sec = (O2sec * rho_O2 + CO2sec * rho_CO2 + N2sec * rho_N2 + Arsec * rho_Ar) / 100;

    // Humidité de l'air
    const titre_air = 0.00728;
    const c1 = titre_air / rho_H2O;
    const c2 = c1 * rho_air_sec;
    const humidite_vol = c2 / (1 + c2) * 100;
    const facteur_sec = (100 - humidite_vol) / 100;
    
    const O2_hum = O2sec * facteur_sec;
    const CO2_hum = CO2sec * facteur_sec;
    const N2_hum = N2sec * facteur_sec;
    const Ar_hum = Arsec * facteur_sec;
    const H2O_hum = humidite_vol;

    // Volumes molaires (L/mol)
    const Vm_O2 = 22.391, Vm_CO2 = 22.257, Vm_N2 = 22.405, Vm_Ar = 22.394, Vm_H2O = 21.629;

    // Volumes stœchiométriques
    const V_O2_st = O2m * Vm_O2 / 1000;
    const V_CO2_st = V_O2_st * CO2_hum / O2_hum;
    const V_N2_st = V_O2_st * N2_hum / O2_hum;
    const V_Ar_st = V_O2_st * Ar_hum / O2_hum;
    const V_H2O_st = V_O2_st * H2O_hum / O2_hum;
    
    const V_air_sec_st = V_O2_st + V_CO2_st + V_N2_st + V_Ar_st;
    const V_air_hum_st = V_air_sec_st + V_H2O_st;

    // Volumes fumées stœchiométriques
    const V_CO2_fum_st = CO2m * Vm_CO2 / 1000 + V_CO2_st;
    const V_N2_fum_st = (22.4049/100 * gas.N2 + 22.434/100 * gas.He) * mol / 1000 + V_N2_st;
    const V_H2O_fum_st = H2Om * Vm_H2O / 1000 + V_H2O_st;
    const V_fum_sec_st = V_CO2_fum_st + V_N2_fum_st + V_Ar_st;

    // Facteur d'air
    const excès = 100 * (O2_fumees / (O2_hum - ((1 - H2O_hum/100) * O2_fumees))) * V_fum_sec_st / V_air_hum_st;
    const facteur_air = 1 + excès / 100;

    // Volumes réels
    const V_O2_fum = (facteur_air - 1) * V_O2_st * debit_gaz;
    const V_CO2_fum = (CO2m * Vm_CO2 / 1000 + V_CO2_st * facteur_air) * debit_gaz;
    const V_N2_fum = (gas.N2/100 * 22.4049 * mol / 1000 + gas.He/100 * 22.434 * mol / 1000 + V_N2_st * facteur_air) * debit_gaz;
    const V_Ar_fum = V_Ar_st * facteur_air * debit_gaz;
    const V_H2O_fum = (H2Om * Vm_H2O / 1000 + V_H2O_st * facteur_air) * debit_gaz;

    const volume_fumees_sec = V_O2_fum + V_CO2_fum + V_N2_fum + V_Ar_fum;
    const volume_fumees_total = volume_fumees_sec + V_H2O_fum;
    
    const masse_H2O_fum = V_H2O_fum * rho_H2O;

    const V_O2_air = V_O2_st * facteur_air * debit_gaz;
    const V_CO2_air = V_CO2_st * facteur_air * debit_gaz;
    const V_N2_air = V_N2_st * facteur_air * debit_gaz;
    const V_Ar_air = V_Ar_st * facteur_air * debit_gaz;
    const V_H2O_air = V_H2O_st * facteur_air * debit_gaz;

    const volume_air_sec = V_O2_air + V_CO2_air + V_N2_air + V_Ar_air;
    const volume_air_total = volume_air_sec + V_H2O_air;
    
    const masse_H2O_air = V_H2O_air * rho_H2O;

    // Enthalpies de formation
    const hf_comb = gas.CO2/100 * (-393.52) + gas.CH4/100 * (-74.9) + gas.C2H6/100 * (-84.7) + 
                    gas.C3H8/100 * (-103.88) + gas.nC4/100 * (-124.78) + gas.iC4/100 * (-124.78) + 
                    gas.nC5/100 * (-146.5) + gas.iC5/100 * (-146.5) + gas.nC6/100 * (-208) + gas.CO/100 * (-110.58);

    const mol_O2_fum = (1000 * V_O2_fum * rho_O2 / 31.9988) / mol;
    const mol_CO2_fum = (1000 * V_CO2_fum * rho_CO2 / 44.01) / mol;
    const mol_H2O_fum = (1000 * masse_H2O_fum / 18.0152) / mol;

    const hf_fumee = mol_CO2_fum * (-393.8) + mol_H2O_fum * (-241.9);
    const delta_hf = hf_fumee - hf_comb;

    // Enthalpies sensibles
    const cp_air_moy = (CpO2(temp_air) * V_O2_air + CpCO2(temp_air) * V_CO2_air + 
                       CpN2(temp_air) * V_N2_air + CpAr() * V_Ar_air) / volume_air_sec;
    
    const h_air_sensible = cp_air_moy * volume_air_sec * temp_air;
    const h_air_latent = 2501.6 * masse_H2O_air;
    const h_air_total = h_air_sensible + h_air_latent;

    const hs_total_kJ = hs * debit_gaz * 3600;
    const hi_total_kJ = Hi * debit_gaz * 3600;

    // Enthalpies des fumées à T
    const cp_fum_moy = (CpO2(T) * V_O2_fum + CpCO2(T) * V_CO2_fum + 
                       CpN2(T) * V_N2_fum + CpAr() * V_Ar_fum) / volume_fumees_sec;
    
    const h_fum_sec_sensible = volume_fumees_sec * cp_fum_moy * T;
    const h_eau_sensible = V_H2O_fum * CpH2O(T) * T;
    const h_eau_latente = 2501.6 * masse_H2O_fum;
    const h_fumees_total = h_fum_sec_sensible + h_eau_sensible + h_eau_latente;

    const rendement = (hs_total_kJ + h_air_total - h_fumees_total + delta_hf) / hi_total_kJ;

    // ✅ CORRECTION : Retourner également les volumes de gaz
    return {
      rendement: rendement,
      hs: hs,
      hi: Hi,
      facteur_air: facteur_air,
      volume_air: volume_air_total,
      volume_fumees: volume_fumees_total,
      // ✅ AJOUT : Retourner les volumes individuels de gaz
      V_CO2_fum: V_CO2_fum,
      V_O2_fum: V_O2_fum,
      V_H2O_fum: V_H2O_fum,
      V_N2_fum: V_N2_fum,
      V_Ar_fum: V_Ar_fum,
    };
  }

  // Dichotomie pour trouver T où rendement = 0
  let T_min = 200, T_max = 3000;
  const tolerance = 0.001, max_iter = 100;

  let res_min = calculerRendement(T_min);
  let res_max = calculerRendement(T_max);

  if (res_min.rendement * res_max.rendement > 0) {
    throw new Error(`Aucune solution dans [${T_min}, ${T_max}]°C`);
  }

  let T_solution = T_min, iterations = 0, converged = false;

  for (let i = 0; i < max_iter; i++) {
    const T_mid = (T_min + T_max) / 2;
    const res_mid = calculerRendement(T_mid);
    
    iterations = i + 1;

    if (Math.abs(res_mid.rendement) < tolerance) {
      T_solution = T_mid;
      converged = true;
      break;
    }

    if (res_min.rendement * res_mid.rendement < 0) {
      T_max = T_mid;
      res_max = res_mid;
    } else {
      T_min = T_mid;
      res_min = res_mid;
    }
  }

  if (!converged) T_solution = (T_min + T_max) / 2;

  const resultat_final = calculerRendement(T_solution);

  // ✅ CORRECTION : Utiliser les valeurs retournées par calculerRendement
  return {
    temperature_flamme: Math.round(T_solution * 10) / 10,
    volume_air: Math.round(resultat_final.volume_air * 10) / 10,
    volume_fumees: Math.round(resultat_final.volume_fumees * 10) / 10,
    facteur_air: Math.round(resultat_final.facteur_air * 1000) / 1000,
    rendement_final: Math.round(resultat_final.rendement * 1000000) / 1000000,
    pcs: Math.round(resultat_final.hs * 100) / 100,
    pci: Math.round(resultat_final.hi * 100) / 100,
    iterations: iterations,
    converged: converged,
    // ✅ CORRECTION : Utiliser les valeurs retournées par calculerRendement
    CO2: Math.round(resultat_final.V_CO2_fum * 10) / 10,
    O2: Math.round(resultat_final.V_O2_fum * 10) / 10,
    H2O: Math.round(resultat_final.V_H2O_fum * 10) / 10,
    N2: Math.round(resultat_final.V_N2_fum * 10) / 10,
    Ar: Math.round(resultat_final.V_Ar_fum * 10) / 10
  };
};