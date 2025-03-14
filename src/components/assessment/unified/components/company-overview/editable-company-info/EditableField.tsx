
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit } from "lucide-react";

interface EditableFieldProps {
  field: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onChange: (value: string) => void;
}

export function EditableField({
  field,
  label,
  icon,
  value,
  isEditing,
  onToggleEdit,
  onSave,
  onChange,
}: EditableFieldProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-primary/10 p-2 rounded-full mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
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
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 text-sm"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
