
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService, UserProfile } from "@/services/base/supabaseService";
import { Loader2, Save, User, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await supabaseService.getCurrentUser();
      if (!user) {
        navigate("/login");
        return;
      }
      
      fetchProfile();
    };
    
    checkAuth();
  }, [navigate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await supabaseService.getUserProfile();
      setProfile(profileData);
      setFullName(profileData?.full_name || "");
      setBio(profileData?.bio || "");
      setIsAdmin(profileData?.role === "admin");
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load profile information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await supabaseService.updateUserProfile({
        full_name: fullName,
        bio: bio,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <UserLayout title="Profile Settings">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Profile Settings">
      <motion.div 
        initial="hidden"
        animate="show"
        variants={container}
        className="space-y-6"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardDescription>
                    {t("profile.manageAccount")}
                  </CardDescription>
                </div>
              </div>
              {isAdmin && (
                <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm inline-block ml-16">
                  {t("profile.administrator")}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{t("profile.languageSettings")}</CardTitle>
                  <CardDescription>
                    {t("profile.changeLanguage")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <Label htmlFor="language" className="md:w-1/4">{t("common.language")}</Label>
                <div className="flex-1">
                  <LanguageSelector />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </UserLayout>
  );
}
