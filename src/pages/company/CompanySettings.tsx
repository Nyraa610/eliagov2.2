import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/user/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyGeneralSettings } from "@/components/company/settings/CompanyGeneralSettings";
import { CompanyAPIConnectors } from "@/components/company/settings/CompanyAPIConnectors";
import { CompanyUserManagement } from "@/components/company/settings/CompanyUserManagement";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

export default function CompanySettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, isAdmin, loading } = useCompanyProfile(id || "");
  
  useEffect(() => {
    if (company && !loading) {
      navigate(`/company/${id}`, { replace: true });
    }
  }, [company, loading, id, navigate]);

  return (
    <UserLayout title="Company Settings">
      <div className="flex justify-center p-8">
        <p>Redirecting to company profile...</p>
      </div>
    </UserLayout>
  );
}
