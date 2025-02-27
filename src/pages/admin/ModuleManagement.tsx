
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Edit, Trash2, BookOpen } from "lucide-react";
import { Course, Module } from "@/types/training";
import { trainingService } from "@/services/trainingService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ModuleManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentModule, setCurrentModule] = useState<Partial<Module>>({
    title: "",
    description: "",
    sequence_order: 1,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [moduleIdToDelete, setModuleIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseAndModules = async () => {
      setIsLoading(true);
      try {
        const courseData = await trainingService.getCourseById(courseId);
        setCourse(courseData);

        const modulesData = await trainingService.getModulesByCourseId(courseId);
        setModules(modulesData);
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

    fetchCourseAndModules();
  }, [courseId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentModule((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateModule = async () => {
    if (!courseId) return;

    try {
      const moduleData = {
        ...currentModule,
        course_id: courseId,
        sequence_order: currentModule.id 
          ? currentModule.sequence_order 
          : modules.length > 0 
            ? Math.max(...modules.map(m => m.sequence_order)) + 1 
            : 1
      };

      const { data, error } = await supabase
        .from("modules")
        .upsert([moduleData], { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: currentModule.id ? "Module updated" : "Module added",
        description: `Successfully ${currentModule.id ? "updated" : "added"} the module.`,
      });

      setIsEditDialogOpen(false);
      
      // Refresh modules list
      const updatedModules = await trainingService.getModulesByCourseId(courseId);
      setModules(updatedModules);
      
      // Reset form
      setCurrentModule({
        title: "",
        description: "",
        sequence_order: 1,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving module",
        description: error.message,
      });
    }
  };

  const handleEditModule = (module: Module) => {
    setCurrentModule(module);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!moduleIdToDelete) return;

    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleIdToDelete);

      if (error) throw error;

      toast({
        title: "Module deleted",
        description: "The module has been successfully deleted.",
      });

      // Refresh modules list
      if (courseId) {
        const updatedModules = await trainingService.getModulesByCourseId(courseId);
        setModules(updatedModules);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting module",
        description: error.message,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setModuleIdToDelete(null);
    }
  };

  const handleMoveModule = async (id: string, direction: "up" | "down") => {
    const moduleIndex = modules.findIndex(m => m.id === id);
    if (
      (direction === "up" && moduleIndex === 0) || 
      (direction === "down" && moduleIndex === modules.length - 1)
    ) {
      return;
    }

    const swapWithIndex = direction === "up" ? moduleIndex - 1 : moduleIndex + 1;
    
    const currentModule = modules[moduleIndex];
    const swapModule = modules[swapWithIndex];
    
    // Swap the sequence orders
    const tempOrder = currentModule.sequence_order;
    
    try {
      // Update the first module
      await supabase
        .from("modules")
        .update({ sequence_order: swapModule.sequence_order })
        .eq("id", currentModule.id);
      
      // Update the second module
      await supabase
        .from("modules")
        .update({ sequence_order: tempOrder })
        .eq("id", swapModule.id);
      
      // Refresh modules list
      if (courseId) {
        const updatedModules = await trainingService.getModulesByCourseId(courseId);
        setModules(updatedModules);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error reordering modules",
        description: error.message,
      });
    }
  };

  const handleManageContent = (moduleId: string) => {
    navigate(`/admin/courses/${courseId}/modules/${moduleId}/content`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin/training")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            Manage Modules: {course?.title}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Organize your course into modules. Each module can contain videos, text content, and quizzes.
          </p>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentModule({
                title: "",
                description: "",
                sequence_order: modules.length > 0 ? Math.max(...modules.map(m => m.sequence_order)) + 1 : 1
              })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{currentModule.id ? "Edit Module" : "Add Module"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={currentModule.title}
                    onChange={handleInputChange}
                    placeholder="Enter module title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentModule.description || ""}
                    onChange={handleInputChange}
                    placeholder="Enter module description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrUpdateModule}>
                  {currentModule.id ? "Update" : "Add"} Module
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No modules yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Get started by adding your first module to this course.
                </p>
                <Button onClick={() => setIsEditDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between border rounded-md p-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageContent(module.id)}
                      >
                        Manage Content
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveModule(module.id, "up")}
                        disabled={modules.indexOf(module) === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveModule(module.id, "down")}
                        disabled={modules.indexOf(module) === modules.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditModule(module)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setModuleIdToDelete(module.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this module and all its content, including videos, text, and quizzes.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setModuleIdToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
