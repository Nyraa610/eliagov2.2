
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Save, 
  PlusCircle, 
  Trash2,
  Plus
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  industrySectors, 
  esgLaunchpadService,
  PeerSnapshot
} from "@/services/esgLaunchpadService";

export function PeerSnapshotsManager() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snapshots, setSnapshots] = useState<PeerSnapshot[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [currentSnapshot, setCurrentSnapshot] = useState<PeerSnapshot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Initialize form
  const form = useForm({
    defaultValues: {
      company_size: "medium",
      initiative_title: "",
      initiative_description: "",
      impact_area: "Environmental",
      results: ""
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setCurrentSnapshot(null);
      form.reset({
        company_size: "medium",
        initiative_title: "",
        initiative_description: "",
        impact_area: "Environmental",
        results: ""
      });
    }
  }, [isDialogOpen]);

  // Fetch all snapshots on load
  useEffect(() => {
    fetchAllSnapshots();
  }, []);

  const fetchAllSnapshots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('peer_snapshots')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setSnapshots(data as PeerSnapshot[]);
    } catch (error) {
      console.error("Error fetching peer snapshots:", error);
      toast.error("Failed to load peer snapshots");
    } finally {
      setLoading(false);
    }
  };

  // Handle sector selection change
  const handleSectorChange = async (sectorId: string) => {
    setSelectedSectorId(sectorId);
  };

  // Get snapshots for selected sector
  const getSectorSnapshots = () => {
    if (!selectedSectorId) return [];
    return snapshots.filter(snapshot => snapshot.sector_id === selectedSectorId);
  };

  // Handle edit snapshot
  const handleEditSnapshot = (snapshot: PeerSnapshot) => {
    setCurrentSnapshot(snapshot);
    form.reset({
      company_size: snapshot.company_size,
      initiative_title: snapshot.initiative_title,
      initiative_description: snapshot.initiative_description,
      impact_area: snapshot.impact_area,
      results: snapshot.results
    });
    setIsDialogOpen(true);
  };

  // Handle add new snapshot
  const handleAddSnapshot = () => {
    setCurrentSnapshot(null);
    form.reset({
      company_size: "medium",
      initiative_title: "",
      initiative_description: "",
      impact_area: "Environmental",
      results: ""
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!selectedSectorId) return;
    
    setSaving(true);
    
    try {
      const snapshotData = {
        id: currentSnapshot?.id || crypto.randomUUID(),
        sector_id: selectedSectorId,
        company_size: data.company_size,
        initiative_title: data.initiative_title,
        initiative_description: data.initiative_description,
        impact_area: data.impact_area,
        results: data.results
      };
      
      // Save snapshot to Supabase
      const { error } = await supabase
        .from('peer_snapshots')
        .upsert(snapshotData, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success("Peer snapshot saved successfully");
      
      // Update local state
      if (currentSnapshot) {
        setSnapshots(prev => 
          prev.map(s => s.id === currentSnapshot.id ? snapshotData : s)
        );
      } else {
        setSnapshots(prev => [...prev, snapshotData]);
      }
      
      // Close dialog
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving peer snapshot:", error);
      toast.error("Failed to save peer snapshot");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete snapshot
  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;
    
    try {
      const { error } = await supabase
        .from('peer_snapshots')
        .delete()
        .eq('id', snapshotId);
      
      if (error) throw error;
      
      toast.success("Snapshot deleted successfully");
      
      // Update local state
      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      toast.error("Failed to delete snapshot");
    }
  };

  // Generate snapshots with AI
  const handleGenerateSnapshots = async () => {
    if (!selectedSectorId) return;
    
    setLoading(true);
    
    try {
      const newSnapshots = await esgLaunchpadService.generatePeerSnapshots(selectedSectorId);
      
      if (newSnapshots.length > 0) {
        toast.success(`Generated ${newSnapshots.length} peer snapshots`);
        
        // Update snapshots list
        setSnapshots(prev => {
          // Filter out existing snapshots for this sector
          const filtered = prev.filter(s => s.sector_id !== selectedSectorId);
          // Add new snapshots
          return [...filtered, ...newSnapshots];
        });
      } else {
        toast.error("Failed to generate peer snapshots");
      }
    } catch (error) {
      console.error("Error generating snapshots:", error);
      toast.error("Failed to generate peer snapshots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Peer Snapshots Manager</CardTitle>
        <CardDescription>
          Manage peer initiative snapshots for the ESG Launchpad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Select sector to manage snapshots</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Industry Sector</label>
                <Select value={selectedSectorId} onValueChange={handleSectorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {industrySectors.map(sector => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSectorId && (
                <div className="flex items-end gap-2">
                  <Button onClick={handleAddSnapshot} className="mb-[2px]">
                    <Plus className="h-4 w-4 mr-1" /> Add Snapshot
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateSnapshots}
                    disabled={loading}
                    className="mb-[2px]"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <PlusCircle className="h-4 w-4 mr-1" />
                    )}
                    Generate with AI
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {selectedSectorId && (
            <div>
              <h4 className="font-medium mb-4">Peer Snapshots</h4>
              
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : getSectorSnapshots().length === 0 ? (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">No snapshots found for this sector</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleGenerateSnapshots}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Generate Snapshots with AI
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Size</TableHead>
                      <TableHead>Initiative Title</TableHead>
                      <TableHead>Impact Area</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSectorSnapshots().map((snapshot) => (
                      <TableRow key={snapshot.id}>
                        <TableCell className="font-medium">{snapshot.company_size}</TableCell>
                        <TableCell>{snapshot.initiative_title}</TableCell>
                        <TableCell>{snapshot.impact_area}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditSnapshot(snapshot)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteSnapshot(snapshot.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentSnapshot ? "Edit Snapshot" : "Add New Snapshot"}</DialogTitle>
            <DialogDescription>
              {currentSnapshot 
                ? "Edit the details of this peer snapshot" 
                : "Create a new peer initiative snapshot"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="initiative_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initiative Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter initiative title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="initiative_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initiative Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the initiative in 1-2 sentences" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="impact_area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Impact Area</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Governance">Governance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results Achieved</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief summary of results achieved" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
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
                      Save Snapshot
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
