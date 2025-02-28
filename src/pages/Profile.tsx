
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabaseService, UserProfile } from "@/services/base/supabaseService";
import { Loader2, Save, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <motion.div 
        className="container mx-auto px-4 page-header-spacing pb-8"
        initial="hidden"
        animate="show"
        variants={container}
      >
        <motion.div 
          className="max-w-3xl mx-auto"
          variants={item}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and profile information
                  </CardDescription>
                </div>
              </div>
              {isAdmin && (
                <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm inline-block ml-16">
                  Administrator
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself"
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
