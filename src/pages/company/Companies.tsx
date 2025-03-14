
import { UserLayout } from "@/components/user/UserLayout";
import { CompaniesPage } from "@/components/company/companies/CompaniesPage";

export default function Companies() {
  return (
    <UserLayout title="Companies">
      <CompaniesPage />
    </UserLayout>
  );
}
