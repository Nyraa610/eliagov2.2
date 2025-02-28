
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { courseService } from "@/services/courseService";
import { storageService } from "@/services/storageService";
import { Course } from "@/types/training";
import { Save, ArrowLeft, Upload, X, Image } from "lucide-react";

export default function CourseForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchCourse(id);
    }
  }, [id, isEditMode]);

  const fetchCourse = async (courseId: string) => {
    try {
      const course = await courseService.getCourseById(courseId);
      setTitle(course.title);
      setDescription(course.description || "");
      setPoints(course.points);
      setImageUrl(course.image_url || null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching course",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    try {
      const uploadPath = await storageService.uploadImage(imageFile);
      return uploadPath;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Course title is required.",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      // If there's a new image file, upload it
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }
      
      const courseData: Partial<Course> = {
        title,
        description: description.trim() ? description : null,
        points,
        image_url: finalImageUrl,
      };

      if (isEditMode && id) {
        await courseService.updateCourse(id, courseData);
        toast({
          title: "Course updated",
          description: "The course has been successfully updated.",
        });
      } else {
        await courseService.createCourse(courseData);
        toast({
          title: "Course created",
          description: "The course has been successfully created.",
        });
      }
      
      navigate("/admin/training");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error ${isEditMode ? "updating" : "creating"} course`,
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 page-header-spacing">
          <div className="flex justify-center items-center h-64">
            <p>Loading course...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {isEditMode ? "Edit Course" : "Create New Course"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Course Details" : "Course Details"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter course description"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  placeholder="Enter points for completing this course"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Course Image</Label>
                {imageUrl ? (
                  <div className="relative border rounded-md overflow-hidden h-48">
                    <img
                      src={imageUrl}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-md p-6 text-center">
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Image className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium mb-1">Upload course image</span>
                      <span className="text-xs text-muted-foreground">
                        Recommended: 1200 x 600px, max 5MB
                      </span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/training")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Course
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
