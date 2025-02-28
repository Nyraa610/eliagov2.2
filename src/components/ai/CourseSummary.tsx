
import { useState } from "react";
import { AIAnalysis } from "./AIAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Course } from "@/types/training";
import { courseService } from "@/services/courseService";
import { contentService } from "@/services/contentService";
import { moduleService } from "@/services/moduleService";
import { Sparkles } from "lucide-react";

export function CourseSummary() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseContent, setCourseContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load courses on component mount
  useState(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await courseService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        });
      }
    };

    loadCourses();
  });

  const handleCourseSelect = async (courseId: string) => {
    if (!courseId) return;
    
    setSelectedCourseId(courseId);
    setIsLoading(true);
    
    try {
      // Fetch course details
      const course = await courseService.getCourseById(courseId);
      
      // Fetch modules for the course
      const modules = await moduleService.getModulesByCourseId(courseId);
      
      let allContent = `Course: ${course.title}\nDescription: ${course.description || "No description"}\n\n`;
      
      // Fetch content for each module
      for (const module of modules) {
        allContent += `Module: ${module.title}\n`;
        allContent += `Description: ${module.description || "No description"}\n\n`;
        
        const contentItems = await contentService.getContentItemsByModuleId(module.id);
        
        for (const item of contentItems) {
          allContent += `Content: ${item.title}\n`;
          allContent += `Type: ${item.content_type}\n`;
          
          if (item.content) {
            allContent += `Content: ${item.content}\n\n`;
          }
        }
        
        allContent += "\n";
      }
      
      setCourseContent(allContent);
    } catch (error) {
      console.error("Error fetching course content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch course content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Course Summary Generator
          </CardTitle>
          <CardDescription>Select a course to generate an AI summary</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCourseId}
            onValueChange={handleCourseSelect}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourseId && courseContent && (
        <AIAnalysis
          analysisType="course-summary"
          initialContent={courseContent}
          title="Course Summary"
          description="AI-generated summary of the course content"
          buttonText="Generate Summary"
          showInput={false}
        />
      )}
    </div>
  );
}
