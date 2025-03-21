
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Background,
  NodeToolbar,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState, useEffect } from 'react';
import FloatingEdge from './FloatingEdge';
import { CustomNode } from './CustomNode';
import { CustomToolbar } from './CustomToolbar';
import { useValueChainNodes } from './useValueChainNodes';
import { ValueChainData, NodeType } from '@/types/valueChain';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const minimapStyle = {
  height: 120,
};

const rfStyle = {
  backgroundColor: '#F0F0F0',
};

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData | null;
}

const ValueChainEditorContainer = ({ initialData }: ValueChainEditorContainerProps) => {
  const { nodes: initialNodes, edges: initialEdges } = useValueChainNodes(
    initialData?.nodes || [],
    initialData?.edges || []
  );
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = {
        id: `node-${nodes.length + 1}`,
        type: 'custom',
        position,
        data: { 
          label: `${type || 'New'} node`,
          type: 'custom' as NodeType
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, nodes, setNodes]
  );

  useEffect(() => {
    if (reactFlowInstance && initialNodes.length > 0 && initialEdges.length > 0) {
      setTimeout(() => {
        fitView();
      }, 50);
    }
  }, [reactFlowInstance, initialNodes, initialEdges, fitView]);

  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <CustomToolbar />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={rfStyle}
        >
          <MiniMap style={minimapStyle} zoomable pannable />
          <Controls />
          <Background color="#aaa" variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ValueChainEditorContainer;
