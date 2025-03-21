import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Background,
  NodeToolbar,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState, useEffect } from 'react';
import { initialNodes, initialEdges } from './initial-elements';
import FloatingEdge from './FloatingEdge';
import { CustomNode } from './CustomNode';
import { CustomToolbar } from './CustomToolbar';
import { useValueChainNodes } from './useValueChainNodes';
import { ValueChainData } from '@/types/valueChain';

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

const ValueChainEditorContainer: React.FC<{ initialData?: ValueChainData }> = ({ initialData }) => {
  const { nodes: initialNodes, edges: initialEdges } = useValueChainNodes(initialData);
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

      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.project({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: String(nodes.length + 1),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );

  useEffect(() => {
    if (reactFlowInstance && initialNodes && initialEdges) {
      fitView();
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
          <Background color="#aaa" variant="dots" gap={16} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ValueChainEditorContainer;
