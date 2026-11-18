// Économiseur fumées → air (nœud « Cooling_HX_air ») — rapport Retro (contenu commun : ../ECONOMISEUR/).
import React from 'react';
import Economiseur_Retro_Rapport from '../ECONOMISEUR/Economiseur_Retro_Rapport';
import { translations } from './AIRCOOLER_traduction';

const CONFIG = { code: 'AIRCOOLER', translations };

const AIRCOOLER_Retro_Rapport = (props) => <Economiseur_Retro_Rapport {...props} config={CONFIG} />;

export default AIRCOOLER_Retro_Rapport;
