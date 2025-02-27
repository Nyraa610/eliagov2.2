
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BookOpen, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { trainingService } from "@/services/trainingService";
import { Course } from "@/types/training";
import { Link } from "react-router-dom";

export default function AdminTraining() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await trainingService.getCourses();
        setCourses(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching courses",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Training Administration</h1>
          <Link to="/admin/courses/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center">
                <p>Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No courses yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Get started by creating your first ESG training course.
                </p>
                <Link to="/admin/courses/new">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="object-cover w-full h-40 rounded-md mb-4"
                        />
                      ) : (
                        <div className="bg-muted flex items-center justify-center w-full h-40 rounded-md mb-4">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <p>Points: {course.points}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link to={`/admin/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/admin/courses/${course.id}/modules`}>
                        <Button size="sm">
                          Manage Content
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Certificate Management</h3>
              <p className="text-muted-foreground mt-2">
                Review and manage certificates issued to users.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                This section will be implemented in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
