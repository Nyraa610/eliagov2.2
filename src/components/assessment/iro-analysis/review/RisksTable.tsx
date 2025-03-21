
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IROItem } from "../formSchema";

interface RisksTableProps {
  risks: IROItem[];
  getImpactLabel: (value: number) => string;
  getLikelihoodLabel: (value: number) => string;
  getRiskScoreColor: (score: number) => string;
}

export function RisksTable({ risks, getImpactLabel, getLikelihoodLabel, getRiskScoreColor }: RisksTableProps) {
  return (
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
  );
}
