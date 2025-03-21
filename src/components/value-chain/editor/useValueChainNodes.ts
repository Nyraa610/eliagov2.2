import { useState, useCallback } from "react";
import { Edge, Node, NodeChange, applyNodeChanges, EdgeChange, applyEdgeChanges, XYPosition, Connection } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { NodeData, ValueChainNode } from "@/types/valueChain";

export function useValueChainNodes(
  initialNodes: ValueChainNode[] = [],
  initialEdges: Edge[] = []
) {
  const [nodes, setNodes] = useState<ValueChainNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as ValueChainNode[]);
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${uuidv4()}`,
          source: connection.source || "",
          target: connection.target || "",
          type: "smoothstep",
          animated: true,
        },
      ]);
    },
    [setEdges]
  );

  const addNode = useCallback(
    (type: string, position: XYPosition, label: string = "New Node", data: Partial<NodeData> = {}) => {
      const newNode: ValueChainNode = {
        id: `node-${uuidv4()}`,
        type: "valueChainNode",
        position,
        data: {
          label,
          type: (type as NodeData["type"]) || "custom",
          ...data,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      return newNode;
    },
    [setNodes]
  );

  const updateNode = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
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
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
    },
    [setNodes, setEdges]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  const resetNodesAndEdges = useCallback(
    (newNodes: ValueChainNode[] = [], newEdges: Edge[] = []) => {
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    deleteNode,
    deleteEdge,
    resetNodesAndEdges,
  };
}
