
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MaterialityIssue } from "../formSchema";

interface KeyInsightsProps {
  issues: MaterialityIssue[];
  companyName?: string; // Make this optional to avoid breaking other usages
}

export function KeyInsights({ issues, companyName }: KeyInsightsProps) {
  return (
    <div>
      <h3 className="font-medium text-lg mb-3">Key Insights</h3>
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>
                {issues.filter(i => i.financialMateriality >= 7 && i.impactMateriality >= 7).length} 
                {" "}issues have high importance for both financial and impact materiality.
              </span>
            </li>
            {issues.length > 0 && (
              <>
                <li className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    The top financial materiality issue is{" "}
                    {issues.sort((a, b) => b.financialMateriality - a.financialMateriality)[0]?.title}.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    The top impact materiality issue is{" "}
                    {issues.sort((a, b) => b.impactMateriality - a.impactMateriality)[0]?.title}.
                  </span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
