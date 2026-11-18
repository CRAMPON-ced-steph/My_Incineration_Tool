import React from 'react';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';


import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './DENOX_traduction';


const DENOXopex = ({ innerData, setInnerData, currentLanguage = 'fr', nodeId }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  
  return (
    <OpexDashboard 
      equipmentType="DENOX" 
      innerData={innerData} 
      setInnerData={setInnerData} 
      currentLanguage={currentLanguage}
      nodeId={nodeId}
    />
  );
};

export default DENOXopex;