
import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';

// Custom edge with label with proper type definition
const StakeholderEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} className="stroke-gray-400 stroke-2" />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
            className="nodrag nopan"
          >
            {/* Fix the ReactI18NextChildren type issue by ensuring label is a string */}
            {String(data.label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const StakeholderEdgeTypes = {
  stakeholderEdge: StakeholderEdge,
};
