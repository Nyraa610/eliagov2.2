
import { toast } from "sonner";

export class FileValidator {
  private static validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  public static validateFile(file: File): boolean {
    const isValid = this.validTypes.includes(file.type);
    
    if (!isValid) {
      toast.error(`${file.name}: Only PDF, Office documents, and image files are accepted`);
    }
    
    return isValid;
  }

  public static validateFiles(files: File[]): { validFiles: File[], validationStatus: { [key: string]: boolean } } {
    const validFiles: File[] = [];
    const validationStatus: { [key: string]: boolean } = {};
    
    files.forEach(file => {
      const isValid = this.validateFile(file);
      validationStatus[file.name] = isValid;
      if (isValid) validFiles.push(file);
    });
    
    return { validFiles, validationStatus };
  }
}
