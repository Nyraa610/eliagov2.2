
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { trainingService } from "@/services/trainingService";
import { Course, Module, ContentItem, UserEnrollment } from "@/types/training";
import { CourseHeader } from "@/components/training/course-view/CourseHeader";
import { CourseOverview } from "@/components/training/course-view/CourseOverview";
import { ModuleSidebar } from "@/components/training/course-view/ModuleSidebar";
import { ContentDisplay } from "@/components/training/course-view/ContentDisplay";
import { motion } from "framer-motion";
import { engagementService } from "@/services/engagement";
import { useEngagement } from "@/hooks/useEngagement";

export default function CourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackActivity } = useEngagement();

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
  const [totalCoursePoints, setTotalCoursePoints] = useState(0);
  const [hasTrackedCourseStart, setHasTrackedCourseStart] = useState(false);

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

        // Calculate total course points from quizzes
        let totalPoints = 0;
        for (const module of modulesData) {
          const contentItems = await trainingService.getContentItemsByModuleId(module.id);
          for (const item of contentItems) {
            if (item.content_type === "quiz") {
              const questions = await trainingService.getQuizQuestionsByContentItemId(item.id);
              totalPoints += questions.reduce((sum, q) => sum + q.points, 0);
            }
          }
        }
        setTotalCoursePoints(totalPoints);

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

  // Track course start when user navigates to the content tab
  useEffect(() => {
    if (activeTab === "content" && course && !hasTrackedCourseStart) {
      // Track course start (3 points)
      trackActivity({
        activity_type: 'start_course',
        points_earned: 3,
        metadata: {
          course_id: courseId,
          course_title: course.title,
          timestamp: new Date().toISOString()
        }
      }, true);
      
      setHasTrackedCourseStart(true);
      
      toast({
        title: "Progress",
        description: "Course started! +3 points",
        duration: 3000,
      });
    }
  }, [activeTab, course, courseId, hasTrackedCourseStart, trackActivity, toast]);

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
          
          // Track module completion (10 points)
          trackActivity({
            activity_type: 'complete_module',
            points_earned: 10,
            metadata: {
              course_id: courseId,
              course_title: course?.title,
              module_id: currentModule.id,
              module_title: currentModule.title,
              timestamp: new Date().toISOString()
            }
          });
          
          toast({
            title: "Module completed",
            description: "You've completed this module! +10 points",
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

  const handleQuizComplete = (score: number) => {
    // Update local state
    if (currentContent) {
      setCompletedContent([...completedContent, currentContent.id]);
      
      // Track quiz completion (15 points)
      trackActivity({
        activity_type: 'pass_quiz',
        points_earned: 15,
        metadata: {
          course_id: courseId,
          course_title: course?.title,
          module_id: currentModule?.id,
          module_title: currentModule?.title,
          quiz_id: currentContent.id,
          quiz_title: currentContent.title,
          score: score,
          timestamp: new Date().toISOString()
        }
      });
      
      toast({
        title: "Quiz completed",
        description: `You scored ${score} points! +15 points for completing the quiz`,
      });
      
      // Check if this was the last content item in the module
      const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
      if (currentIndex === contentItems.length - 1) {
        // Mark module as completed
        if (currentModule) {
          trainingService.markModuleAsCompleted(currentModule.id)
            .then(() => {
              setCompletedModules([...completedModules, currentModule.id]);
              
              // Track module completion (10 points)
              trackActivity({
                activity_type: 'complete_module',
                points_earned: 10,
                metadata: {
                  course_id: courseId,
                  course_title: course?.title,
                  module_id: currentModule.id,
                  module_title: currentModule.title,
                  timestamp: new Date().toISOString()
                }
              });
              
              // Move to next module if available
              const currentModuleIndex = modules.findIndex(module => module.id === currentModule.id);
              if (currentModuleIndex < modules.length - 1) {
                const nextModule = modules[currentModuleIndex + 1];
                handleModuleSelect(nextModule);
              }
            })
            .catch(error => {
              console.error("Error marking module as completed:", error);
            });
        }
      } else if (currentIndex < contentItems.length - 1) {
        // Move to next content item
        setCurrentContent(contentItems[currentIndex + 1]);
      }
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

  const handlePrevContent = () => {
    if (!currentContent) return;
    const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
    if (currentIndex > 0) {
      setCurrentContent(contentItems[currentIndex - 1]);
    }
  };

  const handleNextContent = () => {
    if (!currentContent) return;
    const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
    if (currentIndex < contentItems.length - 1) {
      setCurrentContent(contentItems[currentIndex + 1]);
    }
  };

  // Check if this is the last content item in the last module
  const isLastContentInCourse = () => {
    if (!currentContent || !currentModule) return false;
    
    const isLastModule = modules.findIndex(m => m.id === currentModule.id) === modules.length - 1;
    const isLastContent = contentItems.findIndex(c => c.id === currentContent.id) === contentItems.length - 1;
    
    return isLastModule && isLastContent;
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
              <button onClick={() => navigate("/training")}>
                Back to Training
              </button>
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
        <CourseHeader 
          course={course} 
          enrollment={enrollment} 
          onEnroll={enrollInCourse} 
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content" disabled={!enrollment}>Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <CourseOverview 
              course={course} 
              modules={modules} 
              completedModuleIds={completedModules} 
            />
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <ModuleSidebar 
                  modules={modules}
                  contentItems={contentItems}
                  currentModule={currentModule}
                  currentContent={currentContent}
                  completedModuleIds={completedModules}
                  completedContentIds={completedContent}
                  onModuleSelect={handleModuleSelect}
                  onContentSelect={handleContentSelect}
                  getContentTypeIcon={getContentTypeIcon}
                />
              </div>
              
              <div className="md:col-span-8">
                <ContentDisplay 
                  contentItems={contentItems}
                  currentContent={currentContent}
                  completedContentIds={completedContent}
                  onMarkCompleted={markContentAsCompleted}
                  onPrevious={handlePrevContent}
                  onNext={handleNextContent}
                  onQuizComplete={handleQuizComplete}
                  getYouTubeVideoId={getYouTubeVideoId}
                  isYouTubeUrl={isYouTubeUrl}
                  isLastContentInCourse={isLastContentInCourse()}
                  courseTitle={course.title}
                  courseId={course.id}
                  totalCoursePoints={totalCoursePoints}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
