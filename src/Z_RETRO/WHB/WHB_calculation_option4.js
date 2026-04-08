/*import { performCalculation_WHB_option_T_Qair } from './WHB_calculation_option1';


export const performCalculation_WHB_option_Qeau_O2 = (nodeData, T_eau_alimentation_C, Q_eau_purge_pourcent, T_air_exterieur_C, P_th_pourcent, P_vapeur_bar, bilanTypeVapeur, T_vapeur_surchauffee_C, Q_eau_alimentation, O2_mesure) => {


  // Parse the input values
  const Teau_alim = parseFloat(T_eau_alimentation_C) || 0;
  const Qpurge_pourcent = parseFloat(Q_eau_purge_pourcent) || 0;
  const Tair = parseFloat(T_air_exterieur_C) || 0;
  const Pth_pourcent = parseFloat(P_th_pourcent) || 0;
  const Pvap_bar = parseFloat(P_vapeur_bar) || 0;
  const Tvap_surchauffee = parseFloat(T_vapeur_surchauffee_C) || 0;
 // const Qair_parasite_Nm3_h = parseFloat(Q_air_parasite_Nm3_h) || 0;
  const Q_eau_alim= parseFloat(Q_eau_alimentation) || 0;


const Q_vapeur_calculee_target = (1 - Qpurge_pourcent / 100) * Q_eau_alim;
let Tmax = 1300;
let Tmin = 800;
let T_amont_WHB = (Tmax+Tmin)/2;
let Q_vapeur_calcule;
let max_iterations = 100;
let iterations = 21;
let finalresult_step1 ;
let result ;

let Qair_parasite_Nm3_h=0;


let calculateResult_step1 = (T_amont_WHB) => {
return performCalculation_WHB_option_T_Qair(nodeData, Teau_alim, Qpurge_pourcent, Tair,Pth_pourcent, Pvap_bar, bilanTypeVapeur, Tvap_surchauffee,T_amont_WHB, Qair_parasite_Nm3_h);};
result = calculateResult_step1(T_amont_WHB);
while (iterations < max_iterations) {
result = calculateResult_step1(T_amont_WHB);
Q_vapeur_calcule = result.data_vapeur_WHB. Q_vapeur_calculee_kg_h;
if (Q_vapeur_calcule >= Q_vapeur_calculee_target) {Tmax = T_amont_WHB;}
else if (Q_vapeur_calcule <= Q_vapeur_calculee_target) {Tmin = T_amont_WHB;}
else {Tmax = T_amont_WHB;}
T_amont_WHB = (Tmax+Tmin)/2;
iterations++;
}

finalresult_step1 = calculateResult_step1(T_amont_WHB);


const O2_target = parseFloat(O2_mesure) || 0;

let Qair_maximum = 40000;
let Qair_minimum = 0;
 Qair_parasite_Nm3_h = (Qair_maximum + Qair_minimum) / 2;
let O2calcule;
let finalresult_step2 ;

let T = T_amont_WHB;

let calculateResult_step2 = (Qair) => {
  return performCalculation_WHB_option_T_Qair(nodeData, Teau_alim, Qpurge_pourcent, Tair, Pth_pourcent, Pvap_bar, bilanTypeVapeur, Tvap_surchauffee, T, Qair);};

  result = calculateResult_step2(0);

  while (iterations < max_iterations) {
    result = calculateResult_step2(Qair_parasite_Nm3_h);
    O2calcule = result.dataFlow.O2_dry_pourcent;

    if (O2calcule >= O2_target) {Qair_minimum = Qair_parasite_Nm3_h;} 
    else if (O2calcule <= O2_target) {Qair_maximum = Qair_parasite_Nm3_h;}
    else {Qair_maximum = Qair_parasite_Nm3_h;}
    Qair_parasite_Nm3_h = (Qair_maximum + Qair_minimum) / 2;
    iterations++;
  }

finalresult_step2 = calculateResult_step2(Qair_parasite_Nm3_h);


  const  {
      data_Air_WHB,
      data_vapeur_WHB,
      data_eau_alim_WHB,
      dataFlow
    } = finalresult_step1;
  
    return {
      Qair_parasite_Nm3_h, 
      O2_calculated: O2calcule, 
      data_Air_WHB,        
      data_vapeur_WHB,     
      data_eau_alim_WHB,   
      dataFlow,            

    };
};

*/
import { performCalculation_WHB_option_T_Qair } from './WHB_calculation_option1';

