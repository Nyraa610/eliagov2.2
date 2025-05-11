
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
      
      // Call the send-email-native function which will handle the email sending
      const { data, error } = await supabase.functions.invoke("send-email-native", {
        body: options
      });
      
      if (error) {
        console.error("Error sending email:", error);
        toast.error("Failed to send email");
        return { 
          success: false, 
          error: error.message,
          details: {
            type: "supabase_function_error",
            errorInfo: {
              message: error.message,
              name: error.name,
            }
          }
        };
      }
      
      // Handle the case where we got a successful response but there was an error in the function
      if (data && !data.success) {
        console.error("Email function error:", data.error);
        toast.error(data.error || "Failed to send email");
        return {
          success: false,
          error: data.error || "Failed to send email",
          details: data.details || {}
        };
      }
      
      console.log("Email sent successfully:", data);
      
      return {
        success: true,
        data: {
          messageId: data?.messageId || `email-${Date.now()}`,
          recipients: Array.isArray(options.to) ? options.to : [options.to]
        },
        details: data
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
        
        // Make the error message more user-friendly
        let userFriendlyMessage = "Failed to send password reset email";
        
        if (error.message.includes("SMTP") || error.message.includes("network")) {
          userFriendlyMessage = "Email service is currently unavailable. Please try again later.";
        } else if (error.message.includes("rate limit")) {
          userFriendlyMessage = "Too many reset attempts. Please wait a few minutes before trying again.";
        } else if (error.message.includes("not found") || error.message.includes("does not exist")) {
          userFriendlyMessage = "No account found with this email address.";
        }
        
        return { 
          success: false, 
          error: userFriendlyMessage,
          details: {
            type: "supabase_auth_error",
            errorInfo: {
              message: error.message,
              name: error.name,
              originalMessage: error.message
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
        error: "Unable to process your request. Please try again later.",
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
  sendTestEmail: async (email: string) => {
    try {
      console.log("Sending test email to:", email);
      const startTime = Date.now();
      
      // Use Supabase Auth's reset password email to send a custom email template
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
        data: {
          subject: "Test Email from ELIA GO",
          html_content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              <h1 style="color: #4F46E5;">SMTP Test Email</h1>
              <p>Hello,</p>
              <p>This is a test email sent from ELIA GO's email configuration to verify that your Supabase Authentication email settings are working correctly.</p>
              <p>If you received this email, it means your email configuration is working properly.</p>
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
            </div>
          `,
          is_test_email: true,
          is_custom_email: true
        }
      });
      
      const duration = Date.now() - startTime;
      
      if (error) {
        console.error("Test email error:", error);
        return {
          success: false,
          error: error.message,
          details: {
            error: error.message,
            name: error.name,
            duration
          }
        };
      }
      
      return {
        success: true,
        message: `Test email sent successfully to ${email}`,
        details: {
          method: "supabase-auth-reset",
          duration
        }
      };
    } catch (error: any) {
      console.error("Error sending test email:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        details: error
      };
    }
  }
};
