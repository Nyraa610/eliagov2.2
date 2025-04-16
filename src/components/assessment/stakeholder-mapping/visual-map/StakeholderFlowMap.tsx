
import React from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection
} from "@xyflow/react";
import { StakeholderNodeTypes } from "./StakeholderNodeTypes";
import { StakeholderEdgeTypes } from "./StakeholderEdgeTypes";
import { StakeholderMapControls } from "./StakeholderMapControls";

interface StakeholderFlowMapProps {
  reactFlowRef: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  selectedNodeId: string | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export function StakeholderFlowMap({
  reactFlowRef,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  selectedNodeId,
  setNodes,
  setEdges
}: StakeholderFlowMapProps) {
  const nodeTypes = StakeholderNodeTypes;
  const edgeTypes = StakeholderEdgeTypes;

  return (
    <ReactFlow
      ref={reactFlowRef}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
    >
      <Controls />
      <Background color="#aaa" gap={16} />
      <MiniMap
        nodeStrokeWidth={3}
        nodeColor={(node) => {
          switch (node.type) {
            case 'companyNode':
              return '#3498db';
            case 'employeeNode':
              return '#2ecc71';
            case 'customerNode':
              return '#e74c3c';
            case 'supplierNode':
              return '#f39c12';
            case 'communityNode':
              return '#9b59b6';
            case 'governmentNode':
              return '#34495e';
            default:
              return '#95a5a6';
          }
        }}
      />
      <StakeholderMapControls
        selectedNodeId={selectedNodeId}
        nodes={nodes}
        setNodes={setNodes}
        edges={edges}
        setEdges={setEdges}
      />
    </ReactFlow>
  );
}
