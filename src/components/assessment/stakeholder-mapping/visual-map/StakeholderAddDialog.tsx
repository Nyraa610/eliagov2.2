
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StakeholderAddDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string, name: string) => void;
}

export function StakeholderAddDialog({ open, onClose, onAdd }: StakeholderAddDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('generic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    onAdd(type, name);
    
    // Reset form
    setName('');
    setType('generic');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stakeholder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stakeholder-name">Stakeholder Name</Label>
            <Input
              id="stakeholder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter stakeholder name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stakeholder-type">Stakeholder Type</Label>
            <Select
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger id="stakeholder-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="generic">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Stakeholder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
