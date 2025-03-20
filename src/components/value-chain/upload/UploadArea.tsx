
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

interface UploadAreaProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export function UploadArea({ isDragging, onDragOver, onDragLeave, onDrop }: UploadAreaProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        Drag and drop files here, or click to browse
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Accepted formats: PDF, DOC, PPTX, JPG, PNG, GIF
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        Browse Files
      </Button>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
        multiple
        onChange={e => document.dispatchEvent(new CustomEvent('fileInputChange', { detail: e }))}
      />
    </div>
  );
}
