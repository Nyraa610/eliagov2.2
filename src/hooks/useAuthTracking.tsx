
import { useEffect } from 'react';
import { engagementService } from '@/services/engagement';
import { supabase } from '@/lib/supabase';

export function useAuthTracking(isAdmin: boolean) {
  // Track user login - skip for admin routes
  useEffect(() => {
    if (isAdmin) return;
    
    const checkUserAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          // Record login activity
          await engagementService.trackActivity({
            activity_type: 'login',
            points_earned: 5,
            metadata: {
              event: 'initial_session_check',
              timestamp: new Date().toISOString()
            }
          }).catch(err => {
            console.warn("Could not track login activity", err);
          });
        }
      } catch (error) {
        console.warn("Auth check error in EngagementTracker:", error);
      }
    };

    checkUserAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && !isAdmin) {
          try {
            await engagementService.trackActivity({
              activity_type: 'login',
              points_earned: 5,
              metadata: {
                event: 'auth_state_change',
                auth_event: event,
                timestamp: new Date().toISOString()
              }
            }).catch(err => {
              console.warn("Could not track login activity on auth change", err);
            });
          } catch (error) {
            console.warn("Auth change error in EngagementTracker:", error);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isAdmin]);
}
