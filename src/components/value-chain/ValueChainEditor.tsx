
import { useState, useEffect } from "react";
import { ValueChainData } from "@/types/valueChain";
import { ValueChainEditorContainer } from "./editor/ValueChainEditorContainer";
import { valueChainService } from "@/services/value-chain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReactFlowProvider } from "@xyflow/react";

interface ValueChainEditorProps {
  initialData?: ValueChainData | null;
}

export function ValueChainEditor({ initialData }: ValueChainEditorProps) {
  const [loading, setLoading] = useState(initialData === undefined);
  const [valueChainData, setValueChainData] = useState<ValueChainData | null>(initialData || null);
  const { company } = useCompanyProfile();
  const [error, setError] = useState<string | null>(null);

  // If initialData wasn't provided, try to load it
  useEffect(() => {
    const loadValueChain = async () => {
      if (!company || initialData !== undefined) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await valueChainService.loadValueChain(company.id);
        setValueChainData(data);
      } catch (error) {
        console.error("Error loading value chain:", error);
        setError("Failed to load your company's value chain data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (company) {
      loadValueChain();
    }
  }, [company, initialData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ReactFlowProvider>
      <ValueChainEditorContainer initialData={valueChainData} />
    </ReactFlowProvider>
  );
}
