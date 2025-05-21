import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import React from "react";
import { FileText, ExternalLink, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ActionPlanResults() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Action Plan Results</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/assessment/action-plan')}>
            Back to Editor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Action Plan Summary</h2>
          
          {/* Placeholder content - would be replaced with actual data */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium mb-2">Short-term Goals</h3>
              <p className="text-gray-700">
                Implement waste reduction program across all departments by Q3 2025.
                Reduce energy consumption by 15% through efficiency improvements.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">Long-term Goals</h3>
              <p className="text-gray-700">
                Achieve carbon neutrality for all operations by 2030.
                Transition 75% of supply chain to sustainable partners by 2028.
              </p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">Key Initiatives</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Company-wide sustainability training program</li>
                <li>Installation of renewable energy sources at main facilities</li>
                <li>Green procurement policy implementation</li>
                <li>Annual sustainability report publication</li>
              </ul>
            </section>
          </div>
        </Card>
        
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Export Options</h2>
            <div className="space-y-3">
              <Button className="w-full flex items-center justify-start gap-2" variant="outline" asChild>
                <a href="#" download>
                  <FileText className="h-4 w-4" />
                  Download as PDF
                </a>
              </Button>
              
              <Button className="w-full flex items-center justify-start gap-2" variant="outline" asChild>
                <a href="#" download>
                  <FileText className="h-4 w-4" />
                  Download as Word
                </a>
              </Button>
              
              <Button 
                className="w-full flex items-center justify-start gap-2" 
                variant="outline"
                onClick={() => navigate('/action-plan-export')}
                disabled={!isAuthenticated}
              >
                <Database className="h-4 w-4" />
                Export to Notion
              </Button>
              
              <Button className="w-full flex items-center justify-start gap-2" variant="outline">
                <ExternalLink className="h-4 w-4" />
                Share as Link
              </Button>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <div className="space-y-2 text-sm">
              <p>- Share action plan with stakeholders</p>
              <p>- Set up tracking mechanisms for initiatives</p>
              <p>- Schedule quarterly review meetings</p>
              <p>- Assign owners to each initiative</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
