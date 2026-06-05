import { CO2_kg_m3, H2O_kg_m3, O2_kg_m3, N2_kg_m3, coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { h_fumee, TEMP_FUMEE } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import { CpL_T } from '../../A_Transverse_fonction/steam_table3';
import { cp_air_kWh_m3_degree, D_TLM, Fact_UA, Surface_echange } from '../../A_Transverse_fonction/bilan_fct_FB';

const rho_air      = 1.293;   // kg/Nm³
const O2_mass_frac = 0.233;
const N2_mass_frac = 0.767;
const cp_eau       = 4.1868;  // kJ/(kg·°C)
const num = (v) => parseFloat(v) || 0;

/**
 * performCalculation_TUBEANDSHELL
 *
 * Même logique que 1_TUBEANDSHELL_Parameters (Y_BILAN),
 * adaptée au contexte Retro : les données amont viennent de nodeData.result.dataFlow.
 *
 * @param {object} nodeData    - nœud ReactFlow amont
 * @param {string} fluide      - 'eau' | 'air'
 * @param {string} bilanType   - 'T_sortie' | 'T_entree' | 'debit'
 * @param {number} T_fumee_out - température fumées sortie imposée [°C]
 * @param {number} T_fluide_in - température fluide entrée [°C]
 * @param {number} T_fluide_out- température fluide sortie [°C]
 * @param {number} m_eau       - débit eau [kg/h]  (si fluide='eau')
 * @param {number} V_air       - débit air [Nm³/h] (si fluide='air')
 * @param {number} Rendement   - rendement échangeur [%]
 * @param {number} Encrassement- encrassement [%]
 * @param {number} PDC_econo   - perte de charge fumées [mmCE]
 */
export const performCalculation_TUBEANDSHELL = (
  nodeData,
  fluide,
  bilanType,
  T_fumee_out,
  T_fluide_in,
  T_fluide_out,
  m_eau,
  V_air,
  Rendement,
  Encrassement,
  PDC_econo
) => {
  // ── Lecture des données amont ──────────────────────────────────────────────
  const T_FG_in = nodeData?.result?.dataFlow?.T        ?? 200;
  const Qm_CO2  = nodeData?.result?.dataFlow?.Qm_CO2_kg_h ?? 0;
  const Qm_H2O  = nodeData?.result?.dataFlow?.Qm_H2O_kg_h ?? 0;
  const Qm_O2   = nodeData?.result?.dataFlow?.Qm_O2_kg_h  ?? 0;
  const Qm_N2   = nodeData?.result?.dataFlow?.Qm_N2_kg_h  ?? 0;
  const P_IN    = nodeData?.result?.dataFlow?.P_mmCE       ?? 0;

  // ── Débits volumiques fumées [Nm³/h] ──────────────────────────────────────
  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O);
  const Qv_O2_Nm3_h  = O2_kg_m3(Qm_O2);
  const Qv_N2_Nm3_h  = N2_kg_m3(Qm_N2);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;
  const Qm_tot_kg_h  = Qm_CO2 + Qm_H2O + Qm_O2 + Qm_N2;

  // Fractions volumiques
  const O2_dry_pourcent     = Qv_sec_Nm3_h > 0 ? (Qv_O2_Nm3_h  / Qv_sec_Nm3_h) * 100 : 0;
  const O2_humide_pourcent  = Qv_wet_Nm3_h > 0 ? (Qv_O2_Nm3_h  / Qv_wet_Nm3_h) * 100 : 0;
  const H2O_pourcent        = Qv_wet_Nm3_h > 0 ? (Qv_H2O_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;
  const N2_humide_pourcent  = Qv_wet_Nm3_h > 0 ? (Qv_N2_Nm3_h  / Qv_wet_Nm3_h) * 100 : 0;
  const CO2_dry_pourcent    = Qv_sec_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_sec_Nm3_h) * 100 : 0;
  const CO2_humide_pourcent = Qv_wet_Nm3_h > 0 ? (Qv_CO2_Nm3_h / Qv_wet_Nm3_h) * 100 : 0;

  // ── Bilan thermique ────────────────────────────────────────────────────────
  const Rdt       = num(Rendement) / 100;
  const Enc       = num(Encrassement) / 100;
  const effFactor = Rdt * (1 - Enc);

  const m_O2_unit  = O2_mass_frac * rho_air;
  const m_N2_unit  = N2_mass_frac * rho_air;
  const h_air_unit = (T) => h_fumee(T, 0, 0, m_N2_unit, m_O2_unit);

  const H_FG_in_kJh = h_fumee(T_FG_in, Qm_CO2, Qm_H2O, Qm_N2, Qm_O2);

  let T_FG_out_calc    = num(T_fumee_out);
  let T_fluide_in_calc  = num(T_fluide_in);
  let T_fluide_out_calc = num(T_fluide_out);
  let m_eau_calc       = num(m_eau);
  let V_air_calc       = num(V_air);

  if (bilanType === 'T_sortie') {
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, Qm_CO2, Qm_H2O, Qm_N2, Qm_O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      T_fluide_out_calc = m_eau_calc > 0
        ? T_fluide_in_calc + Q_utile_kJh / (m_eau_calc * cp_eau)
        : T_fluide_in_calc;
    } else {
      const H_air_out_target = h_air_unit(T_fluide_in_calc) * V_air_calc + Q_utile_kJh;
      T_fluide_out_calc = H_air_out_target > 0
        ? TEMP_FUMEE(H_air_out_target, 0, 0, m_N2_unit * V_air_calc, m_O2_unit * V_air_calc)
        : T_fluide_in_calc;
    }
  } else if (bilanType === 'T_entree') {
    const H_FG_out_kJh = h_fumee(T_FG_out_calc, Qm_CO2, Qm_H2O, Qm_N2, Qm_O2);
    const Q_utile_kJh  = (H_FG_in_kJh - H_FG_out_kJh) * effFactor;
    if (fluide === 'eau') {
      T_fluide_in_calc = m_eau_calc > 0
        ? T_fluide_out_calc - Q_utile_kJh / (m_eau_calc * cp_eau)
        : T_fluide_out_calc;
    } else {
      const H_air_in_target = h_air_unit(T_fluide_out_calc) * V_air_calc - Q_utile_kJh;
      T_fluide_in_calc = H_air_in_target > 0
        ? TEMP_FUMEE(H_air_in_target, 0, 0, m_N2_unit * V_air_calc, m_O2_unit * V_air_calc)
        : T_fluide_out_calc;
    }
  } else if (bilanType === 'debit' && fluide === 'air') {
    const H_FG_out_kJh_d = h_fumee(T_FG_out_calc, Qm_CO2, Qm_H2O, Qm_N2, Qm_O2);
    const Q_utile_kJh_d  = (H_FG_in_kJh - H_FG_out_kJh_d) * effFactor;
    const dH_air_unit    = h_air_unit(T_fluide_out_calc) - h_air_unit(T_fluide_in_calc);
    V_air_calc = dH_air_unit > 0 ? Q_utile_kJh_d / dH_air_unit : 0;
  }

  // ── Résultats finaux ───────────────────────────────────────────────────────
  const H_FG_out_kJh = h_fumee(T_FG_out_calc, Qm_CO2, Qm_H2O, Qm_N2, Qm_O2);
  const H_FG_in_kWh  = H_FG_in_kJh  / 3600;
  const H_FG_out_kWh = H_FG_out_kJh / 3600;
  const Q_FG_kWh     = H_FG_in_kWh - H_FG_out_kWh;
  const P_out_mmCE   = P_IN - num(PDC_econo);

  const Q_utile_eau_kWh = Q_FG_kWh * Rdt;
  const T_moyen_eau     = (T_fluide_in_calc + T_fluide_out_calc) / 2;
  const dT_fluide       = T_fluide_out_calc - T_fluide_in_calc;

  let cp_fluide_val;
  if (fluide === 'eau') {
    const cpL_raw = T_moyen_eau > 0 && T_moyen_eau < 373 ? CpL_T(T_moyen_eau) : null;
    cp_fluide_val = (cpL_raw instanceof Error || cpL_raw == null) ? cp_eau : cpL_raw;
  } else {
    cp_fluide_val = cp_air_kWh_m3_degree(T_moyen_eau);
  }

  const m_eau_CpL = fluide === 'eau' && cp_fluide_val > 0 && T_moyen_eau > 0
    ? (Q_utile_eau_kWh * 3600) / (cp_fluide_val * T_moyen_eau) : 0;
  const V_air_CpL = fluide === 'air' && cp_fluide_val > 0 && dT_fluide > 0
    ? Q_utile_eau_kWh / (cp_fluide_val * dT_fluide) : 0;

  if (bilanType === 'debit') {
    if (fluide === 'eau') m_eau_calc = m_eau_CpL;
    else                  V_air_calc = V_air_CpL;
  }

  const dT1       = T_FG_out_calc - T_fluide_in_calc;
  const dT2       = T_FG_in - T_fluide_out_calc;
  const d_tlm     = (dT1 > 0 && dT2 > 0 && dT1 !== dT2)
    ? D_TLM(T_FG_out_calc, T_FG_in, T_fluide_out_calc, T_fluide_in_calc) : 0;
  const fact_ua     = Fact_UA(Q_FG_kWh, d_tlm);
  const Fact_U_list = fluide === 'eau' ? 66 : 39;
  const surface     = Surface_echange(fact_ua, Fact_U_list, num(Encrassement));

  // ── dataFlow de sortie (fumées refroidies, composition inchangée) ──────────
  const Qv_wet_m3_h = coeff_Nm3_to_m3(P_out_mmCE, T_FG_out_calc) * Qv_wet_Nm3_h;

  const dataTUBEANDSHELL = {
    T_IN:            T_FG_in,
    T_OUT:           T_FG_out_calc,
    P_IN,
    P_OUT:           P_out_mmCE,
    H_FG_in_kWh,
    H_FG_out_kWh,
    Q_FG_kWh,
    Q_utile_eau_kWh,
    T_moyen_eau,
    cp_fluide:       cp_fluide_val,
    m_eau_kg_h:      fluide === 'eau' ? m_eau_CpL : V_air_CpL,
    D_TLM:           d_tlm,
    Fact_UA:         fact_ua,
    Fact_U_list,
    Surface_m2:      surface,
    PDC_mmCE:        num(PDC_econo),
    FG_OUT_kg_h:     { CO2: Qm_CO2, H2O: Qm_H2O, O2: Qm_O2, N2: Qm_N2 },
    FG_humide_tot:   Qv_wet_Nm3_h,
    FG_sec_tot:      Qv_sec_Nm3_h,
    fluide,
    bilanType,
  };

  const dataFlow = {
    T:                    T_FG_out_calc,
    P_mmCE:               P_out_mmCE,
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
    Qm_CO2_kg_h:  Qm_CO2,
    Qm_H2O_kg_h:  Qm_H2O,
    Qm_O2_kg_h:   Qm_O2,
    Qm_N2_kg_h:   Qm_N2,
    Qm_tot_kg_h,
  };

  return { dataTUBEANDSHELL, dataFlow };
};
