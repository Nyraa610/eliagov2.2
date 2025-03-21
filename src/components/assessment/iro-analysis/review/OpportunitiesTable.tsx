
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IROItem } from "../formSchema";

interface OpportunitiesTableProps {
  opportunities: IROItem[];
  getImpactLabel: (value: number) => string;
  getLikelihoodLabel: (value: number) => string;
}

export function OpportunitiesTable({ opportunities, getImpactLabel, getLikelihoodLabel }: OpportunitiesTableProps) {
  return (
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
  );
}
