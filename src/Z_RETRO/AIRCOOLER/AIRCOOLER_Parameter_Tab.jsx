// Économiseur fumées → air (nœud « Cooling_HX_air ») — onglet Retro (contenu commun : ../ECONOMISEUR/).
import React from 'react';
import Economiseur_Parameter_Tab from '../ECONOMISEUR/Economiseur_Parameter_Tab';
import { performCalculation_AIRCOOLER } from './AIRCOOLER_calculations';
import { FLUIDE } from '../../Y_BILAN/ECHANGEURS/ECONOMISEUR/economiseur_calculs';
import { translations } from './AIRCOOLER_traduction';

const CONFIG = { code: 'AIRCOOLER', fluide: FLUIDE.AIR, translations, calculer: performCalculation_AIRCOOLER };

const AIRCOOLER_Parameter_Tab = (props) => <Economiseur_Parameter_Tab {...props} config={CONFIG} />;

export default AIRCOOLER_Parameter_Tab;
