
import { Building, AlertCircle, RefreshCw, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyWithRole } from "@/services/companyService";
import { CompanyCard } from "./CompanyCard";

interface CompanyListContentProps {
  loading: boolean;
  error: string | null;
  companies: CompanyWithRole[];
  onRefresh: () => void;
  onCreateCompany: () => void;
}

export function CompanyListContent({
  loading,
  error,
  companies,
  onRefresh,
  onCreateCompany
}: CompanyListContentProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-primary/50" />
          </div>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center p-6">
        <CardContent className="pt-6">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Error Loading Companies</h3>
          <p className="mt-2 text-muted-foreground">
            {error}
          </p>
          <Button className="mt-4" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (companies.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="pt-6">
          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Companies</h3>
          <p className="mt-2 text-muted-foreground">
            You haven't created or joined any companies yet.
          </p>
          <Button className="mt-4" onClick={onCreateCompany}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );
}
