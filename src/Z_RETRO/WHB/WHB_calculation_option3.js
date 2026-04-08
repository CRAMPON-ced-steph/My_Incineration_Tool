import { performCalculation_WHB_option_T_Qair } from './WHB_calculation_option1';

export const performCalculation_WHB_option_Qeau_Qair = (nodeData, T_eau_alimentation_C, Q_eau_purge_pourcent, T_air_exterieur_C, P_th_pourcent, P_vapeur_bar, bilanTypeVapeur, T_vapeur_surchauffee_C, Q_eau_alimentation, Q_air_parasite_Nm3_h) => {

  // Parse the input values
  const Teau_alim = parseFloat(T_eau_alimentation_C) || 0;
  const Qpurge_pourcent = parseFloat(Q_eau_purge_pourcent) || 0;
  const Tair = parseFloat(T_air_exterieur_C) || 0;
  const Pth_pourcent = parseFloat(P_th_pourcent) || 0;
  const Pvap_bar = parseFloat(P_vapeur_bar) || 0;
  const Tvap_surchauffee = parseFloat(T_vapeur_surchauffee_C) || 0;
  const Qair_parasite_Nm3_h = parseFloat(Q_air_parasite_Nm3_h) || 0;
  const Q_eau_alim= parseFloat(Q_eau_alimentation) || 0;


const Q_vapeur_calculee_target = (1 - Qpurge_pourcent / 100) * Q_eau_alim;
let Tmax = 1300;
let Tmin = 0;
let T_amont_WHB = (Tmax+Tmin)/2;
let Q_vapeur_calcule;
let max_iterations = 100;
let iterations = 21;
let finalresult ;
let result ;

let calculateResult = (T_amont_WHB) => {
return performCalculation_WHB_option_T_Qair(nodeData, Teau_alim, Qpurge_pourcent, Tair,Pth_pourcent, Pvap_bar, bilanTypeVapeur, Tvap_surchauffee,T_amont_WHB, Qair_parasite_Nm3_h);};

result = calculateResult(T_amont_WHB);

while (iterations < max_iterations) {
result = calculateResult(T_amont_WHB);
Q_vapeur_calcule = result.data_vapeur_WHB. Q_vapeur_calculee_kg_h;

if (Q_vapeur_calcule >= Q_vapeur_calculee_target) {Tmax = T_amont_WHB;}
else if (Q_vapeur_calcule <= Q_vapeur_calculee_target) {Tmin = T_amont_WHB;}
else {Tmax = T_amont_WHB;}
T_amont_WHB = (Tmax+Tmin)/2;
iterations++;
}

finalresult = calculateResult(T_amont_WHB);







  const  {
      data_Air_WHB,
      data_vapeur_WHB,
      data_eau_alim_WHB,
      dataFlow,
    } = finalresult;
  
    return {
      Qair_parasite_Nm3_h, 
      data_Air_WHB,        
      data_vapeur_WHB,     
      data_eau_alim_WHB,   
      dataFlow,            

    };
};
