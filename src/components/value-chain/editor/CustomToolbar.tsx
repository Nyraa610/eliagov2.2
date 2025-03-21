
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Save, 
  Download, 
  Upload, 
  Trash, 
  Plus, 
  Move
} from 'lucide-react';

export const CustomToolbar = () => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 mb-4">
      <Button variant="outline" size="sm" className="gap-1" title="Add Node">
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">Add</span>
      </Button>
      
      <div className="h-6 border-l border-gray-300 mx-1"></div>
      
      <Button variant="outline" size="sm" className="gap-1" title="Save">
        <Save className="h-4 w-4" />
        <span className="hidden md:inline">Save</span>
      </Button>
      
      <Button variant="outline" size="sm" className="gap-1" title="Export">
        <Download className="h-4 w-4" />
        <span className="hidden md:inline">Export</span>
      </Button>
      
      <Button variant="outline" size="sm" className="gap-1" title="Import">
        <Upload className="h-4 w-4" />
        <span className="hidden md:inline">Import</span>
      </Button>
      
      <div className="h-6 border-l border-gray-300 mx-1"></div>
      
      <Button variant="outline" size="sm" className="gap-1" title="Clear">
        <Trash className="h-4 w-4" />
        <span className="hidden md:inline">Clear</span>
      </Button>
      
      <div className="h-6 border-l border-gray-300 mx-1"></div>
      
      <Button variant="outline" size="sm" className="h-9 w-9 p-0" title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="sm" className="h-9 w-9 p-0" title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button variant="outline" size="sm" className="h-9 w-9 p-0" title="Reset View">
        <Move className="h-4 w-4" />
      </Button>
    </div>
  );
};
