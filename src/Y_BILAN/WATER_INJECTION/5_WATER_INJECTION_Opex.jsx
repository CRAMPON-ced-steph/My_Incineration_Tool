import React from 'react';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './WATER_INJECTION_traduction';

const WATER_INJECTIONopex = ({ innerData, setInnerData, currentLanguage = 'fr', nodeId }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <OpexDashboard
      equipmentType="WATER_INJECTION"
      innerData={innerData}
      setInnerData={setInnerData}
      currentLanguage={currentLanguage}
      nodeId={nodeId}
    />
  );
};

export default WATER_INJECTIONopex;
