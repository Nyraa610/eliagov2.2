
import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  addEdge,
  useReactFlow
} from "@xyflow/react";
import { PrimaryActivityNode } from "../nodes/PrimaryActivityNode";
import { SupportActivityNode } from "../nodes/SupportActivityNode";
import { ExternalFactorNode } from "../nodes/ExternalFactorNode";
import { CustomNode } from "../nodes/CustomNode";
import { NodeType } from "@/types/valueChain";

interface ReactFlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
}

export function ReactFlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick
}: ReactFlowCanvasProps) {
  const reactFlowInstance = useReactFlow();

  // Define node types
  const nodeTypes = {
    primary: PrimaryActivityNode,
    support: SupportActivityNode,
    external: ExternalFactorNode,
    custom: CustomNode
  };

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      return addEdge({ ...params, animated: false }, edges);
    },
    [edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      <Controls />
      
      <Panel position="top-left" className="bg-white p-2 rounded shadow-sm text-sm">
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
            <span>Primary</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <span>Support</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
            <span>External</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
            <span>Custom</span>
          </div>
        </div>
      </Panel>
    </ReactFlow>
  );
}
