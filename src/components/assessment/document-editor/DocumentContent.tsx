
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "./rich-text-editor/RichTextEditor";
import { MarkdownEditor } from "./markdown-editor/MarkdownEditor";
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
  const [editorType, setEditorType] = useState<"rich-text" | "markdown">("rich-text");
  
  if (!documentData) return <div>Loading document...</div>;

  const handleContentChange = (section: string, content: string) => {
    setDocumentData({
      ...documentData,
      [section]: content
    });
  };

  const renderEditor = (content: string, section: string) => {
    if (editorType === "markdown") {
      return (
        <MarkdownEditor 
          content={content} 
          onChange={(newContent) => handleContentChange(section, newContent)} 
          placeholder={`Write ${section} content...`}
          readonly={readOnly}
        />
      );
    } else {
      return (
        <RichTextEditor 
          content={content} 
          onChange={(newContent) => handleContentChange(section, newContent)} 
          placeholder={`Write ${section} content...`}
          readonly={readOnly}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end mb-4">
          <Tabs value={editorType} onValueChange={(value) => setEditorType(value as "rich-text" | "markdown")}>
            <TabsList>
              <TabsTrigger value="rich-text">Rich Text</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
      
      {/* Executive Summary */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
          {renderEditor(documentData.executiveSummary || "", "executiveSummary")}
        </CardContent>
      </Card>

      {/* Sustainability in the Mediterranean */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Sustainability in the Mediterranean</h2>
          {renderEditor(documentData.sustainabilityContext || "", "sustainabilityContext")}
        </CardContent>
      </Card>

      {/* Why this Assessment Matters */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Why This Assessment Matters</h2>
          {renderEditor(documentData.assessmentImportance || "", "assessmentImportance")}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">Our Approach: The Elia Go Methodology</h2>
          {renderEditor(documentData.methodology || "", "methodology")}
        </CardContent>
      </Card>

      {/* ESG Assessment */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">1. ESG Assessment Based on ISO 26000</h2>
          {renderEditor(documentData.esgAssessment || "", "esgAssessment")}
        </CardContent>
      </Card>

      {/* Carbon Footprint */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">2. Carbon Footprint Snapshot</h2>
          {renderEditor(documentData.carbonFootprint || "", "carbonFootprint")}
        </CardContent>
      </Card>

      {/* Risks & Opportunities */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">3. Risk & Opportunity Matrix</h2>
          
          <h3 className="text-lg font-semibold mb-3">3.1 Risks</h3>
          {renderEditor(documentData.risks || "", "risks")}
          
          <h3 className="text-lg font-semibold mb-3 mt-6">3.2 Key Opportunities</h3>
          {renderEditor(documentData.opportunities || "", "opportunities")}
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">4. Sustainability Action Plan</h2>
          
          <h3 className="text-lg font-semibold mb-3">Objective</h3>
          {renderEditor(documentData.actionPlanObjective || "", "actionPlanObjective")}
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Key Actions</h3>
          {renderEditor(documentData.actionPlanKeyActions || "", "actionPlanKeyActions")}
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Why This Works / Expected Benefits</h3>
          {renderEditor(documentData.actionPlanBenefits || "", "actionPlanBenefits")}
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Practical Action Roadmap</h3>
          {renderEditor(documentData.actionPlanRoadmap || "", "actionPlanRoadmap")}
        </CardContent>
      </Card>

      {/* Financial Impact */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">5. Financial Impact Projection</h2>
          {renderEditor(documentData.financialImpact || "", "financialImpact")}
        </CardContent>
      </Card>
    </div>
  );
}
