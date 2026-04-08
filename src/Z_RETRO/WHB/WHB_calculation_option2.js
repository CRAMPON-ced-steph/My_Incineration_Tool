import { performCalculation_WHB_option_T_Qair} from './WHB_calculation_option1';

export const performCalculation_WHB_option_T_O2 = (nodeData, T_eau_alimentation_C, Q_eau_purge_pourcent, T_air_exterieur_C, P_th_pourcent, P_vapeur_bar, bilanTypeVapeur, T_vapeur_surchauffee_C, T_amont_WHB_C, O2_mesure) => {

  // Parse input parameters
  const Teau_alim = parseFloat(T_eau_alimentation_C) || 0;
  const Qpurge_pourcent = parseFloat(Q_eau_purge_pourcent) || 0;
  const Tair = parseFloat(T_air_exterieur_C) || 0;
  const Pth_pourcent = parseFloat(P_th_pourcent) || 0;
  const Pvap_bar = parseFloat(P_vapeur_bar) || 0;
  const Tvap_surchauffee = parseFloat(T_vapeur_surchauffee_C) || 0;
  const T = parseFloat(T_amont_WHB_C) || 0;
  const O2_target = parseFloat(O2_mesure) || 0;

  let Qair_maximum = 40000;
  let Qair_minimum = 0;
  let Qair_parasite_Nm3_h = (Qair_maximum + Qair_minimum) / 2;
 let O2calcule;
  let max_iterations = 100;
  let iterations = 21;
  let finalresult ;
  let result ;

let calculateResult = (Qair) => {
    return performCalculation_WHB_option_T_Qair(nodeData, Teau_alim, Qpurge_pourcent, Tair, Pth_pourcent, Pvap_bar, bilanTypeVapeur, Tvap_surchauffee, T, Qair);};

    result = calculateResult(0);

    while (iterations < max_iterations) {
      result = calculateResult(Qair_parasite_Nm3_h);
      O2calcule = result.dataFlow.O2_dry_pourcent;

      if (O2calcule >= O2_target) {Qair_minimum = Qair_parasite_Nm3_h;} 
      else if (O2calcule <= O2_target) {Qair_maximum = Qair_parasite_Nm3_h;}
      else {Qair_maximum = Qair_parasite_Nm3_h;}
      Qair_parasite_Nm3_h = (Qair_maximum + Qair_minimum) / 2;
      iterations++;
    }

 finalresult = calculateResult(Qair_parasite_Nm3_h);

  const  {
      data_Air_WHB,
      data_vapeur_WHB,
      data_eau_alim_WHB,
      dataFlow,
    } = finalresult;
  
    return {
      Qair_parasite_Nm3_h, 
      O2_calculated: O2calcule, 
      data_Air_WHB,        
      data_vapeur_WHB,     
      data_eau_alim_WHB,   
      dataFlow,            

    };
};




