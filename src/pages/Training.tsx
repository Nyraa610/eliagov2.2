
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { trainingService } from "@/services/trainingService";
import { Course, UserEnrollment, Certificate } from "@/types/training";

export default function Training() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, enrollmentsData, certificatesData] = await Promise.all([
          trainingService.getCourses(),
          trainingService.getUserEnrollments(),
          trainingService.getUserCertificates()
        ]);

        setCourses(coursesData);
        setEnrollments(enrollmentsData);
        setCertificates(certificatesData);
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

    fetchData();
  }, [toast]);

  // Helper function to get enrollment for a course
  const getEnrollment = (courseId: string): UserEnrollment | undefined => {
    return enrollments.find(enrollment => enrollment.course_id === courseId);
  };

  // Helper function to get certificate for a course
  const getCertificate = (courseId: string): Certificate | undefined => {
    return certificates.find(certificate => certificate.course_id === courseId);
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      await trainingService.enrollUserInCourse(courseId);
      
      toast({
        title: "Successfully enrolled",
        description: "You have been enrolled in the course",
      });
      
      // Refresh enrollments
      const updatedEnrollments = await trainingService.getUserEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">ESG Training Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enhance your knowledge and earn certificates in sustainability and ESG practices
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p>Loading courses...</p>
          </div>
        ) : certificates.length > 0 ? (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Your Certificates
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map(certificate => {
                const course = courses.find(c => c.id === certificate.course_id);
                return course ? (
                  <Card key={certificate.id} className="overflow-hidden">
                    <div className="bg-primary/10 p-4 flex justify-center">
                      <Award className="h-16 w-16 text-primary" />
                    </div>
                    <CardHeader>
                      <CardTitle>{course.title} Certificate</CardTitle>
                      <CardDescription>
                        Earned {certificate.points_earned} points
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Issued on {new Date(certificate.issued_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                    <CardFooter>
                      {certificate.certificate_url ? (
                        <a 
                          href={certificate.certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full">
                            View Certificate
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Certificate Pending
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ) : null;
              })}
            </div>
          </div>
        ) : null}

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">Available Courses</h2>
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white/60 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No courses available yet</h3>
              <p className="text-muted-foreground mt-2">
                Check back soon for new training opportunities.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => {
                const enrollment = getEnrollment(course.id);
                const certificate = getCertificate(course.id);
                
                return (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="relative">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {certificate && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <Award className="h-5 w-5" />
                        </div>
                      )}
                      {enrollment?.is_completed && !certificate && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{course.points} points upon completion</span>
                      </div>
                      
                      {enrollment && (
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-right mt-1">
                            {enrollment.progress_percentage}% complete
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {certificate ? (
                        <Button variant="outline" className="w-full" disabled>
                          Completed
                        </Button>
                      ) : enrollment ? (
                        <Link to={`/training/courses/${course.id}`} className="w-full">
                          <Button className="w-full">
                            {enrollment.is_completed ? "Review Course" : "Continue Learning"}
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => enrollInCourse(course.id)}
                        >
                          Enroll Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
