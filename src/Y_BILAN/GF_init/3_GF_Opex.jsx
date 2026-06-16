import React from 'react';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';
import { getLanguageCode } from '../../F_Gestion_Langues/Fonction_Traduction';
import { translations } from './GF_traduction';

const GFOpex = ({ innerData, setInnerData, currentLanguage = 'fr' }) => {
  const languageCode = getLanguageCode(currentLanguage);
  const t = (key) => translations[languageCode]?.[key] || translations['fr']?.[key] || key;

  return (
    <OpexDashboard
      equipmentType="GF"
      innerData={innerData}
      setInnerData={setInnerData}
      currentLanguage={currentLanguage}
    />
  );
};

export default GFOpex;
