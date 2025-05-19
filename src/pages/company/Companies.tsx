
import { CompaniesPage } from "@/components/company/companies/CompaniesPage";
import { UserLayout } from "@/components/user/UserLayout";

export default function Companies() {
  return (
    <UserLayout title="My Companies">
      <div className="w-full max-w-7xl mx-auto px-4">
        <CompaniesPage />
      </div>
    </UserLayout>
  );
}
