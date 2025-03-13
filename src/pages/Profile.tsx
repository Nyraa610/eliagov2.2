
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService } from "@/services/base/supabaseService";
import { UserProfile } from "@/services/base/profileTypes";
import { motion } from "framer-motion";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { LanguageSettings } from "@/components/profile/LanguageSettings";
import { ProfileLoading } from "@/components/profile/ProfileLoading";
import { Building, Plus, Loader2 } from "lucide-react";
import { companyService } from "@/services/company";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
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

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Company name is required",
      });
      return;
    }

    setIsCreatingCompany(true);
    try {
      // Simple company creation with just a name
      await companyService.createCompany({ name: companyName });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      setCompanyName("");
      // Refresh profile to show the new company
      fetchProfile();
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create company",
      });
    } finally {
      setIsCreatingCompany(false);
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
        <ProfileLoading />
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
              <ProfileHeader isAdmin={isAdmin} />
            </CardHeader>
            <CardContent className="space-y-6">
              <PersonalInfoForm profile={profile} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                {profile?.company_id ? "Your company details" : "Add your company information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.company_id ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md">
                    <p className="text-green-700 dark:text-green-300">
                      You're associated with a company: {profile.company_name || "Your Company"}
                    </p>
                  </div>
                  <Button onClick={() => navigate("/companies")} variant="outline">
                    View Company Details
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isCreatingCompany} className="flex gap-2 items-center">
                    {isCreatingCompany ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Company
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <LanguageSettings />
            </CardHeader>
          </Card>
        </motion.div>
      </motion.div>
    </UserLayout>
  );
}
