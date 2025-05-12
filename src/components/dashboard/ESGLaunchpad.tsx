
import { useState, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  industrySectors, 
  esgStandards
} from "@/services/esgLaunchpadService";
import { ArrowRight, Award, BarChart2, CheckCircle, Download, FileDown, FileText, Info, Lightbulb, Loader2, Mail, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useESGLaunchpadForm } from "./hooks/useESGLaunchpadForm";

export function ESGLaunchpad() {
  const [activeTab, setActiveTab] = useState("report");
  const { user } = useAuth();
  const [exportingPDF, setExportingPDF] = useState(false);
  
  const { 
    form, 
    step, 
    loading, 
    sectorProfile, 
    peerSnapshots,
    reportGenerated, 
    reportContent, 
    htmlReport, 
    recommendedStandards,
    handleIndustryChange,
    generateReport,
    downloadPDFReport
  } = useESGLaunchpadForm();

  // Watch for changes in the selected industry and standards
  const selectedIndustry = form.watch("industry");
  const selectedStandards = form.watch("selectedStandards");

  // Handle generate report button click
  const onSubmit = useCallback(async (data: any) => {
    await generateReport(data, user?.email);
  }, [generateReport, user?.email]);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setExportingPDF(true);
    try {
      await downloadPDFReport();
    } finally {
      setExportingPDF(false);
    }
  };

  // Use memoized function to avoid infinite re-renders
  const renderStandardLogo = useCallback((standardId: string) => {
    const found = recommendedStandards.find(std => std.id === standardId);
    if (found && found.logo) {
      return (
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-md border p-1 h-12 w-12 flex items-center justify-center">
            <img 
              src={found.logo} 
              alt={found.name} 
              className="max-h-10 max-w-10 object-contain" 
            />
          </div>
          <span className="text-xs text-center mt-1">{found.name}</span>
        </div>
      );
    }
    
    return null;
  }, [recommendedStandards]);

  // Handle standard selection - fixed to avoid infinite loop
  const handleStandardSelection = useCallback((standardId: string) => {
    const currentSelected = form.getValues("selectedStandards") || [];
    const isSelected = currentSelected.includes(standardId);
    
    const newSelectedStandards = isSelected 
      ? currentSelected.filter(id => id !== standardId)
      : [...currentSelected, standardId];
    
    form.setValue("selectedStandards", newSelectedStandards);
  }, [form]);

  // Handle "None" standard selection
  const handleNoneSelection = useCallback(() => {
    form.setValue("selectedStandards", []);
  }, [form]);

  // Standards selection component
  const standardsSelection = (
    <div>
      <div className="mb-3 text-sm font-medium">Select the standards you follow (or select none):</div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* None option */}
        <div
          className={`flex flex-col items-center space-y-2 border rounded-md p-2 hover:bg-muted/40 cursor-pointer ${selectedStandards?.length === 0 ? 'border-primary bg-muted/40' : ''}`}
          onClick={handleNoneSelection}
        >
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs">None</span>
          </div>
          
          <div className="text-sm font-normal text-center cursor-pointer">
            No standards yet
          </div>
          
          {selectedStandards?.length === 0 && (
            <CheckCircle className="h-5 w-5 text-green-600 absolute top-1 right-1" />
          )}
        </div>

        {esgStandards.map((standard) => (
          <TooltipProvider key={standard.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  key={standard.id}
                  className={`flex flex-col items-center space-y-2 border rounded-md p-2 hover:bg-muted/40 cursor-pointer relative ${selectedStandards?.includes(standard.id) ? 'border-primary bg-muted/40' : ''}`}
                  onClick={() => handleStandardSelection(standard.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStandards?.includes(standard.id) || false}
                    className="hidden"
                    readOnly
                  />
                  
                  {renderStandardLogo(standard.id) || (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs">{standard.label.substring(0, 2)}</span>
                    </div>
                  )}
                  
                  <div className="text-sm font-normal text-center cursor-pointer">
                    {standard.label}
                  </div>
                  
                  {selectedStandards?.includes(standard.id) && (
                    <CheckCircle className="h-5 w-5 text-green-600 absolute top-1 right-1" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{standard.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span className="bg-primary text-primary-foreground p-1 rounded-md">ESG</span>
              Launchpad
            </CardTitle>
            <CardDescription>
              Get started with ESG in under 3 minutes and receive a personalized QuickStart report for your industry.
            </CardDescription>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>Powered by Elia Go Expert Analysis</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Step 1: Select Industry */}
              <div className={step !== 1 ? "opacity-70" : ""}>
                <h3 className="font-medium text-lg mb-2 flex items-center">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                  Select your industry
                </h3>
                
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={handleIndustryChange}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your industry sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industrySectors.map(sector => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Step 2: Industry Profile & Standards */}
              {step >= 2 && (
                <div>
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                    Your industry ESG profile
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {sectorProfile && (
                        <div className="space-y-4 mt-4">
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary mt-1" />
                            <div>
                              <h4 className="text-sm font-medium">Expert Assessment</h4>
                              <p className="text-sm">{sectorProfile.description}</p>
                            </div>
                          </div>
                          
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="risks">
                              <AccordionTrigger className="font-medium">
                                Key ESG Risks for Your Industry
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="list-disc pl-5 space-y-1">
                                  {sectorProfile.key_risks.map((risk, index) => (
                                    <li key={index} className="text-sm">{risk}</li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="opportunities">
                              <AccordionTrigger className="font-medium">
                                Key ESG Opportunities
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="list-disc pl-5 space-y-1">
                                  {sectorProfile.key_opportunities.map((opportunity, index) => (
                                    <li key={index} className="text-sm">{opportunity}</li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="procurement">
                              <AccordionTrigger className="font-medium">
                                Top Procurement-Chain Impacts
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="list-disc pl-5 space-y-1">
                                  {sectorProfile.procurement_impacts.map((impact, index) => (
                                    <li key={index} className="text-sm">{impact}</li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                      
                      {/* Expert Analysis Section */}
                      <div className="mt-6 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Expert Analysis</h4>
                        </div>
                        <p className="text-sm text-blue-900 mb-3">
                          Based on data from our ESG team at Elia Go, companies in your sector typically focus on these key areas:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <BarChart2 className="h-4 w-4 text-green-600 mb-1" />
                            <h5 className="text-xs font-medium">Environmental</h5>
                            <p className="text-xs">Carbon reduction strategies show 20% better performance</p>
                          </div>
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <User className="h-4 w-4 text-indigo-600 mb-1" />
                            <h5 className="text-xs font-medium">Social</h5>
                            <p className="text-xs">Supply chain transparency increases stakeholder trust</p>
                          </div>
                          <div className="bg-white rounded-md p-3 shadow-sm">
                            <ShieldCheck className="h-4 w-4 text-amber-600 mb-1" />
                            <h5 className="text-xs font-medium">Governance</h5>
                            <p className="text-xs">Companies with diversity targets outperform peers by 15%</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Recommended Standards Section */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                          <h4 className="font-medium">Recommended Standards & Labels</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {recommendedStandards.map((standard, index) => (
                            <div key={index} className="bg-muted/30 rounded-md p-3 text-center flex flex-col items-center">
                              <div className="bg-white rounded-md border p-2 h-16 w-16 flex items-center justify-center mb-2">
                                <img 
                                  src={standard.logo} 
                                  alt={standard.name} 
                                  className="max-h-12 max-w-12 object-contain" 
                                />
                              </div>
                              <h5 className="text-sm font-medium">{standard.name}</h5>
                              <span className="text-xs text-muted-foreground mt-1">{standard.category}</span>
                              <p className="text-xs mt-1">{standard.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {peerSnapshots && peerSnapshots.length > 0 && (
                        <div className="mt-8">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Peer Initiatives in Your Sector
                          </h4>
                          
                          <div className="grid gap-4 md:grid-cols-3">
                            {peerSnapshots.map((snapshot) => (
                              <Card key={snapshot.id} className="bg-muted/30">
                                <CardHeader className="p-4 pb-2">
                                  <CardTitle className="text-base">
                                    {snapshot.initiative_title}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {snapshot.company_size} company · {snapshot.impact_area}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                  <p className="text-sm">{snapshot.initiative_description}</p>
                                  <p className="text-sm mt-2 font-medium">Results: {snapshot.results}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Step 3: ESG Standards Selection */}
              {step >= 2 && !loading && !reportGenerated && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                    Tell us about your ESG standards
                  </h3>
                  
                  <p className="text-sm mb-4">
                    Do you currently follow any ESG standards or labels? Select all that apply, or continue without selecting any if you don't follow standards yet.
                  </p>
                  
                  {standardsSelection}
                </div>
              )}
              
              {/* Step 4: Generate Report */}
              {step >= 2 && !loading && !reportGenerated && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                    Generate your free QuickStart report
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    The report will be generated for your selected industry and will be available online. 
                    {user?.email && (
                      <span> A copy will also be sent to your email ({user.email}).</span>
                    )}
                  </p>
                </div>
              )}
              
              {/* Report generated */}
              {reportGenerated && (
                <div className="border-t pt-4">
                  <div className="bg-green-50 p-4 rounded-md mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">Your ESG QuickStart report has been generated!</p>
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="report">Report</TabsTrigger>
                      <TabsTrigger value="online">Online Version</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="report">
                      <div className="bg-muted/30 p-4 rounded-md mb-4 whitespace-pre-wrap text-sm">
                        <div dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br>') }} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="online">
                      {htmlReport ? (
                        <div className="border rounded-md overflow-hidden bg-white h-[500px]">
                          <iframe
                            srcDoc={htmlReport}
                            className="w-full h-full"
                            title="ESG QuickStart Report"
                          />
                        </div>
                      ) : (
                        <div className="bg-muted/30 p-4 rounded-md mb-4">
                          <p>Online version not available. Please use the text report.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
            
            {!reportGenerated && step >= 2 && (
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !selectedIndustry}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating report...
                  </>
                ) : (
                  <>
                    Generate my free QuickStart report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            
            {reportGenerated && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  variant={activeTab === "report" ? "default" : "outline"}
                  onClick={handleDownloadPDF}
                  disabled={exportingPDF}
                >
                  {exportingPDF ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {exportingPDF ? 'Creating PDF...' : 'Download as PDF'}
                </Button>
                
                <Button
                  type="button"
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    // Download report as text file
                    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "ESG_QuickStart_Report.txt";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download as text
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Download report as HTML
                    if (htmlReport) {
                      const blob = new Blob([htmlReport], { type: "text/html;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "ESG_QuickStart_Report.html";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as HTML
                </Button>
                
                <Button
                  type="button"
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    // Open email client
                    window.location.href = "mailto:contact@eliago.com?subject=Schedule%20ESG%20Expert%20Call&body=I'd%20like%20to%20schedule%20a%20call%20with%20an%20ESG%20expert%20to%20discuss%20my%20QuickStart%20report.";
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Schedule expert call
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex-col items-start pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Award className="h-3 w-3" />
          <p>Analysis based on Elia Go's proprietary ESG database and expert insights</p>
        </div>
      </CardFooter>
    </Card>
  );
}
