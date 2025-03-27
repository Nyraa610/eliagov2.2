
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
import { useCallback, useState, useEffect, useRef } from 'react';
import FloatingEdge from './FloatingEdge';
import { CustomNode } from './CustomNode';
import { CustomToolbar } from './CustomToolbar';
import { useValueChainNodes } from './useValueChainNodes';
import { ValueChainData, NodeType, AIGenerationPrompt } from '@/types/valueChain';
import { EditorContent } from './components/EditorContent';
import { AutomatedValueChainBuilder } from '../AutomatedValueChainBuilder';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAutomatedValueChain } from './hooks/useAutomatedValueChain';
import { useValueChainActions } from './useValueChainActions';

const nodeTypes = {
  custom: CustomNode,
  valueChainNode: CustomNode
};

const edgeTypes = {
  floating: FloatingEdge,
};

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData | null;
}

const ValueChainEditorContainer = ({ initialData }: ValueChainEditorContainerProps) => {
  const { company } = useCompanyProfile();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAutomatedBuilderOpen, setIsAutomatedBuilderOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const { handleAutomatedValueChain } = useAutomatedValueChain({
    setIsGenerating,
    setGeneratingProgress,
    setNodes,
    setEdges,
    setSelectedNode,
    setIsAIDialogOpen: setIsAutomatedBuilderOpen,
    company
  });

  const {
    handleSave,
    handleExport,
    handleImport,
    handleClear,
    handleZoomIn,
    handleZoomOut,
    handleReset
  } = useValueChainActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    company
  });

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleAddNode = useCallback((type: NodeType) => {
    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowBounds.width / 2,
      y: reactFlowBounds.height / 2,
    });
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'valueChainNode',
      position,
      data: { 
        label: `${type} Node`, 
        type: type,
        description: 'Click to edit'
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [reactFlowInstance, setNodes]);

  const handleUpdateNode = useCallback((nodeId, data) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView();
      }, 50);
    }
  }, [nodes, reactFlowInstance]);

  return (
    <div className="w-full h-full">
      <EditorContent
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        selectedNode={selectedNode}
        handleUpdateNode={handleUpdateNode}
        handleAddNode={handleAddNode}
        handleSave={handleSave}
        handleExport={handleExport}
        handleImport={handleImport}
        handleClear={handleClear}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleReset={handleReset}
        isGenerating={isGenerating}
        generatingProgress={generatingProgress}
        onAutomatedBuilder={() => setIsAutomatedBuilderOpen(true)}
        setSelectedNode={setSelectedNode}
        reactFlowWrapper={reactFlowWrapper}
      />
      
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={handleAutomatedValueChain}
        companyName={company?.name || ""}
        industry={company?.industry || ""}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default ValueChainEditorContainer;
