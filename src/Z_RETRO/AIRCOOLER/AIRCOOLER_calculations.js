// Économiseur fumées → air (nœud « Cooling_HX_air ») — mode Retro.
// Calcul commun : ../ECONOMISEUR/economiseur_retro.js (Pyrofluid ClassEconomiseur).
import { calculRetroEconomiseur, lireParamsRetro } from '../ECONOMISEUR/economiseur_retro';
import { FLUIDE } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_calculs';

export const performCalculation_AIRCOOLER = (nodeData, params = {}) => {
  const { data, dataFlow } = calculRetroEconomiseur(nodeData, params, FLUIDE.AIR);
  return { dataAIRCOOLER: data, dataFlow };
};

// Paramètres de l'onglet Retro (localStorage params_retro_AIRCOOLER_<nodeId>), lus par batchCalculators.js
export const lireParamsRetro_AIRCOOLER = (nodeId) => lireParamsRetro('AIRCOOLER', FLUIDE.AIR, nodeId);
