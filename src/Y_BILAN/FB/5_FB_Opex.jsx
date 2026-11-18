import React from 'react';
import PropTypes from 'prop-types';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard';

const FBopex = ({ innerData, innerDataTick, setInnerData, currentLanguage = 'fr', nodeId }) => {
  return (
    <OpexDashboard
      equipmentType="FB"
      innerData={innerData}
      innerDataTick={innerDataTick}
      setInnerData={setInnerData}
      currentLanguage={currentLanguage}
      nodeId={nodeId}
      equipmentConfig={{ numElecRows: 6 }}
    />
  );
};

FBopex.propTypes = {
  innerData: PropTypes.object.isRequired,
  innerDataTick: PropTypes.number,
  setInnerData: PropTypes.func.isRequired,
  currentLanguage: PropTypes.string,
  nodeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FBopex;
