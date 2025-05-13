import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { ArrowRight, BarChart, Shield, Leaf, Users, Check, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Vérifier l'état d'authentification au chargement de la page
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      // Configurer un écouteur pour les changements d'authentification
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );
      
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    };
    
    checkUser();
  }, []);
  
  // Fonction pour gérer le clic sur "Get Started"
  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Your Path to ESG Excellence
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Simplify your sustainability journey with comprehensive ESG analytics and reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Remplacer le Link par un Button qui utilise la fonction handleGetStarted */}
            <Button size="lg" className="px-8" onClick={handleGetStarted}>
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/features">
              <Button size="lg" variant="outline" className="px-8">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Le reste de votre code reste inchangé */}
      {/* Features Grid */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ESG Assessment</h3>
              <p className="text-gray-600">Comprehensive diagnostic tools to evaluate your company's ESG performance.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Management</h3>
              <p className="text-gray-600">Stay current with regulations and standards across all ESG dimensions.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Carbon Footprint</h3>
              <p className="text-gray-600">Track, measure, and reduce your organization's environmental impact.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stakeholder Engagement</h3>
              <p className="text-gray-600">Tools to engage with investors, employees, and the community.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Plans Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Flexible Plans for Every Business</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Choose the perfect plan to support your company's sustainability goals.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-gray-500 mb-4">Get started with basic ESG tools</p>
              <div className="text-3xl font-bold mb-6">$0</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Basic ESG assessment</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Limited reporting templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Community support</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">Learn More</Button>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-primary relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Kickstart ESG</h3>
              <p className="text-gray-500 mb-4">Essential tools for SMEs</p>
              <div className="text-3xl font-bold mb-6">$99<span className="text-base font-normal">/mo</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Full ESG assessment suite</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Carbon emission calculator</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Advanced reporting</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button className="w-full">See Details</Button>
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-bold mb-2">SustainOps</h3>
              <p className="text-gray-500 mb-4">Complete sustainability platform</p>
              <div className="text-3xl font-bold mb-6">$299<span className="text-base font-normal">/mo</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Enterprise ESG governance</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Value chain analysis</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Team collaboration tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link to="/pricing">
                <Button variant="outline" className="w-full">See Details</Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-12">
            <Link to="/pricing">
              <Button variant="default" size="lg" className="gap-2">
                <CreditCard className="h-5 w-5" />
                View All Plans & Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Aussi mettre à jour ce bouton pour rediriger vers login ou dashboard */}
      <section className="py-16 bg-primary text-white px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your ESG Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of organizations making progress on their sustainability goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white hover:bg-gray-100 text-primary px-8"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white hover:bg-gray-100 text-primary px-8"
                onClick={() => navigate("/register")}
              >
                Sign Up Free
              </Button>
            )}
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="text-white border border-white hover:bg-white/10 px-8">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-medium mb-4">ELIA GO</h3>
            <p className="mb-4">Your partner in sustainable business transformation.</p>
          </div>
          
          <div>
            <h4 className="text-white text-base font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-base font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-base font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          &copy; {new Date().getFullYear()} ELIA GO. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
