// Rapport Bilan de l'économiseur fumées → air (nœud « Cooling_HX_air ») (contenu commun : ../ECONOMISEUR/Economiseur_Report.jsx).
import React from 'react';
import Economiseur_Report from '../ECONOMISEUR/Economiseur_Report';
import { CONFIG_AIRCOOLER } from './AIRCOOLER_config';

const AIRCOOLER_Report = ({ innerData, currentLanguage = 'fr', nodeId }) => (
  <Economiseur_Report innerData={innerData} currentLanguage={currentLanguage} nodeId={nodeId} config={CONFIG_AIRCOOLER} />
);

export default AIRCOOLER_Report;
