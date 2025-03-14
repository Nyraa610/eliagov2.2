
import { Building2, Leaf, Users, ShieldCheck, FileCheck } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UnifiedFormTabsProps {
  onValueChange: (value: string) => void;
}

export function UnifiedFormTabs({ onValueChange }: UnifiedFormTabsProps) {
  return (
    <TabsList className="grid grid-cols-5 mb-4">
      <TabsTrigger value="company" className="flex items-center gap-1">
        <Building2 className="h-4 w-4" /> Company
      </TabsTrigger>
      <TabsTrigger value="environmental" className="flex items-center gap-1">
        <Leaf className="h-4 w-4" /> Environmental
      </TabsTrigger>
      <TabsTrigger value="social" className="flex items-center gap-1">
        <Users className="h-4 w-4" /> Social
      </TabsTrigger>
      <TabsTrigger value="governance" className="flex items-center gap-1">
        <ShieldCheck className="h-4 w-4" /> Governance
      </TabsTrigger>
      <TabsTrigger value="goals" className="flex items-center gap-1">
        <FileCheck className="h-4 w-4" /> Goals
      </TabsTrigger>
    </TabsList>
  );
}
