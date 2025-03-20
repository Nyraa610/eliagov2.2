
import { useCallback } from "react";
import {
  ReactFlow,
  Connection,
  Edge,
  Node,
  useReactFlow,
  addEdge
} from "@xyflow/react";
import { FlowBackground } from "./components/flow/FlowBackground";
import { FlowControls } from "./components/flow/FlowControls";
import { FlowLegend } from "./components/flow/FlowLegend";
import { nodeTypes } from "./components/flow/FlowNodeTypes";

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
  const { setEdges } = useReactFlow();

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: false }, eds));
    },
    [setEdges]
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
      <FlowBackground />
      <FlowControls />
      <FlowLegend />
    </ReactFlow>
  );
}
