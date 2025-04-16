
// Fix the import to reference stakeholderEdgeTypes
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Node,
  Edge,
  Connection
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import { ChevronRight, Share2 } from "lucide-react";
import { stakeholderService } from "@/services/stakeholderService";
import { StakeholderMapControls } from "./visual-map/StakeholderMapControls";
import { StakeholderNodeTypes } from "./visual-map/StakeholderNodeTypes";
import { stakeholderEdgeTypes } from "./visual-map/StakeholderEdgeTypes";
import { StakeholderAddDialog } from "./visual-map/StakeholderAddDialog";

type StakeholderVisualMapProps = {
  onComplete: () => void;
};

export function StakeholderVisualMap({ onComplete }: StakeholderVisualMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const nodeTypes = StakeholderNodeTypes;
  const edgeTypes = stakeholderEdgeTypes;

  // Load existing stakeholder map data
  useEffect(() => {
    const loadStakeholderMap = async () => {
      setIsLoading(true);
      try {
        const { nodes: savedNodes, edges: savedEdges } = await stakeholderService.getStakeholderMap();
        if (savedNodes.length > 0) {
          setNodes(savedNodes);
          setEdges(savedEdges);
        } else {
          // If no saved map, create a default company node in the center
          setNodes([
            {
              id: 'company',
              type: 'companyNode',
              data: { label: 'Your Company' },
              position: { x: 250, y: 250 }
            }
          ]);
        }
      } catch (error) {
        console.error("Error loading stakeholder map:", error);
        toast.error("Failed to load stakeholder map");
        
        // Create default company node if loading fails
        setNodes([
          {
            id: 'company',
            type: 'companyNode',
            data: { label: 'Your Company' },
            position: { x: 250, y: 250 }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStakeholderMap();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'stakeholderEdge' }, eds)),
    [setEdges]
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const handlePaneClick = () => {
    setSelectedNodeId(null);
  };

  const handleAddStakeholder = (type: string, name: string) => {
    const newNode: Node = {
      id: `stakeholder-${Date.now()}`,
      type: `${type}Node`,
      data: { label: name },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Automatically connect to company if it's the only other node
    if (nodes.length === 1 && nodes[0].id === 'company') {
      const newEdge: Edge = {
        id: `e-company-${newNode.id}`,
        source: 'company',
        target: newNode.id,
        type: 'stakeholderEdge'
      };
      setEdges((eds) => [...eds, newEdge]);
    }
  };

  const handleSaveMap = async () => {
    setIsSubmitting(true);
    try {
      await stakeholderService.saveStakeholderMap(nodes, edges);
      toast.success("Stakeholder map saved successfully");
      onComplete();
    } catch (error) {
      console.error("Error saving stakeholder map:", error);
      toast.error("Failed to save stakeholder map");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> Stakeholder Visual Map
          </CardTitle>
          <CardDescription>
            Create a visual map of your stakeholders and their relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="col-span-3">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                variant="outline"
                className="mr-2"
              >
                Add Stakeholder
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSaveMap}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                Save & Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border rounded-lg h-[600px] bg-gray-50">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading stakeholder map...</p>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
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
                  selectedNodeId={selectedNodeId || ''}
                  nodes={nodes}
                  setNodes={setNodes}
                  edges={edges}
                  setEdges={setEdges}
                />
              </ReactFlow>
            )}
          </div>
        </CardContent>
      </Card>

      <StakeholderAddDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddStakeholder}
      />
    </div>
  );
}
