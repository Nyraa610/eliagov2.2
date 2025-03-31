
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { ValueChainNode } from "@/types/valueChain";

interface ConnectionControlsProps {
  nodeId: string;
}

export function ConnectionControls({ nodeId }: ConnectionControlsProps) {
  const { getNodes, addEdges } = useReactFlow();

  // Connect to the nearest node in the specified direction
  const connectToNearestNode = (direction: 'left' | 'right' | 'top' | 'bottom') => {
    const nodes = getNodes();
    const currentNode = nodes.find(n => n.id === nodeId);
    
    if (!currentNode) return;
    
    let filteredNodes: any[] = [];
    let sortFunction: (a: any, b: any) => number;
    let connectionConfig: {
      source: string;
      target: string;
      type: string;
      id: string;
    };
    
    switch(direction) {
      case 'left':
        filteredNodes = nodes.filter(n => 
          n.id !== nodeId &&
          n.position.x < currentNode.position.x &&
          Math.abs(n.position.y - currentNode.position.y) < 150
        );
        sortFunction = (a, b) => 
          (currentNode.position.x - a.position.x) - (currentNode.position.x - b.position.x);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: filteredNodes[0].id,
            target: nodeId,
            type: 'floating',
            id: `e-${filteredNodes[0].id}-${nodeId}`
          };
        }
        break;
        
      case 'right':
        filteredNodes = nodes.filter(n => 
          n.id !== nodeId &&
          n.position.x > currentNode.position.x &&
          Math.abs(n.position.y - currentNode.position.y) < 150
        );
        sortFunction = (a, b) => 
          (a.position.x - currentNode.position.x) - (b.position.x - currentNode.position.x);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: nodeId,
            target: filteredNodes[0].id,
            type: 'floating',
            id: `e-${nodeId}-${filteredNodes[0].id}`
          };
        }
        break;
        
      case 'top':
        filteredNodes = nodes.filter(n => 
          n.id !== nodeId &&
          n.position.y < currentNode.position.y &&
          Math.abs(n.position.x - currentNode.position.x) < 150
        );
        sortFunction = (a, b) => 
          (currentNode.position.y - a.position.y) - (currentNode.position.y - b.position.y);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: filteredNodes[0].id,
            target: nodeId,
            type: 'floating',
            id: `e-${filteredNodes[0].id}-${nodeId}`
          };
        }
        break;
        
      case 'bottom':
        filteredNodes = nodes.filter(n => 
          n.id !== nodeId &&
          n.position.y > currentNode.position.y &&
          Math.abs(n.position.x - currentNode.position.x) < 150
        );
        sortFunction = (a, b) => 
          (a.position.y - currentNode.position.y) - (b.position.y - currentNode.position.y);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: nodeId,
            target: filteredNodes[0].id,
            type: 'floating',
            id: `e-${nodeId}-${filteredNodes[0].id}`
          };
        }
        break;
    }
    
    if (filteredNodes.length > 0) {
      addEdges([connectionConfig]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-2">
        <Link className="mr-2 h-4 w-4" />
        <Label>Connect Node</Label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={() => connectToNearestNode('left')} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          Connect Left
        </Button>
        <Button 
          onClick={() => connectToNearestNode('right')} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          Connect Right
        </Button>
        <Button 
          onClick={() => connectToNearestNode('top')} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          Connect Top
        </Button>
        <Button 
          onClick={() => connectToNearestNode('bottom')} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          Connect Bottom
        </Button>
      </div>
    </div>
  );
}
