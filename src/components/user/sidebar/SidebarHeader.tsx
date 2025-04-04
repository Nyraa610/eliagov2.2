
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
              alt="Elia GO Logo" 
              className="h-6 w-6" 
            />
            
            {company && (
              <>
                <span className="text-xs mx-2">×</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={company.logo_url || undefined} alt={company.name} />
                  <AvatarFallback className="text-xs">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </>
            )}
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
          <div className="flex items-center">
            <span className="text-sm font-medium truncate">
              {company.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
