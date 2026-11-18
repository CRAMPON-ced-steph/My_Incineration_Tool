// Configuration de l'économiseur fumées → eau (nœud « Cooling_HX_eau ») : code (clés localStorage, résultats dans
// innerData, type OPEX), fluide et traductions. Calculs et onglets communs : ../ECONOMISEUR/.
import { FLUIDE } from '../ECONOMISEUR/economiseur_calculs';
import { translations } from './WATERCOOLER_traduction';

export const CONFIG_WATERCOOLER = { code: 'WATERCOOLER', fluide: FLUIDE.EAU, translations };
