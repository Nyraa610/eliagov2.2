
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useParams } from "react-router-dom";

type SidebarHeaderProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

export const SidebarHeader = ({ collapsed, toggleSidebar }: SidebarHeaderProps) => {
  const { id } = useParams<{ id: string }>();
  const { company } = useCompanyProfile(id);

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-2">
        {!collapsed && (
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
              alt="Logo" 
              className="h-6 w-6 mr-2" 
            />
            <span className="font-bold text-primary">ELIA GO</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={collapsed ? "mx-auto" : "ml-auto"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && company && (
        <div className="flex flex-col space-y-2">
          <Separator className="my-2" />
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={company.logo_url || undefined} alt={company.name} />
              <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center">
              <span className="text-xs">×</span>
              <span className="text-sm font-medium ml-1 truncate">
                {company.name}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
