
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, File, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SimpleUploadButton } from "@/components/shared/DocumentUpload";
import { supabase } from "@/lib/supabase";

interface Document {
  id: string;
  name: string;
  file_type: string;
  url: string;
  created_at: string;
}

interface DeliverablesListProps {
  companyId: string;
}

export function DeliverablesList({ companyId }: DeliverablesListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load deliverable documents when component mounts
  const loadDocuments = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Loading deliverable documents for company:", companyId);
      
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('document_type', 'deliverable')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log("Loaded deliverable documents:", data);
      setDocuments(data || []);
    } catch (err) {
      console.error("Error loading deliverable documents:", err);
      setError("Failed to load documents");
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [companyId]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentId);
        
      if (error) throw error;
      
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Error deleting document");
    }
  };

  const handleUploadComplete = async (uploadedDocuments) => {
    // Reload documents after upload
    loadDocuments();
    
    // Create a notification for all users in the company
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        // Create in-app notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            title: 'New Deliverable Uploaded',
            message: `A new deliverable "${uploadedDocuments[0]?.name || 'document'}" has been uploaded`,
            notification_type: 'deliverable_created',
            company_id: companyId,
            sender_id: userData.user.id
          });
          
        if (notificationError) {
          console.error("Error creating notification:", notificationError);
        } else {
          console.log("Notification created successfully");
        }
      }
    } catch (err) {
      console.error("Error with notification:", err);
    }
    
    toast.success("Deliverable uploaded successfully");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Elia Go Deliverables</CardTitle>
        <div className="flex gap-2">
          <SimpleUploadButton 
            companyId={companyId}
            documentType="deliverable"
            onUploadComplete={handleUploadComplete}
            buttonText="Upload Deliverable"
            size="sm"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadDocuments} 
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={loadDocuments}>Retry</Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">No deliverables found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-purple-500" />
                  <div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-medium hover:underline text-blue-600"
                    >
                      {doc.name}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
