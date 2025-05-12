
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  industrySectors, 
  esgLaunchpadService,
  SectorProfile
} from "@/services/esgLaunchpadService";

export function SectorProfilesManager() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<SectorProfile[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [currentProfile, setCurrentProfile] = useState<SectorProfile | null>(null);

  // Initialize form
  const form = useForm({
    defaultValues: {
      description: "",
      risks: ["", "", "", ""],
      opportunities: ["", "", "", ""],
      procurement: ["", "", ""]
    }
  });

  // Fetch all profiles on load
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sector_profiles')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setProfiles(data as SectorProfile[]);
    } catch (error) {
      console.error("Error fetching sector profiles:", error);
      toast.error("Failed to load sector profiles");
    } finally {
      setLoading(false);
    }
  };

  // Handle sector selection change
  const handleSectorChange = async (sectorId: string) => {
    setSelectedSectorId(sectorId);
    
    // Find existing profile
    const existingProfile = profiles.find(p => p.id === sectorId);
    
    if (existingProfile) {
      // Use existing profile
      setCurrentProfile(existingProfile);
      form.reset({
        description: existingProfile.description,
        risks: existingProfile.key_risks.length > 0 
          ? [...existingProfile.key_risks, ...Array(4 - existingProfile.key_risks.length).fill("")] 
          : ["", "", "", ""],
        opportunities: existingProfile.key_opportunities.length > 0
          ? [...existingProfile.key_opportunities, ...Array(4 - existingProfile.key_opportunities.length).fill("")]
          : ["", "", "", ""],
        procurement: existingProfile.procurement_impacts.length > 0
          ? [...existingProfile.procurement_impacts, ...Array(3 - existingProfile.procurement_impacts.length).fill("")]
          : ["", "", ""]
      });
    } else {
      // Generate new profile with AI
      setLoading(true);
      try {
        const newProfile = await esgLaunchpadService.generateSectorProfile(sectorId);
        if (newProfile) {
          setCurrentProfile(newProfile);
          setProfiles(prev => [...prev, newProfile]);
          form.reset({
            description: newProfile.description,
            risks: newProfile.key_risks.length > 0 
              ? [...newProfile.key_risks, ...Array(4 - newProfile.key_risks.length).fill("")] 
              : ["", "", "", ""],
            opportunities: newProfile.key_opportunities.length > 0
              ? [...newProfile.key_opportunities, ...Array(4 - newProfile.key_opportunities.length).fill("")]
              : ["", "", "", ""],
            procurement: newProfile.procurement_impacts.length > 0
              ? [...newProfile.procurement_impacts, ...Array(3 - newProfile.procurement_impacts.length).fill("")]
              : ["", "", ""]
          });
        } else {
          // Create empty profile
          const industry = industrySectors.find(s => s.id === sectorId);
          const emptyProfile: SectorProfile = {
            id: sectorId,
            name: industry?.label || "",
            description: "",
            key_risks: [],
            key_opportunities: [],
            procurement_impacts: []
          };
          setCurrentProfile(emptyProfile);
          form.reset({
            description: "",
            risks: ["", "", "", ""],
            opportunities: ["", "", "", ""],
            procurement: ["", "", ""]
          });
        }
      } catch (error) {
        console.error("Error generating profile:", error);
        toast.error("Failed to generate sector profile");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!currentProfile || !selectedSectorId) return;
    
    setSaving(true);
    
    try {
      const industry = industrySectors.find(s => s.id === selectedSectorId);
      
      // Filter out empty risks, opportunities, and procurement impacts
      const risks = data.risks.filter(Boolean);
      const opportunities = data.opportunities.filter(Boolean);
      const procurement = data.procurement.filter(Boolean);
      
      const updatedProfile: SectorProfile = {
        id: selectedSectorId,
        name: industry?.label || "",
        description: data.description,
        key_risks: risks,
        key_opportunities: opportunities,
        procurement_impacts: procurement,
        is_ai_generated: false,
        updated_at: new Date().toISOString()
      };
      
      // Save profile to Supabase
      const { error } = await supabase
        .from('sector_profiles')
        .upsert(updatedProfile, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success("Sector profile saved successfully");
      
      // Update local state
      setCurrentProfile(updatedProfile);
      setProfiles(prev => 
        prev.map(p => p.id === selectedSectorId ? updatedProfile : p)
      );
      
    } catch (error) {
      console.error("Error saving sector profile:", error);
      toast.error("Failed to save sector profile");
    } finally {
      setSaving(false);
    }
  };

  // Get available sectors (ones that don't have profiles yet)
  const getAvailableSectors = () => {
    const profileIds = profiles.map(p => p.id);
    return industrySectors.filter(sector => !profileIds.includes(sector.id));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ESG Sector Profiles Manager</CardTitle>
        <CardDescription>
          Manage industry sector profiles for the ESG Launchpad
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Select sector to edit</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Existing Profiles</label>
                  <Select value={selectedSectorId} onValueChange={handleSectorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} {profile.is_ai_generated ? "(AI Generated)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Add New Profile</label>
                  <Select value="" onValueChange={handleSectorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSectors().map(sector => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {currentProfile && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Sector Description</h4>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a description of ESG context for this sector"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key ESG Risks</h4>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map(index => (
                        <FormField
                          key={`risks.${index}`}
                          control={form.control}
                          name={`risks.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Risk ${index + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key ESG Opportunities</h4>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map(index => (
                        <FormField
                          key={`opportunities.${index}`}
                          control={form.control}
                          name={`opportunities.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Opportunity ${index + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Top Procurement-Chain Impacts</h4>
                    <div className="space-y-2">
                      {[0, 1, 2].map(index => (
                        <FormField
                          key={`procurement.${index}`}
                          control={form.control}
                          name={`procurement.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder={`Impact ${index + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="destructive"
                      onClick={async () => {
                        if (!currentProfile) return;
                        
                        if (confirm("Are you sure you want to delete this profile?")) {
                          try {
                            const { error } = await supabase
                              .from('sector_profiles')
                              .delete()
                              .eq('id', currentProfile.id);
                            
                            if (error) throw error;
                            
                            toast.success("Profile deleted successfully");
                            setCurrentProfile(null);
                            setSelectedSectorId("");
                            setProfiles(prev => prev.filter(p => p.id !== currentProfile.id));
                            form.reset({
                              description: "",
                              risks: ["", "", "", ""],
                              opportunities: ["", "", "", ""],
                              procurement: ["", "", ""]
                            });
                          } catch (error) {
                            console.error("Error deleting profile:", error);
                            toast.error("Failed to delete profile");
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={async () => {
                        if (!currentProfile) return;
                        
                        try {
                          const newProfile = await esgLaunchpadService.generateSectorProfile(currentProfile.id);
                          if (newProfile) {
                            form.reset({
                              description: newProfile.description,
                              risks: newProfile.key_risks.length > 0 
                                ? [...newProfile.key_risks, ...Array(4 - newProfile.key_risks.length).fill("")] 
                                : ["", "", "", ""],
                              opportunities: newProfile.key_opportunities.length > 0
                                ? [...newProfile.key_opportunities, ...Array(4 - newProfile.key_opportunities.length).fill("")]
                                : ["", "", "", ""],
                              procurement: newProfile.procurement_impacts.length > 0
                                ? [...newProfile.procurement_impacts, ...Array(3 - newProfile.procurement_impacts.length).fill("")]
                                : ["", "", ""]
                            });
                            toast.success("Regenerated with AI successfully");
                          }
                        } catch (error) {
                          console.error("Error regenerating profile:", error);
                          toast.error("Failed to regenerate profile");
                        }
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Regenerate with AI
                    </Button>
                    
                    <Button type="submit" disabled={saving}>
                      {saving ? (
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
                  </div>
                </form>
              </Form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
