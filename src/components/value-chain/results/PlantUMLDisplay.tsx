
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface PlantUMLDisplayProps {
  plantUml: string;
}

export const PlantUMLDisplay = ({ plantUml }: PlantUMLDisplayProps) => {
  if (!plantUml) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-indigo-500" />
          PlantUML Diagram
        </CardTitle>
        <CardDescription>
          A UML representation of your value chain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-[400px]">
          {plantUml}
        </pre>
      </CardContent>
    </Card>
  );
};
