
import { ValueChainData } from "@/types/valueChain";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { PlantUMLDisplay } from "./PlantUMLDisplay";

interface ViewValueChainTabProps {
  valueChainData: ValueChainData;
  onValueChainChange?: (data: ValueChainData) => void;
}

export const ViewValueChainTab = ({ valueChainData, onValueChainChange }: ViewValueChainTabProps) => {
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            AI Generated Value Chain
          </CardTitle>
          <CardDescription>
            Based on your documents and inputs, we've generated a value chain model for your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-[1000px] overflow-hidden">
            <ValueChainEditor 
              initialData={valueChainData} 
              onDataChange={onValueChainChange}
              autoSave={true}
            />
          </div>
        </CardContent>
      </Card>
      
      {valueChainData.metadata?.plantUml && (
        <PlantUMLDisplay plantUml={valueChainData.metadata.plantUml} />
      )}
    </>
  );
};
