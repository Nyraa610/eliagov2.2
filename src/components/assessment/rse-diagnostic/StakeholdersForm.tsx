
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StakeholdersFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export function StakeholdersForm({ onNext, onPrev }: StakeholdersFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stakeholder Mapping</CardTitle>
        <CardDescription>
          Identify and prioritize your key stakeholders for the RSE assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This section will be expanded with stakeholder mapping tools.
        </p>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button onClick={onNext}>
            Next: Challenges & Goals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
