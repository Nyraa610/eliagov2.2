
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { valueChainService } from "@/services/valueChainService";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ValueChainModeling() {
  const [loading, setLoading] = useState(true);
  const [valueChainData, setValueChainData] = useState(null);
  const { company, loading: companyLoading } = useCompanyProfile();

  useEffect(() => {
    const loadValueChain = async () => {
      if (!company) return;
      
      setLoading(true);
      try {
        const data = await valueChainService.loadValueChain(company.id);
        if (data) {
          setValueChainData(data);
        }
      } catch (error) {
        console.error("Error loading value chain:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!companyLoading && company) {
      loadValueChain();
    }
  }, [company, companyLoading]);

  return (
    <UserLayout title="Value Chain Modeling">
      <div className="flex items-center gap-2 mb-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <Link to="/assessment">
            <ChevronLeft className="h-4 w-4" />
            Back to Assessment
          </Link>
        </Button>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Model your company's value chain to better understand your activities and their impact. Use the AI generation feature to get started quickly.
      </p>

      {loading || companyLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      ) : (
        <ValueChainEditor initialData={valueChainData} />
      )}
    </UserLayout>
  );
}
