
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>
            At ELIA GO, we are committed to protecting your privacy. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our website and services.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            We may collect information that you provide directly to us, such as when you create an account,
            use our services, or communicate with us. This may include:
          </p>
          <ul>
            <li>Personal information, such as your name, email address, and company details</li>
            <li>Account information, including your username and password</li>
            <li>Profile information, such as your job title and profile picture</li>
            <li>Company data related to ESG assessments and sustainability metrics</li>
            <li>Payment information when you subscribe to our services</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We may use the information we collect for various purposes, including:
          </p>
          <ul>
            <li>Providing, maintaining, and improving our services</li>
            <li>Processing transactions and managing your account</li>
            <li>Sending you technical notices, updates, and administrative messages</li>
            <li>Responding to your comments, questions, and customer service requests</li>
            <li>Developing new products and services</li>
            <li>Monitoring and analyzing usage patterns and trends</li>
          </ul>
          
          <h2>4. Information Sharing</h2>
          <p>
            We may share your information with third parties in certain circumstances:
          </p>
          <ul>
            <li>With service providers who perform services on our behalf</li>
            <li>In response to legal process or government requests</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with a business transfer, such as a merger or acquisition</li>
          </ul>
          
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information from unauthorized access,
            alteration, disclosure, or destruction.
          </p>
          
          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information,
            such as the right to access, correct, or delete your data.
          </p>
          
          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting
            the new Privacy Policy on this page.
          </p>
          
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@eliago.com.
          </p>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
