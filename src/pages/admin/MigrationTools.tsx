
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, LucideLoader2 } from "lucide-react";

export default function MigrationTools() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const { toast } = useToast();

  const runMigration = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      // Get the current session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("Authentication required");
      }

      const response = await fetch("https://tqvylbkavunzlckhqxcl.supabase.co/functions/v1/migrate-existing-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionData.session.access_token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to run migration");
      }

      setResult(data);
      
      toast({
        title: "Migration Complete",
        description: data.message,
        variant: "default",
      });
    } catch (error) {
      console.error("Migration error:", error);
      
      setResult({
        success: false,
        message: error.message || "An unknown error occurred"
      });
      
      toast({
        title: "Migration Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Migration Tools">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Migrate Existing Users</CardTitle>
            <CardDescription>
              This tool will create a default "Elia Go" company and assign all users without a company to it.
              Use this to ensure all existing users have a company association.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result && (
              <div className={`p-4 rounded-md mb-4 ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  )}
                  <div>
                    <p className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                      {result.success ? "Success" : "Error"}
                    </p>
                    <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-32">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={runMigration} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <LucideLoader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Running Migration..." : "Run Migration"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
}
