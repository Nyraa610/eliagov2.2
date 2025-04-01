
import { DocumentsLayout } from "@/components/documents/DocumentsLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TestUploadButton } from "@/components/documents/TestUploadButton";
import { Card } from "@/components/ui/card";

export default function DocumentCenter() {
  const { user, companyId } = useAuth();
  
  return (
    <div className="container mx-auto">
      {companyId && user?.id && (
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Troubleshooting Tools</h3>
          <TestUploadButton companyId={companyId} />
        </Card>
      )}
      <DocumentsLayout />
    </div>
  );
}
