
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";

export default function Pricing() {
  // Load the Stripe pricing table script
  useEffect(() => {
    // Only load the script if it hasn't been loaded already
    if (!document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')) {
      const script = document.createElement('script');
      script.src = "https://js.stripe.com/v3/pricing-table.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-primary">Plans & Pricing</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your ESG journey. All plans include a 7-day free trial.
          </p>
        </div>
        
        {/* Stripe Pricing Table */}
        <div className="w-full flex justify-center">
          <stripe-pricing-table 
            pricing-table-id="prctbl_1RCjRMIPLzwJ5m9RmNhmv18P"
            publishable-key="pk_test_51Q2veiIPLzwJ5m9R6ltlPGOF813zFvAuC3ZmCHAjOc8rgOxDxZ0hNA4gQv5fsbKHQDX6amBAln57dRFLwt98Sxrl00t1VnCkps">
          </stripe-pricing-table>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Need a custom enterprise plan?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            For organizations with specialized needs, we offer custom enterprise plans with dedicated support and advanced features.
          </p>
          <a 
            href="mailto:contact@eliargo.com" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Contact Us
          </a>
        </div>
      </main>
    </div>
  );
}
