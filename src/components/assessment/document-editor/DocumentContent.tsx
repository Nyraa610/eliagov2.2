
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface DocumentContentProps {
  documentData: any;
  setDocumentData: React.Dispatch<React.SetStateAction<any>>;
  isEditMode: boolean;
}

export const DocumentContent: React.FC<DocumentContentProps> = ({
  documentData,
  setDocumentData,
  isEditMode
}) => {
  if (!documentData) {
    return <div>No document data available.</div>;
  }
  
  const handleInputChange = (section: string, field: string, value: string) => {
    setDocumentData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handleDirectChange = (field: string, value: string) => {
    setDocumentData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  
  const renderEditableField = (label: string, value: string, onChange: (value: string) => void) => {
    if (isEditMode) {
      return (
        <div className="mb-4">
          <Label className="mb-2 block">{label}</Label>
          {label.toLowerCase().includes('description') || value.length > 50 ? (
            <Textarea 
              value={value} 
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[100px]"
            />
          ) : (
            <Input 
              value={value} 
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </div>
      );
    }
    
    return (
      <div className="mb-4">
        <h4 className="text-lg font-medium mb-2">{label}</h4>
        <div className="prose prose-sm max-w-none">
          {value.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-2">{paragraph}</p>
          ))}
        </div>
      </div>
    );
  };
  
  const renderExecutiveSummary = () => {
    const section = documentData.executiveSummary || {};
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Executive Summary</h2>
        {renderEditableField(
          "Summary",
          section.summary || "This executive summary provides an overview of the sustainability assessment findings and recommended actions.",
          (value) => handleInputChange("executiveSummary", "summary", value)
        )}
      </div>
    );
  };
  
  const renderApproach = () => {
    const section = documentData.approach || {};
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Our Approach: the Elia Go Methodology</h2>
        {renderEditableField(
          "Methodology Description",
          section.description || "The Elia Go methodology combines international standards with Mediterranean-specific insights to deliver actionable sustainability recommendations.",
          (value) => handleInputChange("approach", "description", value)
        )}
      </div>
    );
  };
  
  const renderESGAssessment = () => {
    const section = documentData.esgAssessment || {
      introduction: "This ESG assessment provides a comprehensive review of current sustainability practices and identifies areas for improvement, using the ISO 26000 framework as a reference for responsible business conduct.",
      pillars: [
        {
          name: "Organizational Governance",
          assessment: "Formal governance structure with sustainability oversight."
        },
        {
          name: "Human Rights",
          assessment: "Strong policies in place with room for enhanced implementation."
        },
        {
          name: "Labor Practices",
          assessment: "Good employee relations with opportunity for more formal training."
        },
        {
          name: "Environment",
          assessment: "Basic environmental management with substantial improvement opportunities."
        },
        {
          name: "Fair Operating Practices",
          assessment: "Ethical business practices need more formal documentation."
        },
        {
          name: "Consumer Issues",
          assessment: "Strong customer focus with potential for improvement in sustainability communication."
        },
        {
          name: "Community Involvement",
          assessment: "Some community engagement with room for strategic expansion."
        }
      ]
    };
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">1. ESG Assessment Based on ISO 26000</h2>
        
        {renderEditableField(
          "Introduction",
          section.introduction,
          (value) => handleInputChange("esgAssessment", "introduction", value)
        )}
        
        <h3 className="text-xl font-semibold mt-6">ISO 26000 Core Subjects & Assessment</h3>
        
        {isEditMode ? (
          <div className="border rounded-lg overflow-hidden">
            {section.pillars.map((pillar: any, index: number) => (
              <div key={index} className={`p-4 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">Pillar Name</Label>
                    <Input 
                      value={pillar.name} 
                      onChange={(e) => {
                        const newPillars = [...section.pillars];
                        newPillars[index].name = e.target.value;
                        handleInputChange("esgAssessment", "pillars", newPillars);
                      }}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Assessment</Label>
                    <Textarea 
                      value={pillar.assessment} 
                      onChange={(e) => {
                        const newPillars = [...section.pillars];
                        newPillars[index].assessment = e.target.value;
                        handleInputChange("esgAssessment", "pillars", newPillars);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pillar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment & Opportunities</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {section.pillars.map((pillar: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pillar.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{pillar.assessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  const renderCarbonFootprint = () => {
    const section = documentData.carbonFootprint || {
      introduction: "This section provides a snapshot of the organization's carbon footprint across all relevant emission scopes.",
      summary: "Based on our assessment, the total carbon footprint is approximately X tonnes CO2e annually.",
      recommendations: "Key areas for emission reduction include energy efficiency improvements, renewable energy adoption, and optimizing transportation logistics."
    };
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">2. Carbon Footprint Snapshot</h2>
        
        {renderEditableField(
          "Introduction",
          section.introduction,
          (value) => handleInputChange("carbonFootprint", "introduction", value)
        )}
        
        {renderEditableField(
          "Summary",
          section.summary,
          (value) => handleInputChange("carbonFootprint", "summary", value)
        )}
        
        {renderEditableField(
          "Recommendations",
          section.recommendations,
          (value) => handleInputChange("carbonFootprint", "recommendations", value)
        )}
      </div>
    );
  };
  
  const renderRiskOpportunity = () => {
    const section = documentData.riskOpportunity || {
      introduction: "This matrix highlights the key sustainability risks and opportunities identified during the assessment.",
      risks: [
        { title: "Regulatory Risk", description: "Increasing compliance requirements for sustainability reporting." },
        { title: "Resource Scarcity", description: "Potential supply chain disruptions due to water scarcity in Mediterranean regions." },
        { title: "Climate Change Impact", description: "Physical risk to assets from extreme weather events." }
      ],
      opportunities: [
        { title: "Energy Efficiency", description: "Potential for significant cost reduction through energy efficiency measures." },
        { title: "Green Marketing", description: "Growing consumer preference for sustainable products and services." },
        { title: "Circular Economy", description: "Opportunities for waste reduction and resource recovery." }
      ]
    };
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">3. Risk & Opportunity Matrix</h2>
        
        {renderEditableField(
          "Introduction",
          section.introduction,
          (value) => handleInputChange("riskOpportunity", "introduction", value)
        )}
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold">3.1. Risks</h3>
          
          {isEditMode ? (
            <div className="space-y-4 mt-4">
              {section.risks.map((risk: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-1 block">Risk Title</Label>
                      <Input 
                        value={risk.title} 
                        onChange={(e) => {
                          const newRisks = [...section.risks];
                          newRisks[index].title = e.target.value;
                          handleInputChange("riskOpportunity", "risks", newRisks);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Description</Label>
                      <Textarea 
                        value={risk.description} 
                        onChange={(e) => {
                          const newRisks = [...section.risks];
                          newRisks[index].description = e.target.value;
                          handleInputChange("riskOpportunity", "risks", newRisks);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {section.risks.map((risk: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium">{risk.title}</h4>
                  <p className="text-gray-600 mt-1">{risk.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold">3.2. Key Opportunities</h3>
          
          {isEditMode ? (
            <div className="space-y-4 mt-4">
              {section.opportunities.map((opportunity: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-1 block">Opportunity Title</Label>
                      <Input 
                        value={opportunity.title} 
                        onChange={(e) => {
                          const newOpportunities = [...section.opportunities];
                          newOpportunities[index].title = e.target.value;
                          handleInputChange("riskOpportunity", "opportunities", newOpportunities);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Description</Label>
                      <Textarea 
                        value={opportunity.description} 
                        onChange={(e) => {
                          const newOpportunities = [...section.opportunities];
                          newOpportunities[index].description = e.target.value;
                          handleInputChange("riskOpportunity", "opportunities", newOpportunities);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {section.opportunities.map((opportunity: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium">{opportunity.title}</h4>
                  <p className="text-gray-600 mt-1">{opportunity.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderActionPlan = () => {
    const section = documentData.actionPlan || {
      objective: "Develop and implement a comprehensive sustainability strategy that reduces environmental impact while enhancing business performance.",
      keyActions: [
        "Establish formal sustainability governance and reporting structure",
        "Implement energy efficiency measures across all locations",
        "Develop and roll out supplier sustainability assessment program",
        "Launch employee engagement campaign on sustainability topics"
      ],
      benefits: "This approach integrates sustainability into core business operations, leading to cost savings, improved reputation, enhanced compliance, and better prepared for future regulations.",
      roadmap: [
        { timeframe: "Immediate (1-3 months)", actions: "Form sustainability committee, conduct baseline assessments" },
        { timeframe: "Short-term (3-6 months)", actions: "Implement quick wins in energy efficiency, develop policies" },
        { timeframe: "Medium-term (6-12 months)", actions: "Roll out supplier program, staff training" },
        { timeframe: "Long-term (1-2 years)", actions: "Renewable energy transition, circular economy initiatives" }
      ]
    };
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">4. Sustainability Action Plan</h2>
        
        {renderEditableField(
          "Objective",
          section.objective,
          (value) => handleInputChange("actionPlan", "objective", value)
        )}
        
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Key Actions:</h3>
          
          {isEditMode ? (
            <div className="space-y-2 mt-2">
              {section.keyActions.map((action: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={action} 
                    onChange={(e) => {
                      const newActions = [...section.keyActions];
                      newActions[index] = e.target.value;
                      handleInputChange("actionPlan", "keyActions", newActions);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-1 mt-2">
              {section.keyActions.map((action: string, index: number) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          )}
        </div>
        
        {renderEditableField(
          "Why This Works / Expected Benefits",
          section.benefits,
          (value) => handleInputChange("actionPlan", "benefits", value)
        )}
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Practical Action Roadmap</h3>
          
          {isEditMode ? (
            <div className="space-y-4 mt-4">
              {section.roadmap.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-1 block">Timeframe</Label>
                      <Input 
                        value={item.timeframe} 
                        onChange={(e) => {
                          const newRoadmap = [...section.roadmap];
                          newRoadmap[index].timeframe = e.target.value;
                          handleInputChange("actionPlan", "roadmap", newRoadmap);
                        }}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Actions</Label>
                      <Textarea 
                        value={item.actions} 
                        onChange={(e) => {
                          const newRoadmap = [...section.roadmap];
                          newRoadmap[index].actions = e.target.value;
                          handleInputChange("actionPlan", "roadmap", newRoadmap);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {section.roadmap.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <h4 className="font-medium text-primary">{item.timeframe}</h4>
                    <div className="mt-2 md:mt-0">
                      <p className="text-gray-600">{item.actions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderFinancialImpact = () => {
    const section = documentData.financialImpact || {
      introduction: "This section outlines the projected financial impacts of implementing the recommended sustainability actions.",
      summary: "Based on our analysis, implementing the full action plan is expected to result in net positive financial returns within 2-3 years through cost savings and new business opportunities.",
      details: "Key financial benefits include reduced energy costs (15-20% savings potential), waste management savings (10-15%), and potential new revenue from sustainable products and services."
    };
    
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">5. Financial Impact Projection</h2>
        
        {renderEditableField(
          "Introduction",
          section.introduction,
          (value) => handleInputChange("financialImpact", "introduction", value)
        )}
        
        {renderEditableField(
          "Summary",
          section.summary,
          (value) => handleInputChange("financialImpact", "summary", value)
        )}
        
        {renderEditableField(
          "Details",
          section.details,
          (value) => handleInputChange("financialImpact", "details", value)
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {renderEditableField(
            "Document Title",
            documentData.title || "Sustainability Assessment and Action Plan",
            (value) => handleDirectChange("title", value)
          )}
        </h1>
        
        <h2 className="text-xl text-gray-600 mb-2">
          {renderEditableField(
            "Company Name",
            `For ${documentData.companyName || "Your Company"}`,
            (value) => handleDirectChange("companyName", value.replace("For ", ""))
          )}
        </h2>
        
        <div className="text-sm text-gray-500">
          {renderEditableField(
            "Date",
            documentData.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            (value) => handleDirectChange("date", value)
          )}
          {renderEditableField(
            "Prepared By",
            documentData.preparedBy || "Prepared by Elia Go",
            (value) => handleDirectChange("preparedBy", value)
          )}
        </div>
      </div>

      <Accordion type="single" collapsible defaultValue="section-1" className="w-full">
        <AccordionItem value="section-1">
          <AccordionTrigger>Executive Summary</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderExecutiveSummary()}</AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="section-2">
          <AccordionTrigger>Our Approach</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderApproach()}</AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="section-3">
          <AccordionTrigger>ESG Assessment</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderESGAssessment()}</AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="section-4">
          <AccordionTrigger>Carbon Footprint</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderCarbonFootprint()}</AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="section-5">
          <AccordionTrigger>Risk & Opportunity Matrix</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderRiskOpportunity()}</AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="section-6">
          <AccordionTrigger>Action Plan</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderActionPlan()}</AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="section-7">
          <AccordionTrigger>Financial Impact</AccordionTrigger>
          <AccordionContent className="px-1 py-4">{renderFinancialImpact()}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
