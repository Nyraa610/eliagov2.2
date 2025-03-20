
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface MethodologyFormProps {
  form: UseFormReturn<IROFormValues>;
  onNext: () => void;
}

export function MethodologyForm({ form, onNext }: MethodologyFormProps) {
  const { methodology } = form.getValues();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Methodology</CardTitle>
        <CardDescription>
          Review the standard risk assessment methodology that will be applied to your analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Impact Scale</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methodology.impactScale.map((level) => (
                  <TableRow key={level.value}>
                    <TableCell className="font-medium">{level.label} ({level.value})</TableCell>
                    <TableCell>{level.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Likelihood Scale</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methodology.likelihoodScale.map((level) => (
                  <TableRow key={level.value}>
                    <TableCell className="font-medium">{level.label} ({level.value})</TableCell>
                    <TableCell>{level.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Risk Score Matrix</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  {methodology.impactScale.map((impact) => (
                    <TableHead key={impact.value}>Impact: {impact.label} ({impact.value})</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {methodology.likelihoodScale.map((likelihood) => (
                  <TableRow key={likelihood.value}>
                    <TableCell className="font-medium">Likelihood: {likelihood.label} ({likelihood.value})</TableCell>
                    {methodology.impactScale.map((impact) => {
                      const score = impact.value * likelihood.value;
                      let bgColor = "bg-green-100";
                      if (score >= 4) bgColor = "bg-yellow-100";
                      if (score >= 6) bgColor = "bg-orange-100"; 
                      if (score >= 8) bgColor = "bg-red-100";
                      
                      return (
                        <TableCell 
                          key={`${likelihood.value}-${impact.value}`}
                          className={`text-center font-bold ${bgColor}`}
                        >
                          {score}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onNext}>
          Continue to Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
