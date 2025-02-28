
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { trainingService } from "@/services/trainingService";
import { Course, UserEnrollment, Certificate } from "@/types/training";
import CertificatesSection from "@/components/training/CertificatesSection";
import AvailableCoursesSection from "@/components/training/AvailableCoursesSection";

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
      <div className="container mx-auto px-4 page-header-spacing pb-8">
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
        ) : (
          <>
            <CertificatesSection certificates={certificates} courses={courses} />
            <AvailableCoursesSection 
              courses={courses} 
              enrollments={enrollments} 
              certificates={certificates}
              onEnroll={enrollInCourse}
            />
          </>
        )}
      </div>
    </div>
  );
}
