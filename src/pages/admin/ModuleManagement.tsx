
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { moduleService } from "@/services/moduleService";
import { courseService } from "@/services/courseService";
import { Module, Course } from "@/types/training";
import { ArrowLeft, Plus, Edit, Trash2, Save, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

// Optional: Import a library for drag-and-drop functionality
// import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';

export default function ModuleManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!courseId) throw new Error("Course ID is required");
      
      const [courseData, modulesData] = await Promise.all([
        courseService.getCourseById(courseId),
        moduleService.getModulesByCourseId(courseId)
      ]);
      
      setCourse(courseData);
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

  const openCreateDialog = () => {
    setIsEditing(false);
    setCurrentModule(null);
    setModuleTitle("");
    setModuleDescription("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (module: Module) => {
    setIsEditing(true);
    setCurrentModule(module);
    setModuleTitle(module.title);
    setModuleDescription(module.description || "");
    setIsDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Module title is required.",
      });
      return;
    }

    try {
      if (isEditing && currentModule) {
        await moduleService.updateModule(currentModule.id, {
          title: moduleTitle,
          description: moduleDescription.trim() ? moduleDescription : null,
        });
        
        toast({
          title: "Module updated",
          description: "The module has been successfully updated.",
        });
      } else {
        if (!courseId) throw new Error("Course ID is required");
        
        await moduleService.createModule({
          course_id: courseId,
          title: moduleTitle,
          description: moduleDescription.trim() ? moduleDescription : null,
          sequence_order: modules.length + 1,
        });
        
        toast({
          title: "Module created",
          description: "The module has been successfully created.",
        });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error ${isEditing ? "updating" : "creating"} module`,
        description: error.message,
      });
    }
  };

  const handleDeleteModule = async () => {
    if (!deleteModuleId) return;
    
    try {
      await moduleService.deleteModule(deleteModuleId);
      toast({
        title: "Module deleted",
        description: "The module has been successfully deleted.",
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting module",
        description: error.message,
      });
    } finally {
      setDeleteModuleId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex justify-center items-center h-64">
            <p>Loading modules...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin/training")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
              <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/admin/training")}>
                Return to Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing pb-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/training")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex-grow">
            {course.title} - Modules
          </h1>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        {modules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-lg font-medium mb-2">No Modules Yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Start creating modules to organize your course content.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <Card key={module.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <GripVertical className="h-5 w-5 mr-2 text-muted-foreground cursor-grab" />
                    <CardTitle className="flex-grow">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.description || "No description provided."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(module)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteModuleId(module.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <Link to={`/admin/courses/${courseId}/modules/${module.id}/content`}>
                    <Button size="sm">
                      Manage Content
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Module' : 'Add Module'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the module details below.' 
                : 'Create a new module to organize your course content.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Module Title</Label>
              <Input
                id="title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="Enter module title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Enter module description"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule}>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteModuleId} onOpenChange={(open) => !open && setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the module
              and all its associated content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteModule} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
