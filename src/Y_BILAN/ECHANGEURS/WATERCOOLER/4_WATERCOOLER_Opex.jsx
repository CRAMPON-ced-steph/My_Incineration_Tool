import React from 'react';
import OpexDashboard from '../../../G_Graphiques/Dashboard/OpexDashboard';

const WATERCOOLERopex = ({ innerData, setInnerData, currentLanguage = 'fr', nodeId }) => (
  <OpexDashboard
    equipmentType="WATERCOOLER"
    innerData={innerData}
    setInnerData={setInnerData}
    currentLanguage={currentLanguage}
    nodeId={nodeId}
  />
);

export default WATERCOOLERopex;
