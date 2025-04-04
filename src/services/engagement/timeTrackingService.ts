
import { supabase } from "@/lib/supabase";
import { engagementService } from "./index";

class TimeTrackingService {
  private activeTimerId: number | null = null;
  private lastActiveTime: number = Date.now();
  private accumulatedTime: number = 0;
  private isWindowActive: boolean = true;
  private readonly POINT_AWARD_THRESHOLD_MS: number = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly POINTS_PER_THRESHOLD: number = 10;
  private readonly ACTIVITY_CHECK_INTERVAL_MS: number = 60 * 1000; // Check every minute
  private readonly TIME_SUBMISSION_INTERVAL_MS: number = 5 * 60 * 1000; // Submit every 5 minutes

  constructor() {
    // Initialize tracking on service creation
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track when window becomes active/inactive
    window.addEventListener('focus', this.handleWindowActive);
    window.addEventListener('blur', this.handleWindowInactive);
    
    // Track user interactions to detect activity
    window.addEventListener('mousemove', this.resetInactivityTimer);
    window.addEventListener('keydown', this.resetInactivityTimer);
    window.addEventListener('click', this.resetInactivityTimer);
    window.addEventListener('scroll', this.resetInactivityTimer);
    
    // Start the tracking timer
    this.startTracking();
  }

  private handleWindowActive = (): void => {
    console.log('Window became active');
    this.isWindowActive = true;
    this.lastActiveTime = Date.now();
  };

  private handleWindowInactive = (): void => {
    console.log('Window became inactive');
    this.isWindowActive = false;
    
    // Store accumulated time before inactivity
    this.accumulatedTime += Date.now() - this.lastActiveTime;
    
    // Submit accumulated time to the server
    this.submitAccumulatedTime();
  };

  private resetInactivityTimer = (): void => {
    if (!this.isWindowActive) {
      // If window just became active again
      this.isWindowActive = true;
      this.lastActiveTime = Date.now();
    }
  };

  private startTracking(): void {
    if (this.activeTimerId !== null) return;
    
    this.lastActiveTime = Date.now();
    
    // Set up a regular interval to check and submit activity time
    this.activeTimerId = window.setInterval(() => {
      if (this.isWindowActive) {
        const now = Date.now();
        const sessionTime = now - this.lastActiveTime;
        
        // Add the time since last check to accumulated time
        this.accumulatedTime += sessionTime;
        
        // Reset the last active time to now
        this.lastActiveTime = now;
        
        // Check if we've reached the threshold to award points and periodically submit time
        if (this.accumulatedTime >= this.TIME_SUBMISSION_INTERVAL_MS) {
          this.submitAccumulatedTime();
        }
      }
    }, this.ACTIVITY_CHECK_INTERVAL_MS);
  }

  private stopTracking(): void {
    if (this.activeTimerId !== null) {
      window.clearInterval(this.activeTimerId);
      this.activeTimerId = null;
    }
  }

  private async submitAccumulatedTime(): Promise<void> {
    if (this.accumulatedTime <= 0) return;
    
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !sessionData.session.user) {
        console.log("No authenticated user, skipping time tracking");
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Convert to seconds for database storage
      const seconds = Math.floor(this.accumulatedTime / 1000);
      if (seconds <= 0) return;
      
      console.log(`Submitting accumulated time: ${seconds} seconds for user ${userId}`);
      
      // Call our new database function to record time and award points
      const { data, error } = await supabase.rpc('record_user_activity_time', {
        p_user_id: userId,
        p_seconds_active: seconds
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`Time tracking submission result:`, data);
      
      // Reset accumulated time after successful submission
      this.accumulatedTime = 0;
    } catch (error) {
      console.error('Error submitting time tracking data:', error);
      // Don't reset accumulation on error so we can try again later
    }
  }

  // Public method to manually trigger time submission (e.g., on page unload)
  public async submitTime(): Promise<void> {
    // If window is active, add time since last active to accumulated time
    if (this.isWindowActive) {
      this.accumulatedTime += Date.now() - this.lastActiveTime;
      this.lastActiveTime = Date.now();
    }
    
    await this.submitAccumulatedTime();
  }

  // Clean up method to remove event listeners and timers
  public cleanup(): void {
    this.stopTracking();
    
    window.removeEventListener('focus', this.handleWindowActive);
    window.removeEventListener('blur', this.handleWindowInactive);
    window.removeEventListener('mousemove', this.resetInactivityTimer);
    window.removeEventListener('keydown', this.resetInactivityTimer);
    window.removeEventListener('click', this.resetInactivityTimer);
    window.removeEventListener('scroll', this.resetInactivityTimer);
    
    // Submit any remaining time before cleanup
    this.submitTime();
  }
}

// Create and export a singleton instance
export const timeTrackingService = new TimeTrackingService();
