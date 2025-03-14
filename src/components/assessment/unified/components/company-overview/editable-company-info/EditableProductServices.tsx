
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit } from "lucide-react";

interface EditableProductServicesProps {
  products: string[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onChange: (products: string[]) => void;
}

export function EditableProductServices({
  products,
  isEditing,
  onToggleEdit,
  onSave,
  onChange,
}: EditableProductServicesProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Products & Services</h4>
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
          value={products.join("\n")}
          onChange={(e) => {
            const lines = e.target.value.split("\n").filter(line => line.trim() !== "");
            onChange(lines);
          }}
          placeholder="Enter one product or service per line"
          className="w-full text-sm"
          rows={4}
        />
      ) : (
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {products.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
