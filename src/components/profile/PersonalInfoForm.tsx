
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/base/supabaseService";
import { useTranslation } from "react-i18next";
import { UserProfile } from "@/services/base/profileTypes";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

interface PersonalInfoFormProps {
  profile: UserProfile | null;
  onProfileUpdated?: () => void;
}

export function PersonalInfoForm({ profile, onProfileUpdated }: PersonalInfoFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await supabaseService.updateUserProfile({
        full_name: fullName,
        bio: bio,
      });
      
      toast({
        description: "Your profile has been successfully updated",
      });
      
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        description: "Could not update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdated = (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl);
    if (onProfileUpdated) {
      onProfileUpdated();
    }
  };

  return (
    <div className="space-y-6">
      <AvatarUpload 
        profile={{ ...profile, avatar_url: avatarUrl } as UserProfile} 
        onAvatarUpdated={handleAvatarUpdated} 
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("profile.email")}</Label>
          <Input 
            id="email" 
            type="email" 
            value={profile?.email || ""}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">{t("profile.fullName")}</Label>
          <Input 
            id="fullName" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("profile.enterFullName")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("profile.bio")}</Label>
          <Textarea 
            id="bio" 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("profile.enterBio")}
            rows={4}
          />
        </div>
      </div>

      <Button 
        onClick={handleSaveProfile} 
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("profile.saving")}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {t("profile.saveProfile")}
          </>
        )}
      </Button>
    </div>
  );
}
