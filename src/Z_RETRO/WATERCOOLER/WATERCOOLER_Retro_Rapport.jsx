// Économiseur fumées → eau (nœud « Cooling_HX_eau ») — rapport Retro (contenu commun : ../ECONOMISEUR/).
import React from 'react';
import Economiseur_Retro_Rapport from '../ECONOMISEUR/Economiseur_Retro_Rapport';
import { translations } from './WATERCOOLER_traduction';

const CONFIG = { code: 'WATERCOOLER', translations };

const WATERCOOLER_Retro_Rapport = (props) => <Economiseur_Retro_Rapport {...props} config={CONFIG} />;

export default WATERCOOLER_Retro_Rapport;
