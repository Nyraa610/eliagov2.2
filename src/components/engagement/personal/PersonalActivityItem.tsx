
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface PersonalActivityItemProps {
  activity: {
    id: string;
    activity_type: string;
    points_earned: number;
    created_at: string;
    metadata?: Record<string, any>;
  };
}

// Helper function to format activity type
const formatActivityType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export function PersonalActivityItem({ activity }: PersonalActivityItemProps) {
  return (
    <div className="flex items-start space-x-4 border-b pb-4 last:border-0">
      <Avatar className="h-8 w-8">
        <AvatarImage src={undefined} />
        <AvatarFallback>
          <span className="text-xs">{activity.activity_type.substring(0, 2).toUpperCase()}</span>
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {formatActivityType(activity.activity_type)}
        </p>
        <p className="text-sm text-muted-foreground">
          +{activity.points_earned} points
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
        {activity.metadata?.path && (
          <p className="text-xs text-muted-foreground">
            Page: {activity.metadata.path}
          </p>
        )}
      </div>
    </div>
  );
}
