
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to ELIA GO. These Terms of Service govern your use of our website and services.
            By accessing or using our services, you agree to be bound by these Terms.
          </p>
          
          <h2>2. Definitions</h2>
          <p>
            "ELIA GO," "we," "us," and "our" refer to the company operating this platform.
            "User," "you," and "your" refer to individuals and entities that use our services.
          </p>
          
          <h2>3. Use of Services</h2>
          <p>
            Our services are provided for business use related to ESG assessment and sustainability.
            You agree to use our services in compliance with applicable laws and regulations.
          </p>
          
          <h2>4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account.
          </p>
          
          <h2>5. Privacy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand
            how we collect, use, and disclose information about you.
          </p>
          
          <h2>6. Intellectual Property</h2>
          <p>
            Our platform and its contents are protected by intellectual property rights.
            You may not use, reproduce, or distribute our content without permission.
          </p>
          
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to our services
            for violations of these Terms or for any other reason.
          </p>
          
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            Our services are provided "as is" without any warranties, express or implied.
            We do not guarantee that our services will be error-free or uninterrupted.
          </p>
          
          <h2>9. Limitation of Liability</h2>
          <p>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            arising out of or relating to your use of our services.
          </p>
          
          <h2>10. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Continued use of our services after any modifications
            constitutes your acceptance of the revised Terms.
          </p>
          
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@eliago.com.
          </p>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
