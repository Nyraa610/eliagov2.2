import React from "react";
import { Document } from "@/services/document";
import { DocumentItem } from "./DocumentItem";

interface DocumentsListProps {
  documents: Document[];
  onDeleteDocument: (document: Document) => void;
}

export function DocumentsList({ 
  documents,
  onDeleteDocument
}: DocumentsListProps) {
  if (documents.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Documents</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map(doc => (
          <DocumentItem 
            key={doc.id} 
            document={doc}
            onDelete={onDeleteDocument}
          />
        ))}
      </div>
    </div>
  );
}
