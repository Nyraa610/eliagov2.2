import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { NodeData } from "@/types/valueChain";
import { ArrowRight, ArrowLeft, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";

interface CustomNodeProps {
  data: NodeData;
  selected: boolean;
  id: string;
}

export function CustomNode({ data, selected, id }: CustomNodeProps) {
  const { addEdges, getNodes } = useReactFlow();

  const handleConnectLeft = () => {
    const nodes = getNodes();
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesOnLeft = nodes.filter(node => 
      node.position.x < currentNode.position.x &&
      Math.abs(node.position.y - currentNode.position.y) < 150
    );

    if (nodesOnLeft.length > 0) {
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
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesOnRight = nodes.filter(node => 
      node.position.x > currentNode.position.x &&
      Math.abs(node.position.y - currentNode.position.y) < 150
    );

    if (nodesOnRight.length > 0) {
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

  const handleConnectTop = () => {
    const nodes = getNodes();
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesAbove = nodes.filter(node => 
      node.position.y < currentNode.position.y &&
      Math.abs(node.position.x - currentNode.position.x) < 150
    );

    if (nodesAbove.length > 0) {
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
    const currentNode = nodes.find(node => node.id === id);
    if (!currentNode) return;
    
    const nodesBelow = nodes.filter(node => 
      node.position.y > currentNode.position.y &&
      Math.abs(node.position.x - currentNode.position.x) < 150
    );

    if (nodesBelow.length > 0) {
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

  const getTextColor = () => {
    if (!data.color) return undefined;
    return isLightColor(data.color) ? '#000000' : '#ffffff';
  };

  const borderClass = selected ? "border-primary" : "border-purple-400";

  return (
    <div className="relative">
      <Card 
        className={`min-w-[180px] border-2 ${borderClass}`}
        style={{ 
          backgroundColor: data.color || '#FAF5FF',
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
      
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const isLightColor = (color: string) => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }
  
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
  
  return true;
};
