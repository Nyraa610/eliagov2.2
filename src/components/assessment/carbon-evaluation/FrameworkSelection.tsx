
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface FrameworkSelectionProps {
  onFrameworkSelected: (framework: string) => void;
}

export function FrameworkSelection({ onFrameworkSelected }: FrameworkSelectionProps) {
  return (
    <div className="space-y-6">
      {/* Recommended Learning Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-primary">Recommended Learning</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <h3 className="text-base font-medium mb-1">Carbon Assessment 101</h3>
              <p className="text-sm text-muted-foreground mb-3">
                New to carbon assessments? Learn the fundamentals before starting your evaluation.
              </p>
              <Button asChild variant="secondary" size="sm">
                <Link to="/training/courses/carbon101">
                  Start Learning
                </Link>
              </Button>
            </div>
            <div className="hidden sm:block border-l border-primary/10 h-24" />
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-1">What you'll learn:</h4>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                <li>Carbon accounting principles</li>
                <li>Scopes 1, 2, and 3 emissions</li>
                <li>Data collection best practices</li>
                <li>Interpreting and reporting results</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Carbon Evaluation Framework</h2>
        <p className="text-gray-600 mb-4">
          Select the carbon accounting methodology that best fits your organization's needs.
          Different frameworks have varying approaches to measuring and categorizing emissions.
        </p>
        
        <Alert className="mb-6">
          <AlertTitle>Important Disclaimer</AlertTitle>
          <AlertDescription>
            Carbon assessments involve inherent uncertainties and may have error margins of 5-20% depending on data quality.
            Results should be viewed as estimates to guide decision-making rather than precise measurements.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>GHG Protocol</CardTitle>
            <CardDescription>
              Global standard for measuring and managing greenhouse gas emissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Developed by World Resources Institute (WRI) and World Business Council for Sustainable Development (WBCSD).
              Widely adopted corporate standard that categorizes emissions into three scopes.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onFrameworkSelected("ghg-protocol")} className="w-full">Select</Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle>Bilan Carbone</CardTitle>
            <CardDescription>
              Comprehensive French methodology developed by ADEME
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Detailed approach that considers the entire life cycle of products and services.
              Well-suited for European organizations and provides excellent guidance for data collection.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onFrameworkSelected("bilan-carbone")} className="w-full">Select</Button>
          </CardFooter>
        </Card>
        
        <Card className="hover:border-primary/50 cursor-pointer transition-colors border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Elia Carbon Evaluation</CardTitle>
            <CardDescription>
              Simplified Bilan Carbone approach for SMEs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Streamlined methodology based on Bilan Carbone, but optimized for small and medium enterprises.
              Easier data collection with practical guidance at each step.
            </p>
            <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 border-green-200">
              Recommended for SMEs
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onFrameworkSelected("elia-carbon")} className="w-full">Select</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
