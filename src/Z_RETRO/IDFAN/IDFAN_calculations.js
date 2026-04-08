import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import {coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';

export const performCalculation_IDFAN = (nodeData, P_amont,Rdt_elec) => {
  // Extract receivedData from nodeData.result.dataFlow with default values
  let T_out = nodeData?.result?.dataFlow?.T|| '20';
  const  Qv_wet_out_Nm3_h = nodeData?.result?.dataFlow?.Qv_wet_Nm3_h|| '20';
  const O2_dry_out_pourcent = nodeData?.result?.dataFlow?.O2_dry_pourcent|| '20';
  const H2O_out_pourcent = nodeData?.result?.dataFlow?.H2O_pourcent|| '20';
  const O2_humide_out_pourcent = nodeData?.result?.dataFlow?.O2_humide_pourcent|| '20';
  const N2_humide_out_pourcent = nodeData?.result?.dataFlow?.N2_humide_pourcent|| '20';
  const CO2_dry_out_pourcent = nodeData?.result?.dataFlow?.CO2_dry_pourcent|| '20';
  const CO2_humide_out_pourcent = nodeData?.result?.dataFlow?.CO2_humide_pourcent|| '20';
  const Qv_CO2_out_Nm3_h = nodeData?.result?.dataFlow?.Qv_CO2_Nm3_h|| '20';
  const Qv_H2O_out_Nm3_h = nodeData?.result?.dataFlow?.Qv_H2O_Nm3_h|| '20';
  const Qv_O2_out_Nm3_h = nodeData?.result?.dataFlow?.Qv_O2_Nm3_h|| '20';
  const Qv_N2_out_Nm3_h = nodeData?.result?.dataFlow?.Qv_N2_Nm3_h|| '20';
  const Qv_sec_out_Nm3_h = nodeData?.result?.dataFlow?.Qv_sec_Nm3_h|| '20';
  const Qm_CO2_out_kg_h = nodeData?.result?.dataFlow?.Qm_CO2_kg_h|| '20';
  const Qm_H2O_out_kg_h = nodeData?.result?.dataFlow?.Qm_H2O_kg_h|| '20';
  const Qm_O2_out_kg_h = nodeData?.result?.dataFlow?.Qm_O2_kg_h|| '20';
  const Qm_N2_out_kg_h = nodeData?.result?.dataFlow?.Qm_N2_kg_h|| '20';
  const Qm_tot_out_kg_h = nodeData?.result?.dataFlow?.Qm_tot_kg_h|| '20';

  const P_out_mmCE = nodeData?.result?.dataFlow?.P_mmCE|| '20';

  // Calculate input parameters (same as output since IDFAN doesn't modify the gas)
  const T = T_out;
  const Qv_wet_Nm3_h = Qv_wet_out_Nm3_h;
  const O2_dry_pourcent = O2_dry_out_pourcent;
  const H2O_pourcent = H2O_out_pourcent;
  const O2_humide_pourcent = O2_humide_out_pourcent;
  const N2_humide_pourcent = N2_humide_out_pourcent;
  const CO2_dry_pourcent = CO2_dry_out_pourcent;
  const CO2_humide_pourcent = CO2_humide_out_pourcent;
  const Qv_CO2_Nm3_h = Qv_CO2_out_Nm3_h;
  const Qv_H2O_Nm3_h = Qv_H2O_out_Nm3_h;
  const Qv_O2_Nm3_h = Qv_O2_out_Nm3_h;
  const Qv_N2_Nm3_h = Qv_N2_out_Nm3_h;
  const Qv_sec_Nm3_h = Qv_sec_out_Nm3_h;
  const Qm_CO2_kg_h = Qm_CO2_out_kg_h;
  const Qm_H2O_kg_h = Qm_H2O_out_kg_h;
  const Qm_O2_kg_h = Qm_O2_out_kg_h;
  const Qm_N2_kg_h = Qm_N2_out_kg_h;
  const Qm_tot_kg_h = Qm_tot_out_kg_h;

  // Calculate enthalpies
  const H_CO2_kj = fh_CO2(T) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T) + 540 * 4.18) * Qm_H2O_kg_h;
  const H_O2_kj = fh_O2(T) * Qm_O2_kg_h;
  const H_N2_kj = fh_N2(T) * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;
  const H_tot_kW = H_tot_kj / 3600;

  let P_mmCE = P_amont;
  let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE,T)*Qv_wet_Nm3_h;



 // let  Qv_wet_m3_h = K *  Qv_wet_out_Nm3_h ;
  
let P_elec = ((Qv_wet_m3_h  * (P_out_mmCE-P_amont)*9.81) /(3600*Rdt_elec/100))/1000;


let Pth_chaleur_dissipee = (1-Rdt_elec/100-0.05) * P_elec;

let K = coeff_Nm3_to_m3(P_out_mmCE, T_out);

const Id_fan = {
  K,
  P_out_mmCE,
  Pth_chaleur_dissipee,
  P_elec
}





  const dataFlow={
    //T_amont_ELECTROFILTER,
    T,
    P_mmCE,
    Qv_wet_m3_h ,
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
  }

  return {Id_fan, dataFlow} ;
};
