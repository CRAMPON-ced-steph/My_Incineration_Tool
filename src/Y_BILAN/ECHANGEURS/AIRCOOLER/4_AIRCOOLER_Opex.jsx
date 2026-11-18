import React from 'react';
import OpexDashboard from '../../../G_Graphiques/Dashboard/OpexDashboard';

const AIRCOOLERopex = ({ innerData, setInnerData, currentLanguage = 'fr', nodeId }) => (
  <OpexDashboard
    equipmentType="AIRCOOLER"
    innerData={innerData}
    setInnerData={setInnerData}
    currentLanguage={currentLanguage}
    nodeId={nodeId}
  />
);

export default AIRCOOLERopex;
