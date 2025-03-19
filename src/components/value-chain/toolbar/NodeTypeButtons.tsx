
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NodeType } from "@/types/valueChain";

interface NodeTypeButtonsProps {
  onAddNode: (type: NodeType) => void;
}

export function NodeTypeButtons({ onAddNode }: NodeTypeButtonsProps) {
  return (
    <div className="flex gap-1 mr-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" onClick={() => onAddNode("primary")} variant="outline">
            <div className="w-3 h-3 bg-blue-400 rounded-sm mr-2"></div>
            Primary
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add primary activity node</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" onClick={() => onAddNode("support")} variant="outline">
            <div className="w-3 h-3 bg-green-400 rounded-sm mr-2"></div>
            Support
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add support activity node</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" onClick={() => onAddNode("external")} variant="outline">
            <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
            External
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add external factor node</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" onClick={() => onAddNode("custom")} variant="outline">
            <div className="w-3 h-3 bg-purple-400 rounded-sm mr-2"></div>
            Custom
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add custom node</TooltipContent>
      </Tooltip>
    </div>
  );
}
