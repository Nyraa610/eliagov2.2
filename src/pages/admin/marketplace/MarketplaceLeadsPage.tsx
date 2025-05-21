
import React, { useState, useEffect } from "react";
import { AdminMarketplaceLayout } from "@/components/admin/marketplace/AdminMarketplaceLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Check, Banknote, DollarSign, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketplaceLead, marketplaceService } from "@/services/marketplace";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceLeadsPage() {
  return (
    <AdminMarketplaceLayout>
      <LeadsTable />
    </AdminMarketplaceLayout>
  );
}

function LeadsTable() {
  const [leads, setLeads] = useState<MarketplaceLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewLead, setViewLead] = useState<MarketplaceLead | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState<number | string>("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getMarketplaceLeads();
        setLeads(data);
      } catch (error) {
        console.error("Error fetching leads:", error);
        toast({
          title: "Error",
          description: "Failed to load marketplace leads. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [toast]);

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "paid") return lead.commission_paid === true;
    if (statusFilter === "unpaid") return lead.commission_paid === false && lead.status !== "new";
    if (statusFilter === "new") return lead.status === "new";
    return true;
  });

  const handleMarkAsContacted = async (lead: MarketplaceLead) => {
    try {
      await marketplaceService.updateLeadStatus(lead.id, "contacted");
      // Update the local state
      setLeads((prev) =>
        prev.map((item) => (item.id === lead.id ? { ...item, status: "contacted" } : item))
      );
      toast({
        title: "Status updated",
        description: `Lead marked as contacted.`,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const handleSetCommission = async () => {
    if (!viewLead || typeof commissionAmount !== "number") return;

    try {
      await marketplaceService.setLeadCommission(viewLead.id, commissionAmount);
      // Update the local state
      setLeads((prev) =>
        prev.map((item) =>
          item.id === viewLead.id ? { ...item, commission_amount: commissionAmount } : item
        )
      );
      setIsCommissionDialogOpen(false);
      toast({
        title: "Commission set",
        description: `Commission of $${commissionAmount} has been set for this lead.`,
      });
    } catch (error) {
      console.error("Error setting commission:", error);
      toast({
        title: "Error",
        description: "Failed to set commission amount",
        variant: "destructive",
      });
    }
  };

  const handleMarkCommissionPaid = async (lead: MarketplaceLead) => {
    try {
      await marketplaceService.markCommissionPaid(lead.id);
      // Update the local state
      setLeads((prev) =>
        prev.map((item) =>
          item.id === lead.id ? { ...item, commission_paid: true, commission_paid_at: new Date().toISOString() } : item
        )
      );
      toast({
        title: "Commission paid",
        description: `Commission for this lead has been marked as paid.`,
      });
    } catch (error) {
      console.error("Error marking commission as paid:", error);
      toast({
        title: "Error",
        description: "Failed to mark commission as paid",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All Leads</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid Commission</TabsTrigger>
            <TabsTrigger value="paid">Paid Commission</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="font-medium">{lead.partner?.name || "Unknown Partner"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.user?.email || "Unknown User"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.company?.name || "Not specified"}</div>
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      {lead.commission_paid ? (
                        <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                          Paid
                        </Badge>
                      ) : lead.commission_amount ? (
                        <span className="text-sm font-medium">${lead.commission_amount}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
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
                              setViewLead(lead);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {lead.status === "new" && (
                            <DropdownMenuItem onClick={() => handleMarkAsContacted(lead)}>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Contacted
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setViewLead(lead);
                              setCommissionAmount(lead.commission_amount || "");
                              setIsCommissionDialogOpen(true);
                            }}
                          >
                            <Banknote className="mr-2 h-4 w-4" />
                            {lead.commission_amount ? "Update Commission" : "Set Commission"}
                          </DropdownMenuItem>
                          {lead.commission_amount && !lead.commission_paid && (
                            <DropdownMenuItem onClick={() => handleMarkCommissionPaid(lead)}>
                              <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                              Mark Commission as Paid
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
      </Card>

      {/* View Lead Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {viewLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Partner</h3>
                  <p>{viewLead.partner?.name || "Unknown Partner"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                  <LeadStatusBadge status={viewLead.status} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">User</h3>
                  <p>{viewLead.user?.email || "Unknown User"}</p>
                </div>
                {viewLead.company && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Company</h3>
                    <p>{viewLead.company.name}</p>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Created Date</h3>
                  <p>{new Date(viewLead.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Commission</h3>
                  {viewLead.commission_paid ? (
                    <div>
                      <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                        Paid ${viewLead.commission_amount}
                      </Badge>
                      {viewLead.commission_paid_at && (
                        <div className="text-xs text-muted-foreground mt-1">
                          on {new Date(viewLead.commission_paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : viewLead.commission_amount ? (
                    <p>${viewLead.commission_amount} (Unpaid)</p>
                  ) : (
                    <p className="text-muted-foreground">Not set</p>
                  )}
                </div>
              </div>

              {viewLead.message && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Message from User</h3>
                  <p className="whitespace-pre-line border rounded-md p-3 bg-muted/30">{viewLead.message}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            {viewLead && (
              <div className="flex gap-2">
                {viewLead.status === "new" && (
                  <Button
                    onClick={() => {
                      handleMarkAsContacted(viewLead);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Contacted
                  </Button>
                )}
                {!viewLead.commission_paid && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setCommissionAmount(viewLead.commission_amount || "");
                      setIsCommissionDialogOpen(true);
                    }}
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    {viewLead.commission_amount ? "Update Commission" : "Set Commission"}
                  </Button>
                )}
              </div>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Dialog */}
      <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {viewLead?.commission_amount ? "Update Commission" : "Set Commission"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Commission Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={commissionAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      setCommissionAmount("");
                    } else {
                      setCommissionAmount(value);
                    }
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the commission amount for this lead. This is the amount that will be paid to your company.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCommissionDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetCommission}
              disabled={typeof commissionAmount !== "number" || commissionAmount <= 0}
            >
              Save Commission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const variants = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-purple-100 text-purple-800 border-purple-200",
    converted: "bg-green-100 text-green-800 border-green-200",
    lost: "bg-red-100 text-red-800 border-red-200",
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
