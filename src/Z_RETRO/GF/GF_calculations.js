import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import { hV_p, hL_T, h_pT, Tsat_p, hV_T } from '../../A_Transverse_fonction/steam_table3';
import {coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';
import {CO2_kg_m3, O2_kg_m3,N2_kg_m3, H2O_kg_m3, O2_m3_kg, N2_m3_kg} from '../../A_Transverse_fonction/conv_calculation';

export const performCalculation_GF = (
    nodeData,
    Waste_flow_rate_kg_h,
    Pressure_losse_mmCE,
    Combustion_air_flowrate_Nm3_h,
    Measured_air_temperature_C,
    Q_feed_water_kg_h,
    T_feed_water_C,
    Blowdown_pourcent,
    Q_saturated_steam,
    Steam_pressure_gauge_bar,
    super_heated_steam_temperature_C,
    Q_superheated_steam_kg_h,
    P_superheated_steam_bar,
    T_superheated_water_boiler_C,
    Q_superheated_water_kg_h,
    Q_recycled_flue_gas_Nm3_h,
    T_recycled_flue_gas_C,
    Injected_water_temperature_C,
    Q_treatment_injected_water_kg_h,
    Auxiliary_fuel_kWh,
    Bottom_ash_pourcent,
    Bottom_ash_temperature_C,
    Unburnt_bottom_ash_pourcent,
    Unburnt_LCV_kcal_kg,
    Reference_temperature_C,
    Q_air_ingress_Nm3_h,
    T_air_ingress_C
) => {

    // Extraction des données de nodeData.result
    const  Qv_wet_Nm3_h = nodeData?.result?.dataFlow?.Qv_wet_Nm3_h  || 10;
    const O2_dry_pourcent = nodeData?.result?.dataFlow?.O2_dry_pourcent|| 10;
    const H2O_pourcent = nodeData?.result?.dataFlow?.H2O_pourcent|| 10;
    const O2_humide_pourcent = nodeData?.result?.dataFlow?.O2_humide_pourcent|| 10;
    const N2_humide_pourcent = nodeData?.result?.dataFlow?.N2_humide_pourcent|| 10;
    const CO2_dry_pourcent = nodeData?.result?.dataFlow?.CO2_dry_pourcent|| 10;
    const CO2_humide_pourcent = nodeData?.result?.dataFlow?.CO2_humide_pourcent|| 10;
    const Qv_CO2_Nm3_h = nodeData?.result?.dataFlow?.Qv_CO2_Nm3_h|| 10;
    const Qv_H2O_Nm3_h = nodeData?.result?.dataFlow?.Qv_H2O_Nm3_h|| 10;
    const Qv_O2_Nm3_h = nodeData?.result?.dataFlow?.Qv_O2_Nm3_h|| 10;
    const Qv_N2_Nm3_h = nodeData?.result?.dataFlow?.Qv_N2_Nm3_h|| 10;
    const Qv_sec_Nm3_h = nodeData?.result?.dataFlow?.Qv_sec_Nm3_h|| 10;
    const Qm_CO2_kg_h = nodeData?.result?.dataFlow?.Qm_CO2_kg_h|| 10;
    const Qm_H2O_kg_h = nodeData?.result?.dataFlow?.Qm_H2O_kg_h|| 10;
    const Qm_O2_kg_h = nodeData?.result?.dataFlow?.Qm_O2_kg_h|| 10;
    const Qm_N2_kg_h = nodeData?.result?.dataFlow?.Qm_N2_kg_h|| 10;
    const Qm_tot_out_kg_h = nodeData?.result?.dataFlow?.Qm_tot_kg_h|| 10;
    const H_out_kW = nodeData?.result?.dataFlow?.H_tot_kW|| 10;
    const P_out_mmCE = nodeData?.result?.dataFlow?.P_mmCE|| 10;

    //ON COMMENCE LES CALCULS

    // PDC
    let P_mmCE = P_out_mmCE;
    //let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE,T)*Qv_wet_Nm3_h;


const T_saturated_steam_C = Tsat_p(Steam_pressure_gauge_bar+1);

let Qv_air_entrant_Nm3_h=0;
let Qm_air_entrant_kg_h =0;
let Qm_O2_air_entrant_kg_h=0; 
let Qm_N2_air_entrant_kg_h =0;
let Qm_CO2_air_entrant_kg_h =0;
let Qm_H2O_air_entrant_kg_h =0;
let Qv_O2_air_entrant_Nm3_h=0;
let Qv_N2_air_entrant_Nm3_h =0;
let Qv_H2O_air_entrant_Nm3_h =0;
let Qv_CO2_air_entrant_Nm3_h =0;
let Qv_sec_air_entrant_Nm3_h =0;
let Qv_wet_air_entrant_Nm3_h=0;
// ON CALCULE LA REPARTITION POURCENT VOLUMIQUE
let O2_dry_air_entrant_pourcent=0;
let O2_humide_air_entrant_pourcent=0;
let H2O_air_entrant_pourcent=0;
let N2_humide_air_entrant_pourcent=0; 
let CO2_dry_air_entrant_pourcent =0;
let CO2_humide_air_entrant_pourcent=0; 
// Calculate enthalpies using the provided T
let H_CO2_air_entrant_kj=0;
let H_H2O_air_entrant_kj =0;
let H_O2_air_entrant_kj=0;
let H_N2_air_entrant_kj=0;
let H_tot_air_entrant_kj=0; 
let H_tot_air_entrant_kW =0;

const O2_masse_volume = (21 * 32/22.4)/(21 * 32/22.4 + 79*28/22.4);
const rho_air = 0.21*32/22.4+0.79*28/22.4;

//AIR PARASITE
    if (Q_air_ingress_Nm3_h !== 0) {
     Qv_air_entrant_Nm3_h = Q_air_ingress_Nm3_h;
     Qm_air_entrant_kg_h = Qv_air_entrant_Nm3_h * rho_air;
     Qm_O2_air_entrant_kg_h = O2_masse_volume * Qm_air_entrant_kg_h;
     Qm_N2_air_entrant_kg_h = (1-O2_masse_volume) * Qm_air_entrant_kg_h;
     Qm_CO2_air_entrant_kg_h = 0;
     Qm_H2O_air_entrant_kg_h = 0;
     Qv_O2_air_entrant_Nm3_h = O2_kg_m3( Qm_O2_air_entrant_kg_h );
     Qv_N2_air_entrant_Nm3_h = N2_kg_m3( Qm_N2_air_entrant_kg_h );
     Qv_H2O_air_entrant_Nm3_h = 0;
     Qv_CO2_air_entrant_Nm3_h = 0;
     Qv_sec_air_entrant_Nm3_h = Qv_CO2_air_entrant_Nm3_h + Qv_O2_air_entrant_Nm3_h + Qv_N2_air_entrant_Nm3_h ;
     Qv_wet_air_entrant_Nm3_h = Qv_sec_air_entrant_Nm3_h +  Qv_H2O_air_entrant_Nm3_h;
    // ON CALCULE LA REPARTITION POURCENT VOLUMIQUE
     O2_dry_air_entrant_pourcent = Qv_O2_air_entrant_Nm3_h / Qv_sec_air_entrant_Nm3_h * 100;
     O2_humide_air_entrant_pourcent = Qv_O2_air_entrant_Nm3_h / Qv_wet_air_entrant_Nm3_h * 100;
     H2O_air_entrant_pourcent = Qv_H2O_air_entrant_Nm3_h / Qv_wet_air_entrant_Nm3_h * 100;
     N2_humide_air_entrant_pourcent = Qv_N2_air_entrant_Nm3_h / Qv_wet_air_entrant_Nm3_h * 100;
     CO2_dry_air_entrant_pourcent = Qv_CO2_air_entrant_Nm3_h / Qv_sec_air_entrant_Nm3_h * 100;
     CO2_humide_air_entrant_pourcent = Qv_CO2_air_entrant_Nm3_h / Qv_wet_air_entrant_Nm3_h * 100;
    // Calculate enthalpies using the provided T
     H_CO2_air_entrant_kj = 0;//fh_CO2(T_air_ingress_C ) * Qm_CO2_air_entrant_kg_h;
     H_H2O_air_entrant_kj = 0;//(fh_H2O(T_air_ingress_C ) + 540 * 4.18) * Qm_H2O_air_entrant_kg_h;
     H_O2_air_entrant_kj = fh_O2(T_air_ingress_C ) * Qm_O2_air_entrant_kg_h;
     H_N2_air_entrant_kj = fh_N2(T_air_ingress_C ) * Qm_N2_air_entrant_kg_h;
     H_tot_air_entrant_kj = H_CO2_air_entrant_kj + H_H2O_air_entrant_kj + H_O2_air_entrant_kj + H_N2_air_entrant_kj;
     H_tot_air_entrant_kW = H_tot_air_entrant_kj / 3600;
    }


// EAU PULVERISEE
let H_treatment_injected_water_kJ = 0;
let H_treatment_injected_water_kW = 0 ;

if (Q_treatment_injected_water_kg_h !==0){
 
H_treatment_injected_water_kJ = Q_treatment_injected_water_kg_h * hV_T(Injected_water_temperature_C);
H_treatment_injected_water_kW = H_treatment_injected_water_kJ /3600;

} 

//const H_treatment_injected_water_kJ = Q_treatment_injected_water_kg_h !== 0 ? Q_treatment_injected_water_kg_h * hV_T(Injected_water_temperature_C) : 0;
//const H_treatment_injected_water_kW = H_treatment_injected_water_kJ / 3600;



//EAU ALIMENTATION CHAUDIERE
let H_feed_water_kJ = 0;
let H_feed_water_kW = 0;
if (Q_feed_water_kg_h!==0){
H_feed_water_kJ = Q_feed_water_kg_h * hL_T(T_feed_water_C);
H_feed_water_kW= H_feed_water_kJ/3600;}



//EAU DE PURGE
let H_blowdown_kJ=0;
let H_blowdown_kW=0;
let Q_blowdown_kg_h=0;

if (Q_feed_water_kg_h!==0){
    Q_blowdown_kg_h = Q_feed_water_kg_h * Blowdown_pourcent/100;
    H_blowdown_kJ = Q_blowdown_kg_h*hL_T(T_saturated_steam_C);
    H_blowdown_kW = H_blowdown_kJ /3600;}


//VAPEUR SATUREE
let H_saturated_steam_kJ=0;
let H_saturated_steam_kW=0;

if ( Q_saturated_steam!==0){
    H_saturated_steam_kJ = Q_saturated_steam*hV_p(Steam_pressure_gauge_bar+1);
    H_saturated_steam_kW = H_saturated_steam_kJ /3600;
}



//VAPEUR SURCHAUFEE
let H_superheated_steam_kJ=0;
let H_superheated_steam_kW=0;

if ( Q_superheated_steam_kg_h!==0){
    H_superheated_steam_kJ = Q_superheated_steam_kg_h*h_pT(P_superheated_steam_bar+1,  super_heated_steam_temperature_C);
    H_superheated_steam_kW =  H_superheated_steam_kJ /3600;}
console.log( Q_superheated_steam_kg_h)


//EAU SURCHAUFEE
let H_superheated_water_kW=0;
let H_superheated_water_kJ=0;
if (Q_superheated_water_kg_h!==0){
    H_superheated_water_kJ = Q_superheated_water_kg_h*hL_T(T_superheated_water_boiler_C);
    H_superheated_water_kW = H_superheated_water_kJ /3600;}




//PERTES THERMIQUES
const H_pertes_thermiques_kW = 0.022 * Math.pow(H_superheated_steam_kW + H_saturated_steam_kW + H_superheated_water_kW - H_feed_water_kW, 0.7);

// PERTES PAR IMBRULEES

const cp_machefer = 0.84; //kJ/kg/C
const cp_fumees = 1.39; // kJ/Nm3/C

const H_imbrule_kJ = (Bottom_ash_pourcent/100)*Waste_flow_rate_kg_h*(cp_machefer* Bottom_ash_temperature_C+Unburnt_bottom_ash_pourcent/100*Unburnt_LCV_kcal_kg*4.1868);
const H_imbrule_kW = H_imbrule_kJ/3600;



const H_fumee_recy_kJ =Q_recycled_flue_gas_Nm3_h*cp_fumees*(T_recycled_flue_gas_C-Reference_temperature_C);
const H_fumee_recy_kW = H_fumee_recy_kJ/3600;




const H_combustible_appoint_kW = Auxiliary_fuel_kWh;



//AIR DE COMBUSTION


const Qm_O2_air_comb_kg_h = Qm_O2_kg_h - Qm_O2_air_entrant_kg_h;
const Qm_N2_air_comb_kg_h =  Qm_N2_kg_h - Qm_N2_air_entrant_kg_h;
const Qm_CO2_air_comb_kg_h =  Qm_CO2_kg_h- Qm_CO2_air_entrant_kg_h;
const Qm_H2O_air_comb_kg_h =  Qm_H2O_kg_h- Qm_H2O_air_entrant_kg_h-Q_treatment_injected_water_kg_h;


const Qv_O2_air_comb_Nm3_h = O2_kg_m3( Qm_O2_air_comb_kg_h );
const Qv_N2_air_comb_Nm3_h = N2_kg_m3( Qm_N2_air_comb_kg_h );
const Qv_H2O_air_comb_Nm3_h =H2O_kg_m3( Qm_H2O_air_comb_kg_h );
const Qv_CO2_air_comb_Nm3_h = CO2_kg_m3( Qm_CO2_air_comb_kg_h );


    // Calculate enthalpies
    let H_air_comb_H2O_kj = (fh_H2O(Measured_air_temperature_C) + 540 * 4.1868) * Qm_H2O_kg_h;
    let H_air_comb_O2_kj = fh_O2(Measured_air_temperature_C) * Qm_O2_kg_h;
    let H_air_comb_N2_kj = fh_N2(Measured_air_temperature_C) * Qm_N2_kg_h;
    let H_air_comb_CO2_kj = fh_CO2(Measured_air_temperature_C) * Qm_CO2_kg_h;
    let H_air_comb_kj = H_air_comb_CO2_kj + H_air_comb_H2O_kj + H_air_comb_O2_kj + H_air_comb_N2_kj;
let H_air_comb_kW = H_air_comb_kj/3600;



const data_air_comb = {
    Measured_air_temperature_C,
H_air_comb_kj,
H_air_comb_kW
    }
    


    // Calcul de la puissance de l'incinérateur

 let P_incinerateur_kWH = H_superheated_steam_kW+H_saturated_steam_kW+H_superheated_water_kW+H_out_kW+H_treatment_injected_water_kW+H_blowdown_kW+H_imbrule_kW+H_pertes_thermiques_kW-H_feed_water_kW-H_air_comb_kW-H_fumee_recy_kW-H_combustible_appoint_kW- H_tot_air_entrant_kW;

const Energie_recuperee_chaudiere_kW = H_saturated_steam_kW+H_superheated_steam_kW+H_superheated_water_kW+H_blowdown_kW-H_feed_water_kW;

const PCI_kCal_kg = P_incinerateur_kWH/Waste_flow_rate_kg_h*3600/4.1868;
const Energie_du_dechet_kW = PCI_kCal_kg * Waste_flow_rate_kg_h*4.1868/3600;
const WHB_yield_pourcent = Energie_recuperee_chaudiere_kW/Energie_du_dechet_kW*100;

 const INCI = {
    H_superheated_steam_kW,
    H_saturated_steam_kW,
    H_superheated_water_kW,
    H_out_kW,
    H_treatment_injected_water_kW,
    H_blowdown_kW,
    H_imbrule_kW,
    H_pertes_thermiques_kW,
    H_feed_water_kW,
    H_air_comb_kW,
    H_fumee_recy_kW,
    H_combustible_appoint_kW,
    H_tot_air_entrant_kW,
    Energie_recuperee_chaudiere_kW,
    Energie_du_dechet_kW ,
    WHB_yield_pourcent 
 }


const Data_AirIngress = {H_tot_air_entrant_kj,H_tot_air_entrant_kW}
const data_InjectedWater={H_treatment_injected_water_kJ,H_treatment_injected_water_kW}
const data_FeedWater={H_feed_water_kJ,H_feed_water_kW}
const data_Blowdown={Q_blowdown_kg_h,  H_blowdown_kJ,H_blowdown_kW}
const data_superheated_steam={H_superheated_steam_kJ,H_superheated_steam_kW}
const data_superheated_water={H_superheated_water_kJ,H_superheated_water_kW }
const data_saturated_steam={H_saturated_steam_kJ,H_saturated_steam_kW}
const data_pertes_thermique={H_pertes_thermiques_kW}
const data_pertes_imbrules={H_imbrule_kJ, H_imbrule_kW}
const data_fumee_recy={H_fumee_recy_kJ, H_fumee_recy_kW}
const data_comb_appoint={H_combustible_appoint_kW}

    return {P_incinerateur_kWH, PCI_kCal_kg,
       INCI,
        Data_AirIngress, data_InjectedWater, data_FeedWater, data_Blowdown, data_saturated_steam, data_superheated_steam, data_superheated_water, data_pertes_thermique, data_pertes_imbrules, data_fumee_recy, data_comb_appoint, data_air_comb

  
        //MasseDechet
    };
};
