
import { Card, CardContent } from "@/components/ui/card";

interface SummarySectionProps {
  totalItems: number;
  risksCount: number;
  opportunitiesCount: number;
}

export function SummarySection({ totalItems, risksCount, opportunitiesCount }: SummarySectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalItems}</div>
            <div className="text-sm text-muted-foreground">Total items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{risksCount}</div>
            <div className="text-sm text-muted-foreground">Risks identified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{opportunitiesCount}</div>
            <div className="text-sm text-muted-foreground">Opportunities identified</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
