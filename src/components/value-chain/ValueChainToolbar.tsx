
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload, Save, Trash2, ZoomIn, ZoomOut, RotateCcw, Plus, ArrowUpRight, FileText, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { NodeType } from "@/types/valueChain";

interface ValueChainToolbarProps {
  onAddNode: (type: NodeType) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onGenerateAI: () => void;
  onUploadDocuments: () => void;
  onAutomatedBuilder: () => void;
}

export function ValueChainToolbar({
  onAddNode,
  onSave,
  onExport,
  onImport,
  onClear,
  onZoomIn,
  onZoomOut,
  onReset,
  onGenerateAI,
  onUploadDocuments,
  onAutomatedBuilder
}: ValueChainToolbarProps) {
  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 mr-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={() => onAddNode("primary")} variant="outline">
                    <div className="w-3 h-3 bg-blue-400 rounded-sm mr-2"></div>
                    Primary
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add primary activity node</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={() => onAddNode("support")} variant="outline">
                    <div className="w-3 h-3 bg-green-400 rounded-sm mr-2"></div>
                    Support
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add support activity node</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={() => onAddNode("external")} variant="outline">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                    External
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add external factor node</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={() => onAddNode("custom")} variant="outline">
                    <div className="w-3 h-3 bg-purple-400 rounded-sm mr-2"></div>
                    Custom
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add custom node</TooltipContent>
              </Tooltip>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset view</TooltipContent>
              </Tooltip>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="secondary" onClick={onGenerateAI} className="gap-1">
                    <ArrowUpRight className="h-4 w-4" />
                    Generate with AI
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate value chain with AI</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onUploadDocuments} className="gap-1">
                    <FileText className="h-4 w-4" />
                    Upload Documents
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload supporting documents</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onAutomatedBuilder} className="gap-1">
                    <Wand2 className="h-4 w-4" />
                    Auto Builder
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start automated value chain builder</TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex gap-1">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
