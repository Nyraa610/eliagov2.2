
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

  return (
    <div className="relative">
      <Card className={`min-w-[180px] border-2 ${selected ? "border-primary" : "border-green-400"} bg-green-50`}>
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
