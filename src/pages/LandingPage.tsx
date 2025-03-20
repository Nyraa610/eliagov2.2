
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl">
              Empower Your Business with ESG Excellence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Transform your Mediterranean SME with our comprehensive ESG platform. 
              Get a detailed diagnosis, understand your impacts, and build a sustainable future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose ELIA GO?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform provides comprehensive tools and insights to help your business thrive in the sustainable economy.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div 
                  key={feature.title} 
                  className="bg-card border rounded-lg p-6 shadow-sm"
                >
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Your ESG Journey?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of Mediterranean businesses already transforming their operations with ELIA GO.
            </p>
            <Link to="/register">
              <Button size="lg">Get Started Now</Button>
            </Link>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}

const features = [
  {
    title: "ESG Assessment",
    description: "Get a comprehensive analysis of your company's ESG performance through our advanced diagnostic tools."
  },
  {
    title: "Impact Analysis",
    description: "Understand your business's environmental and social impacts with detailed insights and recommendations."
  },
  {
    title: "Strategy Development",
    description: "Create a tailored ESG strategy that aligns with your business goals and stakeholder expectations."
  },
  {
    title: "Training & Education",
    description: "Access expert-led training modules to build your team's ESG capabilities and knowledge."
  },
  {
    title: "Performance Tracking",
    description: "Monitor your progress with real-time metrics and comprehensive reporting tools."
  },
  {
    title: "Mediterranean Focus",
    description: "Specialized insights and solutions designed specifically for Mediterranean SMEs."
  }
];
