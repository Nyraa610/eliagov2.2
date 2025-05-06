
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentHeaderProps {
  documentData: any;
  assessmentType: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  documentData,
  assessmentType
}) => {
  const getAssessmentTypeTitle = () => {
    switch (assessmentType) {
      case "esg-diagnostic":
        return "ESG Diagnostic";
      case "carbon-evaluation":
        return "Carbon Evaluation";
      case "action-plan":
        return "Action Plan";
      case "iro":
        return "Risks & Opportunities";
      default:
        return "Assessment";
    }
  };
  
  return (
    <Card className="bg-primary/5">
      <CardContent className="p-6">
        <div className="text-center space-y-2 mb-2">
          <h1 className="text-2xl font-bold text-primary">
            {documentData?.companyName ? `${documentData.companyName} - ` : ""} 
            {getAssessmentTypeTitle()} Report
          </h1>
          <p className="text-gray-600">
            Edit your report content, then export it to PDF or Word format.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
