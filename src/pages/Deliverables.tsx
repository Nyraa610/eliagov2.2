
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Database, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelectedClient } from "@/hooks/useSelectedClient";

export default function Deliverables() {
  const { clientData } = useSelectedClient();
  const [notionExports, setNotionExports] = useState<any[]>([]);
  
  useEffect(() => {
    // Load notion exports from localStorage for demo purposes
    const exports = JSON.parse(localStorage.getItem('notion_exports') || '[]');
    setNotionExports(exports);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold">ESG Deliverables</h1>
        
        <div className="flex mt-4 sm:mt-0">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/integrations/notion">
              <Database className="h-4 w-4" />
              Manage Integrations
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="exports">External Exports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          {clientData?.id ? (
            <DocumentsList companyId={clientData.id} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Select a company to view deliverables</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>External Exports</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/action-plan-export">New Export</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notionExports.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">No exports yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Export your ESG documents to external platforms
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/action-plan-export">Export Action Plan</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notionExports.map((export_item: any) => (
                    <div
                      key={export_item.id}
                      className="flex flex-col border rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <Database className="h-6 w-6" />
                        <div className="flex-1">
                          <h4 className="font-medium">
                            Action Plan - {export_item.destination}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Exported {new Date(export_item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View in Notion</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Use the existing DocumentsList component which is imported at the top of the file
function DocumentsList({ companyId }: { companyId: string }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mock document service until the real one is implemented
    const fetchDocuments = async () => {
      console.log(`Fetching documents for company: ${companyId}`);
      // Return mock data after a short delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDocuments([
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
      ]);
      
      setLoading(false);
    };
    
    fetchDocuments();
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
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
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
                      Generated {new Date(document.created_at).toLocaleString()}
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
