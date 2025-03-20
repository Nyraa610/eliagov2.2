
import { UserLayout } from "@/components/user/UserLayout";

export function Companies() {
  return (
    <UserLayout title="Companies">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Manage Companies</h2>
        <p className="text-muted-foreground">
          View and manage your companies.
        </p>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Companies</h3>
          <p>Company management is currently in development. Check back soon!</p>
        </div>
      </div>
    </UserLayout>
  );
}
