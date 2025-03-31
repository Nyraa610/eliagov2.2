
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

  return (
    <div className="relative">
      <Card className={`min-w-[180px] border-2 ${selected ? "border-primary" : "border-orange-400"} bg-orange-50 rounded-full`}>
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
