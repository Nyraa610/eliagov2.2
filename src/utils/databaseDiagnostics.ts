
import { supabase } from "@/lib/supabase";

export async function checkUserActivitiesTable(): Promise<{
  hasTable: boolean;
  hasCompanyIdColumn: boolean;
  message: string;
}> {
  try {
    // Check if user_activities table exists
    const { data: tables, error: tablesError } = await supabase
      .from('user_activities')
      .select('*')
      .limit(1);

    if (tablesError && tablesError.code === 'PGRST204') {
      return {
        hasTable: false,
        hasCompanyIdColumn: false,
        message: 'Table user_activities does not exist'
      };
    }

    // Check if company_id column exists
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('check_column_exists', { 
        table_name: 'user_activities', 
        column_name: 'company_id' 
      });

    if (columnError) {
      return {
        hasTable: true,
        hasCompanyIdColumn: false,
        message: `Error checking company_id column: ${columnError.message}`
      };
    }

    return {
      hasTable: true,
      hasCompanyIdColumn: !!columnInfo,
      message: columnInfo 
        ? 'Table and company_id column exist' 
        : 'Table exists but company_id column is missing'
    };
  } catch (error) {
    console.error('Error checking database schema:', error);
    return {
      hasTable: false,
      hasCompanyIdColumn: false,
      message: `Exception checking schema: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export async function seedFakeActivitiesForUser(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Find the user by email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, company_id, full_name')
      .eq('email', email);

    if (profileError) {
      return {
        success: false,
        message: `Error finding user profile: ${profileError.message}`
      };
    }

    if (!profiles || profiles.length === 0) {
      return {
        success: false,
        message: `No user found with email: ${email}`
      };
    }

    const user = profiles[0];
    
    // Import and use the activity service to seed activities
    const { activityService } = await import('@/services/engagement/activityService');
    const success = await activityService.seedFakeActivities(user.id, user.company_id);

    if (success) {
      return {
        success: true,
        message: `Successfully seeded activities for ${user.full_name || email}`
      };
    } else {
      return {
        success: false,
        message: `Failed to seed activities for ${email}`
      };
    }
  } catch (error) {
    console.error('Error seeding activities:', error);
    return {
      success: false,
      message: `Exception seeding activities: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
