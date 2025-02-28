
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Course, Module } from "@/types/training";

interface CourseOverviewProps {
  course: Course;
  modules: Module[];
  completedModuleIds: string[];
}

export const CourseOverview = ({ course, modules, completedModuleIds }: CourseOverviewProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Course Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{course.description}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {modules.map((module, index) => (
              <div 
                key={module.id}
                className="flex items-center p-2 border rounded-md"
              >
                <div className="mr-3 bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                  {completedModuleIds.includes(module.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{module.title}</h3>
                  {module.description && (
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
