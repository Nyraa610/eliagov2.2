
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlantUMLDisplayProps {
  plantUml: string;
}

export const PlantUMLDisplay = ({ plantUml }: PlantUMLDisplayProps) => {
  if (!plantUml) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">PlantUML Diagram</CardTitle>
        <CardDescription>
          A UML representation of your value chain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
          {plantUml}
        </pre>
      </CardContent>
    </Card>
  );
};
