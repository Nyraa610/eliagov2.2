
import { CompanyListContainer } from "./companies/CompanyListContainer";

interface CompanyListProps {
  onAddSubsidiary?: () => void;
}

export function CompanyList({ onAddSubsidiary }: CompanyListProps) {
  return (
    <div className="w-full">
      <CompanyListContainer onAddSubsidiary={onAddSubsidiary} />
    </div>
  );
}
