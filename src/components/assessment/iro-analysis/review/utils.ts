
import { IROItem } from "../formSchema";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Get the color for a risk score badge based on the score value
 */
export function getRiskScoreColor(score: number): string {
  if (score <= 3) return "bg-green-100 text-green-800";
  if (score <= 6) return "bg-yellow-100 text-yellow-800";
  if (score <= 8) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

/**
 * Export IRO analysis results to PDF
 */
export function exportToPDF(items: IROItem[], companyName: string = "Your Company") {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Impact, Risks, and Opportunities Analysis", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Company: ${companyName}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    
    // Filter risks and opportunities
    const risks = items.filter(item => item.type === "risk");
    const opportunities = items.filter(item => item.type === "opportunity");
    
    // Add risks table
    if (risks.length > 0) {
      doc.setFontSize(14);
      doc.text("Risks Assessment", 14, 45);
      
      autoTable(doc, {
        startY: 50,
        head: [["Risk", "Category", "Description", "Impact", "Likelihood", "Score", "Mitigation"]],
        body: risks.map(risk => [
          risk.issueTitle,
          risk.category,
          risk.description,
          risk.impact.toString(),
          risk.likelihood.toString(),
          risk.riskScore?.toString() || "-",
          risk.mitigationMeasures || "-"
        ]),
        theme: "striped",
        headStyles: { fillColor: [220, 50, 50] }
      });
    }
    
    // Add opportunities table
    if (opportunities.length > 0) {
      const risksTableHeight = risks.length > 0 ? risks.length * 10 + 10 : 0;
      const opportunitiesY = 50 + risksTableHeight + 20;
      
      doc.setFontSize(14);
      doc.text("Opportunities Assessment", 14, opportunitiesY - 5);
      
      autoTable(doc, {
        startY: opportunitiesY,
        head: [["Opportunity", "Category", "Description", "Impact", "Likelihood", "Score", "Enhancement"]],
        body: opportunities.map(opportunity => [
          opportunity.issueTitle,
          opportunity.category,
          opportunity.description,
          opportunity.impact.toString(),
          opportunity.likelihood.toString(),
          opportunity.riskScore?.toString() || "-",
          opportunity.mitigationMeasures || "-"
        ]),
        theme: "striped",
        headStyles: { fillColor: [50, 150, 50] }
      });
    }
    
    // Add summary at the end
    const totalY = doc.lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.text(`Total Risks: ${risks.length}`, 14, totalY + 15);
    doc.text(`Total Opportunities: ${opportunities.length}`, 14, totalY + 22);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, totalY + 29);
    
    // Save the PDF
    doc.save("iro-analysis-report.pdf");
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
