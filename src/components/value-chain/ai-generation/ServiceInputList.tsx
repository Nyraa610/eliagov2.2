
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-2">
      <Label>Services</Label>
      {services.map((service, index) => (
        <div key={`service-${index}`} className="flex gap-2 mb-2">
          <Input
            value={service}
            onChange={e => onUpdateService(index, e.target.value)}
            placeholder={`Service ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveService(index)}
            disabled={services.length <= 1}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddService}
        className="mt-1"
      >
        Add Service
      </Button>
    </div>
  );
}
