
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, BookOpen } from "lucide-react";
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

  // Determine progress color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-orange-500";
    if (percentage < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const progressColor = enrollment ? getProgressColor(enrollment.progress_percentage) : "bg-primary";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Course Progress</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-primary" />
              <span className="text-sm">{course.points} points available</span>
            </div>
          </div>
          <Progress 
            value={enrollment.progress_percentage} 
            className="h-3" 
            indicatorColor={progressColor}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {enrollment.progress_percentage === 0 ? "Just started" : 
                enrollment.progress_percentage === 100 ? "Completed" : 
                `${enrollment.progress_percentage}% complete`}
            </span>
            <span className="text-xs font-medium">
              {enrollment.is_completed ? "Completed on " + new Date(enrollment.completed_at || "").toLocaleDateString() : "In progress"}
            </span>
          </div>
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
    </div>
  );
};
