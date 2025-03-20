
import { UserLayout } from "@/components/user/UserLayout";

export function AssessmentPage() {
  return (
    <UserLayout title="Assessment">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">ESG Assessment</h2>
        <p className="text-muted-foreground">
          This is your assessment page. You can complete various ESG assessments to understand your company's sustainability performance.
        </p>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <p>The assessment tools are currently in development. Check back soon!</p>
        </div>
      </div>
    </UserLayout>
  );
}
