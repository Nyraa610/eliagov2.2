
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  Clock, 
  FileText, 
  AlertCircle, 
  MoreVertical,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { ApprovalRequest, ApprovalStatus, approvalWorkflowService } from "@/services/approvalWorkflowService";
import { toast } from "sonner";

interface ApprovalRequestCardProps {
  request: ApprovalRequest;
  isApprover: boolean;
  currentUserId: string;
  onStatusUpdate: () => void;
}

export function ApprovalRequestCard({ 
  request, 
  isApprover,
  currentUserId, 
  onStatusUpdate 
}: ApprovalRequestCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "pending_approval":
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Approval</Badge>;
      case "under_review":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1"><FileText className="h-3 w-3" /> Under Review</Badge>;
      case "needs_modifications":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Needs Modifications</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1"><Check className="h-3 w-3" /> Approved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const updateStatus = async (newStatus: ApprovalStatus, customFeedback?: string) => {
    setIsSubmitting(true);
    
    try {
      const feedbackText = customFeedback !== undefined ? customFeedback : feedback;
      
      const success = await approvalWorkflowService.updateApprovalStatus(
        request.id as string,
        newStatus,
        currentUserId,
        feedbackText || undefined
      );
      
      if (success) {
        setFeedback("");
        setShowFeedback(false);
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error("Failed to update approval status");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{request.title}</CardTitle>
          {getStatusBadge(request.status)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {request.created_at && (
            <>Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="py-2">
        <p className="text-sm">{request.description}</p>
        
        {request.feedback && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-1 text-sm font-medium mb-1">
              <MessageSquare className="h-4 w-4" /> Feedback
            </div>
            <p className="text-sm">{request.feedback}</p>
          </div>
        )}
        
        {showFeedback && (
          <div className="mt-3">
            <Textarea 
              placeholder="Provide feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <div>
          {request.document_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={request.document_url} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2" />
                View Document
              </a>
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {isApprover && ['pending_approval', 'under_review'].includes(request.status) && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {request.status === 'pending_approval' && (
                    <DropdownMenuItem onClick={() => updateStatus('under_review')}>
                      Mark Under Review
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowFeedback(true)}>
                    Provide Feedback
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (!feedback && !showFeedback) {
                      setShowFeedback(true);
                    } else {
                      updateStatus('needs_modifications');
                    }
                  }}>
                    Request Modifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                size="sm" 
                onClick={() => updateStatus('approved')}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          
          {showFeedback && (
            <Button 
              size="sm" 
              onClick={() => updateStatus(request.status === 'under_review' ? 'needs_modifications' : 'under_review')}
              disabled={isSubmitting}
            >
              Submit Feedback
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
