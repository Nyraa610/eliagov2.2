
import React from "react";
import { documentService, Document, DocumentFolder } from "@/services/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentFolderData } from "./list/useDocumentFolderData";
import { DocumentsListHeader } from "./list/DocumentsListHeader";
import { FoldersList } from "./list/FoldersList";
import { DocumentsList as DocumentsListComponent } from "./list/DocumentsList";
import { EmptyState } from "./list/EmptyState";
import { LoadingState } from "./list/LoadingState";

interface DocumentsListProps {
  companyId: string;
  currentFolder: DocumentFolder | null;
  breadcrumb: DocumentFolder[];
  onNavigateToFolder: (folder: DocumentFolder | null) => void;
}

export function DocumentsList({ 
  companyId, 
  currentFolder, 
  breadcrumb, 
  onNavigateToFolder 
}: DocumentsListProps) {
  const {
    documents,
    folders,
    loading,
    handleDeleteDocument,
    handleDeleteFolder
  } = useDocumentFolderData(companyId, currentFolder);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <DocumentsListHeader
            currentFolder={currentFolder}
            breadcrumb={breadcrumb}
            onNavigateToFolder={onNavigateToFolder}
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : folders.length === 0 && documents.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            <FoldersList 
              folders={folders}
              onNavigateToFolder={onNavigateToFolder}
              onDeleteFolder={handleDeleteFolder}
            />
            
            <DocumentsListComponent
              documents={documents}
              onDeleteDocument={handleDeleteDocument}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
