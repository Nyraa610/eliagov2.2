
import { PersonalActivityItem } from "./PersonalActivityItem";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonalActivitiesListProps {
  activities: Array<any>;
  loading: boolean;
}

function PersonalActivitiesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-start space-x-4 pb-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-3 w-[100px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PersonalActivitiesList({ activities, loading }: PersonalActivitiesListProps) {
  if (loading) {
    return <PersonalActivitiesSkeleton />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No activities yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Your activities will appear here as you use the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <PersonalActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
