
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { trainingService } from "@/services/trainingService";
import { Course, UserEnrollment, Certificate } from "@/types/training";
import CertificatesSection from "@/components/training/CertificatesSection";
import AvailableCoursesSection from "@/components/training/AvailableCoursesSection";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useEngagement } from "@/hooks/useEngagement";
import { useAuth } from "@/contexts/AuthContext";

export default function Training() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<UserEnrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingSuccess, setTrackingSuccess] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { trackActivity } = useEngagement();
  const { isAuthenticated, user } = useAuth(); // Use the cached auth context

  useEffect(() => {
    // Track explicit training page visit only once on component mount
    const trackPageVisit = async () => {
      try {
        if (!isAuthenticated || !user) {
          console.log("No active session, skipping training visit tracking");
          setTrackingSuccess(false);
          return;
        }
        
        console.log("Tracking Training page visit - authenticated user", user.id);
        
        // Record explicit visit with higher point value
        const success = await trackActivity({
          activity_type: 'view_training',
          points_earned: 5,
          metadata: {
            path: '/training',
            timestamp: new Date().toISOString(),
            explicit: true
          }
        });
        
        setTrackingSuccess(success);
        
        if (success) {
          console.log("Successfully tracked training page visit");
        } else {
          console.warn("Failed to track training page visit");
        }
      } catch (error) {
        console.error("Error tracking training visit:", error);
        setTrackingSuccess(false);
      }
    };
    
    // Execute tracking once on mount
    if (isAuthenticated) {
      trackPageVisit();
    }
  }, [isAuthenticated, trackActivity, user]);

  // Use a callback for data fetching to avoid definition in effect
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const [coursesData, enrollmentsData, certificatesData] = await Promise.all([
        trainingService.getCourses(),
        trainingService.getUserEnrollments(),
        trainingService.getCertificates()
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
  }, [isAuthenticated, toast]);

  // Fetch data only once per session
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const enrollInCourse = async (courseId: string) => {
    try {
      await trainingService.enrollUserInCourse(courseId);
      
      toast({
        title: "Successfully enrolled",
        description: "You have been enrolled in the course",
      });
      
      // Track enrollment activity
      trackActivity({
        activity_type: 'enroll_course',
        points_earned: 3, // Award 3 points for starting a course
        metadata: {
          course_id: courseId,
          timestamp: new Date().toISOString()
        }
      });
      
      // Refresh enrollments, but don't refetch everything
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

  // Animation configuration
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="text-center mb-10"
          variants={item}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-block mb-4"
          >
            <Award className="h-16 w-16 text-primary mx-auto" />
          </motion.div>
          <motion.p variants={item} className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enhance your knowledge and earn certificates in sustainability and ESG practices
          </motion.p>
          {trackingSuccess === false && (
            <motion.p variants={item} className="text-red-500 mt-2 text-sm">
              Note: There might be issues with activity tracking. Your session may need refreshing.
            </motion.p>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p>Loading courses...</p>
          </div>
        ) : (
          <>
            <motion.div variants={item}>
              <CertificatesSection certificates={certificates} courses={courses} />
            </motion.div>
            <motion.div variants={item}>
              <AvailableCoursesSection 
                courses={courses} 
                enrollments={enrollments} 
                certificates={certificates}
                onEnroll={enrollInCourse}
              />
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  );
}
