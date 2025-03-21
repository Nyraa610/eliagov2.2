
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { useState } from "react";
import { TwoColumnTable } from "./TwoColumnTable";
import { Download, Sparkles } from "lucide-react";
import { AIAnalysis } from "@/components/ai/AIAnalysis";

interface AnalysisFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AnalysisForm({ form, onPrevious, onNext }: AnalysisFormProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  
  const handleAddItem = () => {
    setIsAddingItem(true);
    setEditingIndex(null);
  };

  const handleExport = () => {
    const items = form.getValues().items;
    const risks = items.filter(item => item.type === "risk");
    const opportunities = items.filter(item => item.type === "opportunity");
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Title,Description,Impact,Likelihood,Risk Score,Category,Mitigation Measures\n";
    
    items.forEach(item => {
      const row = [
        item.type,
        `"${item.issueTitle.replace(/"/g, '""')}"`,
        `"${item.description.replace(/"/g, '""')}"`,
        item.impact,
        item.likelihood,
        item.riskScore,
        `"${item.category.replace(/"/g, '""')}"`,
        `"${(item.mitigationMeasures || '').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "iro_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleAIAnalysisComplete = (result: string) => {
    try {
      // Try to parse the AI result as JSON
      const aiSuggestions = JSON.parse(result);
      
      if (Array.isArray(aiSuggestions.risks) || Array.isArray(aiSuggestions.opportunities)) {
        // Get current items
        const currentItems = form.getValues().items || [];
        const newItems = [...currentItems];
        
        // Add new risks
        if (Array.isArray(aiSuggestions.risks)) {
          aiSuggestions.risks.forEach((risk: any) => {
            if (risk.title && risk.description) {
              newItems.push({
                issueTitle: risk.title,
                description: risk.description,
                impact: risk.impact || 2,
                likelihood: risk.likelihood || 2,
                riskScore: risk.impact * risk.likelihood || 4,
                type: "risk",
                category: risk.category || "AI Generated",
                mitigationMeasures: risk.mitigation || ""
              });
            }
          });
        }
        
        // Add new opportunities
        if (Array.isArray(aiSuggestions.opportunities)) {
          aiSuggestions.opportunities.forEach((opportunity: any) => {
            if (opportunity.title && opportunity.description) {
              newItems.push({
                issueTitle: opportunity.title,
                description: opportunity.description,
                impact: opportunity.impact || 2,
                likelihood: opportunity.likelihood || 2,
                riskScore: opportunity.impact * opportunity.likelihood || 4,
                type: "opportunity",
                category: opportunity.category || "AI Generated",
                mitigationMeasures: opportunity.enhancement || ""
              });
            }
          });
        }
        
        // Update form with new items
        form.setValue("items", newItems);
      }
    } catch (error) {
      console.error("Error parsing AI analysis:", error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact, Risks & Opportunities Analysis</CardTitle>
        <CardDescription>
          Identify and assess potential risks and opportunities from your materiality analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
          >
            <Sparkles className="h-4 w-4" /> AI Analysis
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
        
        {showAIAnalysis && (
          <AIAnalysis
            analysisType="esg-assessment"
            title="AI Risk & Opportunity Analysis"
            description="Generate potential risks and opportunities based on your business context"
            placeholder="Describe your business, industry, and key ESG concerns..."
            buttonText="Generate Risks & Opportunities"
            onAnalysisComplete={handleAIAnalysisComplete}
          />
        )}
        
        <TwoColumnTable 
          form={form}
          openItemDialog={handleAddItem}
          isAddingItem={isAddingItem}
          setIsAddingItem={setIsAddingItem}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue to Review
        </Button>
      </CardFooter>
    </Card>
  );
}
