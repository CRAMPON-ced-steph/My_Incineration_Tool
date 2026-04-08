import React, { useState, useEffect } from 'react';
import OpexDashboard from '../../G_Graphiques/Dashboard/OpexDashboard_WHB';

const WHBopex = ({ innerData, setInnerData }) => {
  return (
    <OpexDashboard 
      equipmentType="WHB" 
      innerData={innerData} 
      setInnerData={setInnerData} 
    />
  );
};

export default WHBopex;