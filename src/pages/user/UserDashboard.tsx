
import { UserLayout } from "@/components/user/UserLayout";

export function UserDashboard() {
  return (
    <UserLayout title="Dashboard">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          This is your user dashboard. You can view your progress, manage your profile, and access your assessments here.
        </p>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <p>Your dashboard is currently in development. Check back soon for more features!</p>
        </div>
      </div>
    </UserLayout>
  );
}
