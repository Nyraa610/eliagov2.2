
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface TeamActivityItemProps {
  activity: {
    id: string;
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
    activity_type: string;
    points_earned: number;
    created_at: string;
  };
}

// Helper function to format activity type
const formatActivityType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export function TeamActivityItem({ activity }: TeamActivityItemProps) {
  return (
    <div className="flex items-start space-x-4 border-b pb-4 last:border-0">
      <Avatar className="h-8 w-8">
        <AvatarImage src={activity.profiles?.avatar_url} />
        <AvatarFallback>{(activity.profiles?.full_name || 'User').substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {activity.profiles?.full_name || 'Team Member'}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatActivityType(activity.activity_type)} (+{activity.points_earned} points)
        </p>
        <p className="text-xs text-muted-foreground">
          {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
