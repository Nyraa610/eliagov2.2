
import { useState, useEffect } from "react";
import { documentService, Deliverable } from "@/services/document/documentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DeliverablesListProps {
  companyId: string;
}

export function DeliverablesList({ companyId }: DeliverablesListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDeliverables = async () => {
      setLoading(true);
      const data = await documentService.getDeliverables(companyId);
      setDeliverables(data);
      setLoading(false);
    };
    
    loadDeliverables();
  }, [companyId]);
  
  const getDocumentIcon = (documentType: string) => {
    if (documentType.includes('report') || documentType.includes('pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (documentType.includes('spreadsheet') || documentType.includes('excel')) {
      return <FileText className="h-10 w-10 text-emerald-500" />;
    } else {
      return <FileText className="h-10 w-10 text-blue-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Elia Go Deliverables
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : deliverables.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No deliverables available</h3>
            <p className="text-muted-foreground">
              Complete assessments and other activities to generate deliverables
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliverables.map(deliverable => (
              <div 
                key={deliverable.id} 
                className="flex flex-col border rounded-lg p-5"
              >
                <div className="flex items-start gap-4 mb-3">
                  {getDocumentIcon(deliverable.document_type)}
                  <div>
                    <h4 className="font-medium text-lg mb-1">{deliverable.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated {formatDistanceToNow(new Date(deliverable.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {deliverable.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {deliverable.description}
                  </p>
                )}
                
                <div className="mt-auto pt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 w-full"
                    asChild
                  >
                    <a href={deliverable.file_path} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
