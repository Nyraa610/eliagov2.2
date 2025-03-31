
import React from "react";
import { DocumentFolder } from "@/services/document";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

interface DocumentsListHeaderProps {
  currentFolder: DocumentFolder | null;
  breadcrumb: DocumentFolder[];
  onNavigateToFolder: (folder: DocumentFolder | null) => void;
}

export function DocumentsListHeader({ 
  currentFolder, 
  breadcrumb, 
  onNavigateToFolder 
}: DocumentsListHeaderProps) {
  return (
    <>
      <div className="text-lg flex items-center justify-between">
        <div>
          {currentFolder ? currentFolder.name : "All Documents"}
        </div>
      </div>
      
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mt-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal"
                onClick={() => onNavigateToFolder(null)}
              >
                Documents
              </Button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {breadcrumb.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  {index < breadcrumb.length - 1 ? (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto font-normal"
                      onClick={() => onNavigateToFolder(folder)}
                    >
                      {folder.name}
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">{folder.name}</span>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      {currentFolder && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2"
          onClick={() => {
            if (breadcrumb.length > 1) {
              // Go to parent folder
              onNavigateToFolder(breadcrumb[breadcrumb.length - 2]);
            } else {
              // Go to root
              onNavigateToFolder(null);
            }
          }}
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          <span>Up to {breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].name : 'Documents'}</span>
        </Button>
      )}
    </>
  );
}
