import { CO2_m3_kg, H2O_m3_kg, O2_m3_kg, N2_m3_kg } from '../../A_Transverse_fonction/conv_calculation';
import { fh_CO2, fh_H2O, fh_O2, fh_N2 } from '../../A_Transverse_fonction/enthalpy_gas';
import {coeff_Nm3_to_m3} from '../../A_Transverse_fonction/conv_calculation';


export let performCalculation_STACK = (p1, p2, p3, p4, p5,p6) => {
    // Convert string inputs to numbers and set defaults
    
    
    let T = parseFloat(p1) || 0;
    let Qv_wet_Nm3_h = parseFloat(p2) || 0;
    let O2_dry_pourcent = parseFloat(p3) || 0;
    let H2O_pourcent = parseFloat(p4) || 0;
    let CO2_dry_pourcent = parseFloat(p5) || 0;
    let P_out_mmCE = parseFloat(p6) || 0;

 ///
 let P_mmCE = P_out_mmCE;
 let Qv_wet_m3_h = coeff_Nm3_to_m3(P_mmCE, T)*Qv_wet_Nm3_h;
   
 // Calculate O2 percentage in wet basis
    let O2_humide_pourcent = O2_dry_pourcent * (1 - H2O_pourcent / 100);
     let CO2_humide_pourcent = CO2_dry_pourcent * (1 - H2O_pourcent / 100);
    // Calculate N2 percentage in wet basis (remaining percentage)
    let N2_humide_pourcent = 100 - O2_humide_pourcent - H2O_pourcent - CO2_humide_pourcent;

    // Calculate volumetric flow rates
    let Qv_H2O_Nm3_h = (H2O_pourcent / 100) * Qv_wet_Nm3_h;
    let Qv_O2_Nm3_h = (O2_humide_pourcent / 100) * Qv_wet_Nm3_h;
    let Qv_N2_Nm3_h = (N2_humide_pourcent / 100) * Qv_wet_Nm3_h;
    let Qv_CO2_Nm3_h = (CO2_humide_pourcent / 100) * Qv_wet_Nm3_h;

    // Calculate dry flow rate
    let Qv_sec_Nm3_h = Qv_wet_Nm3_h - Qv_H2O_Nm3_h;

    // Convert to mass flow rates
    let Qm_H2O_kg_h = H2O_m3_kg(Qv_H2O_Nm3_h);
    let Qm_O2_kg_h = O2_m3_kg(Qv_O2_Nm3_h);
    let Qm_N2_kg_h = N2_m3_kg(Qv_N2_Nm3_h);
    let Qm_CO2_kg_h = CO2_m3_kg(Qv_CO2_Nm3_h);
    let Qm_tot_kg_h = Qm_CO2_kg_h + Qm_H2O_kg_h + Qm_O2_kg_h + Qm_N2_kg_h;

    // Calculate enthalpies
    let H_H2O_kj = (fh_H2O(T) + 540 * 4.18) * Qm_H2O_kg_h;
    let H_O2_kj = fh_O2(T) * Qm_O2_kg_h;
    let H_N2_kj = fh_N2(T) * Qm_N2_kg_h;
    let H_CO2_kj = fh_CO2(T) * Qm_CO2_kg_h;
    let H_tot_kj = H_CO2_kj + H_H2O_kj + H_O2_kj + H_N2_kj;

    // Convert total energy to kW
    let H_tot_kW = H_tot_kj / 3600;




    // Return calculation results
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
    
      return { dataFlow} ;

/*

      const formatNumber = (num) => num ? Number(num.toFixed(2)) : num;

      const dataFlow = Object.fromEntries(
          Object.entries({ T, Qv_wet_Nm3_h, O2_dry_pourcent, H2O_pourcent, O2_humide_pourcent, 
              N2_humide_pourcent, CO2_dry_pourcent, CO2_humide_pourcent, Qv_CO2_Nm3_h, 
              Qv_H2O_Nm3_h, Qv_O2_Nm3_h, Qv_N2_Nm3_h, Qv_sec_Nm3_h, Qm_CO2_kg_h, 
              Qm_H2O_kg_h, Qm_O2_kg_h, Qm_N2_kg_h, Qm_tot_kg_h, H_CO2_kj, H_H2O_kj, 
              H_O2_kj, H_N2_kj, H_tot_kj, H_tot_kW })
          .map(([k, v]) => [k, formatNumber(v)])
      );
      
      return { dataFlow };

*/


    };
    