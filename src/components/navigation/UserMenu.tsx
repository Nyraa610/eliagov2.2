
import { Link } from "react-router-dom";
import { LogOut, Settings, User, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/services/base/profileTypes";

interface UserMenuProps {
  userProfile: UserProfile | null;
  onLogout: () => Promise<void>;
}

export const UserMenu = ({ userProfile, onLogout }: UserMenuProps) => {
  const { t } = useTranslation();
  
  const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border border-primary/10">
            <AvatarImage 
              src={userProfile?.avatar_url || ""} 
              alt={userProfile?.full_name || "User profile"} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(userProfile?.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile?.full_name || "User"}
            </p>
            {userProfile?.email && (
              <p className="text-xs text-muted-foreground leading-none mt-1">
                {userProfile.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center w-full cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            {t('navigation.dashboard')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            {t('navigation.profile')}
          </Link>
        </DropdownMenuItem>
        {userProfile?.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin/panel" className="flex items-center w-full cursor-pointer">
              <UserRound className="mr-2 h-4 w-4" />
              {t('navigation.adminPanel')}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="flex items-center cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
