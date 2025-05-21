
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { marketplaceService } from "@/services/marketplace";
import { AdminMarketplaceLayout } from "@/components/admin/marketplace/AdminMarketplaceLayout";
import { Loader2, MoreHorizontal, Search, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function MarketplaceLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getAllLeads();
        setLeads(data);
        setFilteredLeads(data);
      } catch (error) {
        console.error("Error loading leads:", error);
        toast({
          title: "Error",
          description: "Failed to load marketplace leads",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeads();
  }, [toast]);
  
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = leads.filter(
        lead =>
          lead.partner?.name.toLowerCase().includes(term) ||
          lead.user?.email.toLowerCase().includes(term) ||
          lead.company?.name?.toLowerCase().includes(term)
      );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads(leads);
    }
  }, [searchTerm, leads]);
  
  const handleMarkLeadConverted = async (leadId: string) => {
    try {
      await marketplaceService.updateLeadStatus(leadId, { status: 'converted' });
      
      // Update local state
      const updatedLeads = leads.map(lead => 
        lead.id === leadId ? { ...lead, status: 'converted' } : lead
      );
      
      setLeads(updatedLeads);
      setFilteredLeads(
        filteredLeads.map(lead => 
          lead.id === leadId ? { ...lead, status: 'converted' } : lead
        )
      );
      
      toast({
        title: "Lead updated",
        description: "Lead has been marked as converted",
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkCommissionPaid = async (leadId: string, amount: number) => {
    try {
      await marketplaceService.updateLeadStatus(leadId, { 
        commission_paid: true,
        commission_amount: amount,
        commission_paid_at: new Date().toISOString()
      });
      
      // Update local state
      const updatedLeads = leads.map(lead => 
        lead.id === leadId ? { 
          ...lead, 
          commission_paid: true,
          commission_amount: amount,
          commission_paid_at: new Date().toISOString()
        } : lead
      );
      
      setLeads(updatedLeads);
      setFilteredLeads(
        filteredLeads.map(lead => 
          lead.id === leadId ? { 
            ...lead, 
            commission_paid: true,
            commission_amount: amount,
            commission_paid_at: new Date().toISOString()
          } : lead
        )
      );
      
      toast({
        title: "Commission paid",
        description: `Commission of ${amount}€ has been marked as paid`,
      });
    } catch (error) {
      console.error("Error updating commission status:", error);
      toast({
        title: "Error",
        description: "Failed to update commission status",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'converted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Converted</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Contacted</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };
  
  return (
    <AdminMarketplaceLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Leads & Commission</h2>
          <p className="text-muted-foreground mt-1">
            Track leads sent to partners and manage commission payments
          </p>
        </div>
        
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ? (
                        <>
                          <p className="text-muted-foreground mb-2">No leads found matching search term.</p>
                          <Button variant="ghost" onClick={() => setSearchTerm("")}>Clear Search</Button>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No leads registered yet.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.partner?.name || 'Unknown Partner'}</TableCell>
                      <TableCell>{lead.user?.email || lead.user_id}</TableCell>
                      <TableCell>{lead.company?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        {lead.commission_paid ? (
                          <span className="text-green-600 font-medium">
                            {lead.commission_amount || 0}€ Paid
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {lead.status !== 'converted' && (
                              <DropdownMenuItem 
                                onClick={() => handleMarkLeadConverted(lead.id)}
                                className="text-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Converted
                              </DropdownMenuItem>
                            )}
                            
                            {!lead.commission_paid && (
                              <DropdownMenuItem 
                                onClick={() => handleMarkCommissionPaid(lead.id, 250)}
                                className="text-blue-600"
                              >
                                <CircleDollarSign className="h-4 w-4 mr-2" />
                                Record Commission Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminMarketplaceLayout>
  );
}
