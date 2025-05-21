
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, Notion, ArrowUpRight } from "lucide-react";
import { DeliverablesList } from "@/components/documents/list/DeliverablesList";
import { Link } from "react-router-dom";
import { useSelectedClient } from "@/hooks/useSelectedClient";

export default function Deliverables() {
  const { client } = useSelectedClient();
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
              <Notion className="h-4 w-4" />
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
          {client?.id ? (
            <DeliverablesList companyId={client.id} />
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
                        <Notion className="h-6 w-6" />
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
