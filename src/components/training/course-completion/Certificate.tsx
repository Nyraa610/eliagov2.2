
import React from "react";
import { Button } from "@/components/ui/button";
import { Award, Download, GraduationCap } from "lucide-react";

interface CertificateProps {
  certificate: { id: string; certificate_url: string } | null;
  loading: boolean;
  isSuccessful: boolean;
  onGenerateCertificate: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({
  certificate,
  loading,
  isSuccessful,
  onGenerateCertificate
}) => {
  if (!isSuccessful) return null;
  
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Award className="h-6 w-6 text-primary mr-2" />
          <h3 className="font-medium">Course Certificate</h3>
        </div>
        
        {certificate ? (
          <a 
            href={certificate.certificate_url} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </a>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGenerateCertificate}
            disabled={loading}
            className="gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            {loading ? "Generating..." : "Get Certificate"}
          </Button>
        )}
      </div>
    </div>
  );
};
