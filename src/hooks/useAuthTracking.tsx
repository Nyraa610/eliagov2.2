
import { useEffect } from 'react';
import { engagementService } from '@/services/engagement';
import { supabase } from '@/lib/supabase';

export function useAuthTracking(isAdmin: boolean, isAuthenticated: boolean = true) {
  // Track user login - skip for admin routes or if not authenticated
  useEffect(() => {
    if (isAdmin || !isAuthenticated) return;
    
    const checkUserAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Tracking login activity (initial session check)");
          
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
        } else {
          console.log("No active session found, skipping login tracking");
        }
      } catch (error) {
        console.warn("Auth check error in EngagementTracker:", error);
      }
    };

    checkUserAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          try {
            console.log("Tracking login activity (auth state change)");
            
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
  }, [isAdmin, isAuthenticated]);
}
