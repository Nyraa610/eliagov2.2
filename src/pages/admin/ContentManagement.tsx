
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { moduleService } from "@/services/moduleService";
import { contentService } from "@/services/contentService";
import { ContentItem, Module } from "@/types/training";
import { ArrowLeft, Plus, Edit, Trash2, Save, GripVertical, FileText, Video, Quiz } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState<"text" | "video" | "quiz">("text");
  const [contentText, setContentText] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  const [deleteContentId, setDeleteContentId] = useState<string | null>(null);

  useEffect(() => {
    if (moduleId) {
      fetchData();
    }
  }, [moduleId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!moduleId) throw new Error("Module ID is required");
      
      const [moduleData, contentData] = await Promise.all([
        moduleService.getModuleById(moduleId),
        contentService.getContentItemsByModuleId(moduleId)
      ]);
      
      setModule(moduleData);
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

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentContent(null);
    setContentTitle("");
    setContentType("text");
    setContentText("");
    setVideoUrl("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (content: ContentItem) => {
    setIsEditing(true);
    setCurrentContent(content);
    setContentTitle(content.title);
    setContentType(content.content_type as "text" | "video" | "quiz");
    
    if (content.content_type === "text") {
      setContentText(content.content || "");
      setVideoUrl("");
    } else if (content.content_type === "video") {
      setVideoUrl(content.video_url || "");
      setContentText("");
    } else {
      setContentText("");
      setVideoUrl("");
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveContent = async () => {
    if (!contentTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Content title is required.",
      });
      return;
    }

    if (contentType === "video" && !videoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Video URL is required for video content.",
      });
      return;
    }

    if (contentType === "text" && !contentText.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Content text is required for text content.",
      });
      return;
    }

    try {
      const contentData: Partial<ContentItem> = {
        title: contentTitle,
        content_type: contentType,
        content: contentType === "text" ? contentText : null,
        video_url: contentType === "video" ? videoUrl : null,
      };

      if (isEditing && currentContent) {
        await contentService.updateContentItem(currentContent.id, contentData);
        
        toast({
          title: "Content updated",
          description: "The content has been successfully updated.",
        });
      } else {
        if (!moduleId) throw new Error("Module ID is required");
        
        contentData.module_id = moduleId;
        contentData.sequence_order = contentItems.length + 1;
        
        await contentService.createContentItem(contentData);
        
        toast({
          title: "Content created",
          description: "The content has been successfully created.",
        });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error ${isEditing ? "updating" : "creating"} content`,
        description: error.message,
      });
    }
  };

  const handleDeleteContent = async () => {
    if (!deleteContentId) return;
    
    try {
      await contentService.deleteContentItem(deleteContentId);
      toast({
        title: "Content deleted",
        description: "The content has been successfully deleted.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting content",
        description: error.message,
      });
    } finally {
      setDeleteContentId(null);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "quiz":
        return <Quiz className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex justify-center items-center h-64">
            <p>Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Module Not Found</h2>
              <p className="text-muted-foreground mb-4">The module you're looking for doesn't exist.</p>
              <Button onClick={() => navigate(`/admin/courses/${courseId}/modules`)}>
                Return to Modules
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing pb-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex-grow">
            {module.title} - Content
          </h1>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>

        {contentItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">No Content Yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Start creating content for this module. You can add text, videos, or quizzes.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contentItems.map((content, index) => (
              <Card key={content.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <GripVertical className="h-5 w-5 mr-2 text-muted-foreground cursor-grab" />
                    <div className="mr-2 text-muted-foreground">
                      {getContentTypeIcon(content.content_type)}
                    </div>
                    <CardTitle className="flex-grow">{content.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {content.content_type === "text" && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.content || "No content provided."}
                    </p>
                  )}
                  {content.content_type === "video" && (
                    <p className="text-sm text-muted-foreground truncate">
                      Video URL: {content.video_url}
                    </p>
                  )}
                  {content.content_type === "quiz" && (
                    <p className="text-sm text-muted-foreground">
                      Interactive quiz
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(content)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteContentId(content.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  {content.content_type === "quiz" && (
                    <Link to={`/admin/courses/${courseId}/modules/${moduleId}/content/${content.id}/quiz`}>
                      <Button size="sm">
                        <Quiz className="h-4 w-4 mr-2" />
                        Manage Quiz
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Content' : 'Add Content'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the content details below.' 
                : 'Create new content for this module.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                placeholder="Enter content title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(value) => setContentType(value as "text" | "video" | "quiz")}
                disabled={isEditing} // Can't change type when editing
              >
                <SelectTrigger id="content-type">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {contentType === "text" && (
              <div className="space-y-2">
                <Label htmlFor="content-text">Content</Label>
                <Textarea
                  id="content-text"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Enter your content here"
                  className="min-h-[200px]"
                />
              </div>
            )}
            
            {contentType === "video" && (
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                />
              </div>
            )}
            
            {contentType === "quiz" && !isEditing && (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm">
                  After creating the quiz content, you'll be able to add questions and answers from the quiz management page.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Content' : 'Create Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteContentId} onOpenChange={(open) => !open && setDeleteContentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this content item
              {contentItems.find(c => c.id === deleteContentId)?.content_type === "quiz" && 
                " and all associated quiz questions and answers"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
