
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus } from "lucide-react";
import { useValueChainResults } from "@/hooks/useValueChainResults";
import { ValueChainActions } from "@/components/value-chain/results/ValueChainActions";
import { ViewValueChainTab } from "@/components/value-chain/results/ViewValueChainTab";
import { CreateValueChainTab } from "@/components/value-chain/results/CreateValueChainTab";
import { ValueChainLoading } from "@/components/value-chain/results/ValueChainLoading";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ValueChainResults() {
  const { 
    valueChainData, 
    setValueChainData, 
    handleValueChainChange,
    loading, 
    activeTab, 
    setActiveTab,
    dataChanged
  } = useValueChainResults();

  // Show toast notification on page load if data was already saved
  useEffect(() => {
    if (valueChainData && !loading && !dataChanged) {
      const timer = setTimeout(() => {
        toast.info("Value chain data has been loaded successfully. Any changes will be automatically saved.");
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [valueChainData, loading, dataChanged]);

  return (
    <>
      <h1 className="text-2xl font-bold text-primary mb-4">Value Chain Results</h1>
      <div className="flex flex-col gap-6">
        <ValueChainActions 
          valueChainData={valueChainData} 
          activeTab={activeTab} 
          onValueChainLoad={setValueChainData}
        />

        {loading ? (
          <ValueChainLoading />
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
                <ViewValueChainTab 
                  valueChainData={valueChainData}
                  onValueChainChange={handleValueChainChange} 
                />
              </TabsContent>
            )}
            
            <TabsContent value="create">
              <CreateValueChainTab 
                initialData={valueChainData}
                onValueChainChange={handleValueChainChange}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
