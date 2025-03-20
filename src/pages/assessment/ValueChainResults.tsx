
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserLayout } from "@/components/user/UserLayout";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { ValueChainData } from "@/types/valueChain";
import { Skeleton } from "@/components/ui/skeleton";

export default function ValueChainResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [valueChainData, setValueChainData] = useState<ValueChainData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get valueChainData from location state or localStorage
    const data = location.state?.valueChainData;
    
    if (data) {
      setValueChainData(data);
      setLoading(false);
      // Also save to localStorage as a fallback
      localStorage.setItem('lastGeneratedValueChain', JSON.stringify(data));
    } else {
      // Try to get from localStorage if not in navigation state
      const savedData = localStorage.getItem('lastGeneratedValueChain');
      if (savedData) {
        try {
          setValueChainData(JSON.parse(savedData));
        } catch (error) {
          console.error("Error parsing saved value chain data:", error);
        }
      }
      setLoading(false);
    }
  }, [location.state]);

  const handleBackToEditor = () => {
    navigate("/assessment/value-chain");
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
            {valueChainData && (
              <Button variant="default" className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                Save Results
              </Button>
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
        ) : valueChainData ? (
          <>
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
                <div className="h-[600px]">
                  <ValueChainEditor initialData={valueChainData} />
                </div>
              </CardContent>
            </Card>
            
            {valueChainData.metadata?.plantUml && (
              <Card>
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
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Generated Value Chain Found</CardTitle>
              <CardDescription>
                Return to the Value Chain Editor to generate a new value chain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleBackToEditor}>
                Go to Value Chain Editor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}
