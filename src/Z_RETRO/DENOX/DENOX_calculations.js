import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import { Qeau_remove_to_be_at_T, temp_bef_add_wat } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3, coeff_Nm3_to_m3,  conv_O2_ref } from '../../A_Transverse_fonction/conv_calculation';

export const performCalculation_DENOX_option_Qeau = (nodeData, targetNOx, sprayWaterTemp, coeffStoech, solutionConc, solutionDensity, sprayFlowrate, PDC) => {
  if (!nodeData?.result?.dataFlow) {
    console.error("Invalid nodeData structure");
    return null;
  }

  // LECTURE DU NOEUD PRÉCÉDENT
  const { T: Taval, P_mmCE: P_out_mmCE, Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_O2_kg_h, Qm_N2_kg_h } = nodeData.result.dataFlow;


const Conso_stoechio_reactif_kg_h =(sprayFlowrate*solutionDensity)/1000*(solutionConc/100);
const NH3_molar_mass_g_mol = 17;
const Quantite_NH3_mol_h = Conso_stoechio_reactif_kg_h /NH3_molar_mass_g_mol*1000;

const ratio_mol_NO_mol_reactif = 1;
const Quantite_NO_a_eliminer_mol_h = Quantite_NH3_mol_h *ratio_mol_NO_mol_reactif/coeffStoech;

const NO2_molar_mass_g_mol = 46;
const Quantite_NOx_eliminable_kg_h =Quantite_NO_a_eliminer_mol_h/1000*NO2_molar_mass_g_mol;

const Qv_sec_out_Nm3_h = nodeData.result.dataFlow.Qv_sec_Nm3_h;
const Qv_wet_out_Nm3_h = nodeData.result.dataFlow.Qv_wet_Nm3_h;



  // CALCUL DE LA NOUVELLE COMPOSITION DES FUMÉES EN MASSE

  const Qm_H2O_total_kg_h = Qm_H2O_kg_h + sprayFlowrate;
  const Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_total_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;

  // CALCUL DE LA TEMPÉRATURE APRÈS AJOUT D'EAU
  const T = temp_bef_add_wat(sprayFlowrate, sprayWaterTemp, Taval, Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_N2_kg_h, Qm_O2_kg_h);

  // CONVERSION DES MASSES EN VOLUME
  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2_kg_h);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O_total_kg_h);
  const Qv_O2_Nm3_h = O2_kg_m3(Qm_O2_kg_h);
  const Qv_N2_Nm3_h = N2_kg_m3(Qm_N2_kg_h);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;

  // CALCUL DES POURCENTAGES VOLUMIQUES
  const O2_dry_pourcent = (Qv_O2_Nm3_h / Qv_sec_Nm3_h) * 100;
  const O2_humide_pourcent = (Qv_O2_Nm3_h / Qv_wet_Nm3_h) * 100;
  const H2O_pourcent = (Qv_H2O_Nm3_h / Qv_wet_Nm3_h) * 100;
  const N2_humide_pourcent = (Qv_N2_Nm3_h / Qv_wet_Nm3_h) * 100;
  const CO2_dry_pourcent = (Qv_CO2_Nm3_h / Qv_sec_Nm3_h) * 100;
  const CO2_humide_pourcent = (Qv_CO2_Nm3_h / Qv_wet_Nm3_h) * 100;

  // CALCUL DES ENTHALPIES
  const H_CO2_kj = fh_CO2(T) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T) + 540 * 4.18) * Qm_H2O_total_kg_h;
  const H_O2_kj = fh_O2(T) * Qm_O2_kg_h;
  const H_N2_kj = fh_N2(T) * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;
  const H_tot_kW = H_tot_kj / 3600;

  // CALCUL DE LA PRESSION ET DU DÉBIT
  const P_mmCE = parseFloat(P_out_mmCE) +parseFloat(PDC);
  const Qv_sec_m3_h = coeff_Nm3_to_m3(P_mmCE, T) * Qv_sec_Nm3_h;
  const Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T) * Qv_wet_Nm3_h;

const Qv_sec_11pourcent_Nm3_h = Qv_sec_Nm3_h * conv_O2_ref(11, O2_dry_pourcent);

const NOx_concentration_mg_Nm3 = (Quantite_NOx_eliminable_kg_h * Math.pow(10, 6) / Qv_sec_11pourcent_Nm3_h) + targetNOx;


const dataDENOX = { 
  Conso_stoechio_reactif_kg_h ,  
  Quantite_NH3_mol_h  , 
  Quantite_NO_a_eliminer_mol_h, 
  Quantite_NOx_eliminable_kg_h, 
  Qv_sec_m3_h,
  Qv_sec_11pourcent_Nm3_h, 
  NOx_concentration_mg_Nm3 , }


const dataFlow= {
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
  Qm_H2O_total_kg_h,
  Qm_O2_kg_h,
  Qm_N2_kg_h,
  Qm_tot_kg_h,
  H_CO2_kj,
  H_H2O_kj,
  H_O2_kj,
  H_N2_kj,
  H_tot_kj,
  H_tot_kW,
}

  

return {dataDENOX , dataFlow} ;
    

};
