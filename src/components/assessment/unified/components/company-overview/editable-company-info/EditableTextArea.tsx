
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit } from "lucide-react";

interface EditableTextAreaProps {
  field: string;
  label: string;
  value: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onChange: (value: string) => void;
}

export function EditableTextArea({
  field,
  label,
  value,
  isEditing,
  onToggleEdit,
  onSave,
  onChange,
}: EditableTextAreaProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">{label}</h4>
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm"
          rows={4}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{value}</p>
      )}
    </div>
  );
}
