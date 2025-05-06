
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TemplateSelectorProps {
  onTemplateChange: (template: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateChange
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    onTemplateChange(value);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="template-selector" className="text-sm font-medium">
        Template:
      </Label>
      <Select
        value={selectedTemplate}
        onValueChange={handleTemplateChange}
      >
        <SelectTrigger id="template-selector" className="w-[200px]">
          <SelectValue placeholder="Select Template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="standard">Standard Template</SelectItem>
          <SelectItem value="executive">Executive Summary</SelectItem>
          <SelectItem value="detailed">Detailed Report</SelectItem>
          <SelectItem value="presentation">Presentation Format</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
