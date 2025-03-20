
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserLayout } from "@/components/user/UserLayout";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, FileText, Download, Plus } from "lucide-react";
import { ValueChainData } from "@/types/valueChain";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ValueChainResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [valueChainData, setValueChainData] = useState<ValueChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "create">("view");

  useEffect(() => {
    console.log("ValueChainResults: Component mounted");
    
    // Get valueChainData from location state
    const stateData = location.state?.valueChainData;
    
    if (stateData) {
      console.log("ValueChainResults: Data found in location state", stateData);
      setValueChainData(stateData);
      // Also save to localStorage as a fallback
      try {
        localStorage.setItem('lastGeneratedValueChain', JSON.stringify(stateData));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      setLoading(false);
    } else {
      console.log("ValueChainResults: No data in location state, checking localStorage");
      // Try to get from localStorage if not in navigation state
      try {
        const savedData = localStorage.getItem('lastGeneratedValueChain');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("ValueChainResults: Data loaded from localStorage", parsedData);
          setValueChainData(parsedData);
        } else {
          console.log("ValueChainResults: No data found in localStorage either");
          // Still allow the user to create from scratch
          setActiveTab("create");
        }
      } catch (error) {
        console.error("Error parsing saved value chain data:", error);
        toast.error("Error loading saved value chain data");
        setActiveTab("create");
      }
      setLoading(false);
    }
  }, [location.state]);

  const handleBackToEditor = () => {
    navigate("/assessment/value-chain");
  };

  const handleSaveResults = () => {
    toast.success("Value chain saved successfully!");
    // You can implement actual saving functionality later
  };

  const handleExportResults = () => {
    if (!valueChainData) return;
    
    try {
      // Create a download for the JSON
      const dataStr = JSON.stringify(valueChainData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportName = valueChainData.name || 'value-chain-export';
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataUri);
      downloadAnchorNode.setAttribute("download", `${exportName}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success("Value chain exported successfully!");
    } catch (error) {
      console.error("Error exporting value chain:", error);
      toast.error("Error exporting value chain");
    }
  };

  return (
    <UserLayout title="Value Chain Results">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToEditor}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Value Chain Editor
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {valueChainData && activeTab === "view" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleExportResults}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSaveResults}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Save Results
                </Button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[500px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "view" | "create")} className="w-full">
            <TabsList className="mb-4">
              {valueChainData && (
                <TabsTrigger value="view" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  View Generated Value Chain
                </TabsTrigger>
              )}
              <TabsTrigger value="create" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create/Edit Value Chain
              </TabsTrigger>
            </TabsList>
            
            {valueChainData && (
              <TabsContent value="view">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      AI Generated Value Chain
                    </CardTitle>
                    <CardDescription>
                      Based on your documents and inputs, we've generated a value chain model for your business.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[800px]">
                      <ValueChainEditor initialData={valueChainData} />
                    </div>
                  </CardContent>
                </Card>
                
                {valueChainData.metadata?.plantUml && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">PlantUML Diagram</CardTitle>
                      <CardDescription>
                        A UML representation of your value chain
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                        {valueChainData.metadata.plantUml}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
            
            <TabsContent value="create">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-500" />
                    Create Your Value Chain
                  </CardTitle>
                  <CardDescription>
                    Build a value chain model from scratch or modify an existing one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[800px]">
                    <ValueChainEditor initialData={valueChainData} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </UserLayout>
  );
}
