// Économiseur fumées → eau (nœud « Cooling_HX_eau ») — mode Bilan.
// Onglets dans l'ordre des équipements : Gaz, Polluants, Design, OPEX, Rapport.
import React from 'react';
import EconomiseurMainPage from '../ECONOMISEUR/EconomiseurMainPage';
import EconomiseurFlueGas from '../ECONOMISEUR/1_Economiseur_Flue_gas_ML';
import EconomiseurPollutantEmission from '../ECONOMISEUR/2_Economiseur_Pollutant_Emission_ML';
import EconomiseurDesign from '../ECONOMISEUR/3_Economiseur_Design_ML';
import WATERCOOLERopex from './4_WATERCOOLER_Opex';
import WATERCOOLER_Report from './WATERCOOLER_Report';
import { CONFIG_WATERCOOLER } from './WATERCOOLER_config';

const ONGLETS = [
  { cle: 'Flue gases', Composant: EconomiseurFlueGas },
  { cle: 'Pollutant Emissions', Composant: EconomiseurPollutantEmission },
  { cle: 'Design', Composant: EconomiseurDesign },
  { cle: 'Opex', Composant: WATERCOOLERopex },
  { cle: 'Report', Composant: WATERCOOLER_Report },
];

const WATERCOOLERMainPage = (props) => <EconomiseurMainPage {...props} config={CONFIG_WATERCOOLER} onglets={ONGLETS} />;

export default WATERCOOLERMainPage;
