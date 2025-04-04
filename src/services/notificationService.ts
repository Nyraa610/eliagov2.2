
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type NotificationType = 
  | 'assessment_completed' 
  | 'document_uploaded' 
  | 'deliverable_created' 
  | 'message';

export interface Notification {
  id?: string;
  user_id: string;
  sender_id?: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at?: string;
}

export const notificationService = {
  /**
   * Get notifications for the current user
   */
  getUserNotifications: async (limit: number = 20): Promise<Notification[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        return [];
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*, sender:sender_id(full_name, avatar_url, email)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error("Error fetching notifications:", error.message);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Exception fetching notifications:", error);
      return [];
    }
  },
  
  /**
   * Get unread notification count for the current user
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
      
      if (error) {
        console.error("Error fetching unread notification count:", error.message);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error("Exception fetching unread notification count:", error);
      return 0;
    }
  },
  
  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) {
        console.error("Error marking notification as read:", error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception marking notification as read:", error);
      return false;
    }
  },
  
  /**
   * Mark all notifications as read for the current user
   */
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        return false;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
      
      if (error) {
        console.error("Error marking all notifications as read:", error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception marking all notifications as read:", error);
      return false;
    }
  },
  
  /**
   * Create a document upload notification for consultants
   */
  createDocumentNotification: async (
    documentId: string, 
    documentName: string, 
    documentType: string, 
    companyId?: string
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        return false;
      }
      
      // Get user details to include in notification
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email, company_id')
        .eq('id', session.user.id)
        .single();
      
      if (!userProfile) {
        console.error("User profile not found for document notification");
        return false;
      }
      
      // Create notification for all consultants
      const { data: consultants, error: consultantError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'consultant');
      
      if (consultantError) {
        console.error("Error fetching consultants:", consultantError);
        return false;
      }
      
      // Format document type for display
      const formattedType = documentType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      // Create a notification for each consultant
      const notifications = consultants.map(consultant => ({
        user_id: consultant.id,
        sender_id: session.user.id,
        notification_type: 'document_uploaded',
        title: `Document Uploaded`,
        message: `${userProfile.full_name || 'A user'} has uploaded a new ${formattedType} document: ${documentName}`,
        metadata: {
          document_id: documentId,
          document_name: documentName,
          document_type: documentType,
          user_email: userProfile.email,
          company_id: userProfile.company_id || companyId
        },
        is_read: false
      }));
      
      if (notifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);
        
        if (notificationError) {
          console.error("Error creating document notifications:", notificationError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Exception creating document notification:", error);
      return false;
    }
  },
  
  /**
   * Create a notification for specific users or all users in a company
   */
  sendNotification: async (
    title: string,
    message: string,
    options: {
      userIds?: string[];
      companyId?: string;
      notificationType?: NotificationType;
      metadata?: any;
    }
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        return false;
      }
      
      let targetUserIds: string[] = [];
      
      // If specific userIds are provided, use those
      if (options.userIds && options.userIds.length > 0) {
        targetUserIds = options.userIds;
      } 
      // If companyId is provided, send to all users in that company
      else if (options.companyId) {
        const { data: companyUsers, error: companyError } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', options.companyId);
        
        if (companyError) {
          console.error("Error fetching company users:", companyError);
          return false;
        }
        
        targetUserIds = companyUsers.map(user => user.id);
      }
      
      if (targetUserIds.length === 0) {
        console.error("No target users found for notification");
        return false;
      }
      
      // Create notifications for each target user
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        sender_id: session.user.id,
        notification_type: options.notificationType || 'message',
        title,
        message,
        metadata: options.metadata || {},
        is_read: false
      }));
      
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) {
        console.error("Error sending notifications:", error);
        return false;
      }
      
      toast.success("Notification sent successfully");
      return true;
    } catch (error) {
      console.error("Exception sending notification:", error);
      toast.error("Failed to send notification");
      return false;
    }
  }
};
