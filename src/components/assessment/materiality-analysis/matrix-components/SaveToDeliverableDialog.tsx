
import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SaveToDeliverableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deliverableName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

export function SaveToDeliverableDialog({
  isOpen,
  onClose,
  deliverableName,
  onNameChange,
  onSave
}: SaveToDeliverableDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save to Elia Go Deliverables</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="grid gap-2">
            <label htmlFor="deliverable-name" className="text-sm font-medium">Deliverable Name</label>
            <input
              id="deliverable-name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter deliverable name"
              value={deliverableName}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
