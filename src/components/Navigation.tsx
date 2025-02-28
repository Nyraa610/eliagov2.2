
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSupabase } from "@/services/base/supabaseService";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";

const Navigation = () => {
  const supabase = useSupabase();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get user data from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(profile?.role === 'admin');
          
          // Special case for testing - this email is always admin
          if (session.user.email === 'alex.gon@eliago.com') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };
    
    checkUserRole();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/4a9d4c8d-12c6-4ba9-87b5-132f6c06c33a.png" 
          alt="Elia Go Logo" 
          className="h-10 w-auto"
        />
        <span className="text-lg font-bold">Elia Go</span>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/about">About</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/help">Help</Link>
            </DropdownMenuItem>
            {/* Admin panel link - only visible to admins */}
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin/panel">Admin Panel</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

// Export as both default and named export
export default Navigation;
export { Navigation };
