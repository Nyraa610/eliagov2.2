
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Download, FileText } from "lucide-react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { assessmentService } from "@/services/assessment";
import { MarkdownEditor } from "@/components/assessment/document-editor/markdown-editor/MarkdownEditor";
import { toast as sonnerToast } from "sonner";

export default function MarkdownDocumentEditor() {
  const { assessmentType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { company } = useCompanyProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!assessmentType) {
          toast({
            title: "Error",
            description: "Assessment type is required",
            variant: "destructive"
          });
          navigate("/assessment");
          return;
        }
        
        // Fetch document data from the service
        const data = await assessmentService.getDocumentTemplate(assessmentType);
        
        // If company exists, populate the template with company data
        if (company) {
          data.companyName = company.name;
          data.industry = company.industry || "Not specified";
        }
        
        setDocumentData(data);
        
        // Check if there's already saved markdown content
        if (data.markdownContent) {
          setMarkdownContent(data.markdownContent);
        } else {
          // Generate initial markdown content if none exists
          const initialMarkdown = `# ${data.title || 'Sustainability Report'}
## For ${data.companyName || 'Your Company'}

*${data.date || new Date().toLocaleDateString()}*

## Executive Summary

${data.executiveSummary || 'This document provides an executive summary of our sustainability assessment findings.'}

## Sustainability Context

${data.sustainabilityContext || 'Context information about sustainability in the Mediterranean region.'}

## Why This Assessment Matters

${data.assessmentImportance || 'Explanation of why this assessment is important for your organization.'}

## Our Approach: The Methodology

${data.methodology || 'Description of the methodology used for this assessment.'}

## Key Findings

### 1. ESG Assessment

${data.esgAssessment || 'Results of the ESG assessment based on ISO 26000.'}

### 2. Carbon Footprint

${data.carbonFootprint || 'Analysis of your organization\'s carbon footprint.'}

### 3. Risk & Opportunity Matrix

#### Risks

${data.risks || 'Key sustainability risks identified.'}

#### Opportunities

${data.opportunities || 'Key sustainability opportunities identified.'}

## Action Plan

### Objective

${data.actionPlanObjective || 'The main objective of the sustainability action plan.'}

### Key Actions

${data.actionPlanKeyActions || 'List of key actions to take.'}

### Expected Benefits

${data.actionPlanBenefits || 'Benefits expected from implementing the action plan.'}

### Implementation Roadmap

${data.actionPlanRoadmap || 'Timeline and steps for implementing the action plan.'}

## Financial Impact

${data.financialImpact || 'Analysis of the financial impact of sustainability initiatives.'}

![Sustainability Image](https://images.unsplash.com/photo-1649972904349-6e44c42644a7)
`;
          
          setMarkdownContent(initialMarkdown);
        }
      } catch (error) {
        console.error("Failed to fetch document data:", error);
        toast({
          title: "Error",
          description: "Failed to load document template",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assessmentType, company, navigate, toast]);
  
  const handleBack = () => {
    navigate(`/assessment/${assessmentType}-results`);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      sonnerToast.loading("Saving document...");
      
      // Update document data with markdown content
      const updatedDocumentData = {
        ...documentData,
        markdownContent: markdownContent // Store the full markdown document
      };
      
      const success = await assessmentService.saveDocumentData(
        assessmentType || '', 
        updatedDocumentData
      );
      
      if (success) {
        sonnerToast.success("Document saved successfully");
      } else {
        sonnerToast.error("Failed to save document");
      }
    } catch (error) {
      console.error("Failed to save document:", error);
      sonnerToast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };
  
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      setExporting(format);
      sonnerToast.loading(`Exporting as ${format.toUpperCase()}...`);
      
      // Add markdown content to the document data before exporting
      const exportData = {
        ...documentData,
        markdownContent,
        content: markdownContent // Some exporters might look for this field
      };
      
      // Prepare filename
      const companyName = documentData?.companyName || 'company';
      const cleanCompanyName = companyName.toLowerCase().replace(/\s+/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileExtension = format === 'word' ? 'docx' : 'pdf';
      const filename = `${cleanCompanyName}-${assessmentType}-${dateStr}.${fileExtension}`;
      
      // Call the export function from assessmentService
      const success = await assessmentService.exportDocument(
        assessmentType || '', 
        exportData, 
        format, 
        filename
      );
      
      if (success) {
        sonnerToast.success(`${format.toUpperCase()} export completed. Your document has been downloaded.`);
      } else {
        sonnerToast.error(`Failed to export as ${format}`);
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      sonnerToast.error(`Failed to export as ${format}`);
    } finally {
      setExporting(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null || saving}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport('word')}
            disabled={exporting !== null || saving}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {exporting === 'word' ? 'Exporting...' : 'Export Word'}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Document"}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {documentData.title || "Sustainability Report"}
              {documentData.companyName && ` - ${documentData.companyName}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {documentData.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <div className="markdown-document-editor">
            <MarkdownEditor
              content={markdownContent}
              onChange={setMarkdownContent}
              placeholder="Write your document..."
              className="min-h-[500px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-8 pb-8">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null || saving}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport('word')}
            disabled={exporting !== null || saving}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {exporting === 'word' ? 'Exporting...' : 'Export Word'}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Document"}
          </Button>
        </div>
      </div>
    </div>
  );
}
