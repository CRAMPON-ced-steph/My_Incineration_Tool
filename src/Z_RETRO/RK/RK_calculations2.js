import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import { hV_p, hL_T, h_pT, Tsat_p } from '../../A_Transverse_fonction/steam_table3';
import {coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';

export const performCalculation_RK_with_WHB = (
    nodeData,
    Tair_RK_C,
    Thermal_losses_MW,
    NCV_kcal_kg,
    Masse_dechet_kg_h,
    bilanType_NCV_Masse,
    bilanType_whb
) => {
    // Conversion et validation des entrées
    const Tair = parseFloat(Tair_RK_C) || 0;
    const Pth_MW = parseFloat(Thermal_losses_MW) || 0;
    let NCV = parseFloat(NCV_kcal_kg) || 0;
    let MasseDechet = parseFloat(Masse_dechet_kg_h) || 0;

    // Extraction des données de nodeData.result
    const  Qv_wet_Nm3_h = nodeData.result.dataFlow.Qv_wet_Nm3_h;
    const O2_dry_pourcent = nodeData.result.dataFlow.O2_dry_pourcent;
    const H2O_pourcent = nodeData.result.dataFlow.H2O_pourcent;
    const O2_humide_pourcent = nodeData.result.dataFlow.O2_humide_pourcent;
    const N2_humide_pourcent = nodeData.result.dataFlow.N2_humide_pourcent;
    const CO2_dry_pourcent = nodeData.result.dataFlow.CO2_dry_pourcent;
    const CO2_humide_pourcent = nodeData.result.dataFlow.CO2_humide_pourcent;
    const Qv_CO2_Nm3_h = nodeData.result.dataFlow.Qv_CO2_Nm3_h;
    const Qv_H2O_Nm3_h = nodeData.result.dataFlow.Qv_H2O_Nm3_h;
    const Qv_O2_Nm3_h = nodeData.result.dataFlow.Qv_O2_Nm3_h;
    const Qv_N2_Nm3_h = nodeData.result.dataFlow.Qv_N2_Nm3_h;
    const Qv_sec_Nm3_h = nodeData.result.dataFlow.Qv_sec_Nm3_h;
    const Qm_CO2_kg_h = nodeData.result.dataFlow.Qm_CO2_kg_h;
    const Qm_H2O_kg_h = nodeData.result.dataFlow.Qm_H2O_kg_h;
    const Qm_O2_kg_h = nodeData.result.dataFlow.Qm_O2_kg_h;
    const Qm_N2_kg_h = nodeData.result.dataFlow.Qm_N2_kg_h;
    const Qm_tot_out_kg_h = nodeData.result.dataFlow.Qm_tot_kg_h;
    const H_out_kW = nodeData.result.dataFlow.H_tot_kW;

    const P_out_mmCE = nodeData.result.dataFlow.P_mmCE;

let P_incinerateur_MWH;

const Energy_recuperee_kW = nodeData.result.data_Air_WHB.Energie_recuperee_WHB_kW ;


  //  let P_mmCE = P_out_mmCE;
  //  let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE,T)*Qv_wet_Nm3_h;





        P_incinerateur_MWH = Energy_recuperee_kW+Pth_MW;




    // Calculs basés sur bilanType_NCV_Masse
    if (bilanType_NCV_Masse === 'NET_CALORIFIC_VALUE') {
        NCV = MasseDechet > 0 ? (P_incinerateur_MWH * 1000) / (MasseDechet / 3600 * 4.1868) : 0;
    } else if (bilanType_NCV_Masse === 'WASTE_FLOWRATE') {
        MasseDechet = NCV > 0 ? (P_incinerateur_MWH * 1000) / (NCV * 4.1868 / 3600) : 0;
    }

    return {
  P_incinerateur_MWH,
   NCV,
   MasseDechet,

    }
};
