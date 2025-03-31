
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useAuthTracking } from '@/hooks/useAuthTracking';
import { useTeamEngagement } from '@/hooks/useTeamEngagement';

export function EngagementTracker() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const location = useLocation();

  // Check if user is on admin route
  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    setIsAdmin(isAdminRoute);
  }, [location.pathname]);

  // Use our extracted hooks
  useActivityTracking(isAdmin);
  useAuthTracking(isAdmin);
  useTeamEngagement(isAdmin);

  // This component doesn't render anything visible
  return null;
}

export default EngagementTracker;
