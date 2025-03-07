
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, ClipboardList, Users, LineChart } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: JSX.Element;
}

interface DiagnosticTabsProps {
  activeTab: string;
}

export function DiagnosticTabs({ activeTab }: DiagnosticTabsProps) {
  const tabs: Tab[] = [
    { id: "company-info", label: "Company Information", icon: <Building className="h-4 w-4 mr-2" /> },
    { id: "practices", label: "Current Practices", icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { id: "stakeholders", label: "Stakeholders", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "challenges", label: "Challenges & Goals", icon: <LineChart className="h-4 w-4 mr-2" /> }
  ];

  return (
    <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
      {tabs.map(tab => (
        <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
          {tab.icon} {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
