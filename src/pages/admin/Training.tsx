
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileEdit, Trash2, LayoutGrid, BookOpen, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { trainingService } from "@/services/trainingService";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/training";
import { CourseSummary } from "@/components/ai/CourseSummary";

export default function AdminTraining() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const coursesData = await trainingService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [toast]);

  const handleCreateCourse = () => {
    navigate("/admin/courses/new");
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        toast({
          title: "Course deleted",
          description: "The course has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting course:", error);
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive"
        });
      }
    }
  };

  const handleManageModules = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/modules`);
  };

  return (
    <AdminLayout title="Training Management">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="courses">
            <BookOpen className="mr-2 h-4 w-4" /> Course Management
          </TabsTrigger>
          <TabsTrigger value="ai-tools">
            <Sparkles className="mr-2 h-4 w-4" /> AI Tools
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateCourse}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </div>
          
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">Loading courses...</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">No courses found. Create your first course!</td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.points}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCourse(course.id)}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleManageModules(course.id)}>
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-tools" className="pt-4">
          <CourseSummary />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
