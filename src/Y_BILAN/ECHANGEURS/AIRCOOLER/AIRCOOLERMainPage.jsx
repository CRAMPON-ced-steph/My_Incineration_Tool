// Économiseur fumées → air (nœud « Cooling_HX_air ») — mode Bilan.
// Onglets dans l'ordre des équipements : Gaz, Polluants, Design, OPEX, Rapport.
import React from 'react';
import EconomiseurMainPage from '../ECONOMISEUR/EconomiseurMainPage';
import EconomiseurFlueGas from '../ECONOMISEUR/1_Economiseur_Flue_gas_ML';
import EconomiseurPollutantEmission from '../ECONOMISEUR/2_Economiseur_Pollutant_Emission_ML';
import EconomiseurDesign from '../ECONOMISEUR/3_Economiseur_Design_ML';
import AIRCOOLERopex from './4_AIRCOOLER_Opex';
import AIRCOOLER_Report from './AIRCOOLER_Report';
import { CONFIG_AIRCOOLER } from './AIRCOOLER_config';

const ONGLETS = [
  { cle: 'Flue gases', Composant: EconomiseurFlueGas },
  { cle: 'Pollutant Emissions', Composant: EconomiseurPollutantEmission },
  { cle: 'Design', Composant: EconomiseurDesign },
  { cle: 'Opex', Composant: AIRCOOLERopex },
  { cle: 'Report', Composant: AIRCOOLER_Report },
];

const AIRCOOLERMainPage = (props) => <EconomiseurMainPage {...props} config={CONFIG_AIRCOOLER} onglets={ONGLETS} />;

export default AIRCOOLERMainPage;
