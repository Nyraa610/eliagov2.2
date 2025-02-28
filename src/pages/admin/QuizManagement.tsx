
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizEditor } from "@/components/training/QuizEditor";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { contentService } from "@/services/contentService";
import { ContentItem } from "@/types/training";

export default function QuizManagement() {
  const { courseId, moduleId, contentId } = useParams<{ courseId: string, moduleId: string, contentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContentItem = async () => {
      if (!contentId) return;
      
      setIsLoading(true);
      try {
        const content = await contentService.getContentItemById(contentId);
        setContentItem(content);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading content",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentItem();
  }, [contentId, toast]);

  const handleBack = () => {
    if (courseId && moduleId) {
      navigate(`/admin/courses/${courseId}/modules/${moduleId}/content`);
    } else {
      navigate("/admin/training");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!contentItem) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Content Not Found</h1>
          </div>
          <p>The content item you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
          <h1 className="text-2xl font-bold">Quiz Management</h1>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Title:</strong> {contentItem.title}</p>
              <p><strong>Type:</strong> {contentItem.content_type}</p>
            </CardContent>
          </Card>
        </div>

        {contentItem.content_type === "quiz" && contentId && (
          <Card>
            <CardHeader>
              <CardTitle>Quiz Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuizEditor contentItemId={contentId} />
            </CardContent>
          </Card>
        )}

        {contentItem.content_type !== "quiz" && (
          <Card>
            <CardContent>
              <p className="text-center py-4">
                Quiz management is only available for content with type 'quiz'.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
