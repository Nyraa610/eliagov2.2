
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState, useEffect, useRef } from 'react';
import FloatingEdge from './FloatingEdge';
import { CustomNode } from './CustomNode';
import { CustomToolbar } from './CustomToolbar';
import { useValueChainNodes } from './useValueChainNodes';
import { ValueChainData, NodeType, AIGenerationPrompt, NodeData } from '@/types/valueChain';
import { EditorContent } from './components/EditorContent';
import { AutomatedValueChainBuilder } from '../AutomatedValueChainBuilder';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAutomatedValueChain } from './hooks/useAutomatedValueChain';
import { useValueChainActions } from './useValueChainActions';
import { Company } from '@/services/company/types';
import { toast } from 'sonner';
import { valueChainService } from '@/services/value-chain';
import { Node, Edge } from '@xyflow/react';

const nodeTypes = {
  custom: CustomNode,
  valueChainNode: CustomNode
};

const edgeTypes = {
  floating: FloatingEdge,
};

// Auto-save debounce delay in milliseconds
const AUTO_SAVE_DELAY = 10000; // 10 seconds

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData | null;
  onDataChange?: (data: ValueChainData) => void;
  autoSave?: boolean;
  company?: Company | null;
}

const ValueChainEditorContainer = ({ 
  initialData, 
  onDataChange, 
  autoSave = false,
  company: propCompany
}: ValueChainEditorContainerProps) => {
  const { company: contextCompany } = useCompanyProfile();
  const company = propCompany || contextCompany;
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAutomatedBuilderOpen, setIsAutomatedBuilderOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);
  
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

  // Create current value chain data
  const getCurrentValueChainData = useCallback((): ValueChainData => {
    return {
      nodes: nodes as unknown as any[],
      edges,
      name: company?.name ? `${company.name} Value Chain` : "Value Chain",
      companyId: company?.id,
      metadata: initialData?.metadata || {}
    };
  }, [nodes, edges, company, initialData]);

  // Trigger auto-save
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (!company?.id || nodes.length === 0) return;

      try {
        const currentData = getCurrentValueChainData();
        const currentDataString = JSON.stringify(currentData);

        // Skip if data hasn't changed since last save
        if (lastSavedDataRef.current === currentDataString) {
          return;
        }

        const success = await valueChainService.saveValueChain(currentData);
        if (success) {
          console.log("Auto-saved value chain");
          lastSavedDataRef.current = currentDataString;
        }
      } catch (error) {
        console.error("Error auto-saving value chain:", error);
      }
    }, AUTO_SAVE_DELAY);
  }, [company, nodes, getCurrentValueChainData]);

  // Auto-save when nodes or edges change
  useEffect(() => {
    if (autoSave && company?.id && nodes.length > 0) {
      triggerAutoSave();
    }

    // Update parent component if needed
    if (onDataChange) {
      onDataChange(getCurrentValueChainData());
    }

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [nodes, edges, autoSave, company, onDataChange, getCurrentValueChainData, triggerAutoSave]);

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
    company,
    onSaveSuccess: (savedData) => {
      lastSavedDataRef.current = JSON.stringify(savedData);
      toast.success("Value chain saved successfully");
    }
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
