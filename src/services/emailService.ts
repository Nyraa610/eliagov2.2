
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded content
  contentType: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailResponse {
  success: boolean;
  data?: {
    messageId: string;
    recipients: string[];
  };
  error?: string;
  details?: any;
}

/**
 * Service for sending emails via Supabase Auth
 */
export const emailService = {
  /**
   * Send an email using Supabase's configured SMTP server
   */
  sendEmail: async (options: EmailOptions): Promise<EmailResponse> => {
    try {
      console.log("Sending email to:", options.to);
      
      // For emails that don't fit into auth-related categories,
      // we'll use a simplified approach through a specialized edge function
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke("send-supabase-email", {
        body: options
      });
      const duration = Date.now() - startTime;
      
      console.log(`Send-email function responded in ${duration}ms`);
      
      if (error) {
        console.error("Error invoking send-supabase-email function:", error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
          code: error.code,
          status: error.status
        });
        
        toast.error("Failed to send email");
        return { 
          success: false, 
          error: error.message,
          details: {
            type: "supabase_function_error",
            duration,
            errorInfo: {
              message: error.message,
              name: error.name,
              code: error.code,
              status: error.status
            }
          }
        };
      }
      
      console.log("Email sent successfully:", data);
      return {
        ...(data as EmailResponse),
        details: {
          duration,
          responseType: "success"
        }
      };
    } catch (error: any) {
      console.error("Exception sending email:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      toast.error("Failed to send email");
      return { 
        success: false, 
        error: error.message || "Unknown error",
        details: {
          type: "exception",
          errorInfo: {
            message: error.message,
            name: error.name
          }
        }
      };
    }
  },
  
  /**
   * Send a welcome email to a newly registered user
   */
  sendWelcomeEmail: async (email: string, firstName: string): Promise<EmailResponse> => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to ELIA GO!</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with ELIA GO. We're excited to have you on board!</p>
        <p>With ELIA GO, you can:</p>
        <ul>
          <li>Track your sustainability progress</li>
          <li>Access ESG diagnostic tools</li>
          <li>Generate comprehensive reports</li>
          <li>Collaborate with your team</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The ELIA GO Team</p>
      </div>
    `;
    
    return emailService.sendEmail({
      to: email,
      subject: "Welcome to ELIA GO!",
      html
    });
  },
  
  /**
   * Send a notification email about user invitation
   */
  sendInvitationEmail: async (email: string, inviterName: string, companyName: string): Promise<EmailResponse> => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">You've Been Invited!</h1>
        <p>Hello,</p>
        <p>${inviterName} has invited you to join ${companyName} on the ELIA GO platform.</p>
        <p>ELIA GO is a sustainability management platform that helps companies:</p>
        <ul>
          <li>Track ESG metrics</li>
          <li>Generate sustainability reports</li>
          <li>Develop action plans</li>
          <li>Collaborate with team members</li>
        </ul>
        <p>To accept this invitation, please check your email for the verification link or contact the person who invited you.</p>
        <p>Best regards,<br>The ELIA GO Team</p>
      </div>
    `;
    
    return emailService.sendEmail({
      to: email,
      subject: `Invitation to join ${companyName} on ELIA GO`,
      html
    });
  },
  
  /**
   * Send a password reset email using Supabase Auth
   */
  sendPasswordResetEmail: async (email: string, resetLink: string): Promise<EmailResponse> => {
    try {
      console.log("Sending password reset email to:", email);
      
      // Use Supabase's built-in password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetLink,
      });
      
      if (error) {
        console.error("Password reset email error:", error);
        return { 
          success: false, 
          error: error.message,
          details: {
            type: "supabase_auth_error",
            errorInfo: {
              message: error.message,
              name: error.name
            }
          }
        };
      }
      
      console.log("Password reset email sent successfully");
      return {
        success: true,
        data: {
          messageId: "supabase-auth-reset",
          recipients: [email]
        },
        details: {
          emailType: "passwordReset",
          method: "supabase-auth"
        }
      };
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      return { 
        success: false, 
        error: error.message || "Failed to send password reset email",
        details: {
          type: "exception",
          emailType: "passwordReset",
          errorInfo: {
            message: error.message,
            name: error.name
          }
        }
      };
    }
  },
  
  /**
   * Send a test email to verify email configuration
   */
  sendTestEmail: async (toEmail: string): Promise<EmailResponse> => {
    try {
      console.log("Sending test email to:", toEmail);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Email Test Successful!</h1>
          <p>Hello,</p>
          <p>This is a test email to verify that the email configuration for ELIA GO is working correctly.</p>
          <p>If you're receiving this email, it means that:</p>
          <ul>
            <li>Your Supabase SMTP settings are correctly configured</li>
            <li>Emails can be successfully delivered through your configured email provider</li>
          </ul>
          <p>Configuration details:</p>
          <ul>
            <li>Provider: Supabase Auth SMTP</li>
            <li>Test sent: ${new Date().toLocaleString()}</li>
          </ul>
          <p>Best regards,<br>The ELIA GO Team</p>
        </div>
      `;
      
      const startTime = Date.now();
      const response = await emailService.sendEmail({
        to: toEmail,
        subject: "ELIA GO - Email Test",
        html
      });
      const duration = Date.now() - startTime;
      
      console.log(`Test email ${response.success ? 'success' : 'failed'} in ${duration}ms`);
      
      return {
        ...response,
        details: {
          ...response.details,
          emailType: "test",
          duration
        }
      };
    } catch (error: any) {
      console.error("Failed to send test email:", error);
      return { 
        success: false, 
        error: error.message || "Failed to send test email",
        details: {
          type: "exception",
          emailType: "test",
          errorInfo: {
            message: error.message,
            name: error.name
          }
        }
      };
    }
  }
};
