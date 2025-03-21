
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarHeaderProps = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

export const SidebarHeader = ({ collapsed, toggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      {!collapsed && (
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/68339245-bb39-49e9-befe-1c3bf86a589b.png" 
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
        className="ml-auto"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
};
