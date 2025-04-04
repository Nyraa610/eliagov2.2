
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/services/storageService";
import { UserProfile } from "@/services/base/profileTypes";
import { supabaseService } from "@/services/base/supabaseService";
import { useTranslation } from "react-i18next";

interface AvatarUploadProps {
  profile: UserProfile | null;
  onAvatarUpdated: (newAvatarUrl: string | null) => void;
}

export function AvatarUpload({ profile, onAvatarUpdated }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const getInitials = (name?: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        description: t("profile.invalidImageFormat"),
      });
      return;
    }

    // Validate file size (max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      toast({
        variant: "destructive",
        description: t("profile.imageTooLarge"),
      });
      return;
    }

    setIsUploading(true);
    try {
      const avatarUrl = await storageService.uploadImage(file);
      await supabaseService.updateUserProfile({ avatar_url: avatarUrl });
      onAvatarUpdated(avatarUrl);
      toast({
        description: t("profile.avatarUpdated"),
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        description: t("profile.avatarUploadFailed"),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile?.avatar_url) return;
    
    setIsDeleting(true);
    try {
      await supabaseService.updateUserProfile({ avatar_url: null });
      onAvatarUpdated(null);
      toast({
        description: t("profile.avatarRemoved"),
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        variant: "destructive",
        description: t("profile.avatarRemoveFailed"),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage 
            src={profile?.avatar_url || ""} 
            alt={profile?.full_name || "User"} 
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials(profile?.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="cursor-pointer p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <Camera className="h-5 w-5 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleFileChange}
              disabled={isUploading || isDeleting}
            />
          </label>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => document.getElementById('avatar-input')?.click()}
          disabled={isUploading || isDeleting}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("profile.uploading")}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t("profile.updateAvatar")}
            </>
          )}
          <input
            id="avatar-input"
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleFileChange}
            disabled={isUploading || isDeleting}
          />
        </Button>
        
        {profile?.avatar_url && (
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={handleDeleteAvatar}
            disabled={isUploading || isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("profile.removeAvatar")}
          </Button>
        )}
      </div>
    </div>
  );
}
