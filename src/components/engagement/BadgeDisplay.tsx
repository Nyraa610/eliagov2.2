
import { useEffect, useState } from 'react';
import { engagementService, UserBadge } from '@/services/engagement';
import { Award } from 'lucide-react';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function BadgeDisplay() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      const userBadges = await engagementService.getUserBadges();
      setBadges(userBadges);
      setLoading(false);
    };

    fetchBadges();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm hover:bg-muted cursor-pointer">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-primary font-medium">{badges.length}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <h4 className="font-medium text-sm mb-2">Your Badges</h4>
        <div className="grid grid-cols-3 gap-2">
          <TooltipProvider>
            {badges.map((badge) => (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-2 border rounded-md hover:bg-accent">
                    <Award className="h-6 w-6 text-primary mb-1" />
                    <span className="text-xs text-center font-medium truncate w-full">
                      {badge.badge?.name || 'Badge'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.badge?.name}</p>
                  <p className="text-xs">{badge.badge?.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Earned: {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
