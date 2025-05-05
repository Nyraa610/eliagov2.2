
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function DoubleMaterialityIntro() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Double Materiality Assessment</h2>
        <p className="text-muted-foreground">
          Identify and prioritize ESG issues based on both their financial impact on your company and your company's impact on society and the environment
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> 
            What is Double Materiality?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <strong>Double Materiality</strong> is a concept that considers two perspectives when assessing ESG issues:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Financial Materiality</CardTitle>
                  <CardDescription>Impact on the company</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>How ESG issues affect the financial value, performance, and development of the company</p>
                </CardContent>
              </Card>
              
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Impact Materiality</CardTitle>
                  <CardDescription>Impact on society & environment</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>How the company's activities affect the environment, people, and economy (positive or negative)</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-md bg-muted/50 p-4">
              <h4 className="text-sm font-medium mb-2">Why it matters:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Creates a holistic view of sustainability risks and opportunities</li>
                <li>Aligns with EU legislation (CSRD, SFDR) and global reporting standards</li>
                <li>Helps focus sustainability efforts where they create the most value</li>
                <li>Identifies issues that matter most to both the business and stakeholders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="rounded-md border p-4">
        <h3 className="text-base font-medium mb-2">Assessment Process</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex justify-center items-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-2 mx-auto">1</div>
            <h4 className="text-center text-sm font-medium">Identify Issues</h4>
            <p className="text-center text-xs text-muted-foreground mt-1">Identify relevant material issues</p>
          </div>
          
          <div className="rounded-lg border bg-card p-3">
            <div className="flex justify-center items-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-2 mx-auto">2</div>
            <h4 className="text-center text-sm font-medium">Assess Impact</h4>
            <p className="text-center text-xs text-muted-foreground mt-1">Rate financial & impact materiality</p>
          </div>
          
          <div className="rounded-lg border bg-card p-3">
            <div className="flex justify-center items-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-2 mx-auto">3</div>
            <h4 className="text-center text-sm font-medium">Stakeholder Input</h4>
            <p className="text-center text-xs text-muted-foreground mt-1">Document stakeholder feedback</p>
          </div>
          
          <div className="rounded-lg border bg-card p-3">
            <div className="flex justify-center items-center h-8 w-8 rounded-full bg-primary/10 text-primary mb-2 mx-auto">4</div>
            <h4 className="text-center text-sm font-medium">Create Matrix</h4>
            <p className="text-center text-xs text-muted-foreground mt-1">Visualize & prioritize issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}
