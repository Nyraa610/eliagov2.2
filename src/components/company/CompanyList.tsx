
import { supabaseService } from "@/services/base/supabaseService";
import { CompanyListContainer } from "./companies/CompanyListContainer";

interface CompanyListProps {
  maxCompanies?: number;
  onAddSubsidiary?: () => void;
}

export function CompanyList({ maxCompanies, onAddSubsidiary }: CompanyListProps) {
  return (
    <CompanyListContainer
      maxCompanies={maxCompanies}
      onAddSubsidiary={onAddSubsidiary}
    />
  );
}
