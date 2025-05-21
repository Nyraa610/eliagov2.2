
import React, { useState, useEffect } from "react";
import { AdminMarketplaceLayout } from "@/components/admin/marketplace/AdminMarketplaceLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Eye, CheckCircle, XCircle, ExternalLink, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PartnerApplication, marketplaceService } from "@/services/marketplace";
import { Skeleton } from "@/components/ui/skeleton";

export default function PartnerApplicationsPage() {
  return (
    <AdminMarketplaceLayout>
      <ApplicationsTable />
    </AdminMarketplaceLayout>
  );
}

function ApplicationsTable() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewApplication, setViewApplication] = useState<PartnerApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getPartnerApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description: "Failed to load partner applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [toast]);

  const handleApprove = async (application: PartnerApplication) => {
    try {
      await marketplaceService.approveApplication(application.id);
      // Update the local state to reflect the approval
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "approved" } : app
        )
      );
      toast({
        title: "Application approved",
        description: `${application.company_name} has been approved as a partner.`,
      });
    } catch (error) {
      console.error("Error approving application:", error);
      toast({
        title: "Error",
        description: "Failed to approve partner application",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (application: PartnerApplication) => {
    try {
      await marketplaceService.rejectApplication(application.id);
      // Update the local state to reflect the rejection
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, status: "rejected" } : app
        )
      );
      toast({
        title: "Application rejected",
        description: `${application.company_name}'s application has been rejected.`,
      });
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error",
        description: "Failed to reject partner application",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
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
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="font-medium">{application.company_name}</div>
                      {application.company_website && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <a
                            href={application.company_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Website
                          </a>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{application.contact_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {application.contact_email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {application.categories.slice(0, 2).map((category, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {application.categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{application.categories.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ApplicationStatusBadge status={application.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
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
                              setViewApplication(application);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {application.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(application)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(application)}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            </>
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

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Partner Application</DialogTitle>
          </DialogHeader>
          {viewApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Company Name</h3>
                  <p>{viewApplication.company_name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                  <ApplicationStatusBadge status={viewApplication.status} />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Name</h3>
                  <p>{viewApplication.contact_name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Email</h3>
                  <p>{viewApplication.contact_email}</p>
                </div>
                {viewApplication.contact_phone && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Phone</h3>
                    <p>{viewApplication.contact_phone}</p>
                  </div>
                )}
                {viewApplication.company_website && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Website</h3>
                    <a
                      href={viewApplication.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      {viewApplication.company_website}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                <p className="whitespace-pre-line">{viewApplication.company_description}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Services Offered</h3>
                <p className="whitespace-pre-line">{viewApplication.services_offered}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Categories</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewApplication.categories.map((category, idx) => (
                    <Badge key={idx} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Locations</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewApplication.locations.map((location, idx) => (
                    <Badge key={idx} variant="secondary">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Target Company Sizes</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewApplication.company_sizes.map((size, idx) => (
                    <Badge key={idx} variant="secondary">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            {viewApplication && viewApplication.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (viewApplication) {
                      handleReject(viewApplication);
                      setIsViewDialogOpen(false);
                    }
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    if (viewApplication) {
                      handleApprove(viewApplication);
                      setIsViewDialogOpen(false);
                    }
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationStatusBadge({ status }: { status: string }) {
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
