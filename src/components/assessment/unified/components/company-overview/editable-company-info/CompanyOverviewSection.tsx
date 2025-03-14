
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit } from "lucide-react";

interface CompanyOverviewSectionProps {
  overview: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onChange: (value: string) => void;
}

export function CompanyOverviewSection({
  overview,
  isEditing,
  onToggleEdit,
  onSave,
  onChange,
}: CompanyOverviewSectionProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">Company Overview</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => isEditing ? onSave() : onToggleEdit()}
          className="h-6 w-6 p-0"
        >
          {isEditing ? <Check className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
        </Button>
      </div>
      {isEditing ? (
        <Textarea
          value={overview}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm"
          rows={4}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{overview}</p>
      )}
    </div>
  );
}
