// Économiseur fumées → eau (nœud « Cooling_HX_eau ») — mode Retro.
// Calcul commun : ../ECONOMISEUR/economiseur_retro.js (Pyrofluid ClassEconomiseur).
import { calculRetroEconomiseur, lireParamsRetro } from '../ECONOMISEUR/economiseur_retro';
import { FLUIDE } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_calculs';

export const performCalculation_WATERCOOLER = (nodeData, params = {}) => {
  const { data, dataFlow } = calculRetroEconomiseur(nodeData, params, FLUIDE.EAU);
  return { dataWATERCOOLER: data, dataFlow };
};

// Paramètres de l'onglet Retro (localStorage params_retro_WATERCOOLER_<nodeId>), lus par batchCalculators.js
export const lireParamsRetro_WATERCOOLER = (nodeId) => lireParamsRetro('WATERCOOLER', FLUIDE.EAU, nodeId);
