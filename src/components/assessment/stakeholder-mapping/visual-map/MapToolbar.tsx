
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { MapExportControls } from "./MapExportControls";

interface MapToolbarProps {
  onAddStakeholder: () => void;
  onSave: () => Promise<boolean>;
  onSaveVersion: (imageUrl: string, versionName: string) => Promise<void>;
  reactFlowRef: React.RefObject<HTMLDivElement>;
  isSubmitting: boolean;
}

export function MapToolbar({
  onAddStakeholder,
  onSave,
  onSaveVersion,
  reactFlowRef,
  isSubmitting
}: MapToolbarProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <div className="col-span-3 flex items-center gap-2">
        <Button
          onClick={onAddStakeholder}
          variant="outline"
          className="mr-2"
        >
          Add Stakeholder
        </Button>
        
        <MapExportControls 
          reactFlowRef={reactFlowRef}
          onSaveVersion={onSaveVersion}
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          Save & Continue <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
