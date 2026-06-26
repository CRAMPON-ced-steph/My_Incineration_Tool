/* eslint-disable react/prop-types */
import React from 'react';
import { Handle, Position } from '@xyflow/react';

const FURNACE_LABELS = ['RK+SCC', 'GF', 'FB'];

const CustomNode = ({ data }) => {
  const isFurnace = FURNACE_LABELS.includes(data.label);
  const isStack = data.label === 'STACK';

  return (
    <>
      {/* Line name above furnace nodes */}
      {isFurnace && data.lineName && (
        <div style={{
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: 10,
          fontWeight: 600,
          color: '#1a3a6b',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 3,
          padding: '1px 6px',
          border: '1px solid #c5d5ea',
        }}>
          {data.lineName}
        </div>
      )}

      {!isFurnace && <Handle type="target" position={Position.Left} />}
      {data.label}
      {!isStack && <Handle type="source" position={Position.Right} />}
    </>
  );
};

export default React.memo(CustomNode);
