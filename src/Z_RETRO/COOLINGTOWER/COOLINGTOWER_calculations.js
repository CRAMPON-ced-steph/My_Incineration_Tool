import {fh_CO2, fh_H2O, fh_O2, fh_N2} from '../../A_Transverse_fonction/enthalpy_gas';
import {Qeau_remove_to_be_at_T, temp_bef_add_wat, TEMP_FUMEE} from '../../A_Transverse_fonction/enthalpy_mix_gas';
import {CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3, coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';
import { hV_T } from '../../A_Transverse_fonction/steam_table3';

export const performCalculation_COOLINGTOWER_option_Qeau = (nodeData, Teau, T_steam_C, Qeau_kg_h, Qsteam_kg_h, PDC_aero) => {
  // Extract receivedData from nodeData.result with default values
  
  // LECTURE DU NOEUD PRECEDENT
  const Taval = nodeData.result.dataFlow.T;
  const Qm_CO2_out_kg_h = nodeData.result.dataFlow.Qm_CO2_kg_h;
  const Qm_H2O_out_kg_h = nodeData.result.dataFlow.Qm_H2O_kg_h;
  const Qm_O2_out_kg_h = nodeData.result.dataFlow.Qm_O2_kg_h;
  const Qm_N2_out_kg_h = nodeData.result.dataFlow.Qm_N2_kg_h;

  const P_out_mmCE = nodeData.result.dataFlow.P_mmCE ;
//const T_steam_C = parseFloat(T_steam_C);
// const Qsteam_kg_h = parseFloat(Qsteam_kg_h);
//const Qeau_kg_h = parseFloat(Qeau_kg_h);


  let H_vapeur_kJ = hV_T(T_steam_C)*Qsteam_kg_h;
  let H_vapeur_kW = H_vapeur_kJ/3600;
  


  // ON CALCULE LA NOUVELLE COMPOSITION DES FUMEES ENTREES EN MASSE
  const Qm_CO2_intermediaire_kg_h = Qm_CO2_out_kg_h;
  const Qm_H2O_intermediaire_kg_h = Qm_H2O_out_kg_h - Qeau_kg_h;
  const Qm_O2_intermediaire_kg_h = Qm_O2_out_kg_h;
  const Qm_N2_intermediaire_kg_h = Qm_N2_out_kg_h;
  const Qm_tot_intermediaire_kg_h = Qm_CO2_intermediaire_kg_h + Qm_H2O_intermediaire_kg_h + Qm_O2_intermediaire_kg_h + Qm_N2_intermediaire_kg_h;



  // ON CALCULE LA MASSE D'EAU QU'IL A FALLU AJOUTER POUR ARRIVER A LA TEMPERATURE FINALE
  const T_intermediaire = temp_bef_add_wat(Qeau_kg_h, Teau, Taval, Qm_CO2_out_kg_h, Qm_H2O_out_kg_h, Qm_N2_out_kg_h, Qm_O2_out_kg_h);

  // Calculate enthalpies using the provided T
  const H_CO2_intermediaire_kj = fh_CO2(T_intermediaire) * Qm_CO2_intermediaire_kg_h;
  const H_H2O_intermediaire_kj = (fh_H2O(T_intermediaire) + 540 * 4.1868) * Qm_H2O_intermediaire_kg_h;
  const H_O2_intermediaire_kj = fh_O2(T_intermediaire) * Qm_O2_intermediaire_kg_h;
  const H_N2_intermediaire_kj = fh_N2(T_intermediaire) * Qm_N2_intermediaire_kg_h;
  const H_tot_intermediaire_kj = H_CO2_intermediaire_kj + H_H2O_intermediaire_kj + H_O2_intermediaire_kj + H_N2_intermediaire_kj;
  const H_tot_intermediaire_kW = H_tot_intermediaire_kj / 3600;

  // ON CALCULE LA NOUVELLE COMPOSITION DES FUMEES ENTREES EN MASSE EN AJOUTANT LA VAPEUR
  const Qm_CO2_kg_h = Qm_CO2_intermediaire_kg_h;
  const Qm_H2O_kg_h = Qm_H2O_intermediaire_kg_h - Qsteam_kg_h;
  const Qm_O2_kg_h = Qm_O2_intermediaire_kg_h;
  const Qm_N2_kg_h = Qm_N2_intermediaire_kg_h;
  const Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;

const delta_H=H_tot_intermediaire_kj- H_vapeur_kJ;

  const T_final = TEMP_FUMEE(delta_H, Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_N2_kg_h, Qm_O2_kg_h);

  //ON CONVERTIT LES MASSES EN VOLUME
  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2_kg_h);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O_kg_h);
  const Qv_O2_Nm3_h = O2_kg_m3(Qm_O2_kg_h);
  const Qv_N2_Nm3_h = N2_kg_m3(Qm_N2_kg_h);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;

  // ON CALCULE LA REPARTITION POURCENT VOLUMIQUE
  const O2_dry_pourcent = Qv_sec_Nm3_h > 0 ? (Qv_O2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const O2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_O2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const H2O_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_H2O_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const N2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_N2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const CO2_dry_pourcent = Qv_sec_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const CO2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;


let T=T_final;


  // Calculate enthalpies using the provided T
  const H_CO2_kj = fh_CO2(T) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T) + 540 * 4.1868) * Qm_H2O_kg_h;
  const H_O2_kj = fh_O2(T) * Qm_O2_kg_h;
  const H_N2_kj = fh_N2(T) * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;
  const H_tot_kW = H_tot_kj / 3600;




  let P_mmCE = P_out_mmCE-PDC_aero;
  let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T)*Qv_wet_Nm3_h;
    


  const dataCOOLINGTOWER = {H_tot_intermediaire_kj,H_tot_intermediaire_kW, H_vapeur_kJ, H_vapeur_kW, T_intermediaire, T_final};

  const dataFlow = {
    T,
    P_mmCE,
    Qv_wet_m3_h,
    Qv_wet_Nm3_h,
    O2_dry_pourcent,
    H2O_pourcent,
    O2_humide_pourcent,
    N2_humide_pourcent,
    CO2_dry_pourcent,
    CO2_humide_pourcent,
    Qv_CO2_Nm3_h,
    Qv_H2O_Nm3_h,
    Qv_O2_Nm3_h,
    Qv_N2_Nm3_h,
    Qv_sec_Nm3_h,
    Qm_CO2_kg_h,
    Qm_H2O_kg_h,
    Qm_O2_kg_h,
    Qm_N2_kg_h,
    Qm_tot_kg_h,
    H_CO2_kj,
    H_H2O_kj,
    H_O2_kj,
    H_N2_kj,
    H_tot_kj,
    H_tot_kW,
  };

  return {dataCOOLINGTOWER, dataFlow};
};