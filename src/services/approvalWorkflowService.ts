
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { notificationService } from "./notificationService";
import { emailService } from "./emailService";

export type ApprovalStatus = 
  | "pending_approval"
  | "under_review" 
  | "needs_modifications" 
  | "approved";

export interface ApprovalRequest {
  id?: string;
  title: string;
  description: string;
  document_url?: string;
  document_type: string;
  document_id: string;
  requester_id: string;
  company_id: string;
  status: ApprovalStatus;
  approvers: string[];
  approved_by?: string;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

export const approvalWorkflowService = {
  /**
   * Creates a new approval request
   */
  createApprovalRequest: async (request: Omit<ApprovalRequest, "status" | "created_at" | "updated_at">): Promise<ApprovalRequest | null> => {
    try {
      // Add default status
      const approvalRequest = {
        ...request,
        status: "pending_approval" as ApprovalStatus
      };
      
      // Insert the approval request
      const { data, error } = await supabase
        .from('approval_requests')
        .insert(approvalRequest)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating approval request:", error);
        toast.error("Failed to create approval request");
        return null;
      }
      
      // Send notifications to approvers
      for (const approverId of request.approvers) {
        await notificationService.sendNotification(
          "Approval Request",
          `${request.title} requires your approval`,
          {
            userIds: [approverId],
            notificationType: "approval_request",
            metadata: {
              request_id: data.id,
              document_id: request.document_id,
              document_type: request.document_type
            }
          }
        );
      }
      
      // Send email notification
      await emailService.sendEmail({
        to: await getApproverEmails(request.approvers),
        subject: `Approval Request: ${request.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">New Approval Request</h1>
            <p>A new approval request has been submitted that requires your review:</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h2 style="margin-top: 0;">${request.title}</h2>
              <p>${request.description}</p>
            </div>
            <p>Please log in to the ELIA GO platform to review this request and provide your approval or feedback.</p>
            <p>Best regards,<br>ELIA GO Team</p>
          </div>
        `
      });
      
      return data;
    } catch (error) {
      console.error("Exception creating approval request:", error);
      toast.error("Failed to process approval request");
      return null;
    }
  },

  /**
   * Get approval requests for a user to review
   */
  getPendingApprovalRequests: async (userId: string): Promise<ApprovalRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .contains('approvers', [userId])
        .in('status', ['pending_approval', 'under_review'])
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching approval requests:", error);
        toast.error("Failed to fetch approval requests");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Exception fetching approval requests:", error);
      return [];
    }
  },

  /**
   * Get approval requests created by a user
   */
  getUserApprovalRequests: async (userId: string): Promise<ApprovalRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching user approval requests:", error);
        toast.error("Failed to fetch your approval requests");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Exception fetching user approval requests:", error);
      return [];
    }
  },

  /**
   * Update the status of an approval request
   */
  updateApprovalStatus: async (
    requestId: string, 
    status: ApprovalStatus, 
    userId: string,
    feedback?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      // Add feedback if provided
      if (feedback) {
        updateData.feedback = feedback;
      }
      
      // Add approver ID if approved
      if (status === "approved") {
        updateData.approved_by = userId;
      }
      
      const { error } = await supabase
        .from('approval_requests')
        .update(updateData)
        .eq('id', requestId);
      
      if (error) {
        console.error("Error updating approval status:", error);
        toast.error("Failed to update approval status");
        return false;
      }
      
      // Get the request details to send notifications
      const { data: request } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (!request) {
        console.error("Could not find approval request");
        return true;
      }
      
      // Send notification to requester
      let notificationTitle = "";
      let notificationMessage = "";
      
      switch(status) {
        case "under_review":
          notificationTitle = "Approval Request Under Review";
          notificationMessage = `Your approval request for "${request.title}" is now under review`;
          break;
        case "needs_modifications":
          notificationTitle = "Approval Request Needs Modifications";
          notificationMessage = `Your approval request for "${request.title}" requires modifications`;
          break;
        case "approved":
          notificationTitle = "Approval Request Approved";
          notificationMessage = `Your approval request for "${request.title}" has been approved`;
          break;
        default:
          notificationTitle = "Approval Request Updated";
          notificationMessage = `Your approval request for "${request.title}" has been updated`;
      }
      
      await notificationService.sendNotification(
        notificationTitle,
        notificationMessage,
        {
          userIds: [request.requester_id],
          notificationType: "approval_update",
          metadata: {
            request_id: requestId,
            status,
            feedback,
            document_id: request.document_id,
            document_type: request.document_type
          }
        }
      );
      
      // Send email notification
      if (request.requester_id) {
        const { data: requester } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', request.requester_id)
          .single();
          
        if (requester?.email) {
          await emailService.sendEmail({
            to: requester.email,
            subject: notificationTitle,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">${notificationTitle}</h1>
                <p>${notificationMessage}</p>
                ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
                <p>Please log in to the ELIA GO platform for more details.</p>
                <p>Best regards,<br>ELIA GO Team</p>
              </div>
            `
          });
        }
      }
      
      toast.success("Approval status updated successfully");
      return true;
    } catch (error) {
      console.error("Exception updating approval status:", error);
      toast.error("Failed to update approval status");
      return false;
    }
  },
  
  /**
   * Check if a user can approve a request
   */
  canUserApprove: async (requestId: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('approvers, status')
        .eq('id', requestId)
        .single();
      
      if (error || !data) {
        console.error("Error checking approval permissions:", error);
        return false;
      }
      
      // Check if the user is in the list of approvers
      const isApprover = data.approvers.includes(userId);
      
      // Check if the request is in a state that can be approved
      const canBeApproved = ['pending_approval', 'under_review'].includes(data.status);
      
      return isApprover && canBeApproved;
    } catch (error) {
      console.error("Exception checking approval permissions:", error);
      return false;
    }
  }
};

// Helper function to get approver emails
async function getApproverEmails(approverIds: string[]): Promise<string[]> {
  if (!approverIds.length) return [];
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .in('id', approverIds);
    
    if (error || !data) {
      console.error("Error fetching approver emails:", error);
      return [];
    }
    
    return data.map(user => user.email).filter(Boolean) as string[];
  } catch (error) {
    console.error("Exception fetching approver emails:", error);
    return [];
  }
}
