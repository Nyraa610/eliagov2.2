
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { checkUserActivitiesTable, seedFakeActivitiesForUser } from "@/utils/databaseDiagnostics";

export default function DiagnosticsPage() {
  const [userEmail, setUserEmail] = useState<string>("alex.gon26@gmail.com");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [seedingResult, setSeedingResult] = useState<any>(null);
  const { toast } = useToast();

  const checkTableStatus = async () => {
    setIsLoading(true);
    try {
      const status = await checkUserActivitiesTable();
      setTableStatus(status);
    } catch (error) {
      console.error("Error checking table status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check database status."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkTableStatus();
  }, []);

  const handleSeedActivities = async () => {
    if (!userEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address."
      });
      return;
    }

    setIsSeeding(true);
    setSeedingResult(null);
    
    try {
      const result = await seedFakeActivitiesForUser(userEmail);
      setSeedingResult(result);
      
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Success" : "Error",
        description: result.message
      });

      // Refresh table status after seeding
      if (result.success) {
        await checkTableStatus();
      }
    } catch (error) {
      console.error("Error seeding activities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to seed activities due to an exception."
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Engagement Diagnostics</h1>
            <p className="text-muted-foreground">Check and fix user activities tracking</p>
          </div>
          <Button
            variant="outline"
            onClick={checkTableStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>Check user_activities table structure</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tableStatus ? (
                <div className="space-y-4">
                  <Alert variant={tableStatus.hasTable ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {tableStatus.hasTable ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <AlertTitle>User Activities Table</AlertTitle>
                    </div>
                    <AlertDescription>
                      {tableStatus.hasTable ? "Table exists" : "Table does not exist"}
                    </AlertDescription>
                  </Alert>

                  <Alert variant={tableStatus.hasCompanyIdColumn ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {tableStatus.hasCompanyIdColumn ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <AlertTitle>Company ID Column</AlertTitle>
                    </div>
                    <AlertDescription>
                      {tableStatus.hasCompanyIdColumn 
                        ? "Column exists" 
                        : "Column does not exist - this is why activities aren't being tracked"}
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <h3 className="font-medium mb-2">Diagnosis</h3>
                    <p className="text-sm text-muted-foreground">{tableStatus.message}</p>
                    
                    {!tableStatus.hasCompanyIdColumn && (
                      <div className="mt-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500 inline mr-2" />
                        <span className="text-sm font-medium">
                          The company_id column is missing from the user_activities table. 
                          This is why activities are failing to be tracked.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  Failed to retrieve database status
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seed User Activities</CardTitle>
              <CardDescription>Add fake activities for a user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Email</label>
                  <Input 
                    value={userEmail} 
                    onChange={(e) => setUserEmail(e.target.value)} 
                    placeholder="Enter user email"
                  />
                </div>

                <Button 
                  onClick={handleSeedActivities} 
                  disabled={isSeeding || !userEmail}
                  className="w-full"
                >
                  {isSeeding ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Seeding Activities...
                    </>
                  ) : (
                    "Seed Fake Activities"
                  )}
                </Button>

                {seedingResult && (
                  <Alert variant={seedingResult.success ? "default" : "destructive"} className="mt-4">
                    <div className="flex items-center gap-2">
                      {seedingResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <AlertTitle>{seedingResult.success ? "Success" : "Error"}</AlertTitle>
                    </div>
                    <AlertDescription>{seedingResult.message}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>This will create 10 fake activities for the specified user, adding points and updating engagement stats.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!tableStatus?.hasCompanyIdColumn && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Fix Database Issues</CardTitle>
              <CardDescription>Add the missing company_id column</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <AlertTitle>SQL Migration Required</AlertTitle>
                  <AlertDescription>
                    To fix the issue, you need to add the company_id column to the user_activities table. Run the following SQL in the Supabase SQL editor:
                  </AlertDescription>
                </Alert>

                <div className="bg-black text-white p-4 rounded-md overflow-auto">
                  <pre className="text-sm">
{`-- Add company_id column to user_activities table
ALTER TABLE public.user_activities 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Fix the RPC function to check if column exists
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO result;
  
  RETURN result;
END;
$$;`}
                  </pre>
                </div>

                <p className="text-sm text-muted-foreground">
                  After running this SQL, refresh the page to check if the issue was resolved.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
