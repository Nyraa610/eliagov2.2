
import { ValueChainData } from "@/types/valueChain";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CreateValueChainTabProps {
  initialData: ValueChainData | null;
}

export const CreateValueChainTab = ({ initialData }: CreateValueChainTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-500" />
          Create Your Value Chain
        </CardTitle>
        <CardDescription>
          Build a value chain model from scratch or modify an existing one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <ValueChainEditor initialData={initialData} />
        </div>
      </CardContent>
    </Card>
  );
};
