// Rapport Bilan de l'économiseur fumées → eau (nœud « Cooling_HX_eau ») (contenu commun : ../ECONOMISEUR/Economiseur_Report.jsx).
import React from 'react';
import Economiseur_Report from '../ECONOMISEUR/Economiseur_Report';
import { CONFIG_WATERCOOLER } from './WATERCOOLER_config';

const WATERCOOLER_Report = ({ innerData, currentLanguage = 'fr', nodeId }) => (
  <Economiseur_Report innerData={innerData} currentLanguage={currentLanguage} nodeId={nodeId} config={CONFIG_WATERCOOLER} />
);

export default WATERCOOLER_Report;
