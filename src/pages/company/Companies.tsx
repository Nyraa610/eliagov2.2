
import { CompaniesPage } from "@/components/company/companies/CompaniesPage";
import { UserLayout } from "@/components/user/UserLayout";

export default function Companies() {
  return (
    <UserLayout title="My Companies">
      <CompaniesPage />
    </UserLayout>
  );
}
