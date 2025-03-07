
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Company } from "@/services/companyService";
import { companyStorageService } from "@/services/companyStorageService";
import { useToast } from "@/hooks/use-toast";

interface CompanyLogoUploadProps {
  company: Company;
  isDisabled: boolean;
}

export function CompanyLogoUpload({ company, isDisabled }: CompanyLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null);
  const { toast } = useToast();

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;
    
    try {
      setIsUploading(true);
      
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Upload to storage
      const logoUrl = await companyStorageService.uploadLogo(company.id, file);
      
      toast({
        title: "Logo uploaded",
        description: "Company logo has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "There was an error uploading the company logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={logoPreview || company.logo_url || undefined} />
        <AvatarFallback className="text-xl">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col space-y-2">
        <Label htmlFor="logo">Company Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={isUploading || isDisabled}
        />
        <p className="text-sm text-muted-foreground">Recommended size: 256x256px</p>
      </div>
    </div>
  );
}
