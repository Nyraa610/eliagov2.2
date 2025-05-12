
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { esgLaunchpadService, SectorProfile, PeerSnapshot, industrySectors } from "@/services/esgLaunchpadService";
import { pdfReportService } from "@/services/reports/pdfReportService";

// Form schema for validation
const formSchema = z.object({
  industry: z.string().min(1, "Please select your industry"),
  selectedStandards: z.array(z.string()).default([]),
});

export type ESGLaunchpadFormData = z.infer<typeof formSchema>;

export function useESGLaunchpadForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sectorProfile, setSectorProfile] = useState<SectorProfile | null>(null);
  const [peerSnapshots, setPeerSnapshots] = useState<PeerSnapshot[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [htmlReport, setHtmlReport] = useState("");
  const [recommendedStandards, setRecommendedStandards] = useState<any[]>([]);
  const [industryName, setIndustryName] = useState("");

  // Initialize form
  const form = useForm<ESGLaunchpadFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: "",
      selectedStandards: [],
    }
  });

  const handleIndustryChange = useCallback(async (value: string) => {
    if (!value) return;
    
    form.setValue("industry", value);
    setLoading(true);
    
    try {
      console.log(`Fetching sector profile for industry: ${value}`);
      // Fetch sector profile
      const profile = await esgLaunchpadService.getSectorProfile(value);
      console.log("Sector profile received:", profile);
      setSectorProfile(profile);
      
      // Fetch peer snapshots
      console.log(`Fetching peer snapshots for industry: ${value}`);
      const snapshots = await esgLaunchpadService.getPeerSnapshots(value);
      console.log(`Received ${snapshots.length} peer snapshots`);
      setPeerSnapshots(snapshots);
      
      // Get recommended standards for this industry
      const recommendedForIndustry = [
        {
          id: "iso_14001",
          name: "ISO 14001",
          logo: "/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png",
          description: "Environmental management system standard",
          category: "Environmental"
        },
        {
          id: "iso_26000",
          name: "ISO 26000",
          logo: "/lovable-uploads/430dad71-05bf-4918-b6a5-b3f6dda67864.png", 
          description: "Guidance on social responsibility",
          category: "Social"
        },
        {
          id: "ecovadis",
          name: "EcoVadis",
          logo: "/lovable-uploads/4a9d4c8d-12c6-4ba9-87b5-132f6c06c33a.png",
          description: "Business sustainability ratings",
          category: "General ESG"
        },
        {
          id: "bcorp",
          name: "B Corp",
          logo: "/lovable-uploads/5a9bda6d-1916-4bf1-a783-f3ba753aeff1.png",
          description: "Certification for social and environmental performance",
          category: "General ESG"
        }
      ];
      
      setRecommendedStandards(recommendedForIndustry);
      
      // Store industry name for PDF report
      const selectedIndustry = industrySectors.find(sector => sector.id === value);
      setIndustryName(selectedIndustry?.label || value);
      
      // Move to the next step
      setStep(2);
    } catch (error) {
      console.error("Error fetching sector data:", error);
      toast.error("Failed to load industry data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const generateReport = useCallback(async (data: ESGLaunchpadFormData, userEmail?: string) => {
    if (!data.industry) {
      toast.error("Please select your industry");
      return false;
    }

    setLoading(true);
    
    try {
      console.log("Generating report with data:", {
        industry: data.industry,
        selectedStandards: data.selectedStandards || [],
        email: userEmail
      });
      
      // Add a unique request ID for tracking
      const requestId = crypto.randomUUID();
      console.log(`Report generation request ID: ${requestId}`);
      
      // Generate the report
      const reportResult = await esgLaunchpadService.generateQuickStartReport({
        industry: data.industry,
        followsStandards: data.selectedStandards?.length ? true : false,
        selectedStandards: data.selectedStandards || [],
        email: userEmail,
        requestId: requestId
      });
      
      if (!reportResult) {
        console.error("Report generation returned null or undefined");
        toast.error("Failed to generate report. Please try again later.");
        return false;
      }
      
      console.log("Report generated successfully:", {
        contentLength: reportResult.reportContent?.length || 0,
        htmlContentAvailable: !!reportResult.htmlContent,
        emailSent: reportResult.emailSent,
        requestId: requestId
      });
      
      setReportContent(reportResult.reportContent);
      setHtmlReport(reportResult.htmlContent || "");
      setReportGenerated(true);
      
      // Report is automatically sent to user's email
      if (userEmail && reportResult.emailSent) {
        toast.success(`Report sent to your email: ${userEmail}`);
      } else {
        toast.success("Report generated successfully!");
      }
      
      return true;
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadPDFReport = useCallback(async () => {
    if (!sectorProfile || !form.getValues().industry) {
      toast.error("Missing required data to generate PDF");
      return false;
    }

    const data = {
      industry: form.getValues().industry,
      industryName: industryName,
      sectorProfile: sectorProfile,
      selectedStandards: form.getValues().selectedStandards || [],
      standardsData: recommendedStandards,
      reportContent: reportContent
    };

    return await pdfReportService.generateESGQuickStartReport(data);
  }, [form, industryName, recommendedStandards, reportContent, sectorProfile]);

  return {
    form,
    step,
    setStep,
    loading,
    sectorProfile,
    peerSnapshots,
    reportGenerated,
    setReportGenerated,
    reportContent,
    htmlReport,
    recommendedStandards,
    handleIndustryChange,
    generateReport,
    downloadPDFReport
  };
}
