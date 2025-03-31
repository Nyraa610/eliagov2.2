import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { NodeData } from "@/types/valueChain";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";

interface ExternalFactorNodeProps {
  data: NodeData;
  selected: boolean;
  id: string;
}

export function ExternalFactorNode({ data, selected, id }: ExternalFactorNodeProps) {
  const { addEdges, getNodes } = useReactFlow();

  const handleConnectLeft = () => {
    const nodes = getNodes();
    // Find nodes to the left of current node
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesOnLeft = nodes.filter(node => 
      node.position.x < currentNode.position.x &&
      Math.abs(node.position.y - currentNode.position.y) < 150
    );

    if (nodesOnLeft.length > 0) {
      // Sort by distance (closest first)
      nodesOnLeft.sort((a, b) => 
        (currentNode.position.x - a.position.x) - (currentNode.position.x - b.position.x)
      );
      
      const closestNode = nodesOnLeft[0];
      
      addEdges([{
        id: `e-${closestNode.id}-${id}`,
        source: closestNode.id,
        target: id,
        type: 'floating'
      }]);
    }
  };

  const handleConnectRight = () => {
    const nodes = getNodes();
    // Find nodes to the right of current node
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesOnRight = nodes.filter(node => 
      node.position.x > currentNode.position.x &&
      Math.abs(node.position.y - currentNode.position.y) < 150
    );

    if (nodesOnRight.length > 0) {
      // Sort by distance (closest first)
      nodesOnRight.sort((a, b) => 
        (a.position.x - currentNode.position.x) - (b.position.x - currentNode.position.x)
      );
      
      const closestNode = nodesOnRight[0];
      
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

  const borderClass = selected ? "border-primary" : "border-orange-400";

  return (
    <div className="relative">
      <Card 
        className={`min-w-[180px] border-2 ${borderClass} rounded-full`}
        style={{ 
          backgroundColor: data.color || '#FFFAF0', // orange-50 equivalent
          color: getTextColor()
        }}
      >
        <CardContent className="p-3">
          <div className="font-medium text-center">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground mt-1 text-center">{data.description}</div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute top-1/2 -left-10 transform -translate-y-1/2 h-8 w-8 opacity-70 hover:opacity-100 bg-white"
        onClick={handleConnectLeft}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Connect from left</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute top-1/2 -right-10 transform -translate-y-1/2 h-8 w-8 opacity-70 hover:opacity-100 bg-white"
        onClick={handleConnectRight}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Connect to right</span>
      </Button>
      
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
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
