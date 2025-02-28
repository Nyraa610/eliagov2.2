
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Trophy, Award } from "lucide-react";
import { Course, Module } from "@/types/training";
import { motion } from "framer-motion";

interface CourseOverviewProps {
  course: Course;
  modules: Module[];
  completedModuleIds: string[];
}

export const CourseOverview = ({ course, modules, completedModuleIds }: CourseOverviewProps) => {
  // Calculate progress percentage
  const progress = modules.length > 0 
    ? Math.round((completedModuleIds.length / modules.length) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 text-primary mr-2" />
              Course Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{course.description}</p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 text-primary mr-2" />
              Course Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modules.map((module, index) => (
                <motion.div 
                  key={module.id}
                  className="flex items-center p-2 border rounded-md"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
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
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
