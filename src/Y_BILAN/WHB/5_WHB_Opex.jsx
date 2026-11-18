import React from 'react';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';

// Onglet OPEX de la chaudière : consommations écrites par l'onglet Design
// (pompe alimentaire, eau d'appoint, cendres) et valorisation (électricité,
// vapeur) lue dans l'onglet Valorisation vapeur.
const WHBopex = ({ innerData, setInnerData, currentLanguage = 'fr', nodeId }) => (
  <OpexDashboard
    equipmentType="WHB"
    innerData={innerData}
    setInnerData={setInnerData}
    currentLanguage={currentLanguage}
    nodeId={nodeId}
  />
);

export default WHBopex;
