
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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleAddNode = useCallback((type: NodeType) => {
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
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

  const handleSave = useCallback(() => {
    console.log('Save value chain');
    // Implement save functionality
  }, []);

  const handleExport = useCallback(() => {
    console.log('Export value chain');
    // Implement export functionality
  }, []);

  const handleImport = useCallback((e) => {
    console.log('Import value chain');
    // Implement import functionality
  }, []);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleReset = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

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
      />
      
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={handleAutomatedValueChain}
        companyName={company?.name || ""}
        industry={company?.industry || ""}
        location={company?.location || ""}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default ValueChainEditorContainer;
