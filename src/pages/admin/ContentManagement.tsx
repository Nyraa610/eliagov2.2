import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  ArrowLeft, Plus, ChevronUp, ChevronDown, Edit, Trash2, 
  FileText, Video, ListChecks 
} from "lucide-react";
import { Module, ContentItem } from "@/types/training";
import { trainingService } from "@/services/trainingService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContentManagement() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [module, setModule] = useState<Module | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentContentItem, setCurrentContentItem] = useState<Partial<ContentItem>>({
    title: "",
    content_type: "text",
    content: "",
    video_url: "",
    sequence_order: 1,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentItemIdToDelete, setContentItemIdToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!moduleId) return;

    const fetchModuleAndContent = async () => {
      setIsLoading(true);
      try {
        // Get module data
        const { data: moduleData, error: moduleError } = await supabase
          .from("modules")
          .select("*")
          .eq("id", moduleId)
          .single();

        if (moduleError) throw moduleError;
        setModule(moduleData as Module);

        // Get content items for this module
        const contentData = await trainingService.getContentItemsByModuleId(moduleId);
        setContentItems(contentData);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleAndContent();
  }, [moduleId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentContentItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentContentItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      // Clear the video URL if a file is selected
      setCurrentContentItem((prev) => ({ ...prev, video_url: "" }));
    }
  };

  const handleAddOrUpdateContent = async () => {
    if (!moduleId) return;
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      let videoUrl = currentContentItem.video_url;

      // If it's a video content and a new file is uploaded
      if (currentContentItem.content_type === "video" && videoFile) {
        try {
          toast({
            title: "Uploading video",
            description: "Please wait while your video is being uploaded...",
          });
          
          console.log("Starting video upload process");
          
          // Check if user is authenticated
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) {
            throw new Error("User not authenticated for upload");
          }
          
          console.log("User authenticated:", userData.user.id);
          
          // First check if the bucket exists and create it if needed
          console.log("Checking for training_materials bucket");
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          
          if (bucketsError) {
            console.error("Error listing buckets:", bucketsError);
            throw bucketsError;
          }
          
          console.log("Available buckets:", buckets);
          const trainingBucket = buckets?.find(b => b.name === 'training_materials');
          
          if (!trainingBucket) {
            console.log("Creating training_materials bucket");
            const { error: bucketError } = await supabase.storage.createBucket('training_materials', {
              public: true
            });
            
            if (bucketError) {
              console.error("Error creating bucket:", bucketError);
              throw bucketError;
            }
            console.log("Bucket created successfully");
          } else {
            console.log("Bucket already exists");
          }
          
          // Upload the video
          console.log("Preparing to upload video:", videoFile.name);
          const fileExt = videoFile.name.split('.').pop() || 'mp4';
          const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`;
          const filePath = `videos/${fileName}`;
          
          console.log("Uploading to path:", filePath);
          
          const { error: uploadError } = await supabase.storage
            .from('training_materials')
            .upload(filePath, videoFile, {
              cacheControl: '3600',
              upsert: true
            });
        
          if (uploadError) {
            console.error("Video upload error:", uploadError);
            throw uploadError;
          }
          
          console.log("Video upload successful");
          
          // Get the public URL
          const { data } = supabase.storage
            .from('training_materials')
            .getPublicUrl(filePath);
        
          if (!data || !data.publicUrl) {
            throw new Error("Failed to get public URL for uploaded video");
          }
          
          console.log("Video public URL:", data.publicUrl);
          videoUrl = data.publicUrl;
          
          toast({
            title: "Video uploaded",
            description: "Your video has been successfully uploaded.",
          });
        } catch (uploadError: any) {
          console.error("Video upload failed:", uploadError);
          toast({
            variant: "destructive",
            title: "Video upload failed",
            description: uploadError.message || "Unknown error occurred during upload",
          });
          setIsSubmitting(false);
          return;
        }
      }

      const contentData = {
        ...currentContentItem,
        module_id: moduleId,
        video_url: videoUrl,
        sequence_order: currentContentItem.id 
          ? currentContentItem.sequence_order 
          : contentItems.length > 0 
            ? Math.max(...contentItems.map(item => item.sequence_order || 0)) + 1 
            : 1
      };
      
      console.log("Saving content item with data:", contentData);

      const { data, error } = await supabase
        .from("content_items")
        .upsert([contentData], { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error("Error saving content item:", error);
        throw error;
      }

      console.log("Content item saved successfully:", data);

      toast({
        title: currentContentItem.id ? "Content updated" : "Content added",
        description: `Successfully ${currentContentItem.id ? "updated" : "added"} the content item.`,
      });

      setIsEditDialogOpen(false);
      
      // Refresh content items list
      const updatedContentItems = await trainingService.getContentItemsByModuleId(moduleId);
      setContentItems(updatedContentItems);
      
      // Reset form
      setCurrentContentItem({
        title: "",
        content_type: "text",
        content: "",
        video_url: "",
        sequence_order: 1,
      });
      setVideoFile(null);
    } catch (error: any) {
      console.error("Error in handleAddOrUpdateContent:", error);
      toast({
        variant: "destructive",
        title: "Error saving content",
        description: error.message || "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleEditContent = (item: ContentItem) => {
    setCurrentContentItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contentItemIdToDelete) return;

    try {
      const { error } = await supabase
        .from("content_items")
        .delete()
        .eq("id", contentItemIdToDelete);

      if (error) throw error;

      toast({
        title: "Content deleted",
        description: "The content item has been successfully deleted.",
      });

      // Refresh content items list
      if (moduleId) {
        const updatedContentItems = await trainingService.getContentItemsByModuleId(moduleId);
        setContentItems(updatedContentItems);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting content",
        description: error.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setContentItemIdToDelete(null);
    }
  };

  const handleMoveContent = async (id: string, direction: "up" | "down") => {
    const itemIndex = contentItems.findIndex(item => item.id === id);
    if (
      (direction === "up" && itemIndex === 0) || 
      (direction === "down" && itemIndex === contentItems.length - 1)
    ) {
      return;
    }

    const swapWithIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    
    const currentItem = contentItems[itemIndex];
    const swapItem = contentItems[swapWithIndex];
    
    // Swap the sequence orders
    const tempOrder = currentItem.sequence_order;
    
    try {
      // Update the first item
      await supabase
        .from("content_items")
        .update({ sequence_order: swapItem.sequence_order })
        .eq("id", currentItem.id);
      
      // Update the second item
      await supabase
        .from("content_items")
        .update({ sequence_order: tempOrder })
        .eq("id", swapItem.id);
      
      // Refresh content items list
      if (moduleId) {
        const updatedContentItems = await trainingService.getContentItemsByModuleId(moduleId);
        setContentItems(updatedContentItems);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error reordering content",
        description: error.message,
      });
    }
  };

  const handleManageQuiz = (contentItemId: string) => {
    navigate(`/admin/courses/${courseId}/modules/${moduleId}/content/${contentItemId}/quiz`);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "quiz":
        return <ListChecks className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/admin/courses/${courseId}/modules`)} 
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            Manage Content: {module?.title}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Add videos, text content, and quizzes to this module.
          </p>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentContentItem({
                title: "",
                content_type: "text",
                content: "",
                video_url: "",
                sequence_order: contentItems.length > 0 ? Math.max(...contentItems.map(item => item.sequence_order || 0)) + 1 : 1
              })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{currentContentItem.id ? "Edit Content" : "Add Content"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Content Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={currentContentItem.title || ""}
                    onChange={handleInputChange}
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select
                    value={currentContentItem.content_type || "text"}
                    onValueChange={(value) => handleSelectChange("content_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentContentItem.content_type === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Text Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={currentContentItem.content || ""}
                      onChange={handleInputChange}
                      placeholder="Enter text content"
                      rows={10}
                    />
                  </div>
                )}

                {currentContentItem.content_type === "video" && (
                  <div className="space-y-4">
                    {currentContentItem.video_url && (
                      <div className="space-y-2">
                        <Label>Current Video</Label>
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <video 
                            src={currentContentItem.video_url} 
                            controls 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="video">Upload Video</Label>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: MP4, WebM (max 100MB)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="video_url">Or Video URL</Label>
                      <Input
                        id="video_url"
                        name="video_url"
                        value={currentContentItem.video_url || ""}
                        onChange={handleInputChange}
                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        disabled={!!videoFile}
                      />
                      {videoFile && (
                        <p className="text-xs text-amber-600">
                          URL input is disabled because you're uploading a file. Clear the file input to use a URL instead.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {currentContentItem.content_type === "quiz" && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Quiz Instructions</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={currentContentItem.content || ""}
                      onChange={handleInputChange}
                      placeholder="Enter quiz instructions"
                      rows={5}
                    />
                    {currentContentItem.id && (
                      <p className="text-sm text-muted-foreground mt-2">
                        You'll be able to add questions after saving this quiz.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setVideoFile(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddOrUpdateContent}
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? "Saving..." 
                    : currentContentItem.id 
                      ? "Update Content" 
                      : "Add Content"
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Content</CardTitle>
          </CardHeader>
          <CardContent>
            {contentItems.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No content yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Get started by adding content to this module.
                </p>
                <Button onClick={() => setIsEditDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border rounded-md p-4"
                  >
                    <div className="flex items-center flex-1">
                      <div className="bg-muted p-2 rounded-md mr-3">
                        {getContentTypeIcon(item.content_type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.content_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.content_type === "quiz" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageQuiz(item.id)}
                        >
                          Manage Questions
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveContent(item.id, "up")}
                        disabled={contentItems.indexOf(item) === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveContent(item.id, "down")}
                        disabled={contentItems.indexOf(item) === contentItems.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditContent(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setContentItemIdToDelete(item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this content item and all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setContentItemIdToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
