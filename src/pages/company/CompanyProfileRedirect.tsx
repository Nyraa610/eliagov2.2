
import { UserLayout } from "@/components/user/UserLayout";
import { CompanyProfileRedirect } from "@/components/company/CompanyProfileRedirect";

export default function CompanyRedirect() {
  return (
    <UserLayout>
      <CompanyProfileRedirect />
    </UserLayout>
  );
}
