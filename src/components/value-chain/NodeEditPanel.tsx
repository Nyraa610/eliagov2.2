
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NodeData, NodeType, ValueChainNode } from "@/types/valueChain";
import { X } from "lucide-react";

interface NodeEditPanelProps {
  selectedNode: ValueChainNode | null;
  onUpdate: (nodeId: string, data: NodeData) => void;
  onClose: () => void;
}

export function NodeEditPanel({ selectedNode, onUpdate, onClose }: NodeEditPanelProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [nodeType, setNodeType] = useState<NodeType>("custom");

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || "");
      setDescription(selectedNode.data.description || "");
      setNodeType((selectedNode.data.type as NodeType) || "custom");
    }
  }, [selectedNode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNode) {
      onUpdate(selectedNode.id, {
        label,
        description,
        type: nodeType
      });
    }
  };

  if (!selectedNode) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Edit Node</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Node label"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="node-description">Description</Label>
            <Textarea
              id="node-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Node description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="node-type">Node Type</Label>
            <Select
              value={nodeType}
              onValueChange={(value) => setNodeType(value as NodeType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary Activity</SelectItem>
                <SelectItem value="support">Support Activity</SelectItem>
                <SelectItem value="external">External Factor</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full">Update Node</Button>
        </form>
      </CardContent>
    </Card>
  );
}
