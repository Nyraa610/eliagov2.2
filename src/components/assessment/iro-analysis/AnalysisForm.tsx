
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoColumnTable } from "./two-column-table/TwoColumnTable";
import { IROFormValues } from "./formSchema";

interface AnalysisFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AnalysisForm({ form, onPrevious, onNext }: AnalysisFormProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Function to open dialog for adding new item
  const openItemDialog = () => {
    setIsAddingItem(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identify Risks & Opportunities</CardTitle>
          <CardDescription>
            Identify and assess key risks and opportunities related to your business operations. 
            Add items manually or use AI to generate suggestions based on your business context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoColumnTable
            form={form}
            openItemDialog={openItemDialog}
            isAddingItem={isAddingItem}
            setIsAddingItem={setIsAddingItem}
            editingIndex={editingIndex}
            setEditingIndex={setEditingIndex}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
