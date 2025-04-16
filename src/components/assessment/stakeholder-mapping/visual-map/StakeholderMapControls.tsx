
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  Plus, 
  UserPlus, 
  Undo2, 
  Building, 
  Users, 
  Info
} from "lucide-react";

interface StakeholderMapControlsProps {
  onAddNode: (type: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onExport: () => void;
  mapName: string;
  onMapNameChange: (name: string) => void;
}

export function StakeholderMapControls({
  onAddNode,
  onZoomIn,
  onZoomOut,
  onSave,
  onExport,
  mapName,
  onMapNameChange,
}: StakeholderMapControlsProps) {
  const { t } = useTranslation();
  const [selectedNodeType, setSelectedNodeType] = useState<string>("stakeholder");

  const handleNodeTypeChange = (value: string) => {
    setSelectedNodeType(value);
  };

  const handleAddNode = () => {
    onAddNode(selectedNodeType);
  };

  const nodeTypes = [
    { id: "stakeholder", label: "Stakeholder", icon: <Users size={14} /> },
    { id: "company", label: "Company", icon: <Building size={14} /> },
    { id: "person", label: "Person", icon: <UserPlus size={14} /> },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="map-name" className="text-sm font-medium mr-2">
            Map Name:
          </Label>
          <Input
            id="map-name"
            value={mapName}
            onChange={(e) => onMapNameChange(e.target.value)}
            className="h-8 flex-1"
            placeholder="Stakeholder Map"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  className="h-8 px-3"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save the current map</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 border rounded-md px-2 py-1">
            <Select
              value={selectedNodeType}
              onValueChange={handleNodeTypeChange}
            >
              <SelectTrigger className="h-8 w-[130px] border-0 px-2 py-0 font-normal">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {nodeTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center space-x-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddNode}
              className="h-7 px-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              className="h-8 px-2"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="h-8 w-px bg-gray-200"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              className="h-8 px-2"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8 px-3"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Create connections by dragging from one node's handle to another.
                  <br />
                  Double-click a node to edit its properties.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
