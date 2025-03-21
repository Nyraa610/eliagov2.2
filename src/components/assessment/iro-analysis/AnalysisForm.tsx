
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { useState } from "react";
import { TwoColumnTable } from "./TwoColumnTable";

interface AnalysisFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AnalysisForm({ form, onPrevious, onNext }: AnalysisFormProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const handleAddItem = () => {
    setIsAddingItem(true);
    setEditingIndex(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact, Risks & Opportunities Analysis</CardTitle>
        <CardDescription>
          Identify and assess potential risks and opportunities from your materiality analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoColumnTable 
          form={form}
          openItemDialog={handleAddItem}
          isAddingItem={isAddingItem}
          setIsAddingItem={setIsAddingItem}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue to Review
        </Button>
      </CardFooter>
    </Card>
  );
}
