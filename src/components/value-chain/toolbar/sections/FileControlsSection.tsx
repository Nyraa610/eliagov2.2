
import { Button } from "@/components/ui/button";
import { Download, Upload, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface FileControlsSectionProps {
  onSave: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function FileControlsSection({ onSave, onExport, onImport, onClear }: FileControlsSectionProps) {
  return (
    <div className="flex gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save value chain</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export as JSON</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Input
                type="file"
                accept=".json"
                onChange={onImport}
                className="hidden"
                id="import-value-chain"
              />
              <Label htmlFor="import-value-chain" className="cursor-pointer">
                <Button size="sm" variant="outline" type="button" asChild>
                  <div>
                    <Upload className="h-4 w-4" />
                  </div>
                </Button>
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent>Import from JSON</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear canvas</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
