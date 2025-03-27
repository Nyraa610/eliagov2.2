
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FrameworkSelectionProps {
  onFrameworkSelected: (framework: string) => void;
}

export function FrameworkSelection({ onFrameworkSelected }: FrameworkSelectionProps) {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);

  const handleFrameworkChange = (value: string) => {
    setSelectedFramework(value);
  };

  const handleContinue = () => {
    if (selectedFramework) {
      onFrameworkSelected(selectedFramework);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Carbon Footprint Evaluation</CardTitle>
        <CardDescription>
          Measure and understand your organization's greenhouse gas emissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">What is a Carbon Evaluation?</h3>
          <p className="text-gray-600">
            A carbon evaluation, also known as a carbon footprint assessment, measures the total greenhouse 
            gas emissions caused directly and indirectly by your organization. It helps identify emission 
            hotspots and opportunities for reduction strategies.
          </p>
          
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <Info className="h-4 w-4" />
            <AlertTitle className="text-amber-800">Disclaimer</AlertTitle>
            <AlertDescription className="text-amber-700">
              This evaluation provides an estimate with potential error margins. Results may vary based on
              data quality, methodology specifics, and emission factors used. For regulatory compliance or 
              official reporting, we recommend working with certified carbon accounting professionals.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-4">Select a Carbon Accounting Framework</h3>
          <RadioGroup 
            value={selectedFramework || ""} 
            onValueChange={handleFrameworkChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className={`border rounded-lg p-4 transition-all ${selectedFramework === 'ghg-protocol' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-400'}`}>
              <RadioGroupItem value="ghg-protocol" id="ghg-protocol" className="sr-only" />
              <Label 
                htmlFor="ghg-protocol" 
                className="flex items-start cursor-pointer h-full"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-base font-medium">GHG Protocol</h4>
                    {selectedFramework === 'ghg-protocol' && (
                      <CheckCircle className="h-5 w-5 text-primary ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    The most widely used international accounting framework for governments and 
                    businesses to understand, quantify, and manage greenhouse gas emissions.
                  </p>
                </div>
              </Label>
            </div>
            
            <div className={`border rounded-lg p-4 transition-all ${selectedFramework === 'bilan-carbone' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-400'}`}>
              <RadioGroupItem value="bilan-carbone" id="bilan-carbone" className="sr-only" />
              <Label 
                htmlFor="bilan-carbone" 
                className="flex items-start cursor-pointer h-full"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-base font-medium">Bilan Carbone (ADEME)</h4>
                    {selectedFramework === 'bilan-carbone' && (
                      <CheckCircle className="h-5 w-5 text-primary ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    A methodology developed by the French Environment and Energy Management Agency (ADEME), 
                    widely used in France and Europe for comprehensive carbon assessments.
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedFramework}
            size="lg"
            className="px-8"
          >
            Continue with {selectedFramework === 'ghg-protocol' ? 'GHG Protocol' : selectedFramework === 'bilan-carbone' ? 'Bilan Carbone' : 'Selected Framework'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
