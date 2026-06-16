import React from 'react';
import PropTypes from 'prop-types';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';

const GFopex = ({ innerData, innerDataTick, setInnerData, currentLanguage = 'fr' }) => {
  return (
    <OpexDashboard
      equipmentType="GF"
      innerData={innerData}
      innerDataTick={innerDataTick}
      setInnerData={setInnerData}
      currentLanguage={currentLanguage}
      equipmentConfig={{ numElecRows: 6 }}
    />
  );
};

GFopex.propTypes = {
  innerData: PropTypes.object.isRequired,
  innerDataTick: PropTypes.number,
  setInnerData: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string,
};

export default GFopex;
