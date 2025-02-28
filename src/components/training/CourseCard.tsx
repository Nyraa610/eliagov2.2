
import { Link } from "react-router-dom";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Course, UserEnrollment, Certificate } from "@/types/training";

interface CourseCardProps {
  course: Course;
  enrollment?: UserEnrollment;
  certificate?: Certificate;
  onEnroll: (courseId: string) => void;
}

const CourseCard = ({ course, enrollment, certificate, onEnroll }: CourseCardProps) => {
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
