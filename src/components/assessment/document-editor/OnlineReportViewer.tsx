
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

interface OnlineReportViewerProps {
  documentData: any;
  onExport: (format: 'pdf' | 'word') => void;
}

export const OnlineReportViewer: React.FC<OnlineReportViewerProps> = ({ 
  documentData,
  onExport
}) => {
  const navigate = useNavigate();
  const { assessmentType } = useParams();

  const handleBack = () => {
    navigate(`/assessment/${assessmentType}-results`);
  };

  if (!documentData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">No document data available</h2>
          <p className="text-gray-500 mb-4">The report could not be loaded</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={() => onExport('word')}>
            <FileText className="h-4 w-4 mr-2" />
            Download Word
          </Button>
        </div>
      </div>
      
      <Card className="bg-white print:shadow-none">
        <CardContent className="p-8 print:p-0">
          {/* Document Header */}
          <div className="text-center mb-10 border-b pb-6">
            <h1 className="text-3xl font-bold text-primary mb-3">{documentData.title || "Action Plan Report"}</h1>
            <p className="text-xl mb-2">{documentData.companyName || ""}</p>
            <p className="text-gray-600">
              {documentData.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-gray-600 mt-2">{documentData.preparedBy || "Prepared by Elia Go"}</p>
          </div>
          
          {/* Executive Summary */}
          {documentData.executiveSummary && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
              <div className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: documentData.executiveSummary.summary || documentData.executiveSummary }}
              />
            </section>
          )}
          
          {/* Approach */}
          {documentData.approach && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Approach</h2>
              <div className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: documentData.approach.description || documentData.approach }}
              />
            </section>
          )}
          
          {/* ESG Assessment */}
          {documentData.esgAssessment && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">ESG Assessment</h2>
              {typeof documentData.esgAssessment === 'string' ? (
                <div className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: documentData.esgAssessment }}
                />
              ) : (
                <>
                  <p className="mb-4">{documentData.esgAssessment.introduction || ""}</p>
                  {documentData.esgAssessment.pillars && documentData.esgAssessment.pillars.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold mb-3">ESG Pillars</h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Pillar</th>
                            <th className="border p-2 text-left">Assessment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentData.esgAssessment.pillars.map((pillar: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="border p-2">{pillar.name}</td>
                              <td className="border p-2">{pillar.assessment}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
          
          {/* Carbon Footprint */}
          {documentData.carbonFootprint && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Carbon Footprint</h2>
              {typeof documentData.carbonFootprint === 'string' ? (
                <div className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: documentData.carbonFootprint }}
                />
              ) : (
                <>
                  <p className="mb-2">{documentData.carbonFootprint.introduction || ""}</p>
                  <p className="mb-2">{documentData.carbonFootprint.summary || ""}</p>
                  <p className="mb-2">{documentData.carbonFootprint.recommendations || ""}</p>
                </>
              )}
            </section>
          )}
          
          {/* Risk Opportunity Matrix */}
          {documentData.riskOpportunity && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Risk & Opportunity Analysis</h2>
              {typeof documentData.riskOpportunity === 'string' ? (
                <div className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: documentData.riskOpportunity }}
                />
              ) : (
                <>
                  <p className="mb-4">{documentData.riskOpportunity.introduction || ""}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Key Risks</h3>
                      {documentData.riskOpportunity.risks && documentData.riskOpportunity.risks.length > 0 ? (
                        <ul className="space-y-2">
                          {documentData.riskOpportunity.risks.map((risk: any, index: number) => (
                            <li key={index} className="border p-3 rounded-md">
                              <strong>{risk.title}</strong>: {risk.description}
                            </li>
                          ))}
                        </ul>
                      ) : <p>No risks identified</p>}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Key Opportunities</h3>
                      {documentData.riskOpportunity.opportunities && documentData.riskOpportunity.opportunities.length > 0 ? (
                        <ul className="space-y-2">
                          {documentData.riskOpportunity.opportunities.map((opp: any, index: number) => (
                            <li key={index} className="border p-3 rounded-md">
                              <strong>{opp.title}</strong>: {opp.description}
                            </li>
                          ))}
                        </ul>
                      ) : <p>No opportunities identified</p>}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}
          
          {/* Action Plan */}
          {documentData.actionPlan && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Action Plan</h2>
              {typeof documentData.actionPlan === 'string' ? (
                <div className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: documentData.actionPlan }}
                />
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">Objective</h3>
                  <p className="mb-4">{documentData.actionPlan.objective || ""}</p>
                  
                  <h3 className="text-xl font-semibold mb-2">Key Actions</h3>
                  {documentData.actionPlan.keyActions && documentData.actionPlan.keyActions.length > 0 ? (
                    <ul className="list-disc pl-5 mb-4">
                      {documentData.actionPlan.keyActions.map((action: string, index: number) => (
                        <li key={index} className="mb-1">{action}</li>
                      ))}
                    </ul>
                  ) : <p className="mb-4">No key actions specified</p>}
                  
                  <h3 className="text-xl font-semibold mb-2">Expected Benefits</h3>
                  <p className="mb-4">{documentData.actionPlan.benefits || ""}</p>
                  
                  <h3 className="text-xl font-semibold mb-2">Implementation Roadmap</h3>
                  {documentData.actionPlan.roadmap && documentData.actionPlan.roadmap.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Timeframe</th>
                            <th className="border p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentData.actionPlan.roadmap.map((phase: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="border p-2">{phase.timeframe}</td>
                              <td className="border p-2">{phase.actions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p>No roadmap specified</p>}
                </>
              )}
            </section>
          )}
          
          {/* Financial Impact */}
          {documentData.financialImpact && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Financial Impact</h2>
              {typeof documentData.financialImpact === 'string' ? (
                <div className="prose max-w-none" 
                  dangerouslySetInnerHTML={{ __html: documentData.financialImpact }}
                />
              ) : (
                <>
                  <p className="mb-2">{documentData.financialImpact.introduction || ""}</p>
                  <p className="mb-2">{documentData.financialImpact.summary || ""}</p>
                  <p className="mb-2">{documentData.financialImpact.details || ""}</p>
                </>
              )}
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
