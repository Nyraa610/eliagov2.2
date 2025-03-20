
import { UserLayout } from "@/components/user/UserLayout";

export function CompanyDashboard() {
  return (
    <UserLayout title="Company Dashboard">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Company Overview</h2>
        <p className="text-muted-foreground">
          This is your company dashboard. You can manage your company's ESG performance, view reports, and access assessment tools.
        </p>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <p>Your company dashboard is currently in development. Check back soon for more features!</p>
        </div>
      </div>
    </UserLayout>
  );
}
