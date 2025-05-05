
import React from "react";
import { MaterialityIssue } from "../formSchema";

interface MaterialityIssuesSummaryProps {
  issues: MaterialityIssue[];
}

export function MaterialityIssuesSummary({ issues }: MaterialityIssuesSummaryProps) {
  return (
    <div>
      <h3 className="font-medium text-lg mb-3">Material Issues Summary</h3>
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div key={issue.id || index} className="border p-3 rounded-md">
            <div className="flex justify-between">
              <h4 className="font-medium">{issue.title}</h4>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  issue.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                  issue.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {issue.category}
                </span>
              </div>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <div className="text-sm">
                Financial: <span className="font-medium">{issue.financialMateriality}/10</span>
              </div>
              <div className="text-sm">
                Impact: <span className="font-medium">{issue.impactMateriality}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
