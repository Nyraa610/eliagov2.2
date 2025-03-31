import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { NodeData } from "@/types/valueChain";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";

interface SupportActivityNodeProps {
  data: NodeData;
  selected: boolean;
  id: string;
}

export function SupportActivityNode({ data, selected, id }: SupportActivityNodeProps) {
  const { addEdges, getNodes } = useReactFlow();

  const handleConnectTop = () => {
    const nodes = getNodes();
    // Find nodes above current node
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesAbove = nodes.filter(node => 
      node.position.y < currentNode.position.y &&
      Math.abs(node.position.x - currentNode.position.x) < 150
    );

    if (nodesAbove.length > 0) {
      // Sort by distance (closest first)
      nodesAbove.sort((a, b) => 
        (currentNode.position.y - a.position.y) - (currentNode.position.y - b.position.y)
      );
      
      const closestNode = nodesAbove[0];
      
      addEdges([{
        id: `e-${closestNode.id}-${id}`,
        source: closestNode.id,
        target: id,
        type: 'floating'
      }]);
    }
  };

  const handleConnectBottom = () => {
    const nodes = getNodes();
    // Find nodes below current node
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesBelow = nodes.filter(node => 
      node.position.y > currentNode.position.y &&
      Math.abs(node.position.x - currentNode.position.x) < 150
    );

    if (nodesBelow.length > 0) {
      // Sort by distance (closest first)
      nodesBelow.sort((a, b) => 
        (a.position.y - currentNode.position.y) - (b.position.y - currentNode.position.y)
      );
      
      const closestNode = nodesBelow[0];
      
      addEdges([{
        id: `e-${id}-${closestNode.id}`,
        source: id,
        target: closestNode.id,
        type: 'floating'
      }]);
    }
  };

  // Determine appropriate text color based on background
  const getTextColor = () => {
    if (!data.color) return undefined;
    return isLightColor(data.color) ? '#000000' : '#ffffff';
  };

  const borderClass = selected ? "border-primary" : "border-green-400";

  return (
    <div className="relative">
      <Card 
        className={`min-w-[180px] border-2 ${borderClass}`}
        style={{ 
          backgroundColor: data.color || '#F0FFF4', // green-50 equivalent
          color: getTextColor()
        }}
      >
        <CardContent className="p-3">
          <div className="font-medium">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-10 h-8 w-8 opacity-70 hover:opacity-100 bg-white"
        onClick={handleConnectTop}
      >
        <ArrowUp className="h-4 w-4" />
        <span className="sr-only">Connect from top</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-10 h-8 w-8 opacity-70 hover:opacity-100 bg-white"
        onClick={handleConnectBottom}
      >
        <ArrowDown className="h-4 w-4" />
        <span className="sr-only">Connect to bottom</span>
      </Button>
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Helper function to determine if a color is light or dark
const isLightColor = (color: string) => {
  // For hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
  // For rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128;
    }
  }
  
  return true; // Default to light
};
