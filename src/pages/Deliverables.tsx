
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliverablesList } from "@/components/documents/DeliverablesList";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function Deliverables() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserCompany = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setCompanyId(data.company_id);
          }
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
        toast({
          title: "Error",
          description: "Failed to load company information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserCompany();
  }, [toast]);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{t("deliverables.title")}</h1>
        <p className="text-gray-600">
          {t("deliverables.description")}
        </p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : companyId ? (
            <DeliverablesList companyId={companyId} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-1">No company associated</h3>
              <p className="text-muted-foreground">
                You need to be associated with a company to view deliverables
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reports">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : companyId ? (
            <DeliverablesList companyId={companyId} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-1">No company associated</h3>
              <p className="text-muted-foreground">
                You need to be associated with a company to view reports
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analyses">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : companyId ? (
            <DeliverablesList companyId={companyId} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-1">No company associated</h3>
              <p className="text-muted-foreground">
                You need to be associated with a company to view analyses
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="certifications">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : companyId ? (
            <DeliverablesList companyId={companyId} />
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-1">No company associated</h3>
              <p className="text-muted-foreground">
                You need to be associated with a company to view certifications
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
