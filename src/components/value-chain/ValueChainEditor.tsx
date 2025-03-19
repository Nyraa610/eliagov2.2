
import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  Panel,
  BackgroundVariant
} from "@xyflow/react";
import { NodeData, ValueChainData, ValueChainNode, ValueChainEdge, NodeType, AIGenerationPrompt } from "@/types/valueChain";
import { PrimaryActivityNode } from "./nodes/PrimaryActivityNode";
import { SupportActivityNode } from "./nodes/SupportActivityNode";
import { ExternalFactorNode } from "./nodes/ExternalFactorNode";
import { CustomNode } from "./nodes/CustomNode";
import { ValueChainToolbar } from "./ValueChainToolbar";
import { NodeEditPanel } from "./NodeEditPanel";
import { AIGenerationDialog } from "./AIGenerationDialog";
import { toast } from "sonner";
import { valueChainService } from "@/services/valueChainService";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

// Import react-flow styles
import "@xyflow/react/dist/style.css";
import "@/styles/value-chain.css";

interface ValueChainEditorProps {
  initialData?: ValueChainData;
}

export function ValueChainEditor({ initialData }: ValueChainEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // Fix: Pass an empty array as default value
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { company } = useCompanyProfile();
  const reactFlowInstance = useReactFlow();

  // Define node types
  const nodeTypes = useMemo(() => ({
    primary: PrimaryActivityNode,
    support: SupportActivityNode,
    external: ExternalFactorNode,
    custom: CustomNode
  }), []);

  // Initialize with some basic nodes if no initial data
  useEffect(() => {
    if (!initialData && nodes.length === 0) {
      // Create a default simple value chain structure
      setNodes([
        {
          id: 'primary-1',
          type: 'primary',
          position: { x: 100, y: 200 },
          data: { label: 'Input Logistics', type: 'primary' }
        },
        {
          id: 'primary-2',
          type: 'primary',
          position: { x: 350, y: 200 },
          data: { label: 'Operations', type: 'primary' }
        },
        {
          id: 'primary-3',
          type: 'primary',
          position: { x: 600, y: 200 },
          data: { label: 'Output Logistics', type: 'primary' }
        },
        {
          id: 'support-1',
          type: 'support',
          position: { x: 350, y: 50 },
          data: { label: 'Support Activities', type: 'support' }
        }
      ]);

      setEdges([
        {
          id: 'edge-p1-p2',
          source: 'primary-1',
          target: 'primary-2'
        },
        {
          id: 'edge-p2-p3',
          source: 'primary-2',
          target: 'primary-3'
        },
        {
          id: 'edge-s1-p2',
          source: 'support-1',
          target: 'primary-2'
        }
      ]);
    }
  }, [initialData, nodes.length, setNodes, setEdges]);

  // Handle connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: false }, eds));
    },
    [setEdges]
  );

  // Node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node as ValueChainNode);
    },
    []
  );

  // Update node data
  const handleUpdateNode = useCallback(
    (nodeId: string, data: NodeData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // If the node type has changed, we need to update the node type as well
            const currentType = node.type;
            const newType = data.type as string;
            
            return {
              ...node,
              data: {
                ...node.data,
                ...data
              },
              type: newType !== currentType ? newType : currentType
            };
          }
          return node;
        })
      );
      toast.success("Node updated");
    },
    [setNodes]
  );

  // Add a new node
  const handleAddNode = useCallback(
    (type: NodeType) => {
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 300 + 100
        },
        data: {
          label: `New ${type} node`,
          type
        }
      };
      
      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode as ValueChainNode);
    },
    [setNodes]
  );

  // Save the value chain
  const handleSave = useCallback(async () => {
    if (!company) {
      toast.error("No company profile available");
      return;
    }
    
    const valueChainData: ValueChainData = {
      nodes,
      edges,
      name: `${company.name} Value Chain`,
      companyId: company.id
    };
    
    const success = await valueChainService.saveValueChain(valueChainData);
    if (success) {
      toast.success("Value chain saved successfully");
    }
  }, [nodes, edges, company]);

  // Export the value chain as JSON
  const handleExport = useCallback(() => {
    const valueChainData: ValueChainData = {
      nodes,
      edges,
      name: company ? `${company.name} Value Chain` : "Value Chain"
    };
    
    valueChainService.exportAsJson(valueChainData);
  }, [nodes, edges, company]);

  // Import a value chain from a JSON file
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        if (jsonData.nodes && jsonData.edges) {
          setNodes(jsonData.nodes);
          setEdges(jsonData.edges);
          toast.success("Value chain imported successfully");
        } else {
          toast.error("Invalid value chain data format");
        }
      } catch (error) {
        toast.error("Failed to parse JSON file");
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = "";
  }, [setNodes, setEdges]);

  // Clear the canvas
  const handleClear = useCallback(() => {
    if (confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      toast.success("Canvas cleared");
    }
  }, [setNodes, setEdges]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);
  
  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);
  
  const handleReset = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  // AI generation
  const handleGenerateAI = useCallback(async (prompt: AIGenerationPrompt) => {
    setIsGenerating(true);
    try {
      const valueChainData = await valueChainService.generateValueChain(prompt);
      if (valueChainData && valueChainData.nodes && valueChainData.edges) {
        setNodes(valueChainData.nodes);
        setEdges(valueChainData.edges);
        setIsAIDialogOpen(false);
        toast.success("Value chain generated successfully");
        
        // Reset the view to fit all nodes
        setTimeout(() => {
          reactFlowInstance.fitView();
        }, 100);
      } else {
        toast.error("Failed to generate value chain");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating the value chain");
    } finally {
      setIsGenerating(false);
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  return (
    <div className="h-[calc(100vh-200px)] min-h-[800px]">
      <div className="mb-4">
        <ValueChainToolbar
          onAddNode={handleAddNode}
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClear}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onGenerateAI={() => setIsAIDialogOpen(true)}
        />
      </div>
      
      <div className="flex gap-4 h-full">
        <div ref={reactFlowWrapper} className="flex-1 border rounded-lg overflow-hidden">
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
        </div>
        
        {selectedNode && (
          <div className="w-96">
            <NodeEditPanel
              selectedNode={selectedNode}
              onUpdate={handleUpdateNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
      
      <AIGenerationDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        onGenerate={handleGenerateAI}
        isGenerating={isGenerating}
        companyName={company?.name || ''}
        industry={company?.industry || ''}
      />
    </div>
  );
}
