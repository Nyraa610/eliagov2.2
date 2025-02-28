import React from "react";
import { Link } from "react-router-dom";
import { useSupabase } from "@/services/base/supabaseService";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const supabase = useSupabase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <Link to="/" className="text-lg font-bold">MyApp</Link>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button className="p-2 bg-gray-200 rounded">Menu</button>
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
          {/* Admin panel link */}
          <DropdownMenuItem asChild>
            <Link to="/admin">Admin Panel</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navigation;
