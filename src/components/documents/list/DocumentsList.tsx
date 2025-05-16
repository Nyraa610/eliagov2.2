import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { Document } from "@/services/types";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { PersonalDocumentUploader } from "@/components/documents/PersonalDocumentUploader";
import { useTranslation } from "react-i18next";

interface PersonalDocumentsListProps {
  userId: string;
}

export function PersonalDocumentsList({ userId }: PersonalDocumentsListProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('uploaded_by', userId)
        .eq('is_personal', true)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw fetchError;
      }
      
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching personal documents:', err);
      setError(t('documents.errors.fetchFailed', 'Failed to load documents. Please try again later.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  const handleDocumentUploaded = () => {
    fetchDocuments();
  };

  const handleDeleteDocument = async (document: Document) => {
    try {
      // Extract file path from URL
      const urlParts = document.url.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('company_documents_storage') + 1).join('/');
      
      if (!filePath) {
        toast.error(t('documents.errors.invalidFilePath', 'Invalid file path'));
        return;
      }
      
      // 1. Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('company_documents_storage')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        toast.error(t('documents.errors.deleteStorageFailed', 'Failed to delete file from storage'));
        return;
      }
      
      // 2. Delete the document record from the database
      const { error: dbError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', document.id);
      
      if (dbError) {
        console.error('Error deleting document record:', dbError);
        toast.error(t('documents.errors.deleteRecordFailed', 'Failed to delete document record'));
        return;
      }
      
      toast.success(t('documents.deleteSuccess', 'Document deleted successfully'));
      fetchDocuments();
    } catch (error) {
      console.error('Delete document error:', error);
      toast.error(t('documents.errors.deleteFailed', 'Delete failed: {{error}}', { 
        error: error instanceof Error ? error.message : String(error) 
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('documents.personalDocuments', 'Personal Documents')}</h2>
        <PersonalDocumentUploader onUploadComplete={handleDocumentUploaded} />
      </div>
      
      {documents.length > 0 ? (
        <DocumentsList documents={documents} onDeleteDocument={handleDeleteDocument} />
      ) : (
        <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg font-medium text-gray-700">
            {t('documents.noPersonalDocuments', 'No personal documents yet')}
          </p>
          <p className="text-gray-500 mt-2">
            {t('documents.uploadToOrganize', 'Upload documents to keep them organized')}
          </p>
        </div>
      )}
    </div>
  );
}
