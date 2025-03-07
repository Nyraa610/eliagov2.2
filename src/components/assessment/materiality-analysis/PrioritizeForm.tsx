
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";

interface PrioritizeFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onSubmit: (values: MaterialityFormValues) => void;
}

export function PrioritizeForm({ form, onPrevious, onSubmit }: PrioritizeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materiality Matrix</CardTitle>
        <CardDescription>
          Based on your inputs, we've generated a materiality matrix to help prioritize your ESG issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-100 rounded-lg p-8 flex items-center justify-center">
          <p className="text-center text-muted-foreground">
            The materiality matrix visualization will be displayed here, plotting business impact versus stakeholder impact.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={() => onSubmit(form.getValues())}>
          Complete Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
