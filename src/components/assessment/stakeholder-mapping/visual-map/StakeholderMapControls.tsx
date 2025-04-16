
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Node, Edge } from "@xyflow/react";

export interface StakeholderMapControlsProps {
  selectedNodeId: string;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export function StakeholderMapControls({
  selectedNodeId,
  nodes,
  setNodes,
  edges,
  setEdges,
}: StakeholderMapControlsProps) {
  const { t } = useTranslation();
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeType, setNodeType] = useState("");
  const [relationships, setRelationships] = useState<{ [key: string]: string }>({});
  const [showNodeControls, setShowNodeControls] = useState(false);

  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((node) => node.id === selectedNodeId);
      if (selectedNode) {
        setNodeLabel(selectedNode.data.label || "");
        setNodeType(selectedNode.type?.replace("Node", "") || "");
        setShowNodeControls(true);
        
        // Get relationships for this node
        const nodeRelationships: { [key: string]: string } = {};
        edges.forEach((edge) => {
          if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
            const isSource = edge.source === selectedNodeId;
            const otherNodeId = isSource ? edge.target : edge.source;
            const otherNode = nodes.find((n) => n.id === otherNodeId);
            
            if (otherNode) {
              nodeRelationships[edge.id] = edge.data?.relationship || "";
            }
          }
        });
        
        setRelationships(nodeRelationships);
      }
    } else {
      setShowNodeControls(false);
    }
  }, [selectedNodeId, nodes, edges]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeLabel(e.target.value);
    
    // Update node in real-time
    if (selectedNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: e.target.value,
              },
            };
          }
          return node;
        })
      );
    }
  };

  const handleTypeChange = (value: string) => {
    setNodeType(value);
    
    // Update node type in real-time
    if (selectedNodeId) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNodeId) {
            return {
              ...node,
              type: `${value}Node`,
            };
          }
          return node;
        })
      );
    }
  };

  const handleRelationshipChange = (edgeId: string, value: string) => {
    // Update relationship in state
    setRelationships((prev) => ({
      ...prev,
      [edgeId]: value,
    }));
    
    // Update edge in real-time
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              relationship: value,
            },
          };
        }
        return edge;
      })
    );
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    
    // Delete all connected edges
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    
    // Delete the node
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    
    // Clear the selection
    setShowNodeControls(false);
  };

  const getConnectedNodeLabel = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return "";
    
    const connectedNodeId = edge.source === selectedNodeId ? edge.target : edge.source;
    const connectedNode = nodes.find((n) => n.id === connectedNodeId);
    
    return connectedNode?.data?.label || "";
  };

  if (!showNodeControls) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 p-4 bg-white rounded-md shadow-md z-10 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">{t("Edit Node")}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowNodeControls(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nodeLabel">{t("Label")}</Label>
          <Input
            id="nodeLabel"
            value={nodeLabel}
            onChange={handleLabelChange}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="nodeType">{t("Type")}</Label>
          <Select
            value={nodeType}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="nodeType" className="mt-1">
              <SelectValue placeholder={t("Select type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {Object.keys(relationships).length > 0 && (
          <div>
            <Label>{t("Relationships")}</Label>
            <div className="space-y-2 mt-1">
              {Object.entries(relationships).map(([edgeId, relationship]) => (
                <div key={edgeId} className="flex items-center space-x-2">
                  <Input
                    value={relationship}
                    onChange={(e) => handleRelationshipChange(edgeId, e.target.value)}
                    placeholder={`${t("Relation with")} ${getConnectedNodeLabel(edgeId)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleDeleteNode}
        >
          <Trash className="h-4 w-4 mr-2" /> {t("Delete Node")}
        </Button>
      </div>
    </div>
  );
}
