
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentContent } from './DocumentContent';
import { FileText, Download } from 'lucide-react';

interface OnlineReportViewerProps {
  documentData: any;
  onExport?: (format: 'pdf' | 'word') => void;
}

export const OnlineReportViewer: React.FC<OnlineReportViewerProps> = ({
  documentData,
  onExport
}) => {
  if (!documentData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">No document data available</h2>
          <p className="text-gray-500 mt-2">Please create a document first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{documentData.title || "Sustainability Report"}</h1>
          <div className="text-gray-500 mt-1">
            {documentData.companyName && <span className="mr-4">Company: {documentData.companyName}</span>}
            {documentData.industry && <span>Industry: {documentData.industry}</span>}
          </div>
        </div>
        
        {onExport && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onExport('word')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Word
            </Button>
          </div>
        )}
      </div>
      
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <DocumentContent 
            documentData={documentData} 
            setDocumentData={() => {}} 
            readOnly={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};
