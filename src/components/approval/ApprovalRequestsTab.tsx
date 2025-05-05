
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ApprovalRequest, approvalWorkflowService } from "@/services/approvalWorkflowService";
import { ApprovalRequestCard } from "./ApprovalRequestCard";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, RefreshCcw } from "lucide-react";

export function ApprovalRequestsTab() {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [submittedRequests, setSubmittedRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const fetchApprovalRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      // Get requests where the current user is an approver
      const pendingApprovals = await approvalWorkflowService.getPendingApprovalRequests(user.id);
      setPendingRequests(pendingApprovals);
      
      // Get requests created by the current user
      const userRequests = await approvalWorkflowService.getUserApprovalRequests(user.id);
      setSubmittedRequests(userRequests);
    } catch (error) {
      console.error("Error fetching approval requests:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchApprovalRequests();
  }, [user?.id]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Approval Requests</h2>
        <Button size="sm" variant="outline" onClick={fetchApprovalRequests}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "submitted")}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="pending">Pending My Approval</TabsTrigger>
          <TabsTrigger value="submitted">My Submitted Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No pending approval requests</h3>
              <p className="text-muted-foreground">
                When someone requests your approval, it will appear here
              </p>
            </div>
          ) : (
            pendingRequests.map(request => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                isApprover={true}
                currentUserId={user?.id as string}
                onStatusUpdate={fetchApprovalRequests}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="submitted" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : submittedRequests.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No submitted requests</h3>
              <p className="text-muted-foreground">
                You haven't submitted any approval requests yet
              </p>
            </div>
          ) : (
            submittedRequests.map(request => (
              <ApprovalRequestCard
                key={request.id}
                request={request}
                isApprover={false}
                currentUserId={user?.id as string}
                onStatusUpdate={fetchApprovalRequests}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
