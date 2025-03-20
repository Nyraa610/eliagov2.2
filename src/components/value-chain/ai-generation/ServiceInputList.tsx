
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface ServiceInputListProps {
  services: string[];
  onAddService: () => void;
  onRemoveService: (index: number) => void;
  onUpdateService: (index: number, value: string) => void;
}

export function ServiceInputList({
  services,
  onAddService,
  onRemoveService,
  onUpdateService
}: ServiceInputListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Key Services</Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddService}
          type="button"
          className="h-8 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" /> Add Service
        </Button>
      </div>
      
      {services.map((service, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder={`Service ${index + 1}`}
            value={service}
            onChange={(e) => onUpdateService(index, e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveService(index)}
            type="button"
            disabled={services.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
