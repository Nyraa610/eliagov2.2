
import { UserLayout } from "@/components/user/UserLayout";

export function CreateCompany() {
  return (
    <UserLayout title="Create Company">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Create a New Company</h2>
        <p className="text-muted-foreground">
          Set up a new company profile.
        </p>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Company Creation Form</h3>
          <p>Company creation is currently in development. Check back soon!</p>
        </div>
      </div>
    </UserLayout>
  );
}
