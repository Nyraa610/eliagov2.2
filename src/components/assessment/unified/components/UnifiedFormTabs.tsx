
import { Building2, Leaf, Users, ShieldCheck, FileCheck } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface UnifiedFormTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  steps: string[];
  progress: number;
}

export function UnifiedFormTabs({ activeTab, setActiveTab, steps, progress }: UnifiedFormTabsProps) {
  const handleValueChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <TabsList className="grid grid-cols-5 mb-4">
      <TabsTrigger 
        value="company" 
        className="flex items-center gap-1"
        onClick={() => handleValueChange("company")}
        data-state={activeTab === "company" ? "active" : "inactive"}
      >
        <Building2 className="h-4 w-4" /> Company
      </TabsTrigger>
      <TabsTrigger 
        value="environmental" 
        className="flex items-center gap-1"
        onClick={() => handleValueChange("environmental")}
        data-state={activeTab === "environmental" ? "active" : "inactive"}
      >
        <Leaf className="h-4 w-4" /> Environmental
      </TabsTrigger>
      <TabsTrigger 
        value="social" 
        className="flex items-center gap-1"
        onClick={() => handleValueChange("social")}
        data-state={activeTab === "social" ? "active" : "inactive"}
      >
        <Users className="h-4 w-4" /> Social
      </TabsTrigger>
      <TabsTrigger 
        value="governance" 
        className="flex items-center gap-1"
        onClick={() => handleValueChange("governance")}
        data-state={activeTab === "governance" ? "active" : "inactive"}
      >
        <ShieldCheck className="h-4 w-4" /> Governance
      </TabsTrigger>
      <TabsTrigger 
        value="review" 
        className="flex items-center gap-1"
        onClick={() => handleValueChange("review")}
        data-state={activeTab === "review" ? "active" : "inactive"}
      >
        <FileCheck className="h-4 w-4" /> Review
      </TabsTrigger>
    </TabsList>
  );
}
