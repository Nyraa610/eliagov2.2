
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/base/supabaseService";
import { UserProfile } from "@/services/base/profileTypes";
import { UserLayout } from "@/components/user/UserLayout";
import { ProfileLoading } from "@/components/profile/ProfileLoading";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <UserLayout title="Profile Settings">
        <ProfileLoading />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Profile Settings">
      <ProfileContent 
        profile={profile} 
        isAdmin={isAdmin}
        onCompanyCreated={fetchProfile}
      />
    </UserLayout>
  );
}
