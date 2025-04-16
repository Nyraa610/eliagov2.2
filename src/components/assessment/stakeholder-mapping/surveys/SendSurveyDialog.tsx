
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StakeholderContact } from '../database/StakeholderContactDialog';
import { Survey } from '../StakeholderSurveys';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

interface SendSurveyDialogProps {
  open: boolean;
  onClose: () => void;
  onSendSurvey: (contactIds: string[]) => void;
  survey: Survey;
  contacts: StakeholderContact[];
}

export function SendSurveyDialog({
  open,
  onClose,
  onSendSurvey,
  survey,
  contacts
}: SendSurveyDialogProps) {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  // Filter contacts by stakeholder type if the survey has one defined
  const relevantContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.position && contact.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // We might want to filter by stakeholder type in the future
    return matchesSearch;
  });

  useEffect(() => {
    if (open) {
      // Reset selections
      setSelectedContactIds([]);
      setSearchTerm('');
      setSelectAll(false);
    }
  }, [open]);

  useEffect(() => {
    // Update selectAll state based on selections
    if (relevantContacts.length > 0 && selectedContactIds.length === relevantContacts.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedContactIds, relevantContacts]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(relevantContacts.map(contact => contact.id));
    }
    setSelectAll(!selectAll);
  };

  const handleToggleContact = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(selectedContactIds.filter(id => id !== contactId));
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };

  const handleSend = () => {
    if (selectedContactIds.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }
    
    onSendSurvey(selectedContactIds);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Send "{survey.name}" Survey</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Select contacts to send this survey to
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">Select All</Label>
            </div>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {relevantContacts.length > 0 ? (
            <ScrollArea className="h-[300px] border rounded-md">
              <div className="p-4 space-y-2">
                {relevantContacts.map((contact) => (
                  <div key={contact.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md">
                    <Checkbox 
                      id={`contact-${contact.id}`}
                      checked={selectedContactIds.includes(contact.id)}
                      onCheckedChange={() => handleToggleContact(contact.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`contact-${contact.id}`}
                        className="font-medium block"
                      >
                        {contact.name}
                      </Label>
                      <div className="text-sm text-muted-foreground">{contact.email}</div>
                      {contact.position && (
                        <div className="text-xs text-muted-foreground">{contact.position}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="border rounded-md p-8 text-center">
              <p className="text-muted-foreground">No contacts found</p>
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            {selectedContactIds.length} of {relevantContacts.length} contacts selected
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={selectedContactIds.length === 0}
          >
            Send Survey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
