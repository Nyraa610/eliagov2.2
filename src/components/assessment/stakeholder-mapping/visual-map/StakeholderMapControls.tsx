
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Save } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface StakeholderMapControlsProps {
  selectedNodeId: string | null;
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
  setEdges
}: StakeholderMapControlsProps) {
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeType, setNodeType] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Find the selected node
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  // Initialize form when a node is selected
  React.useEffect(() => {
    if (selectedNode) {
      setNodeLabel(selectedNode.data.label || '');
      
      // Extract node type from the type property (remove "Node" suffix)
      const currentType = selectedNode.type?.replace('Node', '') || 'generic';
      setNodeType(currentType);
      
      setIsEditing(false);
    }
  }, [selectedNode]);

  // Handle node deletion
  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    
    // Remove all connected edges
    const newEdges = edges.filter(
      edge => edge.source !== selectedNodeId && edge.target !== selectedNodeId
    );
    
    // Remove the node
    const newNodes = nodes.filter(node => node.id !== selectedNodeId);
    
    setEdges(newEdges);
    setNodes(newNodes);
  };

  // Handle save node changes
  const handleSaveChanges = () => {
    if (!selectedNodeId || !nodeLabel) return;
    
    // Update the node
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNodeId) {
        const newType = `${nodeType}Node`;
        return {
          ...node,
          data: { ...node.data, label: nodeLabel },
          type: newType,
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    setIsEditing(false);
  };

  if (!selectedNode) return null;

  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 10,
      }}
    >
      <Card className="w-72">
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-label">Stakeholder Name</Label>
                <Input
                  id="node-label"
                  value={nodeLabel}
                  onChange={(e) => setNodeLabel(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="node-type">Stakeholder Type</Label>
                <Select
                  value={nodeType}
                  onValueChange={setNodeType}
                >
                  <SelectTrigger id="node-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="generic">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={!nodeLabel}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="font-medium">{selectedNode.data.label}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground text-xs">Type</Label>
                <p className="capitalize">{selectedNode.type?.replace('Node', '') || 'Generic'}</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteNode}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
