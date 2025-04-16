
import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Stakeholder } from '../StakeholderDatabase';

export type StakeholderContact = {
  id: string;
  stakeholderId: string;
  name: string;
  email: string;
  position?: string;
  phone?: string;
  notes?: string;
};

interface StakeholderContactDialogProps {
  open: boolean;
  onClose: () => void;
  onAddContact: (contact: Omit<StakeholderContact, 'id'>) => void;
  onAddStakeholder: (stakeholder: Omit<Stakeholder, 'id' | 'contactCount'>) => void;
  stakeholders: Stakeholder[];
  selectedStakeholder: Stakeholder | null;
}

export function StakeholderContactDialog({
  open,
  onClose,
  onAddContact,
  onAddStakeholder,
  stakeholders,
  selectedStakeholder
}: StakeholderContactDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedStakeholder ? "contact" : "stakeholder");
  
  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string>('');
  
  // Stakeholder state
  const [stakeholderName, setStakeholderName] = useState('');
  const [stakeholderType, setStakeholderType] = useState('');
  const [stakeholderInfluence, setStakeholderInfluence] = useState<'low' | 'medium' | 'high'>('medium');
  const [stakeholderInterest, setStakeholderInterest] = useState<'low' | 'medium' | 'high'>('medium');
  const [stakeholderDescription, setStakeholderDescription] = useState('');

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (selectedStakeholder) {
        setSelectedStakeholderId(selectedStakeholder.id);
        setActiveTab("contact");
      } else {
        setActiveTab(stakeholders.length > 0 ? "contact" : "stakeholder");
      }
      
      // Reset form fields
      resetContactForm();
      resetStakeholderForm();
    }
  }, [open, selectedStakeholder, stakeholders]);

  const resetContactForm = () => {
    setContactName('');
    setContactEmail('');
    setContactPosition('');
    setContactPhone('');
    setContactNotes('');
  };

  const resetStakeholderForm = () => {
    setStakeholderName('');
    setStakeholderType('');
    setStakeholderInfluence('medium');
    setStakeholderInterest('medium');
    setStakeholderDescription('');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactName.trim() || !contactEmail.trim() || !selectedStakeholderId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    onAddContact({
      stakeholderId: selectedStakeholderId,
      name: contactName,
      email: contactEmail,
      position: contactPosition,
      phone: contactPhone,
      notes: contactNotes
    });
    
    resetContactForm();
    onClose();
  };

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stakeholderName.trim() || !stakeholderType.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    onAddStakeholder({
      name: stakeholderName,
      type: stakeholderType,
      influence: stakeholderInfluence,
      interest: stakeholderInterest,
      description: stakeholderDescription
    });
    
    resetStakeholderForm();
    
    // If we're adding a stakeholder first, switch to contact tab
    if (activeTab === "stakeholder") {
      setActiveTab("contact");
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {selectedStakeholder 
              ? `Add Contact to ${selectedStakeholder.name}` 
              : stakeholders.length > 0 
                ? "Add Stakeholder or Contact" 
                : "Add Stakeholder"}
          </DialogTitle>
        </DialogHeader>
        
        {stakeholders.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="contact">Add Contact</TabsTrigger>
              <TabsTrigger value="stakeholder">Add Stakeholder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contact">
              <form onSubmit={handleAddContact} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="stakeholder-select">Stakeholder</Label>
                  <Select
                    value={selectedStakeholderId}
                    onValueChange={setSelectedStakeholderId}
                    required
                    disabled={!!selectedStakeholder}
                  >
                    <SelectTrigger id="stakeholder-select">
                      <SelectValue placeholder="Select stakeholder" />
                    </SelectTrigger>
                    <SelectContent>
                      {stakeholders.map((stakeholder) => (
                        <SelectItem key={stakeholder.id} value={stakeholder.id}>
                          {stakeholder.name} ({stakeholder.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact Name *</Label>
                    <Input
                      id="contact-name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email Address *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-position">Position</Label>
                    <Input
                      id="contact-position"
                      value={contactPosition}
                      onChange={(e) => setContactPosition(e.target.value)}
                      placeholder="Job title or role"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Phone Number</Label>
                    <Input
                      id="contact-phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-notes">Notes</Label>
                  <Textarea
                    id="contact-notes"
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Additional information about this contact"
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Contact</Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="stakeholder">
              <form onSubmit={handleAddStakeholder} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stakeholder-name">Stakeholder Name *</Label>
                    <Input
                      id="stakeholder-name"
                      value={stakeholderName}
                      onChange={(e) => setStakeholderName(e.target.value)}
                      placeholder="Organization name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stakeholder-type">Stakeholder Type *</Label>
                    <Input
                      id="stakeholder-type"
                      value={stakeholderType}
                      onChange={(e) => setStakeholderType(e.target.value)}
                      placeholder="e.g., Supplier, Customer, etc."
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stakeholder-influence">Influence Level</Label>
                    <Select
                      value={stakeholderInfluence}
                      onValueChange={(value: any) => setStakeholderInfluence(value)}
                    >
                      <SelectTrigger id="stakeholder-influence">
                        <SelectValue placeholder="Select influence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stakeholder-interest">Interest Level</Label>
                    <Select
                      value={stakeholderInterest}
                      onValueChange={(value: any) => setStakeholderInterest(value)}
                    >
                      <SelectTrigger id="stakeholder-interest">
                        <SelectValue placeholder="Select interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stakeholder-description">Description</Label>
                  <Textarea
                    id="stakeholder-description"
                    value={stakeholderDescription}
                    onChange={(e) => setStakeholderDescription(e.target.value)}
                    placeholder="Brief description of this stakeholder"
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Stakeholder</Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleAddStakeholder} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder-name">Stakeholder Name *</Label>
              <Input
                id="stakeholder-name"
                value={stakeholderName}
                onChange={(e) => setStakeholderName(e.target.value)}
                placeholder="Organization name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stakeholder-type">Stakeholder Type *</Label>
              <Input
                id="stakeholder-type"
                value={stakeholderType}
                onChange={(e) => setStakeholderType(e.target.value)}
                placeholder="e.g., Supplier, Customer, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stakeholder-influence">Influence Level</Label>
                <Select
                  value={stakeholderInfluence}
                  onValueChange={(value: any) => setStakeholderInfluence(value)}
                >
                  <SelectTrigger id="stakeholder-influence">
                    <SelectValue placeholder="Select influence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stakeholder-interest">Interest Level</Label>
                <Select
                  value={stakeholderInterest}
                  onValueChange={(value: any) => setStakeholderInterest(value)}
                >
                  <SelectTrigger id="stakeholder-interest">
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stakeholder-description">Description</Label>
              <Textarea
                id="stakeholder-description"
                value={stakeholderDescription}
                onChange={(e) => setStakeholderDescription(e.target.value)}
                placeholder="Brief description of this stakeholder"
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Stakeholder</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
