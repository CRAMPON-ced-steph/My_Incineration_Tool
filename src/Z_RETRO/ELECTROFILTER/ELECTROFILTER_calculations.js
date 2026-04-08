import {fh_CO2,fh_H2O, fh_O2,fh_N2,fh_AIR} from '../../A_Transverse_fonction/enthalpy_gas';
import {AIR_DILUTION_T } from '../../A_Transverse_fonction/enthalpy_mix_gas';
import {CO2_kg_m3, O2_kg_m3,N2_kg_m3, H2O_kg_m3, O2_m3_kg, N2_m3_kg} from '../../A_Transverse_fonction/conv_calculation';

import {coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';
import {O2_masse_volume, rho_air} from '../../A_Transverse_fonction/constantes';

// performCalculation_ELECTROFILTER_option_T
export const performCalculation_ELECTROFILTER = (nodeData, T_air_decolmatation, Q_air_decolmatation,T_amont_ELECTROFILTER, PDC_aero ) => {
  
  
  // Extract receivedData from nodeData.result with default values
  // LECTURE DU NOEUD PRECEDENT
  const T_aval_ELECTROFILTER = nodeData.result.dataFlow.T;
   const T =parseFloat(T_amont_ELECTROFILTER) || 0;
 // const T_amont_ELECTROFILTER = parseFloat(T_amont_ELECTROFILTER);
  const Tair = parseFloat(T_air_decolmatation);
//const Q_air_decolmatation=parseFloat(Q_air_decolmatation);

  const Qv_wet_out_Nm3_h = nodeData.result.dataFlow.Qv_wet_Nm3_h;
  const O2_dry_out_pourcent = nodeData.result.dataFlow.O2_dry_pourcent;
  const H2O_out_pourcent = nodeData.result.dataFlow.H2O_pourcent;
  const O2_humide_out_pourcent = nodeData.result.dataFlow.O2_humide_pourcent;
  const N2_humide_out_pourcent = nodeData.result.dataFlow.N2_humide_pourcent;
  const CO2_dry_out_pourcent = nodeData.result.dataFlow.CO2_dry_pourcent;
  const CO2_humide_out_pourcent = nodeData.result.dataFlow.CO2_humide_pourcent;
  const Qv_CO2_out_Nm3_h = nodeData.result.dataFlow.Qv_CO2_Nm3_h;
  const Qv_H2O_out_Nm3_h = nodeData.result.dataFlow.Qv_H2O_Nm3_h;
  const Qv_O2_out_Nm3_h = nodeData.result.dataFlow.Qv_O2_Nm3_h;
  const Qv_N2_out_Nm3_h = nodeData.result.dataFlow.Qv_N2_Nm3_h;
  const Qv_sec_out_Nm3_h = nodeData.result.dataFlow.Qv_sec_Nm3_h;
  const Qm_CO2_out_kg_h = nodeData.result.dataFlow.Qm_CO2_kg_h;
  const Qm_H2O_out_kg_h = nodeData.result.dataFlow.Qm_H2O_kg_h;
  const Qm_O2_out_kg_h = nodeData.result.dataFlow.Qm_O2_kg_h;
  const Qm_N2_out_kg_h = nodeData.result.dataFlow.Qm_N2_kg_h;
  const Qm_tot_out_kg_h = nodeData.result.dataFlow.Qm_tot_kg_h;

  const P_out_mmCE = nodeData.result.dataFlow.P_mmCE;;

//ON CALCULE LE VOLUME D'AIR PARASITE

const Qv_air_entrant_tot_Nm3_h = AIR_DILUTION_T(Tair, T_amont_ELECTROFILTER, T_aval_ELECTROFILTER,Qm_CO2_out_kg_h, Qm_H2O_out_kg_h, Qm_N2_out_kg_h, Qm_O2_out_kg_h);

const Qv_air_entrant_Nm3_h = Qv_air_entrant_tot_Nm3_h;//-Q_air_decolmatation;
const Qm_air_entrant_kg_h = Qv_air_entrant_Nm3_h * rho_air;
const Qm_O2_air_entrant_kg_h = O2_masse_volume * Qm_air_entrant_kg_h;
const Qm_N2_air_entrant_kg_h = (1-O2_masse_volume) * Qm_air_entrant_kg_h;

const Qv_O2_air_entrant_Nm3_h = O2_kg_m3( Qm_O2_air_entrant_kg_h );
const Qv_N2_air_entrant_Nm3_h = N2_kg_m3( Qm_N2_air_entrant_kg_h );

const Qair_parasite = Qv_air_entrant_Nm3_h-Q_air_decolmatation;






  // ON CALCULE LA NOUVELLE COMPOSITION DES FUMEES ENTREES EN MASSE
  const Qm_CO2_kg_h = Qm_CO2_out_kg_h;
  const Qm_H2O_kg_h = Qm_H2O_out_kg_h;
  const Qm_O2_kg_h = Qm_O2_out_kg_h-Qm_O2_air_entrant_kg_h;
  const Qm_N2_kg_h = Qm_N2_out_kg_h-Qm_N2_air_entrant_kg_h;
  const Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;



  //ON CONVERTIT LES MASSES EN VOLUME
  const Qv_CO2_Nm3_h = CO2_kg_m3(Qm_CO2_kg_h);
  const Qv_H2O_Nm3_h = H2O_kg_m3(Qm_H2O_kg_h);
  const Qv_O2_Nm3_h = O2_kg_m3(Qm_O2_kg_h);
  const Qv_N2_Nm3_h = N2_kg_m3(Qm_N2_kg_h);
  const Qv_sec_Nm3_h = Qv_CO2_Nm3_h + Qv_O2_Nm3_h + Qv_N2_Nm3_h;
  const Qv_wet_Nm3_h = Qv_sec_Nm3_h + Qv_H2O_Nm3_h;

  // ON CALCULE LA REPARTITION POURCENT VOLUMIQUE
  const O2_dry_pourcent = Qv_O2_Nm3_h / Qv_sec_Nm3_h * 100;
  const O2_humide_pourcent = Qv_O2_Nm3_h / Qv_wet_Nm3_h * 100;
  const H2O_pourcent = Qv_H2O_Nm3_h / Qv_wet_Nm3_h * 100;
  const N2_humide_pourcent = Qv_N2_Nm3_h / Qv_wet_Nm3_h * 100;
  const CO2_dry_pourcent = Qv_CO2_Nm3_h / Qv_sec_Nm3_h * 100;
  const CO2_humide_pourcent = Qv_CO2_Nm3_h / Qv_wet_Nm3_h * 100;

  // Calculate enthalpies using the provided T
  const H_CO2_kj = fh_CO2(T_amont_ELECTROFILTER) * Qm_CO2_kg_h;
  const H_H2O_kj = (fh_H2O(T_amont_ELECTROFILTER) + 540 * 4.18) * Qm_H2O_kg_h;
  const H_O2_kj = fh_O2(T_amont_ELECTROFILTER) * Qm_O2_kg_h;
  const H_N2_kj = fh_N2(T_amont_ELECTROFILTER) * Qm_N2_kg_h;
  const H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;
  const H_tot_kW = H_tot_kj / 3600;

  //ON GENERE LA MATRICE DE SORTIE
  
  
  let P_mmCE = P_out_mmCE+PDC_aero;
  let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE,T)*Qv_wet_Nm3_h;


const dataELECTROFILTER={
  Qair_parasite,
  Qv_air_entrant_Nm3_h,
  Qm_air_entrant_kg_h,
  Qm_O2_air_entrant_kg_h,
  Qm_N2_air_entrant_kg_h,
  Qv_O2_air_entrant_Nm3_h,
  Qv_N2_air_entrant_Nm3_h,
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

  return {dataELECTROFILTER , dataFlow} ;
};
