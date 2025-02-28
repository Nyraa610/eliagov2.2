
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSupabase } from "@/services/base/supabaseService";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
      <Link to="/" className="text-lg font-bold">MyApp</Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" className="p-2 bg-gray-200 rounded">Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
              <Link to="/admin">Admin Panel</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

// Export as both default and named export
export default Navigation;
export { Navigation };
