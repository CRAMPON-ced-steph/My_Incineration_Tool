// Économiseur fumées → eau (nœud « Cooling_HX_eau ») — onglet Retro (contenu commun : ../ECONOMISEUR/).
import React from 'react';
import Economiseur_Parameter_Tab from '../ECONOMISEUR/Economiseur_Parameter_Tab';
import { performCalculation_WATERCOOLER } from './WATERCOOLER_calculations';
import { FLUIDE } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_calculs';
import { translations } from './WATERCOOLER_traduction';

const CONFIG = { code: 'WATERCOOLER', fluide: FLUIDE.EAU, translations, calculer: performCalculation_WATERCOOLER };

const WATERCOOLER_Parameter_Tab = (props) => <Economiseur_Parameter_Tab {...props} config={CONFIG} />;

export default WATERCOOLER_Parameter_Tab;
