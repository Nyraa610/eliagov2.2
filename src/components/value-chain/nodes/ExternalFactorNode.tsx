
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { NodeData } from "@/types/valueChain";

interface ExternalFactorNodeProps {
  data: NodeData;
  selected: boolean;
}

export function ExternalFactorNode({ data, selected }: ExternalFactorNodeProps) {
  return (
    <Card className={`min-w-[180px] border-2 ${selected ? "border-primary" : "border-orange-400"} bg-orange-50 rounded-full`}>
      <CardContent className="p-3">
        <div className="font-medium text-center">{data.label}</div>
        {data.description && (
          <div className="text-xs text-muted-foreground mt-1 text-center">{data.description}</div>
        )}
      </CardContent>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
}
