
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { NodeData } from '@/types/valueChain';

interface CustomNodeProps {
  data: NodeData;
  selected: boolean;
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  return (
    <Card className={`min-w-[180px] border-2 ${selected ? 'border-primary' : 'border-gray-400'} bg-white`}>
      <CardContent className="p-3">
        <div className="font-medium">{data.label}</div>
        {data.description && (
          <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
        )}
      </CardContent>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
});
