
import { BookOpen } from "lucide-react";
import { Course, UserEnrollment, Certificate } from "@/types/training";
import CourseCard from "./CourseCard";

interface AvailableCoursesSectionProps {
  courses: Course[];
  enrollments: UserEnrollment[];
  certificates: Certificate[];
  onEnroll: (courseId: string) => void;
}

const AvailableCoursesSection = ({ 
  courses, 
  enrollments, 
  certificates, 
  onEnroll 
}: AvailableCoursesSectionProps) => {
  // Helper function to get enrollment for a course
  const getEnrollment = (courseId: string): UserEnrollment | undefined => {
    return enrollments.find(enrollment => enrollment.course_id === courseId);
  };

  // Helper function to get certificate for a course
  const getCertificate = (courseId: string): Certificate | undefined => {
    return certificates.find(certificate => certificate.course_id === courseId);
  };

  return (
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
          {courses.map(course => (
            <CourseCard 
              key={course.id}
              course={course} 
              enrollment={getEnrollment(course.id)} 
              certificate={getCertificate(course.id)}
              onEnroll={onEnroll}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCoursesSection;
