
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RichTextEditor } from "./rich-text-editor/RichTextEditor";
import "../../../components/assessment/document-editor/rich-text-editor/RichTextEditor.css";

interface DocumentContentProps {
  documentData: any;
  setDocumentData: (data: any) => void;
  readOnly?: boolean;
}

export function DocumentContent({ 
  documentData, 
  setDocumentData,
  readOnly = false
}: DocumentContentProps) {
  if (!documentData) return <div>Loading document...</div>;

  const handleContentChange = (section: string, content: string) => {
    setDocumentData({
      ...documentData,
      [section]: content
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
          <RichTextEditor 
            content={documentData.executiveSummary || ""} 
            onChange={(content) => handleContentChange("executiveSummary", content)} 
            placeholder="Write the executive summary..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Sustainability in the Mediterranean */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Sustainability in the Mediterranean</h2>
          <RichTextEditor 
            content={documentData.sustainabilityContext || ""} 
            onChange={(content) => handleContentChange("sustainabilityContext", content)} 
            placeholder="Describe the sustainability context..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Why this Assessment Matters */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Why This Assessment Matters</h2>
          <RichTextEditor 
            content={documentData.assessmentImportance || ""} 
            onChange={(content) => handleContentChange("assessmentImportance", content)} 
            placeholder="Explain why this assessment is important..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Our Approach: The Elia Go Methodology</h2>
          <RichTextEditor 
            content={documentData.methodology || ""} 
            onChange={(content) => handleContentChange("methodology", content)} 
            placeholder="Describe the methodology used..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* ESG Assessment */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">1. ESG Assessment Based on ISO 26000</h2>
          <RichTextEditor 
            content={documentData.esgAssessment || ""} 
            onChange={(content) => handleContentChange("esgAssessment", content)} 
            placeholder="Detail the ESG assessment findings..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Carbon Footprint */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">2. Carbon Footprint Snapshot</h2>
          <RichTextEditor 
            content={documentData.carbonFootprint || ""} 
            onChange={(content) => handleContentChange("carbonFootprint", content)} 
            placeholder="Present the carbon footprint data..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Risks & Opportunities */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">3. Risk & Opportunity Matrix</h2>
          
          <h3 className="text-lg font-semibold mb-3">3.1 Risks</h3>
          <RichTextEditor 
            content={documentData.risks || ""} 
            onChange={(content) => handleContentChange("risks", content)} 
            placeholder="List and describe risks..."
            readonly={readOnly}
          />
          
          <h3 className="text-lg font-semibold mb-3 mt-6">3.2 Key Opportunities</h3>
          <RichTextEditor 
            content={documentData.opportunities || ""} 
            onChange={(content) => handleContentChange("opportunities", content)} 
            placeholder="List and describe opportunities..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">4. Sustainability Action Plan</h2>
          
          <h3 className="text-lg font-semibold mb-3">Objective</h3>
          <RichTextEditor 
            content={documentData.actionPlanObjective || ""} 
            onChange={(content) => handleContentChange("actionPlanObjective", content)} 
            placeholder="Define objectives..."
            readonly={readOnly}
          />
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Key Actions</h3>
          <RichTextEditor 
            content={documentData.actionPlanKeyActions || ""} 
            onChange={(content) => handleContentChange("actionPlanKeyActions", content)} 
            placeholder="List key actions..."
            readonly={readOnly}
          />
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Why This Works / Expected Benefits</h3>
          <RichTextEditor 
            content={documentData.actionPlanBenefits || ""} 
            onChange={(content) => handleContentChange("actionPlanBenefits", content)} 
            placeholder="Describe expected benefits..."
            readonly={readOnly}
          />
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Practical Action Roadmap</h3>
          <RichTextEditor 
            content={documentData.actionPlanRoadmap || ""} 
            onChange={(content) => handleContentChange("actionPlanRoadmap", content)} 
            placeholder="Outline the roadmap..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Financial Impact */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">5. Financial Impact Projection</h2>
          <RichTextEditor 
            content={documentData.financialImpact || ""} 
            onChange={(content) => handleContentChange("financialImpact", content)} 
            placeholder="Project financial impacts..."
            readonly={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
}
