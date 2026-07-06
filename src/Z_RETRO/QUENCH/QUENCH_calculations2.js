import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import { Qeau_remove_to_be_at_T, temp_bef_add_wat } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3, coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { Lv } from '../../A_Transverse_fonction/constantes';

export const performCalculation_QUENCH_option_Qeau = (nodeData, Qeau, Teau, PDC_aero) => {
  if (!nodeData?.result?.dataFlow) {
    console.error("Invalid nodeData structure");
    return null;
  }

  // LECTURE DU NOEUD PRÉCÉDENT
  const { T: Taval, P_mmCE: P_out_mmCE, Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_O2_kg_h, Qm_N2_kg_h } = nodeData.result.dataFlow;

  // CALCUL DE LA COMPOSITION AMONT (retro : l'eau du quench n'est pas encore présente
  // en amont → on la RETIRE, comme dans option_T). Cohérent avec temp_bef_add_wat qui
  // calcule la température amont avec (m_H2O - Qeau).
  const Qm_H2O_amont_kg_h = Qm_H2O_kg_h - Qeau;
  const Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_amont_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;

  // CALCUL DE LA TEMPÉRATURE AMONT (retro : température du gaz AVANT ajout de l'eau)
  const T = temp_bef_add_wat(Qeau, Teau, Taval, Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_N2_kg_h, Qm_O2_kg_h);

  // CONVERSION DES MASSES EN VOLUME
  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2_kg_h);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O_amont_kg_h);
  const Qv_O2_Nm3_h = O2_kg_m3(Qm_O2_kg_h);
  const Qv_N2_Nm3_h = N2_kg_m3(Qm_N2_kg_h);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;

  // CALCUL DES POURCENTAGES VOLUMIQUES
  const O2_dry_pourcent = Qv_sec_Nm3_h > 0 ? (Qv_O2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const O2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_O2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const H2O_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_H2O_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const N2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_N2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const CO2_dry_pourcent = Qv_sec_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const CO2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;

  // CALCUL DES ENTHALPIES
  const H_CO2_kj = fh_CO2(T) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T) + Lv) * Qm_H2O_amont_kg_h;
  const H_O2_kj = fh_O2(T) * Qm_O2_kg_h;
  const H_N2_kj = fh_N2(T) * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;
  const H_tot_kW = H_tot_kj / 3600;

  // CALCUL DE LA PRESSION ET DU DÉBIT
  const P_mmCE = parseFloat(P_out_mmCE) +parseFloat(PDC_aero);
  const Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T) * Qv_wet_Nm3_h;

  return {
    dataQUENCH: { Qeau },
    dataFlow: {
      T_in: Taval,
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
      Qm_H2O_kg_h: Qm_H2O_amont_kg_h,
      Qm_O2_kg_h,
      Qm_N2_kg_h,
      Qm_tot_kg_h,
      H_CO2_kj,
      H_H2O_kj,
      H_O2_kj,
      H_N2_kj,
      H_tot_kj,
      H_tot_kW,
    },
  };
};
