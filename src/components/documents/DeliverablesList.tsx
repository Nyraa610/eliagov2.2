
import { useState, useEffect } from "react";
import { documentService, Deliverable } from "@/services/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface DeliverablesListProps {
  companyId: string;
}

export function DeliverablesList({ companyId }: DeliverablesListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDeliverables = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDeliverables(companyId);
        setDeliverables(data);
      } catch (error) {
        console.error("Error loading deliverables:", error);
        toast({
          title: "Error",
          description: "Failed to load deliverables",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDeliverables();
  }, [companyId]);
  
  const getFileIcon = (documentType: string) => {
    if (documentType === 'carbon_report') {
      return <FileText className="h-6 w-6 text-green-500" />;
    } else if (documentType === 'value_chain') {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Elia Go Deliverables</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : deliverables.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No deliverables yet</h3>
            <p className="text-muted-foreground">
              Complete assessments to generate reports and deliverables
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliverables.map(deliverable => (
              <div
                key={deliverable.id}
                className="flex flex-col border rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(deliverable.document_type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{deliverable.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated {formatDistanceToNow(new Date(deliverable.created_at), { addSuffix: true })}
                    </p>
                    {deliverable.description && (
                      <p className="text-sm mt-1">{deliverable.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
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
