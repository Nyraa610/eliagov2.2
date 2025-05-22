
import { useState, useEffect, useCallback } from "react";
import { Node, Edge, Connection, addEdge } from "@xyflow/react";
import { toast } from "sonner";
import { stakeholderService } from "@/services/stakeholderService";
import { documentService } from "@/services/document";
import { supabase } from "@/lib/supabase";

export const useStakeholderMap = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [versions, setVersions] = useState<{id: string, name: string, created_at: string}[]>([]);

  // Fetch company ID for the current user
  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setCompanyId(data.company_id);
          }
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
      }
    };
    
    fetchUserCompany();
  }, []);

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
        
        // Load saved versions
        if (companyId) {
          const savedVersions = await stakeholderService.getStakeholderMapVersions(companyId);
          setVersions(savedVersions);
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
    
    if (companyId) {
      loadStakeholderMap();
    }
  }, [companyId]);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updatedNodes = [...nds];
      // Apply the changes to the nodes
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.dragging) {
          const nodeIndex = updatedNodes.findIndex(n => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: {
                x: change.position.x,
                y: change.position.y
              }
            };
          }
        }
      });
      return updatedNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges(eds => {
      const updatedEdges = [...eds];
      // Apply the changes to the edges
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          const edgeIndex = updatedEdges.findIndex(e => e.id === change.id);
          if (edgeIndex !== -1) {
            updatedEdges.splice(edgeIndex, 1);
          }
        }
      });
      return updatedEdges;
    });
  }, []);

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
      return true;
    } catch (error) {
      console.error("Error saving stakeholder map:", error);
      toast.error("Failed to save stakeholder map");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fix the return type to match the expected Promise<void>
  const handleSaveVersion = async (imageUrl: string, versionName: string): Promise<void> => {
    if (!companyId) {
      toast.error("Company ID is required to save versions");
      return;
    }
    
    try {
      // Save the version in the database
      const versionId = await stakeholderService.saveStakeholderMapVersion(
        companyId,
        versionName,
        imageUrl
      );
      
      // Refresh versions list
      const savedVersions = await stakeholderService.getStakeholderMapVersions(companyId);
      setVersions(savedVersions);
      
      // Save as a deliverable
      await documentService.createDeliverable({
        company_id: companyId,
        name: versionName,
        description: "Stakeholder mapping visual representation",
        file_path: imageUrl,
        file_type: "image/png",
        assessment_type: "stakeholder_mapping",
        category: "stakeholder_map"
      });
      
      // No return needed since return type is void
    } catch (error) {
      console.error("Error saving version:", error);
      throw error;
    }
  };

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isLoading,
    isSubmitting,
    selectedNodeId,
    companyId,
    versions,
    handleNodeClick,
    handlePaneClick,
    handleAddStakeholder,
    handleSaveMap,
    handleSaveVersion
  };
};
