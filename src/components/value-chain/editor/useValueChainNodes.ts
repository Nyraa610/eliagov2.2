
import { useState, useEffect, useCallback } from "react";
import { Node, Edge, useNodesState, useEdgesState } from "@xyflow/react";
import { ValueChainData, ValueChainNode, NodeType } from "@/types/valueChain";
import { toast } from "sonner";

export function useValueChainNodes(initialData?: ValueChainData | null) {
  // Initialize with empty arrays as a base
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);

  // Initialize with some basic nodes if no initial data
  useEffect(() => {
    if ((!initialData || initialData.nodes.length === 0) && nodes.length === 0) {
      console.log("Creating default value chain nodes");
      // Create a default simple value chain structure
      const defaultNodes = [
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
      ];

      const defaultEdges = [
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
      ];

      setNodes(defaultNodes);
      setEdges(defaultEdges);
    }
  }, [initialData, nodes.length, setNodes, setEdges]);

  // Node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      console.log("Node clicked:", node);
      setSelectedNode(node as ValueChainNode);
    },
    []
  );

  // Update node data
  const handleUpdateNode = useCallback(
    (nodeId: string, data: any) => {
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

  return {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    handleUpdateNode,
    handleAddNode,
    setNodes,
    setEdges
  };
}
