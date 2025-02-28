
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { contentService } from "@/services/contentService";
import { ContentItem } from "@/types/training";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentQuizManager from "@/components/training/ContentQuizManager";
import QuizEditor from "@/components/training/QuizEditor";

export default function QuizManagement() {
  const { courseId, moduleId, contentId } = useParams<{ courseId: string; moduleId: string; contentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [contentItem, setContentItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("editor");

  useEffect(() => {
    if (contentId) {
      fetchContentItem();
    }
  }, [contentId]);

  const fetchContentItem = async () => {
    if (!contentId) return;
    
    setIsLoading(true);
    try {
      const item = await contentService.getContentItemById(contentId);
      
      if (item.content_type !== "quiz") {
        toast({
          variant: "destructive",
          title: "Invalid content type",
          description: "This content item is not a quiz.",
        });
        navigate(`/admin/courses/${courseId}/modules/${moduleId}/content`);
        return;
      }
      
      setContentItem(item);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching content",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex justify-center items-center h-64">
            <p>Loading quiz content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/admin/courses/${courseId}/modules/${moduleId}/content`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
              <p className="text-muted-foreground mb-4">The quiz content you're looking for doesn't exist.</p>
              <Button onClick={() => navigate(`/admin/courses/${courseId}/modules/${moduleId}/content`)}>
                Return to Content
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
            onClick={() => navigate(`/admin/courses/${courseId}/modules/${moduleId}/content`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {contentItem.title} - Quiz Management
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              This page allows you to manage the quiz questions and answers for this content.
              Use the editor to add, edit, and remove questions. You can also preview the quiz
              to see how it will appear to learners.
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">Quiz Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <QuizEditor contentItemId={contentId} />
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentQuizManager 
                  contentId={contentId} 
                  previewMode={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
