
import React from "react";
import ActionPlanExport from "@/components/integrations/notion/ActionPlanExport";

export default function ActionPlanExportPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Export Action Plan</h1>
      <ActionPlanExport />
    </div>
  );
}
