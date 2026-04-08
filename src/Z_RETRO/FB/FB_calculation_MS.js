import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import { hV_p, hL_T, h_pT, Tsat_p } from '../../A_Transverse_fonction/steam_table3';
import { coeff_Nm3_to_m3 } from '../../A_Transverse_fonction/conv_calculation';
import { PCI_kcal_kgMV, calculatePCI_kcal_kg } from '../../A_Transverse_fonction/FB_fonctions';

export const performCalculation_FB_MS = (
    nodeData,
    Tair_FB_C,
    Thermal_losses_MW,
    Q_boue_kg_h,
    wasteType,
    MV_percent
) => {
    // Conversion et validation des entrées
    const Tair = parseFloat(Tair_FB_C) || 0;
    const Pth_MW = parseFloat(Thermal_losses_MW) || 0;
    let Qboue_kg_h = parseFloat(Q_boue_kg_h) || 0;
    let MV = parseFloat(MV_percent) || 0;

    // Extraction des données de nodeData.result
    const Qv_wet_Nm3_h = nodeData.result.dataFlow.Qv_wet_Nm3_h;
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

    let P_mmCE = P_out_mmCE;
    let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, Tair) * Qv_wet_Nm3_h;

    // Calcul de la puissance de l'incinérateur

    // Calculate enthalpies
    let H_air_H2O_kj = (fh_H2O(Tair) + 540 * 4.18) * Qm_H2O_kg_h;
    let H_air_O2_kj = fh_O2(Tair) * Qm_O2_kg_h;
    let H_air_N2_kj = fh_N2(Tair) * Qm_N2_kg_h;
    let H_air_CO2_kj = fh_CO2(Tair) * Qm_CO2_kg_h;
    let H_air_kj = H_air_CO2_kj + H_air_H2O_kj + H_air_O2_kj + H_air_N2_kj;
    let H_air_kW = H_air_kj / 3600;

    let P_incinerateur_MWH = (H_out_kW - H_air_kW) / 1000 - Pth_MW;

    let MS = 10;
    let PCIkcalkgMV = PCI_kcal_kgMV(wasteType);
    let calculatePCIkcalkg = calculatePCI_kcal_kg(MS, MV, PCIkcalkgMV);
    let Hboue_kcal = calculatePCIkcalkg * Q_boue_kg_h;
    let Hboue_kW = Hboue_kcal * 4.1868/3600;

    // Boucle corrigée
    do {
        calculatePCIkcalkg = calculatePCI_kcal_kg(MS, MV, PCIkcalkgMV);
        Hboue_kcal = calculatePCIkcalkg * Q_boue_kg_h;
        Hboue_kW = Hboue_kcal * 4.1868/3600;
        MS = MS + 1;
    } while (Hboue_kW < P_incinerateur_MWH * 1000); // Conversion MW en kW

    return {
        H_out_kW,
        H_air_kW,
        P_incinerateur_MWH,
        calculatePCIkcalkg,
        MS,
        Qboue_kg_h,
        Qv_wet_m3_h
    };
};