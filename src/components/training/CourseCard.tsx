
import { Link } from "react-router-dom";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Course, UserEnrollment, Certificate } from "@/types/training";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  course: Course;
  enrollment?: UserEnrollment;
  certificate?: Certificate;
  onEnroll: (courseId: string) => void;
}

const CourseCard = ({ course, enrollment, certificate, onEnroll }: CourseCardProps) => {
  // Determine progress color based on completion percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "bg-red-500";
    if (percentage < 50) return "bg-orange-500";
    if (percentage < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const progressColor = enrollment ? getProgressColor(enrollment.progress_percentage) : "bg-primary";

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
            <Progress 
              value={enrollment.progress_percentage} 
              className="h-2 mt-2" 
              indicatorColor={progressColor}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{enrollment.progress_percentage}%</span>
            </div>
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
            onClick={() => onEnroll(course.id)}
          >
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