export const performCalculation_WHB_option_Qeau_O2 = (nodeData, T_eau_alimentation_C, Q_eau_purge_pourcent, T_air_exterieur_C, P_th_pourcent, P_vapeur_bar, bilanTypeVapeur, T_vapeur_surchauffee_C, Q_eau_alimentation, O2_mesure) => {
  // Parse the input values
  const Teau_alim = parseFloat(T_eau_alimentation_C) || 0;
  const Qpurge_pourcent = parseFloat(Q_eau_purge_pourcent) || 0;
  const Tair = parseFloat(T_air_exterieur_C) || 0;
  const Pth_pourcent = parseFloat(P_th_pourcent) || 0;
  const Pvap_bar = parseFloat(P_vapeur_bar) || 0;
  const Tvap_surchauffee = parseFloat(T_vapeur_surchauffee_C) || 0;
  const Q_eau_alim = parseFloat(Q_eau_alimentation) || 0;
  const O2_target = parseFloat(O2_mesure) || 0;

  const Q_vapeur_calculee_target = (1 - Qpurge_pourcent / 100) * Q_eau_alim;
  let Tmax = 1300;
  let Tmin = 0;
  let T_amont_WHB = (Tmax + Tmin) / 2;
  let Q_vapeur_calcule;
  let max_iterations = 100;
  let iterations = 0; // Fixed: reset iterations counter
  let finalresult_step1;
  let result;

  let Qair_parasite_Nm3_h = 0;

  // Step 1: Find T_amont_WHB that gives target vapor flow
  let calculateResult_step1 = (T_amont_WHB) => {
    return performCalculation_WHB_option_T_Qair(
      nodeData, 
      Teau_alim, 
      Qpurge_pourcent, 
      Tair, 
      Pth_pourcent, 
      Pvap_bar, 
      bilanTypeVapeur, 
      Tvap_surchauffee, 
      T_amont_WHB, 
      Qair_parasite_Nm3_h
    );
  };

  result = calculateResult_step1(T_amont_WHB);

  while (iterations < max_iterations) {
    result = calculateResult_step1(T_amont_WHB);
    Q_vapeur_calcule = result.data_vapeur_WHB.Q_vapeur_calculee_kg_h; // Fixed: removed space in property access
    
    if (Q_vapeur_calcule >= Q_vapeur_calculee_target) {
      Tmax = T_amont_WHB;
    } else if (Q_vapeur_calcule <= Q_vapeur_calculee_target) {
      Tmin = T_amont_WHB;
    }
    
    T_amont_WHB = (Tmax + Tmin) / 2;
    iterations++;
  }

  finalresult_step1 = calculateResult_step1(T_amont_WHB);

  // Step 2: Find Qair_parasite_Nm3_h that gives target O2 percentage
  let Qair_maximum = 40000;
  let Qair_minimum = 0;
  Qair_parasite_Nm3_h = (Qair_maximum + Qair_minimum) / 2;
  let O2calcule;
  let finalresult_step2;

  let T = T_amont_WHB;
  iterations = 0; // Fixed: reset iterations counter for second loop

  let calculateResult_step2 = (Qair) => {
    return performCalculation_WHB_option_T_Qair(
      nodeData, 
      Teau_alim, 
      Qpurge_pourcent, 
      Tair, 
      Pth_pourcent, 
      Pvap_bar, 
      bilanTypeVapeur, 
      Tvap_surchauffee, 
      T, 
      Qair
    );
  };

  while (iterations < max_iterations) {
    result = calculateResult_step2(Qair_parasite_Nm3_h);
    O2calcule = result.dataFlow.O2_dry_pourcent;

    if (O2calcule >= O2_target) {
      Qair_minimum = Qair_parasite_Nm3_h;
    } else if (O2calcule <= O2_target) {
      Qair_maximum = Qair_parasite_Nm3_h;
    }
    
    Qair_parasite_Nm3_h = (Qair_maximum + Qair_minimum) / 2;
    iterations++;
  }

  finalresult_step2 = calculateResult_step2(Qair_parasite_Nm3_h);

  // Use finalresult_step2 for the return values since it's the most recent calculation
  const {
    data_Air_WHB,
    data_vapeur_WHB,
    data_eau_alim_WHB,
    dataFlow
  } = finalresult_step2; // Fixed: use finalresult_step2 instead of finalresult_step1

  return {
    Qair_parasite_Nm3_h, 
    O2_calculated: O2calcule, 
    data_Air_WHB,        
    data_vapeur_WHB,     
    data_eau_alim_WHB,   
    dataFlow
  };
};