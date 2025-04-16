
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ChevronRight, Database, Plus, Search, Trash2 } from "lucide-react";
import { stakeholderService } from "@/services/stakeholderService";
import { StakeholderContactDialog } from "./database/StakeholderContactDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export type Stakeholder = {
  id: string;
  name: string;
  type: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  contactCount: number;
  description?: string;
};

export type StakeholderContact = {
  id: string;
  stakeholderId: string;
  name: string;
  email: string;
  position?: string;
  phone?: string;
  notes?: string;
};

type StakeholderDatabaseProps = {
  onComplete: () => void;
};

export function StakeholderDatabase({ onComplete }: StakeholderDatabaseProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [contacts, setContacts] = useState<StakeholderContact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("stakeholders");

  // Load stakeholder data
  useEffect(() => {
    const loadStakeholderData = async () => {
      setIsLoading(true);
      try {
        const data = await stakeholderService.getStakeholders();
        setStakeholders(data);
        
        const contactsData = await stakeholderService.getStakeholderContacts();
        setContacts(contactsData);
      } catch (error) {
        console.error("Error loading stakeholder data:", error);
        toast.error("Failed to load stakeholder data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStakeholderData();
  }, []);

  const filteredStakeholders = stakeholders.filter(
    (stakeholder) =>
      stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stakeholder.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.position && contact.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddContact = async (contact: Omit<StakeholderContact, 'id'>) => {
    try {
      const newContact = await stakeholderService.addStakeholderContact(contact);
      setContacts((prev) => [...prev, newContact]);
      
      // Update contact count for the stakeholder
      const updatedStakeholders = stakeholders.map(s => 
        s.id === contact.stakeholderId 
          ? { ...s, contactCount: s.contactCount + 1 }
          : s
      );
      setStakeholders(updatedStakeholders);
      
      toast.success("Contact added successfully");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    }
  };

  const handleDeleteStakeholder = async (id: string) => {
    if (confirm("Are you sure you want to delete this stakeholder? All associated contacts will also be deleted.")) {
      try {
        await stakeholderService.deleteStakeholder(id);
        setStakeholders(stakeholders.filter(s => s.id !== id));
        setContacts(contacts.filter(c => c.stakeholderId !== id));
        toast.success("Stakeholder deleted successfully");
      } catch (error) {
        console.error("Error deleting stakeholder:", error);
        toast.error("Failed to delete stakeholder");
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        const contactToDelete = contacts.find(c => c.id === id);
        if (!contactToDelete) return;
        
        await stakeholderService.deleteStakeholderContact(id);
        setContacts(contacts.filter(c => c.id !== id));
        
        // Update contact count for the stakeholder
        const updatedStakeholders = stakeholders.map(s => 
          s.id === contactToDelete.stakeholderId 
            ? { ...s, contactCount: Math.max(0, s.contactCount - 1) }
            : s
        );
        setStakeholders(updatedStakeholders);
        
        toast.success("Contact deleted successfully");
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete contact");
      }
    }
  };

  const handleAddStakeholder = async (stakeholder: Omit<Stakeholder, 'id' | 'contactCount'>) => {
    try {
      const newStakeholder = await stakeholderService.addStakeholder({
        ...stakeholder,
        contactCount: 0
      });
      setStakeholders((prev) => [...prev, newStakeholder]);
      toast.success("Stakeholder added successfully");
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      toast.error("Failed to add stakeholder");
    }
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" /> Stakeholder Database
          </CardTitle>
          <CardDescription>
            Manage your stakeholders and their contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stakeholders or contacts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStakeholder(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Stakeholder
              </Button>
              <Button
                onClick={() => onComplete()}
                className="flex items-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>

            <TabsContent value="stakeholders">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading stakeholders...</p>
                </div>
              ) : stakeholders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No stakeholders found</h3>
                  <p className="text-muted-foreground mb-4">Add your first stakeholder to get started</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedStakeholder(null);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Stakeholder
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Influence</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStakeholders.map((stakeholder) => (
                        <TableRow key={stakeholder.id}>
                          <TableCell className="font-medium">{stakeholder.name}</TableCell>
                          <TableCell>{stakeholder.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getInfluenceColor(stakeholder.influence)}>
                              {stakeholder.influence}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getInterestColor(stakeholder.interest)}>
                              {stakeholder.interest}
                            </Badge>
                          </TableCell>
                          <TableCell>{stakeholder.contactCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedStakeholder(stakeholder);
                                  setIsAddDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStakeholder(stakeholder.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Database className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No contacts found</h3>
                  <p className="text-muted-foreground mb-4">Add contacts to your stakeholders</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (stakeholders.length > 0) {
                        setSelectedStakeholder(stakeholders[0]);
                        setIsAddDialogOpen(true);
                      } else {
                        toast.error("Add a stakeholder first before adding contacts");
                      }
                    }}
                    disabled={stakeholders.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Contact
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Stakeholder</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => {
                        const stakeholder = stakeholders.find(s => s.id === contact.stakeholderId);
                        return (
                          <TableRow key={contact.id}>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{contact.email}</TableCell>
                            <TableCell>{contact.position || '-'}</TableCell>
                            <TableCell>{stakeholder?.name || '-'}</TableCell>
                            <TableCell>{contact.phone || '-'}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteContact(contact.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <StakeholderContactDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddContact={handleAddContact}
        onAddStakeholder={handleAddStakeholder}
        stakeholders={stakeholders}
        selectedStakeholder={selectedStakeholder}
      />
    </div>
  );
}
