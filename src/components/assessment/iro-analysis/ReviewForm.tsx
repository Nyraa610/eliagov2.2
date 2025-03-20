
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReviewFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onSubmit: (values: IROFormValues) => void;
}

export function ReviewForm({ form, onPrevious, onSubmit }: ReviewFormProps) {
  const { items, methodology } = form.getValues();
  
  const getImpactLabel = (value: number) => {
    const scale = methodology.impactScale;
    return scale.find(item => item.value === value)?.label || value.toString();
  };
  
  const getLikelihoodLabel = (value: number) => {
    const scale = methodology.likelihoodScale;
    return scale.find(item => item.value === value)?.label || value.toString();
  };
  
  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return "bg-green-100 text-green-800";
    if (score <= 6) return "bg-yellow-100 text-yellow-800";
    if (score <= 8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  // Filter for risks and opportunities
  const risks = items.filter(item => item.type === "risk");
  const opportunities = items.filter(item => item.type === "opportunity");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>
          Review your identified risks and opportunities before submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-sm text-muted-foreground">Total items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{risks.length}</div>
                <div className="text-sm text-muted-foreground">Risks identified</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{opportunities.length}</div>
                <div className="text-sm text-muted-foreground">Opportunities identified</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-3">Risks</h3>
          {risks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Likelihood</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((risk) => (
                  <TableRow key={risk.id || risk.issueTitle}>
                    <TableCell className="font-medium">{risk.issueTitle}</TableCell>
                    <TableCell>{risk.category}</TableCell>
                    <TableCell>{getImpactLabel(risk.impact)}</TableCell>
                    <TableCell>{getLikelihoodLabel(risk.likelihood)}</TableCell>
                    <TableCell>
                      <Badge className={getRiskScoreColor(risk.riskScore || 0)}>
                        {risk.riskScore}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No risks identified.</p>
          )}
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-3">Opportunities</h3>
          {opportunities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Likelihood</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp) => (
                  <TableRow key={opp.id || opp.issueTitle}>
                    <TableCell className="font-medium">{opp.issueTitle}</TableCell>
                    <TableCell>{opp.category}</TableCell>
                    <TableCell>{getImpactLabel(opp.impact)}</TableCell>
                    <TableCell>{getLikelihoodLabel(opp.likelihood)}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {opp.riskScore}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No opportunities identified.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={() => onSubmit(form.getValues())}>
          Submit Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
