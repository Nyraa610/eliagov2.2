
import { TeamActivityItem } from "./TeamActivityItem";
import { TeamActivitiesSkeleton } from "./TeamActivitiesSkeleton";

interface TeamActivitiesListProps {
  activities: Array<any>;
  loading: boolean;
}

export function TeamActivitiesList({ activities, loading }: TeamActivitiesListProps) {
  if (loading) {
    return <TeamActivitiesSkeleton />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No team activities yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Activities will appear here when your team members use the platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => (
        <TeamActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
