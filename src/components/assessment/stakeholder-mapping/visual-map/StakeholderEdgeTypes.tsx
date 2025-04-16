
import React from "react";
import { EdgeProps, getBezierPath } from "@xyflow/react";
import { useTranslation } from "react-i18next";

// Custom edge component for stakeholder connections
export function StakeholderEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  const { t } = useTranslation();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const relationshipLabel = data?.relationship || "";
  
  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path stroke-2 stroke-gray-300"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {relationshipLabel && (
        <text
          x={labelX}
          y={labelY}
          className="text-xs fill-gray-700 bg-white px-1"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ 
            background: '#fff',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 500
          }}
        >
          {relationshipLabel}
        </text>
      )}
    </>
  );
}

// Export edge types for React Flow
export const stakeholderEdgeTypes = {
  stakeholderEdge: StakeholderEdge,
};
