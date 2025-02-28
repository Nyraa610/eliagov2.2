
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, CheckCircle2, Play, FileText, Video, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { trainingService } from "@/services/trainingService";
import { Course, Module, ContentItem, UserEnrollment } from "@/types/training";

export default function CourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [completedContent, setCompletedContent] = useState<string[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // Get course data
        const courseData = await trainingService.getCourseById(courseId);
        setCourse(courseData);

        // Get enrollment status
        const enrollmentData = await trainingService.getEnrollmentByCourseId(courseId);
        setEnrollment(enrollmentData);

        // Get modules
        const modulesData = await trainingService.getModulesByCourseId(courseId);
        setModules(modulesData);

        // Get completed modules and content
        const completedModulesData = await trainingService.getCompletedModules();
        const completedContentData = await trainingService.getCompletedContentItems();
        
        setCompletedModules(completedModulesData.map(m => m.module_id));
        setCompletedContent(completedContentData.map(c => c.content_item_id));

        // Set first module as current if available
        if (modulesData.length > 0) {
          setCurrentModule(modulesData[0]);
          
          // Load content items for the first module
          const contentItemsData = await trainingService.getContentItemsByModuleId(modulesData[0].id);
          setContentItems(contentItemsData);
          
          // Set first content item as current if available
          if (contentItemsData.length > 0) {
            setCurrentContent(contentItemsData[0]);
          }
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading course",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, toast]);

  const handleModuleSelect = async (module: Module) => {
    setCurrentModule(module);
    setCurrentContent(null);
    
    try {
      const contentItemsData = await trainingService.getContentItemsByModuleId(module.id);
      setContentItems(contentItemsData);
      
      if (contentItemsData.length > 0) {
        setCurrentContent(contentItemsData[0]);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading module content",
        description: error.message,
      });
    }
  };

  const handleContentSelect = (content: ContentItem) => {
    setCurrentContent(content);
  };

  const markContentAsCompleted = async () => {
    if (!currentContent) return;
    
    try {
      await trainingService.markContentAsCompleted(currentContent.id);
      
      // Update local state
      setCompletedContent([...completedContent, currentContent.id]);
      
      toast({
        title: "Progress saved",
        description: "This content has been marked as completed.",
      });
      
      // Move to next content item if available
      const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
      if (currentIndex < contentItems.length - 1) {
        setCurrentContent(contentItems[currentIndex + 1]);
      } else {
        // If this was the last content item, mark module as completed
        if (currentModule) {
          await trainingService.markModuleAsCompleted(currentModule.id);
          setCompletedModules([...completedModules, currentModule.id]);
          
          toast({
            title: "Module completed",
            description: "You've completed this module!",
          });
          
          // Move to next module if available
          const currentModuleIndex = modules.findIndex(module => module.id === currentModule.id);
          if (currentModuleIndex < modules.length - 1) {
            const nextModule = modules[currentModuleIndex + 1];
            handleModuleSelect(nextModule);
          }
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving progress",
        description: error.message,
      });
    }
  };

  const enrollInCourse = async () => {
    if (!courseId) return;
    
    try {
      const enrollmentData = await trainingService.enrollUserInCourse(courseId);
      setEnrollment(enrollmentData);
      
      toast({
        title: "Successfully enrolled",
        description: "You have been enrolled in the course",
      });
      
      setActiveTab("content");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message,
      });
    }
  };

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    
    // Regular YouTube URLs
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return match[2];
    }
    
    return null;
  };
  
  const isYouTubeUrl = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const renderContentItem = () => {
    if (!currentContent) return null;

    switch (currentContent.content_type) {
      case "text":
        return (
          <div className="prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: currentContent.content || "" }} />
          </div>
        );
      case "video":
        if (currentContent.video_url) {
          // Check if it's a YouTube video
          if (isYouTubeUrl(currentContent.video_url)) {
            const videoId = getYouTubeVideoId(currentContent.video_url);
            if (videoId) {
              return (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-md overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  {currentContent.content && (
                    <div className="prose max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
                    </div>
                  )}
                </div>
              );
            }
          }
          
          // Otherwise, it's a direct video URL
          return (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video 
                  src={currentContent.video_url} 
                  controls 
                  className="w-full h-full" 
                />
              </div>
              {currentContent.content && (
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center h-64 bg-muted rounded-md">
            <p className="text-muted-foreground">No video available</p>
          </div>
        );
      case "quiz":
        return (
          <div className="space-y-4">
            <div className="prose max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: currentContent.content || "" }} />
            </div>
            <Button onClick={() => alert("Quiz functionality not yet implemented")}>
              Start Quiz
            </Button>
          </div>
        );
      default:
        return null;
    }
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
        return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
              <p className="mb-4">The course you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/training")}>
                Back to Training
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
      <div className="container mx-auto px-4 pt-24 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/training")} 
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-primary">{course.title}</h1>
        </div>

        {enrollment ? (
          <div className="mb-4">
            <Progress value={enrollment.progress_percentage} className="h-2" />
            <p className="text-xs text-right mt-1">
              {enrollment.progress_percentage}% complete
            </p>
          </div>
        ) : (
          <Button 
            className="mb-6" 
            onClick={enrollInCourse}
          >
            Enroll Now
          </Button>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content" disabled={!enrollment}>Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{course.description}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {modules.map((module, index) => (
                    <div 
                      key={module.id}
                      className="flex items-center p-2 border rounded-md"
                    >
                      <div className="mr-3 bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                        {completedModules.includes(module.id) ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {modules.map((module, index) => (
                        <div 
                          key={module.id}
                          className={`flex items-center p-2 border rounded-md cursor-pointer ${
                            currentModule?.id === module.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => handleModuleSelect(module)}
                        >
                          <div className="mr-3 bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                            {completedModules.includes(module.id) ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{module.title}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {currentModule && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Module Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {contentItems.map((content, index) => (
                          <div 
                            key={content.id}
                            className={`flex items-center p-2 border rounded-md cursor-pointer ${
                              currentContent?.id === content.id ? 'bg-primary/10 border-primary' : ''
                            }`}
                            onClick={() => handleContentSelect(content)}
                          >
                            <div className="mr-3 flex items-center justify-center">
                              {completedContent.includes(content.id) ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                getContentTypeIcon(content.content_type)
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{content.title}</h3>
                              <p className="text-xs text-muted-foreground capitalize">
                                {content.content_type}
                              </p>
                            </div>
                          </div>
                        ))}

                        {contentItems.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No content available for this module.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="md:col-span-8">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{currentContent?.title || 'Select content to view'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentContent ? (
                      <div className="space-y-6">
                        {renderContentItem()}
                        
                        <div className="flex justify-between items-center pt-4">
                          <Button
                            variant="outline"
                            disabled={!contentItems.length || contentItems[0].id === currentContent.id}
                            onClick={() => {
                              const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
                              if (currentIndex > 0) {
                                setCurrentContent(contentItems[currentIndex - 1]);
                              }
                            }}
                          >
                            Previous
                          </Button>
                          
                          {completedContent.includes(currentContent.id) ? (
                            <Button variant="outline" disabled>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Completed
                            </Button>
                          ) : (
                            <Button onClick={markContentAsCompleted}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Complete
                            </Button>
                          )}
                          
                          <Button
                            disabled={!contentItems.length || contentItems[contentItems.length - 1].id === currentContent.id}
                            onClick={() => {
                              const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
                              if (currentIndex < contentItems.length - 1) {
                                setCurrentContent(contentItems[currentIndex + 1]);
                              }
                            }}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No content selected</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                          Select a module and content item from the sidebar to begin learning.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
