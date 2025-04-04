
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building, Search, Mail, PlusCircle, RefreshCw } from "lucide-react";
import { notificationService } from "@/services/notificationService";

interface Company {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  created_at: string;
}

interface CompanyUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
}

export function ClientManagementTab() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load companies data."
      });
    } finally {
      setLoading(false);
    }
  };

  const viewCompanyUsers = async (company: Company) => {
    try {
      setSelectedCompany(company);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('company_id', company.id);
      
      if (error) {
        throw error;
      }
      
      setCompanyUsers(data || []);
    } catch (error) {
      console.error("Error fetching company users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load company users."
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide both a title and content for your message."
      });
      return;
    }

    try {
      setIsSendingMessage(true);
      
      let success;
      if (selectedCompany) {
        // Send to all users in the company
        success = await notificationService.sendNotification(
          messageTitle,
          messageContent,
          { companyId: selectedCompany.id }
        );
      } else {
        // Message to selected users would be implemented here
        toast({
          variant: "destructive",
          title: "Error",
          description: "No company selected for notification."
        });
        return;
      }
      
      if (success) {
        setIsMessageDialogOpen(false);
        setMessageTitle("");
        setMessageContent("");
        toast({
          title: "Success",
          description: "Message has been sent successfully."
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message."
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.country && company.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search companies..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={fetchCompanies} variant="outline" className="h-10">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <p className="mt-4 text-muted-foreground">No companies found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.industry || "—"}</TableCell>
                  <TableCell>{company.country || "—"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewCompanyUsers(company)}
                    >
                      View Users
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Mail className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Company Users Dialog */}
      {selectedCompany && (
        <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCompany.name} - Users</DialogTitle>
            </DialogHeader>
            
            <div className="pt-4 pb-2 flex justify-between items-center">
              <p className="text-muted-foreground text-sm">
                {companyUsers.length} {companyUsers.length === 1 ? "user" : "users"} found
              </p>
              <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Message to {selectedCompany.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Message Title</label>
                      <Input 
                        value={messageTitle} 
                        onChange={(e) => setMessageTitle(e.target.value)}
                        placeholder="Enter message title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message Content</label>
                      <textarea 
                        className="w-full h-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Enter your message here..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={isSendingMessage}
                    >
                      {isSendingMessage && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {companyUsers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <p className="text-muted-foreground">No users found for this company</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs">
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
