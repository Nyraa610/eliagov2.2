import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// Define the Document interface
interface Document {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

// Mock document service until the real one is implemented
const documentService = {
  getDocuments: async (companyId: string): Promise<Document[]> => {
    console.log(`Fetching documents for company: ${companyId}`);
    // Return mock data for now
    return [
      {
        id: '1',
        name: 'ESG Assessment Report',
        description: 'Final ESG assessment report for Q2 2025',
        file_path: '/path/to/file1.pdf',
        file_type: 'application/pdf',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Carbon Footprint Analysis',
        description: 'Detailed carbon footprint analysis with recommendations',
        file_path: '/path/to/file2.xlsx',
        file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }
};

interface DocumentsListProps {
  companyId: string;
}

export function DocumentsList({ companyId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDocuments(companyId);
        setDocuments(data);
      } catch (error) {
        console.error("Error loading documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [companyId]);
  
  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf' || fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-6 w-6 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Elia Go Documents</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No documents yet</h3>
            <p className="text-muted-foreground">
              Complete assessments to generate reports and documents
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(document => (
              <div
                key={document.id}
                className="flex flex-col border rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(document.file_type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                    </p>
                    {document.description && (
                      <p className="text-sm mt-1">{document.description}</p>
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
                    <a href={document.file_path} target="_blank" rel="noopener noreferrer" download>
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
