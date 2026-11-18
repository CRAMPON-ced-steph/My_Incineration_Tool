// Économiseur fumées → eau (« Cooling_HX_eau ») — mode Retro.
// La température de sortie des fumées est imposée par le nœud aval (dataFlow.T) ; l'option
// « T° entrée fumées » remplace « T° sortie fumées » du mode Bilan. Mêmes calculs que le mode
// Bilan (Y_BILAN/ECHANGEURS/WATERCOOLER/WATERCOOLER_calculs.js, Pyrofluid ClassEconomiseur).
import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import { CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3, coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { Lv } from '../../A_Transverse_fonction/constantes';
import {
  calculEconomiseur, puissancePompe_kW, CALCUL, PARAMS_DEFAUT_ECO,
} from '../../Y_BILAN/ECHANGEURS/WATERCOOLER/WATERCOOLER_calculs';

export const PARAMS_DEFAUT_RETRO = {
  ...PARAMS_DEFAUT_ECO,
  T_amont_C: 550, // T° entrée fumées (donnée, sauf option « T° entrée fumées »)
  nbEchangeurs: 1,
};

// Paramètres saisis dans l'onglet Retro (lus aussi par batchCalculators.js)
export const cleParamsRetro = (nodeId) => `params_retro_WATERCOOLER_${nodeId}`;
export const lireParamsRetro = (nodeId) => {
  try {
    return { ...PARAMS_DEFAUT_RETRO, ...JSON.parse(localStorage.getItem(cleParamsRetro(nodeId)) || '{}') };
  } catch {
    return { ...PARAMS_DEFAUT_RETRO };
  }
};

const num = (v, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : d;
};

export const performCalculation_WATERCOOLER = (nodeData, params = {}) => {
  const p = { ...PARAMS_DEFAUT_RETRO, ...params };
  const aval = nodeData?.result?.dataFlow || {};

  // ── Fumées : composition inchangée (échangeur sans mélange) ──
  const Qm_CO2_kg_h = num(aval.Qm_CO2_kg_h);
  const Qm_H2O_kg_h = num(aval.Qm_H2O_kg_h);
  const Qm_O2_kg_h = num(aval.Qm_O2_kg_h);
  const Qm_N2_kg_h = num(aval.Qm_N2_kg_h);
  const Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;
  const T_aval = num(aval.T, 200);

  const calcul = p.calcul === CALCUL.T_FUMEES_SORTIE ? CALCUL.T_FUMEES_ENTREE : p.calcul;
  const res = calculEconomiseur({
    ...p,
    calcul,
    FG: { CO2: Qm_CO2_kg_h, H2O: Qm_H2O_kg_h, O2: Qm_O2_kg_h, N2: Qm_N2_kg_h },
    T_fumees_entree_C: num(p.T_amont_C),
    T_fumees_sortie_C: T_aval,
    nbEchangeurs: num(p.nbEchangeurs, 1),
  });
  const T = Number.isFinite(res.T_fumees_entree_C) ? res.T_fumees_entree_C : num(p.T_amont_C);

  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2_kg_h);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O_kg_h);
  const Qv_O2_Nm3_h = O2_kg_m3(Qm_O2_kg_h);
  const Qv_N2_Nm3_h = N2_kg_m3(Qm_N2_kg_h);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;
  const pct = (a, b) => (b > 0 ? (a / b) * 100 : 0);

  // ── Pression amont : la perte de charge côté fumées s'ajoute en remontant ──
  const PDC_fumees_mmCE = num(p.PDC_fumees_mmCE);
  const P_mmCE = num(aval.P_mmCE) + PDC_fumees_mmCE;
  const Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T) * Qv_wet_Nm3_h;

  // ── Enthalpies des fumées à la température amont ──
  const H_CO2_kj = fh_CO2(T) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T) + Lv) * Qm_H2O_kg_h;
  const H_O2_kj = fh_O2(T) * Qm_O2_kg_h;
  const H_N2_kj = fh_N2(T) * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;

  const DP_pompe_bar = num(p.DP_pompe_bar);
  const Rdt_pompe_pct = num(p.Rdt_pompe_pct);

  const dataWATERCOOLER = {
    ...res,
    PDC_fumees_mmCE,
    P_entree_mmCE: P_mmCE,
    P_sortie_mmCE: num(aval.P_mmCE),
    Q_FG_entree_m3_h: Qv_wet_m3_h,
    Q_FG_sortie_m3_h: coeff_Nm3_to_m3(num(aval.P_mmCE), T_aval) * Qv_wet_Nm3_h,
    DP_pompe_bar,
    Rdt_pompe_pct,
    Puissance_pompe_kW: puissancePompe_kW(res.Qv_eau_tot_m3_h, DP_pompe_bar, Rdt_pompe_pct),
  };

  const dataFlow = {
    T_in: T_aval,
    T,
    P_mmCE,
    Qv_wet_m3_h,
    Qv_wet_Nm3_h,
    O2_dry_pourcent: pct(Qv_O2_Nm3_h, Qv_sec_Nm3_h),
    H2O_pourcent: pct(Qv_H2O_Nm3_h, Qv_wet_Nm3_h),
    O2_humide_pourcent: pct(Qv_O2_Nm3_h, Qv_wet_Nm3_h),
    N2_humide_pourcent: pct(Qv_N2_Nm3_h, Qv_wet_Nm3_h),
    CO2_dry_pourcent: pct(Qv_CO2_Nm3_h, Qv_sec_Nm3_h),
    CO2_humide_pourcent: pct(Qv_CO2_Nm3_h, Qv_wet_Nm3_h),
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
    H_tot_kW: H_tot_kj / 3600,
  };

  return { dataWATERCOOLER, dataFlow };
};
