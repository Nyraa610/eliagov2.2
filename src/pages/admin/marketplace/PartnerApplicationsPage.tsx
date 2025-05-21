
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PartnerApplication, marketplaceService } from "@/services/marketplace";
import { AdminMarketplaceLayout } from "@/components/admin/marketplace/AdminMarketplaceLayout";
import { Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function PartnerApplicationsPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getAllApplications();
        setApplications(data);
      } catch (error) {
        console.error("Error loading applications:", error);
        toast({
          title: "Error",
          description: "Failed to load partner applications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApplications();
  }, [toast]);
  
  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await marketplaceService.updateApplicationStatus(id, status);
      
      // Update local state
      setApplications(
        applications.map(app => 
          app.id === id ? { ...app, status } : app
        )
      );
      
      toast({
        title: "Application updated",
        description: `Application has been ${status}`,
      });
      
      // If approved, we would typically create a new partner
      if (status === 'approved') {
        // In a real implementation, you might want to open a modal to collect
        // additional partner details before creating the partner
        toast({
          title: "Next Step",
          description: "Don't forget to create a partner account for this approved application",
        });
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
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
        <div>
          <h2 className="text-2xl font-bold">Partner Applications</h2>
          <p className="text-muted-foreground mt-1">
            Review and manage applications from potential solution providers
          </p>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No partner applications submitted yet.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.company_name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{app.contact_name}</div>
                          <a 
                            href={`mailto:${app.contact_email}`}
                            className="text-primary text-sm hover:underline"
                          >
                            {app.contact_email}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {app.categories.slice(0, 2).map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {app.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{app.categories.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(app.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right">
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleUpdateStatus(app.id, 'approved')}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            >
                              <X className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">Reject</span>
                            </Button>
                          </div>
                        )}
                        {app.status !== 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            View Details
                          </Button>
                        )}
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
