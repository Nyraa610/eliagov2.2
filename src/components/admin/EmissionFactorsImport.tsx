
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function EmissionFactorsImport() {
  const [url, setUrl] = useState("https://www.data.gouv.fr/fr/datasets/r/4437996f-c67a-455c-abaa-774c4c874bab");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success?: boolean; 
    message?: string; 
    error?: string;
    details?: {
      headers?: string[];
      mappedColumns?: Record<string, number>;
    }
  } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please enter a valid URL to the emission factors CSV file."
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('import-emission-factors', {
        body: { url }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      setResult(functionData);
      
      if (functionData.success) {
        toast({
          title: "Import Successful",
          description: functionData.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: functionData.error || "An unknown error occurred"
        });
      }
    } catch (error) {
      console.error("Error importing emission factors:", error);
      setResult({ error: error.message || "Failed to import emission factors" });
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          ADEME Emission Factors Import
        </CardTitle>
        <CardDescription>
          Import emission factors from ADEME Base Carbone into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="csv-url" className="text-sm font-medium">
            CSV File URL
          </label>
          <Input
            id="csv-url"
            placeholder="https://example.com/emission-factors.csv"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Enter the URL to the ADEME Base Carbone CSV file. The default URL is pre-filled.
          </p>
          
          <div className="bg-muted p-3 rounded-md mt-2">
            <div className="flex gap-2 items-center text-sm mb-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Expected CSV Format</span>
            </div>
            <p className="text-xs text-muted-foreground">
              The CSV should be semicolon-separated with French or English headers. The importer will automatically detect and map 
              columns for: Code/ID, Name, Category, Tags/Subcategory, Unit, CO2 Value, Uncertainty, and Source.
            </p>
          </div>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{result.success ? "Import Successful" : "Import Failed"}</AlertTitle>
            <AlertDescription>
              {result.message || result.error || "Unknown result"}
              {result.details && (
                <div className="mt-2 text-xs">
                  {result.details.headers && (
                    <div className="mt-1">
                      <strong>CSV Headers:</strong> {result.details.headers.join(', ')}
                    </div>
                  )}
                  {result.details.mappedColumns && (
                    <div className="mt-1">
                      <strong>Mapped columns:</strong> 
                      <ul className="list-disc pl-5 mt-1">
                        {Object.entries(result.details.mappedColumns)
                          .map(([key, value]) => value >= 0 ? (
                            <li key={key}>{key}: column {value} ({result.details?.headers?.[value] || 'unknown'})</li>
                          ) : null)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleImport} 
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? "Importing..." : "Import Emission Factors"}
        </Button>
      </CardFooter>
    </Card>
  );
}
