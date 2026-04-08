import {fh_CO2, fh_H2O, fh_O2, fh_N2} from '../../A_Transverse_fonction/enthalpy_gas';
import {Qeau_remove_to_be_at_T, temp_bef_add_wat} from '../../A_Transverse_fonction/enthalpy_mix_gas';
import {CO2_kg_m3, O2_kg_m3, N2_kg_m3, H2O_kg_m3, coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';

// performCalculation_SCRUBBER_option_T
export const performCalculation_SCRUBBER_option_TinTout = (nodeData, PDC_aero) => {
  
  let T = nodeData.result.dataFlow.T;
  let P_out_mmCE = nodeData.result.dataFlow.P_mmCE;
  let Qv_wet_Nm3_h = nodeData.result.dataFlow.Qv_wet_Nm3_h;

  let P_mmCE = P_out_mmCE - PDC_aero;
  let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T) * Qv_wet_Nm3_h;

  let dataFlow = {
    T: nodeData.result.dataFlow.T,
    P_mmCE,
    Qv_wet_m3_h,
    Qv_wet_Nm3_h: nodeData.result.dataFlow.Qv_wet_Nm3_h,
    O2_dry_pourcent: nodeData.result.dataFlow.O2_dry_pourcent,
    H2O_pourcent: nodeData.result.dataFlow.H2O_pourcent,
    O2_humide_pourcent: nodeData.result.dataFlow.O2_humide_pourcent,
    N2_humide_pourcent: nodeData.result.dataFlow.N2_humide_pourcent,
    CO2_dry_pourcent: nodeData.result.dataFlow.CO2_dry_pourcent,
    CO2_humide_pourcent: nodeData.result.dataFlow.CO2_humide_pourcent,
    Qv_CO2_Nm3_h: nodeData.result.dataFlow.Qv_CO2_Nm3_h,
    Qv_H2O_Nm3_h: nodeData.result.dataFlow.Qv_H2O_Nm3_h,
    Qv_O2_Nm3_h: nodeData.result.dataFlow.Qv_O2_Nm3_h,
    Qv_N2_Nm3_h: nodeData.result.dataFlow.Qv_N2_Nm3_h,
    Qv_sec_Nm3_h: nodeData.result.dataFlow.Qv_sec_Nm3_h,
    Qm_CO2_kg_h: nodeData.result.dataFlow.Qm_CO2_kg_h,
    Qm_H2O_kg_h: nodeData.result.dataFlow.Qm_H2O_kg_h,
    Qm_O2_kg_h: nodeData.result.dataFlow.Qm_O2_kg_h,
    Qm_N2_kg_h: nodeData.result.dataFlow.Qm_N2_kg_h,
    Qm_tot_kg_h: nodeData.result.dataFlow.Qm_tot_kg_h,
    H_CO2_kj: nodeData.result.dataFlow.H_CO2_kj,
    H_H2O_kj: nodeData.result.dataFlow.H_H2O_kj,
    H_O2_kj: nodeData.result.dataFlow.H_O2_kj,
    H_N2_kj: nodeData.result.dataFlow.H_N2_kj,
    H_tot_kj: nodeData.result.dataFlow.H_tot_kj,
    H_tot_kW: nodeData.result.dataFlow.H_tot_kW
  }
  
  return { dataFlow };
};