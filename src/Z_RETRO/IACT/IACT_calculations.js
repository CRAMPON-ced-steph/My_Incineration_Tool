import { fh_CO2, fh_H2O, fh_O2, fh_N2} from '../../A_Transverse_fonction/enthalpy_gas';
import { h_fumee } from '../../A_Transverse_fonction/enthalpy_mix_gas';

import { CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3, coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { rho_air } from '../../A_Transverse_fonction/constantes';

// performCalculation_IACT
// T_air_ambiant  : température de l'air ambiant entrant dans l'IACT [°C]
// T_air_chauffe  : température de l'air réchauffé en sortie [°C]
// Rendement_echange : rendement thermique de l'échangeur [%]
// T_amont_IACT   : température des fumées en entrée de l'IACT [°C]
// PDC_aero       : perte de charge côté fumées [mmCE]
export const performCalculation_IACT = (
  nodeData,
  T_air_ambiant,
  T_air_chauffe,
  Rendement_echange,
  T_amont_IACT,
  PDC_aero
) => {
  // ── Lecture du nœud amont ────────────────────────────────────────────────
  const T_aval_IACT         = nodeData.result.dataFlow.T;
  const Qv_wet_out_Nm3_h    = nodeData.result.dataFlow.Qv_wet_Nm3_h;
  const O2_dry_out_pourcent = nodeData.result.dataFlow.O2_dry_pourcent;
  const H2O_out_pourcent    = nodeData.result.dataFlow.H2O_pourcent;
  const O2_humide_out_pourcent  = nodeData.result.dataFlow.O2_humide_pourcent;
  const N2_humide_out_pourcent  = nodeData.result.dataFlow.N2_humide_pourcent;
  const CO2_dry_out_pourcent    = nodeData.result.dataFlow.CO2_dry_pourcent;
  const CO2_humide_out_pourcent = nodeData.result.dataFlow.CO2_humide_pourcent;
  const Qv_CO2_out_Nm3_h = nodeData.result.dataFlow.Qv_CO2_Nm3_h;
  const Qv_H2O_out_Nm3_h = nodeData.result.dataFlow.Qv_H2O_Nm3_h;
  const Qv_O2_out_Nm3_h  = nodeData.result.dataFlow.Qv_O2_Nm3_h;
  const Qv_N2_out_Nm3_h  = nodeData.result.dataFlow.Qv_N2_Nm3_h;
  const Qv_sec_out_Nm3_h = nodeData.result.dataFlow.Qv_sec_Nm3_h;
  const Qm_CO2_out_kg_h  = nodeData.result.dataFlow.Qm_CO2_kg_h;
  const Qm_H2O_out_kg_h  = nodeData.result.dataFlow.Qm_H2O_kg_h;
  const Qm_O2_out_kg_h   = nodeData.result.dataFlow.Qm_O2_kg_h;
  const Qm_N2_out_kg_h   = nodeData.result.dataFlow.Qm_N2_kg_h;
  const Qm_tot_out_kg_h  = nodeData.result.dataFlow.Qm_tot_kg_h;
  const P_out_mmCE        = nodeData.result.dataFlow.P_mmCE;

  // ── Fumées : composition inchangée côté fumées (échangeur sans mélange) ──
  const Qm_CO2_kg_h = Qm_CO2_out_kg_h;
  const Qm_H2O_kg_h = Qm_H2O_out_kg_h;
  const Qm_O2_kg_h  = Qm_O2_out_kg_h;
  const Qm_N2_kg_h  = Qm_N2_out_kg_h;
  const Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;

  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2_kg_h);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O_kg_h);
  const Qv_O2_Nm3_h  = O2_kg_m3(Qm_O2_kg_h);
  const Qv_N2_Nm3_h  = N2_kg_m3(Qm_N2_kg_h);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;

  // Fractions volumiques fumées
  const O2_dry_pourcent     = Qv_sec_Nm3_h > 0 ? (Qv_O2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const O2_humide_pourcent  = Qv_wet_Nm3_h > 0 ? (Qv_O2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const H2O_pourcent        = Qv_wet_Nm3_h > 0 ? (Qv_H2O_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const N2_humide_pourcent  = Qv_wet_Nm3_h > 0 ? (Qv_N2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const CO2_dry_pourcent    = Qv_sec_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const CO2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;

  // ── Enthalpies fumées à la température amont ─────────────────────────────
  const H_CO2_kj = fh_CO2(T_amont_IACT) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T_amont_IACT) + 540 * 4.18) * Qm_H2O_kg_h;
  const H_O2_kj  = fh_O2(T_amont_IACT)  * Qm_O2_kg_h;
  const H_N2_kj  = fh_N2(T_amont_IACT)  * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;
  const H_tot_kW = H_tot_kj / 3600;

  // ── Bilan échangeur air/fumées ────────────────────────────────────────────
  // Chaleur cédée par les fumées entre T_amont et T_aval
  const H_in_IACT   = h_fumee(T_amont_IACT, Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_N2_kg_h, Qm_O2_kg_h);
  const H_out_IACT  = h_fumee(T_aval_IACT,  Qm_CO2_kg_h, Qm_H2O_kg_h, Qm_N2_kg_h, Qm_O2_kg_h);
  const Delta_H_FG  = H_in_IACT - H_out_IACT;                    // kJ/h cédés par les fumées
  const Delta_H_air = Delta_H_FG * (Rendement_echange / 100);    // kJ/h transférés à l'air

  // Débit d'air chauffé (cp_air moyen ≈ 1.005 kJ/kg·K)
  const cp_air = 1.005; // kJ/(kg·K)
  const Delta_T_air = T_air_chauffe - T_air_ambiant;
  const Qm_air_kg_h = Delta_T_air > 0
    ? Delta_H_air / (cp_air * Delta_T_air)
    : 0;
  const Qv_air_Nm3_h = Qm_air_kg_h / rho_air;

  // ── Pression et débit volumique réel ────────────────────────────────────
  const T          = T_amont_IACT;
  const P_mmCE     = parseFloat(P_out_mmCE) - parseFloat(PDC_aero);
  const Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T) * Qv_wet_Nm3_h;

  // ── Résultats ────────────────────────────────────────────────────────────
  const dataIACT = {

    Delta_H_FG,
    Delta_H_air,
    Qm_air_kg_h,
    Qv_air_Nm3_h,
  };

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

  return { dataIACT, dataFlow };
};
