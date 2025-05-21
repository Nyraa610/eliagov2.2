
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
import { MarketplacePartner, marketplaceService } from "@/services/marketplace";
import { AdminMarketplaceLayout } from "@/components/admin/marketplace/AdminMarketplaceLayout";
import { Loader2, MoreHorizontal, Search, PlusCircle, Check, X, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function PartnersManagementPage() {
  const [partners, setPartners] = useState<MarketplacePartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<MarketplacePartner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getAllPartners();
        setPartners(data);
        setFilteredPartners(data);
      } catch (error) {
        console.error("Error loading partners:", error);
        toast({
          title: "Error",
          description: "Failed to load marketplace partners",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPartners();
  }, [toast]);
  
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = partners.filter(
        partner =>
          partner.name.toLowerCase().includes(term) ||
          partner.description?.toLowerCase().includes(term) ||
          partner.contact_email.toLowerCase().includes(term)
      );
      setFilteredPartners(filtered);
    } else {
      setFilteredPartners(partners);
    }
  }, [searchTerm, partners]);
  
  const handleUpdatePartnerStatus = async (partnerId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await marketplaceService.updatePartner(partnerId, { status });
      
      // Update local state
      const updatedPartners = partners.map(partner => 
        partner.id === partnerId ? { ...partner, status } : partner
      );
      
      setPartners(updatedPartners);
      setFilteredPartners(
        filteredPartners.map(partner => 
          partner.id === partnerId ? { ...partner, status } : partner
        )
      );
      
      toast({
        title: "Status updated",
        description: `Partner status has been updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating partner status:", error);
      toast({
        title: "Error",
        description: "Failed to update partner status",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  return (
    <AdminMarketplaceLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h2 className="text-2xl font-bold">Partners Management</h2>
          <Button className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Partner
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm ? (
                        <>
                          <p className="text-muted-foreground mb-2">No partners found matching search term.</p>
                          <Button variant="ghost" onClick={() => setSearchTerm("")}>Clear Search</Button>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground mb-2">No partners registered yet.</p>
                          <Button>Add First Partner</Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${partner.contact_email}`}
                          className="text-primary hover:underline"
                        >
                          {partner.contact_email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {partner.categories.slice(0, 2).map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {partner.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{partner.categories.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>{partner.commission_percentage}%</TableCell>
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
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Partner</DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {partner.status !== 'approved' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdatePartnerStatus(partner.id, 'approved')}
                                className="text-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve Partner
                              </DropdownMenuItem>
                            )}
                            
                            {partner.status !== 'rejected' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdatePartnerStatus(partner.id, 'rejected')}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject Partner
                              </DropdownMenuItem>
                            )}
                            
                            {partner.website_url && (
                              <DropdownMenuItem asChild>
                                <a 
                                  href={partner.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex cursor-pointer items-center"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Visit Website
                                </a>
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
