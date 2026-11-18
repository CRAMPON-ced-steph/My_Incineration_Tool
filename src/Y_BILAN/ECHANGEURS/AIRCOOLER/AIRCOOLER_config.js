// Configuration de l'économiseur fumées → air (nœud « Cooling_HX_air ») : code (clés localStorage, résultats dans
// innerData, type OPEX), fluide et traductions. Calculs et onglets communs : ../ECONOMISEUR/.
import { FLUIDE } from '../ECONOMISEUR/economiseur_calculs';
import { translations } from './AIRCOOLER_traduction';

export const CONFIG_AIRCOOLER = { code: 'AIRCOOLER', fluide: FLUIDE.AIR, translations };
