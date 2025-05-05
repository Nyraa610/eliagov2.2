
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { approvalWorkflowService } from "@/services/approvalWorkflowService";
import { UserProfile } from "@/services/base/profileTypes";

interface RequestApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: string;
  documentId: string;
  documentTitle: string;
  documentUrl?: string;
  companyId: string;
}

export function RequestApprovalDialog({
  open,
  onOpenChange,
  documentType,
  documentId,
  documentTitle,
  documentUrl,
  companyId
}: RequestApprovalDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(documentTitle || "");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<UserProfile[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  
  // Fetch company users for approver selection
  useEffect(() => {
    if (open && companyId) {
      fetchCompanyUsers();
    }
  }, [open, companyId]);
  
  const fetchCompanyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", companyId);
      
      if (error) {
        console.error("Error fetching company users:", error);
        return;
      }
      
      if (data) {
        setCompanyUsers(data);
      }
    } catch (error) {
      console.error("Exception fetching company users:", error);
    }
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please provide a title for the approval request");
      return;
    }
    
    if (!description.trim()) {
      toast.error("Please provide a description for the approval request");
      return;
    }
    
    if (selectedApprovers.length === 0) {
      toast.error("Please select at least one approver");
      return;
    }
    
    if (!user?.id) {
      toast.error("You must be logged in to request approvals");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await approvalWorkflowService.createApprovalRequest({
        title,
        description,
        document_type: documentType,
        document_id: documentId,
        document_url: documentUrl,
        requester_id: user.id,
        company_id: companyId,
        approvers: selectedApprovers
      });
      
      if (result) {
        toast.success("Approval request submitted successfully");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating approval request:", error);
      toast.error("Failed to submit approval request");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle approver selection
  const toggleApprover = (userId: string) => {
    setSelectedApprovers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Approval</DialogTitle>
          <DialogDescription>
            Request approval for this document or deliverable
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Approval request title"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs approval and any additional context"
              rows={4}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Select Approvers</Label>
            <Select
              onValueChange={(value) => toggleApprover(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an approver" />
              </SelectTrigger>
              <SelectContent>
                {companyUsers
                  .filter(u => u.id !== user?.id)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                      {selectedApprovers.includes(user.id) ? " (Selected)" : ""}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedApprovers.length > 0 && (
              <div className="mt-2">
                <Label>Selected Approvers:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedApprovers.map(approverId => {
                    const approver = companyUsers.find(u => u.id === approverId);
                    return (
                      <div key={approverId} className="flex items-center bg-primary-50 rounded-md px-2 py-1">
                        <span className="text-sm">{approver?.full_name || approver?.email || 'Unknown user'}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto w-auto p-1 ml-1"
                          onClick={() => toggleApprover(approverId)}
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Note: Only one approval from the selected approvers is required
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
