import React, { useState, useEffect } from 'react';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';

import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './FB_traduction';

const FBopex = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {

  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => {
    return translations[languageCode]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <OpexDashboard
      equipmentType="FB"
      innerData={innerData}
      setInnerData={setInnerData}
      currentLanguage={currentLanguage}
    />
  );
};

export default FBopex;
