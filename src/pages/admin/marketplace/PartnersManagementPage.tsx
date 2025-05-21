
import React, { useState, useEffect } from "react";
import { AdminMarketplaceLayout } from "@/components/admin/marketplace/AdminMarketplaceLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketplacePartner, marketplaceService } from "@/services/marketplace";
import { Skeleton } from "@/components/ui/skeleton";

export default function PartnersManagementPage() {
  return (
    <AdminMarketplaceLayout>
      <PartnersTable />
    </AdminMarketplaceLayout>
  );
}

function PartnersTable() {
  const [partners, setPartners] = useState<MarketplacePartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<MarketplacePartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPartner, setEditingPartner] = useState<MarketplacePartner | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<MarketplacePartner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getAllPartners();
        setPartners(data);
        setFilteredPartners(data);
      } catch (error) {
        console.error("Error fetching partners:", error);
        toast({
          title: "Error",
          description: "Failed to load partners. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, [toast]);

  useEffect(() => {
    // Filter partners based on search query and status filter
    const filtered = partners.filter((partner) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || partner.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredPartners(filtered);
  }, [searchQuery, statusFilter, partners]);

  const handleStatusChange = async (partner: MarketplacePartner, newStatus: string) => {
    try {
      await marketplaceService.updatePartnerStatus(partner.id, newStatus);
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, status: newStatus } : p))
      );
      toast({
        title: "Status updated",
        description: `${partner.name} is now ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating partner status:", error);
      toast({
        title: "Error",
        description: "Failed to update partner status",
        variant: "destructive",
      });
    }
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;

    try {
      await marketplaceService.deletePartner(partnerToDelete.id);
      setPartners((prev) => prev.filter((p) => p.id !== partnerToDelete.id));
      setIsDeleteDialogOpen(false);
      setPartnerToDelete(null);
      toast({
        title: "Partner deleted",
        description: `${partnerToDelete.name} has been removed from the marketplace`,
      });
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Partners</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No partners found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {partner.contact_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {partner.categories.map((category, idx) => (
                          <Badge key={idx} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={partner.status} />
                    </TableCell>
                    <TableCell>{partner.commission_percentage}%</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingPartner(partner);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          {partner.website_url && (
                            <DropdownMenuItem asChild>
                              <a
                                href={partner.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit Website
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {partner.status !== "approved" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(partner, "approved")}
                            >
                              Approve Partner
                            </DropdownMenuItem>
                          )}
                          {partner.status !== "rejected" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(partner, "rejected")}
                            >
                              Reject Partner
                            </DropdownMenuItem>
                          )}
                          {partner.status !== "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(partner, "pending")}
                            >
                              Mark as Pending
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setPartnerToDelete(partner);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Partner
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
          </DialogHeader>
          {editingPartner && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Partner Name</Label>
                <Input
                  id="name"
                  value={editingPartner.name}
                  onChange={(e) =>
                    setEditingPartner((prev) => prev ? { ...prev, name: e.target.value } : null)
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingPartner.description || ""}
                  onChange={(e) =>
                    setEditingPartner((prev) => prev ? { ...prev, description: e.target.value } : null)
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission Percentage</Label>
                <Input
                  id="commission"
                  type="number"
                  value={editingPartner.commission_percentage}
                  onChange={(e) =>
                    setEditingPartner((prev) => prev ? { 
                      ...prev, 
                      commission_percentage: parseFloat(e.target.value) 
                    } : null)
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingPartner(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (!editingPartner) return;
                    try {
                      await marketplaceService.updatePartner(editingPartner);
                      setPartners((prev) =>
                        prev.map((p) => (p.id === editingPartner.id ? editingPartner : p))
                      );
                      setIsEditDialogOpen(false);
                      setEditingPartner(null);
                      toast({
                        title: "Partner updated",
                        description: "Partner details have been updated successfully",
                      });
                    } catch (error) {
                      console.error("Error updating partner:", error);
                      toast({
                        title: "Error",
                        description: "Failed to update partner details",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Partner</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{partnerToDelete?.name}</span>? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setPartnerToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePartner}>
              Delete Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  const variant = variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
