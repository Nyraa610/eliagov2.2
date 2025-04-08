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
 * Service for sending emails via Supabase Edge Function
 */
export const emailService = {
  /**
   * Send an email using the configured SMTP server
   */
  sendEmail: async (options: EmailOptions): Promise<EmailResponse> => {
    try {
      console.log("Sending email to:", options.to);
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: options
      });
      const duration = Date.now() - startTime;
      
      console.log(`Send-email function responded in ${duration}ms`);
      
      if (error) {
        console.error("Error invoking send-email function:", error);
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
   * Send a password reset email
   */
  sendPasswordResetEmail: async (email: string, resetLink: string): Promise<EmailResponse> => {
    try {
      console.log("Sending password reset email to:", email);
      console.log("With reset link:", resetLink);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Reset Your Password</h1>
          <p>Hello,</p>
          <p>You recently requested to reset your password for your ELIA GO account. Click the button below to proceed:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">${resetLink}</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The ELIA GO Team</p>
        </div>
      `;
      
      const startTime = Date.now();
      const response = await emailService.sendEmail({
        to: email,
        subject: "Reset Your ELIA GO Password",
        html
      });
      const duration = Date.now() - startTime;
      
      if (!response.success) {
        console.error(`Password reset email failed after ${duration}ms:`, response.error);
      } else {
        console.log(`Password reset email sent successfully in ${duration}ms`);
      }
      
      return {
        ...response,
        details: {
          ...response.details,
          emailType: "passwordReset",
          duration
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
   * Send a test email to verify SMTP configuration
   */
  sendTestEmail: async (toEmail: string): Promise<EmailResponse> => {
    try {
      console.log("Sending test email to:", toEmail);
      
      const config = {
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        username: "olive@eliago.com"
      };
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">SMTP Test Successful!</h1>
          <p>Hello,</p>
          <p>This is a test email to verify that the SMTP configuration for ELIA GO is working correctly.</p>
          <p>If you're receiving this email, it means that:</p>
          <ul>
            <li>Your Gmail SMTP settings are correctly configured</li>
            <li>The Supabase Edge Function is working properly</li>
            <li>Emails can be successfully delivered through your configured SMTP server</li>
          </ul>
          <p>Configuration details:</p>
          <ul>
            <li>SMTP Provider: Gmail</li>
            <li>From: olive@eliago.com</li>
            <li>Test sent: ${new Date().toLocaleString()}</li>
          </ul>
          <p>Best regards,<br>The ELIA GO Team</p>
        </div>
      `;
      
      const startTime = Date.now();
      const response = await emailService.sendEmail({
        to: toEmail,
        subject: "ELIA GO - SMTP Test Email",
        html
      });
      const duration = Date.now() - startTime;
      
      console.log(`Test email ${response.success ? 'success' : 'failed'} in ${duration}ms`);
      
      return {
        ...response,
        details: {
          ...response.details,
          emailType: "test",
          duration,
          smtpConfig: config
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
