
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  esgLaunchpadService, 
  industrySectors, 
  esgStandards,
  SectorProfile,
  PeerSnapshot
} from "@/services/esgLaunchpadService";
import { ArrowRight, CheckCircle, Download, FileText, Info, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";

// Form schema for validation
const formSchema = z.object({
  industry: z.string().min(1, "Please select your industry"),
  followsStandards: z.boolean().default(false),
  selectedStandards: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ESGLaunchpad() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sectorProfile, setSectorProfile] = useState<SectorProfile | null>(null);
  const [peerSnapshots, setPeerSnapshots] = useState<PeerSnapshot[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [htmlReport, setHtmlReport] = useState("");
  const [activeTab, setActiveTab] = useState("report");
  const { user } = useAuth();

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      followsStandards: false,
      selectedStandards: [],
    }
  });

  // Watch for changes in the selected industry and standards
  const selectedIndustry = form.watch("industry");
  const followsStandards = form.watch("followsStandards");
  const selectedStandards = form.watch("selectedStandards");

  // Fetch sector profile and peer snapshots when industry is selected
  const handleIndustryChange = async (value: string) => {
    form.setValue("industry", value);
    if (!value) return;
    
    setLoading(true);
    
    try {
      // Fetch sector profile
      const profile = await esgLaunchpadService.getSectorProfile(value);
      setSectorProfile(profile);
      
      // Fetch peer snapshots
      const snapshots = await esgLaunchpadService.getPeerSnapshots(value);
      setPeerSnapshots(snapshots);
      
      // Move to the next step
      setStep(2);
    } catch (error) {
      console.error("Error fetching sector data:", error);
      toast.error("Failed to load industry data");
    } finally {
      setLoading(false);
    }
  };

  // Handle generate report button click
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Validate industry selection
      if (!data.industry) {
        toast.error("Please select your industry");
        return;
      }
      
      // Get user email from auth context
      const userEmail = user?.email;
      
      // Generate the report
      const reportResult = await esgLaunchpadService.generateQuickStartReport({
        industry: data.industry,
        followsStandards: data.followsStandards,
        selectedStandards: data.selectedStandards || [],
        email: userEmail // Use the authenticated user's email
      });
      
      if (!reportResult) {
        toast.error("Failed to generate report");
        return;
      }
      
      setReportContent(reportResult.reportContent);
      setHtmlReport(reportResult.htmlContent || "");
      setReportGenerated(true);
      
      // Report is automatically sent to user's email
      if (userEmail && reportResult.emailSent) {
        toast.success(`Report sent to your email: ${userEmail}`);
      }
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1 rounded-md">ESG</span>
          Launchpad
        </CardTitle>
        <CardDescription>
          Get started with ESG in under 3 minutes and receive a personalized QuickStart report for your industry.
        </CardDescription>
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
                          <p className="text-sm">{sectorProfile.description}</p>
                          
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
                      
                      {peerSnapshots.length > 0 && (
                        <div className="mt-8">
                          <h4 className="font-medium mb-3">
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
                      
                      <div className="mt-8 border-t pt-4">
                        <FormField
                          control={form.control}
                          name="followsStandards"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Do you currently follow any ESG standards or labels?
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {followsStandards && (
                          <FormField
                            control={form.control}
                            name="selectedStandards"
                            render={() => (
                              <FormItem>
                                <div className="grid grid-cols-2 gap-2">
                                  {esgStandards.map((standard) => (
                                    <TooltipProvider key={standard.id}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <FormItem
                                            key={standard.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={selectedStandards?.includes(standard.id)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? form.setValue("selectedStandards", [
                                                        ...(selectedStandards || []),
                                                        standard.id,
                                                      ])
                                                    : form.setValue(
                                                        "selectedStandards",
                                                        selectedStandards?.filter(
                                                          (value) => value !== standard.id
                                                        ) || []
                                                      );
                                                }}
                                              />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal flex items-center cursor-pointer">
                                              {standard.label}
                                              <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                                            </FormLabel>
                                          </FormItem>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <p>{standard.description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Step 3: Generate Report - Removed email field, showing text instead */}
              {(step >= 2 && !loading && !reportGenerated) && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-lg mb-4 flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
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
                  <Download className="mr-2 h-4 w-4" />
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
                  <FileText className="mr-2 h-4 w-4" />
                  Download as HTML
                </Button>
                
                <Button
                  type="button"
                  className="flex-1"
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
        <p className="text-xs text-muted-foreground">
          Your data will only be used to generate personalized ESG insights and will not be shared with third parties.
        </p>
      </CardFooter>
    </Card>
  );
}
