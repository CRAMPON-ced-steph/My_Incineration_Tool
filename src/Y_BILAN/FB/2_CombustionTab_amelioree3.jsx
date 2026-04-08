import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { molarMasses, massVolumique } from '../../A_Transverse_fonction/constantes';
import { getTranslatedParameter, getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';
import {
  cp_dt_h2o, fh_MS_kW, fh_MM_kW, Hfvoute_kW, Tair_fluide_FB,
  Masse_Air_Instrumentation, MasseAir, Vol_Air, Mole_Excess_O2,
  MoleNOx, cp_air, Masse_Air_Comb_gaz_Func, MasseAir_e, Vol_Air_e, 
  FractionMassiqueC, FractionMassiqueH, FractionMassiqueO, FractionMassiqueN, FractionMassiqueS, FractionMassiqueCl , Mole_CO, Mole_H2,TempSortieFumees
} from '../../A_Transverse_fonction/bilan_fct_FB';
import { H2O_kg_m3, CO2_kg_m3, O2_kg_m3, N2_kg_m3 } from '../../A_Transverse_fonction/conv_calculation';
import SchemaProcessus from './SchemaProcessus';
 
const useTranslation = (currentLanguage = 'fr') => {
  return useMemo(() => {
    const languageCode = getLanguageCode(currentLanguage);
    return (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  }, [currentLanguage]);
};
 
const FUEL_PROPERTIES = {
  GAZ: { density: 0.75, pci: 7730, C_percent: 88.7, H_percent: 7.4, O_percent: 0.6, N_percent: 0.9, S_percent: 1.2, Cl_percent: 0 },
  BIOGAZ: { density: 1.15, pci: 5000, C_percent: 75, H_percent: 25, O_percent: 0, N_percent: 0, S_percent: 0, Cl_percent: 0 },
  FIOUL: { density: 850, pci: 10223, C_percent: 75, H_percent: 25, O_percent: 0, N_percent: 0, S_percent: 0, Cl_percent: 0 },
};
 
const DEFAULT_AIR_COMP_ROW = { CO2_pct: 0, H2O_pct: 0, O2_pct: 23.14, N2_pct: 76.86, SO2_pct: 0, Cl_pct: 0 };
const DEFAULT_AIR_COMPOSITION = {
  air_combustion_boue: { ...DEFAULT_AIR_COMP_ROW },
  air_combustion_gaz:  { ...DEFAULT_AIR_COMP_ROW },
  air_instrumentation: { ...DEFAULT_AIR_COMP_ROW },
  air_secondaire:      { ...DEFAULT_AIR_COMP_ROW },
  air_tertiaire:       { ...DEFAULT_AIR_COMP_ROW },
};
 
const DEFAULT_EMISSIONS = {
  type_energy: 'GAZ',
  densite_combustible: 0.75,
  PCI_combustible: 7730,
  Exces_air_lit: 78,
  Exces_air_combustible: 78,
  O2_pct_air_combustion: 21,
  Teneur_en_eau_kgH2O_kgAS: 0.008,
  SO2_recupere_cendre_pourcent: 20,
  Masse_volatile_kg_h: 0,
  Masse_brute_kg_h: 0,
  Masse_seche_kg_h: 0,
  Masse_mineral_kg_h: 0,
  PCI_boue_kcal_kgMV: 0,
  Masse_eau_kg_h: 0,
};
 
const DEFAULT_THERMAL = {
  Temp_boue_entree_C: 39,
  Temp_fumee_voute_C: 870,
  Temp_air_fluidisation_av_prechauffe_C: 15,
  Temp_air_secondaire_C: 10,
  Masse_air_secondaire_kg_h: 10,
  Masse_air_tertiaire_kg_h: 0,
  Temp_air_tertiaire_C: 0,
  Temp_air_balayage_instrumentation_C: 15,
  Tf_voute_ap_HX_C: 550,
  Pertes_thermiques_pourcent: 3,
  Rdt_HX: 0.85,
};
 
const lsGet = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch { } };
 
const calculateAirMassComposition = (airRow, masse_seche_kg_h, humidite_kg_h = 0) => {
  const total_masse = masse_seche_kg_h + humidite_kg_h;
  return {
    CO2_kg_h: total_masse * (airRow.CO2_pct / 100),
    H2O_kg_h: total_masse * (airRow.H2O_pct / 100),
    O2_kg_h: total_masse * (airRow.O2_pct / 100),
    N2_kg_h: total_masse * (airRow.N2_pct / 100),
    SO2_kg_h: total_masse * (airRow.SO2_pct / 100),
    Cl_kg_h: total_masse * (airRow.Cl_pct / 100),
  };
};
 
// ✅ CORRECTION 1 : Fonction simplifiée qui utilise directement airComp
const calculateAirMassicFractions = (airComp) => {
  // airComp contient déjà les compositions en %
  // Les fonctions FractionMassiqueX() ne sont pas appelées ici
  return {
    C_pct: airComp.C_pct ?? 0,
    H_pct: airComp.H_pct ?? 0,
    O_pct: airComp.O_pct ?? 0,
    N_pct: airComp.N_pct ?? 0,
    S_pct: airComp.S_pct ?? 0,
    Cl_pct: airComp.Cl_pct ?? 0,
  };
};
 
const calculateAirElementMasses = (C_pct, H_pct, O_pct, N_pct, S_pct, Cl_pct, masse_seche_kg_h, humidite_kg_h = 0) => {
  const total_masse = masse_seche_kg_h + humidite_kg_h;
  return {
    C_kg_h: total_masse * (C_pct / 100),
    H_kg_h: total_masse * (H_pct / 100),
    O_kg_h: total_masse * (O_pct / 100),
    N_kg_h: total_masse * (N_pct / 100),
    S_kg_h: total_masse * (S_pct / 100),
    Cl_kg_h: total_masse * (Cl_pct / 100),
  };
};
 
const calculateMoles = (masse_kg_h, masse_molaire) => {
  if (!masse_kg_h || !masse_molaire) return 0;
  return (masse_kg_h / masse_molaire) * 1000;
};
 
// ============================================================
// CALCUL ITÉRATIF COMPLET
// ============================================================
 
function runIterativeCalc({
  composition, sludgeC, sludgeH, sludgeO, sludgeN, sludgeS, sludgeCl,
  Exces_air_lit, Exces_air_combustible,
  Teneur_en_eau_kgH2O_kgAS, Masse_volatile_kg_h, Masse_seche_kg_h, Masse_mineral_kg_h,
  PCI_boue_kcal_kgMV, Masse_eau_kg_h, SO2_recupere_cendre_pourcent,
  Temp_boue_entree_C, Temp_fumee_voute_C, Temp_air_fluidisation_av_prechauffe_C,
  Temp_air_secondaire_C, Temp_air_tertiaire_C, Pertes_thermiques_pourcent,
  Temp_air_balayage_instrumentation_C, Tf_voute_ap_HX_C, Rdt_HX,
  Masse_air_secondaire_kg_h, Masse_air_tertiaire_kg_h,
  MS_pourcent, MV_pourcent, BoueBrute_kg_h,
  airComposition,
}) {
  const MAX_ITER = 20;
  const TOLERANCE = 0.1;
  let Masse_gaz_kg_h = 0;
  let r = {};
 
  // ✅ CORRECTION 3 : Validation de composition dès le départ
  if (!composition || typeof composition.C_percent === 'undefined') {
    console.error('❌ Invalid composition in runIterativeCalc:', composition);
    return {};
  }
 
  // ✅ CORRECTION 4 : Utiliser nullish coalescing pour l'air composition
  const airCombBoue = airComposition?.air_combustion_boue ?? DEFAULT_AIR_COMP_ROW;
  const airCombGaz = airComposition?.air_combustion_gaz ?? DEFAULT_AIR_COMP_ROW;
  const airInstru = airComposition?.air_instrumentation ?? DEFAULT_AIR_COMP_ROW;
  const airSec = airComposition?.air_secondaire ?? DEFAULT_AIR_COMP_ROW;
  const airTert = airComposition?.air_tertiaire ?? DEFAULT_AIR_COMP_ROW;
 
  for (let iter = 0; iter < MAX_ITER; iter++) {
    const Mgaz = {
      C: (composition.C_percent / 100) * Masse_gaz_kg_h,
      H: (composition.H_percent / 100) * Masse_gaz_kg_h,
      O: (composition.O_percent / 100) * Masse_gaz_kg_h,
      N: (composition.N_percent / 100) * Masse_gaz_kg_h,
      S: (composition.S_percent / 100) * Masse_gaz_kg_h,
      Cl: (composition.Cl_percent / 100) * Masse_gaz_kg_h,
    };
 
    // ✅ CORRECTION 5 : Protéger composition.C_percent, H_percent, etc.
    const Maire_sec_comb_gaz = Masse_Air_Comb_gaz_Func(
      Masse_gaz_kg_h, Exces_air_combustible,
      composition.C_percent ?? 0, composition.H_percent ?? 0, 
      composition.S_percent ?? 0, composition.O_percent ?? 0
    ) || 0;
 
    const Mboue = {
      C: (sludgeC / 100) * Masse_volatile_kg_h,
      H: (sludgeH / 100) * Masse_volatile_kg_h,
      O: (sludgeO / 100) * Masse_volatile_kg_h,
      N: (sludgeN / 100) * Masse_volatile_kg_h,
      S: (sludgeS / 100) * Masse_volatile_kg_h,
      Cl: (sludgeCl / 100) * Masse_volatile_kg_h,
    };
 
    const Maire_balayage = Masse_Air_Instrumentation(Mboue.C, Mboue.H, Mboue.S, Mboue.O) || 0;
    const Vair_balayage = Maire_balayage / 1.293;
    const Maire_sec_comb_boue = MasseAir_e(Mboue.C, Mboue.H, Mboue.S, Mboue.O, Exces_air_lit, 21) || 0;
    const Vair_sec_comb_boue = Vol_Air_e(Mboue.C, Mboue.H, Mboue.S, Mboue.O, Exces_air_lit, 21) || 0;
    const Vair_sec_comb_gaz = Vol_Air_e(Mgaz.C, Mgaz.H, Mgaz.S, Mgaz.O, Exces_air_combustible, 21) || 0;
    const Vair_sec_comb_tot = Vair_sec_comb_boue + Vair_sec_comb_gaz;
 
    const Mhum_comb_boue = Maire_sec_comb_boue * Teneur_en_eau_kgH2O_kgAS;
    const Mhum_comb_gaz = Maire_sec_comb_gaz * Teneur_en_eau_kgH2O_kgAS;
    const Mhum_comb_tot = Mhum_comb_boue + Mhum_comb_gaz;
 
    const Vvap_boue = Vair_sec_comb_boue * 1.293 * Teneur_en_eau_kgH2O_kgAS * (0.0224 / 0.018);
    const Vvap_gaz = Vair_sec_comb_gaz * 1.293 * Teneur_en_eau_kgH2O_kgAS * (0.0224 / 0.018);
    const Vvap_tot = Vvap_boue + Vvap_gaz;
    const Vair_comb_tot = Vair_sec_comb_tot + Vvap_tot;
 
    const Debit_eau = Masse_eau_kg_h + Maire_balayage * Teneur_en_eau_kgH2O_kgAS + Maire_sec_comb_boue * Teneur_en_eau_kgH2O_kgAS;
 
    const MB_C = (Mboue.C / 12.01) * 1000;
    const MB_H = ((Mboue.H / 1.008 + (2 * Debit_eau) / 18.016) * 1000);
    const MB_O = (Mboue.O / 16 + Debit_eau / 18.016 + ((Maire_sec_comb_boue / 4.310055 + Maire_balayage / 4.32) / 16)) * 1000;
    const MB_N = ((Mboue.N + (Maire_sec_comb_boue * (1 - 1 / 4.310055) + Maire_balayage * (1 - 1 / 4.32)))) * 1000 / 14.008;
    const MB_S = (Mboue.S / 32.066) * 1000;
    const MB_Cl = (Mboue.Cl / 35.457) * 1000;
 
    const MEau_H = (2 * Debit_eau / 18.016) * 1000;
    const MEau_O = (Debit_eau / 18.016) * 1000;
 
    const MG_C = (Mgaz.C / 12.01) * 1000;
    const MG_H = ((Mgaz.H / 1.008 + (2 * Mhum_comb_gaz) / 18.016) * 1000);
    const MG_O = ((Mgaz.O / 16 + Mhum_comb_gaz / 18.016 + Maire_sec_comb_gaz / 4.310055 / 16) * 1000);
    const MG_N = ((Mgaz.N + Maire_sec_comb_gaz * (1 - 1 / 4.310055)) * 1000) / 14.008;
    const MG_S = (Mgaz.S / 32.066) * 1000;
    const MG_Cl = (Mgaz.Cl / 35.457) * 1000;
 
    const MAirCombBoue_H = (Maire_sec_comb_boue * (airCombBoue.H2O_pct / 100) / 1.008) * 1000;
    const MAirCombBoue_O = (Maire_sec_comb_boue * (airCombBoue.O2_pct / 100) / 16) * 1000;
    const MAirCombBoue_N = (Maire_sec_comb_boue * (airCombBoue.N2_pct / 100) / 14.008) * 1000;
 
    const MAirCombGaz_H = (Maire_sec_comb_gaz * (airCombGaz.H2O_pct / 100) / 1.008) * 1000;
    const MAirCombGaz_O = (Maire_sec_comb_gaz * (airCombGaz.O2_pct / 100) / 16) * 1000;
    const MAirCombGaz_N = (Maire_sec_comb_gaz * (airCombGaz.N2_pct / 100) / 14.008) * 1000;
 
    const MAirInstru_H = (Maire_balayage * (airInstru.H2O_pct / 100) / 1.008) * 1000;
    const MAirInstru_O = (Maire_balayage * (airInstru.O2_pct / 100) / 16) * 1000;
    const MAirInstru_N = (Maire_balayage * (airInstru.N2_pct / 100) / 14.008) * 1000;
 
    const MAirSec_H = (Masse_air_secondaire_kg_h * (airSec.H2O_pct / 100) / 1.008) * 1000;
    const MAirSec_O = (Masse_air_secondaire_kg_h * (airSec.O2_pct / 100) / 16) * 1000;
    const MAirSec_N = (Masse_air_secondaire_kg_h * (airSec.N2_pct / 100) / 14.008) * 1000;
 
    const MAirTert_H = (Masse_air_tertiaire_kg_h * (airTert.H2O_pct / 100) / 1.008) * 1000;
    const MAirTert_O = (Masse_air_tertiaire_kg_h * (airTert.O2_pct / 100) / 16) * 1000;
    const MAirTert_N = (Masse_air_tertiaire_kg_h * (airTert.N2_pct / 100) / 14.008) * 1000;
 
    const MolesO2excGaz = ((Maire_sec_comb_gaz * (1 - 1 / (1 + Exces_air_combustible / 100))) * (1 / 4.310055) * 1000) / 32;
 
    const MF_C = MB_C + MG_C;
    const MF_H = MB_H + MG_H;
    const MF_O2 = MB_O + MG_O;
    const MF_N = MB_N + MG_N;
    const MF_SO2 = MB_S + MG_S;
    const MF_HCl = MB_Cl + MG_Cl;
 
    const MF_CO2 = (MF_C * Math.sqrt(Math.max(MF_O2, 0))) / (0.05 + Math.sqrt(Math.max(MF_O2, 0)));
    const MF_CO = MF_C - MF_CO2;
 
    const MolesO2excBoue = Mole_Excess_O2(Exces_air_lit, Maire_sec_comb_boue, Maire_balayage) || 0;
    const MF_O2exc = MolesO2excGaz + MolesO2excBoue;
 
    const ParamB1 = MF_O2 - 2 * MF_C - 2 * MF_O2exc - 2 * MF_SO2;
    const MF_H2O = ParamB1 + MF_CO;
 
    const MF_NOX = MoleNOx(MS_pourcent, MV_pourcent, PCI_boue_kcal_kgMV, BoueBrute_kg_h) || 0;
    const MF_N2 = (MF_N - MF_NOX) / 2;
 
    const FG_SO2 = (MF_SO2 * molarMasses.SO2) / 1000;
    const FG_HCl = (MF_HCl * molarMasses.HCl) / 1000;
    const FG_CO2 = (MF_CO2 * molarMasses.CO2) / 1000;
    const FG_CO = (MF_CO * molarMasses.CO) / 1000;
    const FG_H2O = (MF_H2O * molarMasses.H2O) / 1000;
    const FG_O2exc = (MF_O2exc * molarMasses.O2) / 1000;
    const FG_NOX = (MF_NOX * molarMasses.NOx) / 1000;
    const FG_N2 = (MF_N2 * molarMasses.N2) / 1000;
    const FG_SO2reel = FG_SO2 * (1 - SO2_recupere_cendre_pourcent / 100);
    const FG_H2 = 0;
 
    const FGv_SO2 = FG_SO2 / massVolumique.SO2;
    const FGv_HCl = FG_HCl / massVolumique.HCl;
    const FGv_CO2 = FG_CO2 / massVolumique.CO2;
    const FGv_CO = FG_CO / massVolumique.CO;
    const FGv_H2O = FG_H2O / massVolumique.H2O;
    const FGv_O2exc = FG_O2exc / massVolumique.O2;
    const FGv_NOX = FG_NOX / massVolumique.NOX;
    const FGv_N2 = FG_N2 / massVolumique.N2;
    const FGv_SO2reel = FG_SO2reel / massVolumique.SO2;
 
    const FG_wet_Nm3 = FGv_HCl + FGv_CO2 + FGv_CO + FGv_H2O + FGv_O2exc + FGv_NOX + FGv_N2 + FGv_SO2reel;
    const FG_dry_Nm3 = FG_wet_Nm3 - FGv_H2O;
    const FG_wet_kg = FG_HCl + FG_CO2 + FG_CO + FG_H2O + FG_O2exc + FG_NOX + FG_N2 + FG_SO2reel;
    const FG_dry_kg = FG_wet_kg - FG_H2O;
 
    const Maire_sec_boue_tot = Maire_sec_comb_boue + Maire_balayage;
    const Maire_sec_comb_tot = Maire_sec_comb_gaz + Maire_sec_comb_boue;
    const Meau_air_comburant = Teneur_en_eau_kgH2O_kgAS * Maire_sec_comb_tot;
 
    const H_MV = (PCI_boue_kcal_kgMV * Masse_volatile_kg_h * 4.1868) / 3600;
    const H_MS = fh_MS_kW(Temp_boue_entree_C, Masse_seche_kg_h) || 0;
    const H_Evap = (Masse_eau_kg_h * (4.1868 * Temp_boue_entree_C - 2501.6)) / 3600;
    const H_MM = fh_MM_kW(Temp_fumee_voute_C, Masse_mineral_kg_h) || 0;
    const H_NET_BOUE = H_MV + H_MS + H_Evap;
 
    const H_air_flu = cp_air(Temp_air_fluidisation_av_prechauffe_C) * Maire_sec_comb_tot + cp_dt_h2o(Temp_air_fluidisation_av_prechauffe_C) * Meau_air_comburant;
 
    const Meau_air2 = Teneur_en_eau_kgH2O_kgAS * Masse_air_secondaire_kg_h;
    const H_air2 = cp_air(Temp_air_secondaire_C) * Masse_air_secondaire_kg_h + cp_dt_h2o(Temp_air_secondaire_C) * Meau_air2;
 
    const Meau_air3 = Teneur_en_eau_kgH2O_kgAS * Masse_air_tertiaire_kg_h;
    const H_air3 = cp_air(Temp_air_tertiaire_C) * Masse_air_tertiaire_kg_h + cp_dt_h2o(Temp_air_tertiaire_C) * Meau_air3;
 
    const Pertes = ((PCI_boue_kcal_kgMV * Masse_volatile_kg_h * (Pertes_thermiques_pourcent / 100)) / 3600) * 4.1868;
 
    const T_soufflante = Temp_air_fluidisation_av_prechauffe_C + 45;
 
    const Meau_balayage = Teneur_en_eau_kgH2O_kgAS * Maire_balayage;
    const H_balayage = cp_air(T_soufflante) * Maire_balayage + cp_dt_h2o(T_soufflante) * Meau_balayage;
 
    const Hf_voute = Hfvoute_kW(Temp_fumee_voute_C, FG_HCl, FG_CO2, FG_CO, FG_H2O, FG_H2, FG_O2exc, FG_N2, FG_SO2reel) || 0;
    const Hf_voute_HX = Hfvoute_kW(Tf_voute_ap_HX_C, FG_HCl, FG_CO2, FG_CO, FG_H2O, FG_H2, FG_O2exc, FG_N2, FG_SO2reel) || 0;
 
    const Tair_prech = Tair_fluide_FB(Hf_voute, Hf_voute_HX, 0, Rdt_HX, Maire_sec_comb_tot, Meau_air_comburant) || 0;
    const H_air_prech = cp_air(Tair_prech) * Maire_sec_comb_tot + cp_dt_h2o(Tair_prech) * (Maire_sec_comb_tot * Teneur_en_eau_kgH2O_kgAS);
 
    const H_gaz_inter = (Masse_gaz_kg_h / 0.87) * 11.493;
 
    const H_in = H_NET_BOUE + H_air_prech + H_balayage + H_gaz_inter;
    const H_out = H_MM + Hf_voute + Pertes;
    const H_gaz = H_out - H_in;
 
    const Q_gaz_Nm3 = H_gaz / 11.493;
    const Q_gaz_kg = Q_gaz_Nm3 * 0.87;
 
    const Rho_FG_kg_Nm3 = Vvap_boue > 0 ? FG_wet_kg / FG_wet_Nm3 : 0;
 
    const Mhum_air_instru = Teneur_en_eau_kgH2O_kgAS * Maire_balayage;
    const Mhum_air_sec = Teneur_en_eau_kgH2O_kgAS * Masse_air_secondaire_kg_h;
    const Mhum_air_tert = Teneur_en_eau_kgH2O_kgAS * Masse_air_tertiaire_kg_h;
 
    const Vvap_instru = Maire_balayage * Teneur_en_eau_kgH2O_kgAS * (0.0224 / 0.018);
    const Vvap_sec = Masse_air_secondaire_kg_h * Teneur_en_eau_kgH2O_kgAS * (0.0224 / 0.018);
    const Vvap_tert = Masse_air_tertiaire_kg_h * Teneur_en_eau_kgH2O_kgAS * (0.0224 / 0.018);
 
    const Vair_instru = Maire_balayage / 1.293;
    const Vair_sec = Masse_air_secondaire_kg_h / 1.293;
    const Vair_tert = Masse_air_tertiaire_kg_h / 1.293;
 
    const Vair_comb_boue_tot = Vair_sec_comb_boue + Vvap_boue;
    const Vair_comb_gaz_tot = Vair_sec_comb_gaz + Vvap_gaz;
    const Vair_instru_tot = Vair_instru + Vvap_instru;
    const Vair_sec_tot = Vair_sec + Vvap_sec;
    const Vair_tert_tot = Vair_tert + Vvap_tert;
 
    const isConverged = Math.abs(Q_gaz_kg) < TOLERANCE;
    const isLastIter = iter === MAX_ITER - 1;
 
    if (isConverged || isLastIter) {
      r = {
        Q_gaz_kg_h: Masse_gaz_kg_h, Q_gaz_Nm3_h: Masse_gaz_kg_h / 0.87,
        Masse_gaz_kg_h, iteration: iter + 1, converged: isConverged,
        Temp_fumee_voute_C, Tf_voute_ap_HX_C,
        Volume_air_balayage_Nm3_h: Vair_balayage, Masse_air_balayage_kg_h: Maire_balayage,
        Masse_air_sec_combustion_boue_kg_h: Maire_sec_comb_boue,
        Volume_air_sec_combustion_boue_Nm3_h: Vair_sec_comb_boue,
        Masse_humidite_air_combustion_boue_kg_h: Mhum_comb_boue,
        VolumeVapeurEauAirCombustionBoue_Nm3_h: Vvap_boue,
        VolumeAirCombustionBoue_total_Nm3_h: Vair_comb_boue_tot,
        Masse_air_sec_combustion_gaz_kg_h: Maire_sec_comb_gaz,
        Volume_air_sec_combustion_gaz_Nm3_h: Vair_sec_comb_gaz,
        Masse_humidite_air_combustion_gaz_kg_h: Mhum_comb_gaz,
        VolumeVapeurEauAirCombustionGaz_Nm3_h: Vvap_gaz,
        VolumeAirCombustionGaz_total_Nm3_h: Vair_comb_gaz_tot,
        Masse_air_sec_combustion_tot_kg_h: Maire_sec_comb_tot,
        Volume_air_sec_combustion_tot_Nm3_h: Vair_sec_comb_tot,
        Masse_humidite_air_combustion_total_kg_h: Mhum_comb_tot,
        VolumeVapeurEauAirCombustionTot_Nm3_h: Vvap_tot,
        VolumeAirCombustionTot_Nm3_h: Vair_comb_tot,
        Masse_air_sec_boue_total_kg_h: Maire_sec_boue_tot,
        Masse_air_instru_kg_h: Maire_balayage,
        Volume_air_instru_Nm3_h: Vair_instru,
        Mhum_air_instru, Vvap_instru, Vair_instru_tot,
        Masse_air_secondaire_kg_h_calc: Masse_air_secondaire_kg_h,
        Volume_air_sec_Nm3_h: Vair_sec,
        Mhum_air_sec, Vvap_sec, Vair_sec_tot,
        Masse_air_tertiaire_kg_h_calc: Masse_air_tertiaire_kg_h,
        Volume_air_tert_Nm3_h: Vair_tert,
        Mhum_air_tert, Vvap_tert, Vair_tert_tot,
        MolesBoues_C: MB_C, MolesBoues_H: MB_H, MolesBoues_O: MB_O,
        MolesBoues_N: MB_N, MolesBoues_S: MB_S, MolesBoues_Cl: MB_Cl,
        MolesO2excesBoue: MolesO2excBoue,
        MolesEauBoue_H: MEau_H, MolesEauBoue_O: MEau_O,
        MolesGaz_C: MG_C, MolesGaz_H: MG_H, MolesGaz_O: MG_O,
        MolesGaz_N: MG_N, MolesGaz_S: MG_S, MolesGaz_Cl: MG_Cl,
        MolesO2excesGaz: MolesO2excGaz,
        MAirCombBoue_H, MAirCombBoue_O, MAirCombBoue_N,
        MAirCombGaz_H, MAirCombGaz_O, MAirCombGaz_N,
        MAirInstru_H, MAirInstru_O, MAirInstru_N,
        MAirSec_H, MAirSec_O, MAirSec_N,
        MAirTert_H, MAirTert_O, MAirTert_N,
        Moles_Fumees_C: MF_C, Moles_Fumees_H: MF_H,
        Moles_Fumees_O2: MF_O2, Moles_Fumees_N: MF_N,
        Moles_Fumees_SO2: MF_SO2, Moles_Fumees_HCl: MF_HCl,
        Moles_Fumees_CO2: MF_CO2, Moles_Fumees_CO: MF_CO,
        Moles_Fumees_H2O: MF_H2O, Moles_Fumees_O2exces: MF_O2exc,
        Moles_Fumees_NOX: MF_NOX, Moles_Fumees_N2: MF_N2,
        FG_kg_h_SO2: FG_SO2, FG_kg_h_HCl: FG_HCl, FG_kg_h_CO2: FG_CO2,
        FG_kg_h_CO: FG_CO, FG_kg_h_H2O: FG_H2O, FG_kg_h_O2exces: FG_O2exc,
        FG_kg_h_NOX: FG_NOX, FG_kg_h_N2: FG_N2, FG_kg_h_SO2reel: FG_SO2reel,
        FG_kg_h_H2: FG_H2,
        FG_wet_kg_h: FG_wet_kg, FG_dry_kg_h: FG_dry_kg,
        FG_Nm3_h_SO2: FGv_SO2, FG_Nm3_h_HCl: FGv_HCl, FG_Nm3_h_CO2: FGv_CO2,
        FG_Nm3_h_CO: FGv_CO, FG_Nm3_h_H2O: FGv_H2O, FG_Nm3_h_O2exces: FGv_O2exc,
        FG_Nm3_h_NOX: FGv_NOX, FG_Nm3_h_N2: FGv_N2, FG_Nm3_h_SO2reel: FGv_SO2reel,
        FG_wet_Nm3_h: FG_wet_Nm3, FG_dry_Nm3_h: FG_dry_Nm3,
        Masses_boues_composition_kg_h: Mboue,
        Masses_gaz_composition_kg_h: Mgaz,
        H_MV_boue_entree_kW: H_MV, H_MS_boue_entree_kW: H_MS,
        H_Evap_boue_entree_kW: H_Evap, H_matiere_minerale_kW: H_MM,
        H_NETTE_BOUE_kW: H_NET_BOUE,
        H_air_fluidisation_av_prechauffe_kW: H_air_flu,
        H_air_secondaire_kW: H_air2, H_air_tertiaire_kW: H_air3,
        Pertes_thermiques_kW: Pertes,
        Temp_air_soufflante_C: T_soufflante,
        Masse_eau_air_balayage_kg_h: Meau_balayage,
        H_air_balayage_instrumentation_kW: H_balayage,
        Hf_voute_kW: Hf_voute, Hf_voute_ap_HX_kW: Hf_voute_HX,
        Tair_ap_prechauffe_C: Tair_prech,
        Hair_ap_prechauffage_kW: H_air_prech,
        H_gaz_inter, H_gaz, H_in, H_out,
        Rho_FG_kg_Nm3, Meau_air_comburant,
        // Données pour calculs air
        Maire_sec_comb_boue,
        Maire_sec_comb_gaz,
        Maire_balayage,
      };
      break;
    }
 
    Masse_gaz_kg_h = Math.max(0, Masse_gaz_kg_h + Q_gaz_kg);
  }
 
  return r;
}
 
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#555' }}>
    <div onClick={() => onChange(!checked)} style={{
      width: '44px', height: '24px', borderRadius: '12px',
      backgroundColor: checked ? '#3b82f6' : '#ccc',
      position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer',
    }}>
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff',
        position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
    {label}
  </label>
);
 
// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
 
const CombustionTab = ({ innerData = {}, onInnerDataChange, onResultsChange, currentLanguage = 'fr' }) => {
  const t = useTranslation(currentLanguage);
 
  const [emissions, setEmissions] = useState(() => lsGet('emissions', DEFAULT_EMISSIONS));
  const [thermalParams, setThermalParams] = useState(() => lsGet('thermalParams', DEFAULT_THERMAL));
  const [airComposition, setAirComposition] = useState(() => lsGet('airComposition', DEFAULT_AIR_COMPOSITION));
  const [showExpertAir, setShowExpertAir] = useState(false);
  const [showExpertFumees, setShowExpertFumees] = useState(false);
  const [showDetailedBilan, setShowDetailedBilan] = useState(false);
 
  useEffect(() => { lsSet('emissions', emissions); }, [emissions]);
  useEffect(() => { lsSet('thermalParams', thermalParams); }, [thermalParams]);
  useEffect(() => { lsSet('airComposition', airComposition); }, [airComposition]);
 
  useEffect(() => {
    setEmissions((prev) => {
      const map = {
        Masse_volatile_kg_h: innerData.MV_kg_h,
        Masse_brute_kg_h: innerData.BoueBrute_kg_h,
        Masse_seche_kg_h: innerData.MS_kg_h,
        Masse_mineral_kg_h: innerData.MM_kg_h,
        PCI_boue_kcal_kgMV: innerData.PCIKCALKGMV,
        Masse_eau_kg_h: innerData.EauExtraite_kg_h,
      };
      let changed = false;
      const next = { ...prev };
      Object.entries(map).forEach(([k, v]) => {
        if (v !== undefined && v !== prev[k]) { next[k] = v; changed = true; }
      });
      return changed ? next : prev;
    });
  }, [innerData.MV_kg_h, innerData.BoueBrute_kg_h, innerData.MS_kg_h, innerData.MM_kg_h, innerData.PCIKCALKGMV, innerData.EauExtraite_kg_h]);
 
  // ✅ CORRECTION 2 : Initialiser composition de manière sûre
  const composition = useMemo(() => {
    const c = FUEL_PROPERTIES[emissions.type_energy] || FUEL_PROPERTIES.GAZ;
    return c || {
      density: 0.75, pci: 7730,
      C_percent: 0, H_percent: 0, O_percent: 0, N_percent: 0, S_percent: 0, Cl_percent: 0
    };
  }, [emissions.type_energy]);
 
  const results = useMemo(() => {
    try {
      // ✅ CORRECTION 6 : Utiliser nullish coalescing pour innerData
      return runIterativeCalc({
        composition,
        sludgeC: innerData?.C_percent ?? 0,
        sludgeH: innerData?.H_percent ?? 0,
        sludgeO: innerData?.O_percent ?? 0,
        sludgeN: innerData?.N_percent ?? 0,
        sludgeS: innerData?.S_percent ?? 0,
        sludgeCl: innerData?.Cl_percent ?? 0,
        Exces_air_lit: emissions.Exces_air_lit ?? 0,
        Exces_air_combustible: emissions.Exces_air_combustible ?? 0,
        Teneur_en_eau_kgH2O_kgAS: emissions.Teneur_en_eau_kgH2O_kgAS ?? 0,
        Masse_volatile_kg_h: emissions.Masse_volatile_kg_h ?? 0,
        Masse_seche_kg_h: emissions.Masse_seche_kg_h ?? 0,
        Masse_mineral_kg_h: emissions.Masse_mineral_kg_h ?? 0,
        PCI_boue_kcal_kgMV: emissions.PCI_boue_kcal_kgMV ?? 0,
        Masse_eau_kg_h: emissions.Masse_eau_kg_h ?? 0,
        SO2_recupere_cendre_pourcent: emissions.SO2_recupere_cendre_pourcent ?? 0,
        Temp_fumee_voute_C: thermalParams.Temp_fumee_voute_C,
        Temp_boue_entree_C: thermalParams.Temp_boue_entree_C,
        Temp_air_fluidisation_av_prechauffe_C: thermalParams.Temp_air_fluidisation_av_prechauffe_C,
        Temp_air_secondaire_C: thermalParams.Temp_air_secondaire_C,
        Temp_air_tertiaire_C: thermalParams.Temp_air_tertiaire_C,
        Pertes_thermiques_pourcent: thermalParams.Pertes_thermiques_pourcent,
        Temp_air_balayage_instrumentation_C: thermalParams.Temp_air_balayage_instrumentation_C,
        Tf_voute_ap_HX_C: thermalParams.Tf_voute_ap_HX_C,
        Rdt_HX: thermalParams.Rdt_HX,
        Masse_air_secondaire_kg_h: thermalParams.Masse_air_secondaire_kg_h,
        Masse_air_tertiaire_kg_h: thermalParams.Masse_air_tertiaire_kg_h,
        MS_pourcent: innerData?.MS_pourcent ?? 0,
        MV_pourcent: innerData?.MV_pourcent ?? 0,
        BoueBrute_kg_h: innerData?.BoueBrute_kg_h ?? 0,
        airComposition,
      });
    } catch (err) {
      console.error('❌ Erreur calcul combustion:', err);
      return {};
    }
  }, [emissions, thermalParams, composition, airComposition,
    innerData?.C_percent, innerData?.H_percent, innerData?.O_percent,
    innerData?.N_percent, innerData?.S_percent, innerData?.Cl_percent,
    innerData?.MS_pourcent, innerData?.MV_pourcent, innerData?.BoueBrute_kg_h]);
 
  // Calculs pour tableau expert air
  const airDataCalculations = useMemo(() => {
    const airRows = [
      { key: 'air_combustion_boue', label: 'Air de combustion des boues', masse_kg_h: results.Masse_air_sec_combustion_boue_kg_h ?? 0, humidite_kg_h: results.Masse_humidite_air_combustion_boue_kg_h ?? 0 },
      { key: 'air_combustion_gaz', label: 'Air de combustion gaz', masse_kg_h: results.Masse_air_sec_combustion_gaz_kg_h ?? 0, humidite_kg_h: results.Masse_humidite_air_combustion_gaz_kg_h ?? 0 },
      { key: 'air_instrumentation', label: 'Air instrumentation', masse_kg_h: results.Masse_air_instru_kg_h ?? 0, humidite_kg_h: results.Mhum_air_instru ?? 0 },
      { key: 'air_secondaire', label: 'Air secondaire', masse_kg_h: results.Masse_air_secondaire_kg_h_calc ?? 0, humidite_kg_h: results.Mhum_air_sec ?? 0 },
      { key: 'air_tertiaire', label: 'Air tertiaire', masse_kg_h: results.Masse_air_tertiaire_kg_h_calc ?? 0, humidite_kg_h: results.Mhum_air_tert ?? 0 },
    ];
 
    const calculations = {};
    for (const row of airRows) {
      // ✅ CORRECTION 7 : Utiliser nullish coalescing pour airComposition
      const airComp = airComposition?.[row.key] ?? DEFAULT_AIR_COMP_ROW;
      const massComp = calculateAirMassComposition(airComp, row.masse_kg_h, row.humidite_kg_h);
      
      // ✅ CORRECTION 1 : Passer airComp directement
      const fractions = calculateAirMassicFractions(airComp);
      const elementMasses = calculateAirElementMasses(
        fractions.C_pct, fractions.H_pct, fractions.O_pct,
        fractions.N_pct, fractions.S_pct, fractions.Cl_pct,
        row.masse_kg_h, row.humidite_kg_h
      );
      
      calculations[row.key] = {
        ...row,
        massComposition: massComp,
        fractions,
        elementMasses,
        moles: {
          C: calculateMoles(elementMasses.C_kg_h, 12.01),
          H: calculateMoles(elementMasses.H_kg_h, 1.008),
          O: calculateMoles(elementMasses.O_kg_h, 16),
          N: calculateMoles(elementMasses.N_kg_h, 14.007),
          S: calculateMoles(elementMasses.S_kg_h, 32.066),
          Cl: calculateMoles(elementMasses.Cl_kg_h, 35.45),
        },
      };
    }
    return calculations;
  }, [airComposition, results.Masse_air_sec_combustion_boue_kg_h, results.Masse_humidite_air_combustion_boue_kg_h,
      results.Masse_air_sec_combustion_gaz_kg_h, results.Masse_humidite_air_combustion_gaz_kg_h,
      results.Masse_air_instru_kg_h, results.Mhum_air_instru,
      results.Masse_air_secondaire_kg_h_calc, results.Mhum_air_sec,
      results.Masse_air_tertiaire_kg_h_calc, results.Mhum_air_tert]);
 
  // Update innerData
  useEffect(() => {
    if (innerData) {
      innerData.FG_wet_Nm3_h = results.FG_wet_Nm3_h ?? 0;
      innerData.FG_dry_Nm3_h = results.FG_dry_Nm3_h ?? 0;
      onInnerDataChange?.();
    }
  }, [results, innerData, onInnerDataChange]);
 
  const handleFuelChange = useCallback((fuelType) => {
    const p = FUEL_PROPERTIES[fuelType];
    setEmissions((prev) => ({ ...prev, type_energy: fuelType, densite_combustible: p.density, PCI_combustible: p.pci }));
  }, []);
 
  const handleEmission = useCallback((key, value) => { setEmissions((prev) => ({ ...prev, [key]: parseFloat(value) || 0 })); }, []);
  const handleThermal = useCallback((key, value) => { setThermalParams((prev) => ({ ...prev, [key]: parseFloat(value) || 0 })); }, []);
 
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#333' };
  const card = { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' };
  const cardTitle = { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#222' };
  const secTitle = { fontSize: '16px', fontWeight: 'bold', marginTop: '20px', marginBottom: '15px', color: '#444', borderBottom: '2px solid #ddd', paddingBottom: '10px' };
  const TH = { border: '1px solid #999', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '10px', backgroundColor: '#D4B5A0' };
  const TD = { border: '1px solid #CCC', padding: '4px 6px', textAlign: 'center', fontSize: '10px' };
  const TDL = { ...TD, textAlign: 'left', fontWeight: 'bold' };
  const TDR = { ...TD, textAlign: 'right', fontWeight: 'bold' };
  const resultBox = { ...inputStyle, backgroundColor: '#e8f5e9', padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#2e7d32' };
 
  const f = (v, d = 2) => v != null && isFinite(v) ? v.toFixed(d) : '-';
 
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={card}>
        <div style={cardTitle}>🔥 {t('Paramètres de Combustion')}</div>
        <div style={secTitle}>{t('Type de combustible')}</div>
        <div style={{ marginBottom: '25px' }}>
          <label style={labelStyle}>{t('Sélectionner le combustible')}</label>
          <select value={emissions.type_energy} onChange={(e) => handleFuelChange(e.target.value)} style={inputStyle}>
            <option value="GAZ">Gaz naturel</option>
            <option value="BIOGAZ">Biogaz</option>
            <option value="FIOUL">Fioul</option>
          </select>
        </div>
      </div>
 
      {/* Tableau expert air */}
      <div style={card}>
        <div style={{ ...cardTitle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>🌬️ {t('Air de Combustion')}</span>
          <ToggleSwitch label="Expert" checked={showExpertAir} onChange={setShowExpertAir} />
        </div>
 
        {showExpertAir ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr>
                  <th style={{ ...TH, width: '200px' }}>Paramètre</th>
                  <th style={TH}>C (%)</th><th style={TH}>H (%)</th><th style={TH}>O (%)</th>
                  <th style={TH}>N (%)</th><th style={TH}>S (%)</th><th style={TH}>Cl (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(airDataCalculations).map((airData) => {
                  const fract = airData.fractions;
                  return (
                    <tr key={airData.key} style={{ backgroundColor: '#F0F8FF' }}>
                      <td style={{ ...TDR, color: '#dc2626' }}>{airData.label}</td>
                      <td style={TD}>{f(fract.C_pct, 2)}</td>
                      <td style={TD}>{f(fract.H_pct, 2)}</td>
                      <td style={TD}>{f(fract.O_pct, 2)}</td>
                      <td style={TD}>{f(fract.N_pct, 2)}</td>
                      <td style={TD}>{f(fract.S_pct, 2)}</td>
                      <td style={TD}>{f(fract.Cl_pct, 2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Mode simplifié</p>
        )}
      </div>
    </div>
  );
};
 
export default CombustionTab;