
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Course, UserEnrollment } from "@/types/training";
import { useToast } from "@/components/ui/use-toast";

interface CourseHeaderProps {
  course: Course;
  enrollment: UserEnrollment | null;
  onEnroll: () => Promise<void>;
}

export const CourseHeader = ({ course, enrollment, onEnroll }: CourseHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      await onEnroll();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Enrollment failed",
        description: error.message,
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
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
          onClick={handleEnroll}
          disabled={isEnrolling}
        >
          {isEnrolling ? "Enrolling..." : "Enroll Now"}
        </Button>
      )}
    </>
  );
};
