
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
import { Upload, ArrowLeft, Save } from "lucide-react";
import { Course } from "@/types/training";
import { trainingService } from "@/services/trainingService";

export default function CourseForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    image_url: "",
    points: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const fetchCourse = async () => {
        setIsLoading(true);
        try {
          const data = await trainingService.getCourseById(id);
          setCourse(data);
          if (data.image_url) {
            setImagePreview(data.image_url);
          }
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

      fetchCourse();
    }
  }, [id, isEditing, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: name === "points" ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageUrl = course.image_url;

      // Upload the image if a new one was selected
      if (imageFile) {
        imageUrl = await trainingService.uploadImage(imageFile);
      }

      const courseData = {
        ...course,
        image_url: imageUrl,
      };

      // Insert or update the course
      const { data, error } = await supabase
        .from("courses")
        .upsert([courseData], { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: isEditing ? "Course updated" : "Course created",
        description: `Successfully ${isEditing ? "updated" : "created"} the course.`,
      });

      navigate("/admin/training");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving course",
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Loading course data...</p>
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
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={course.title}
                        onChange={handleInputChange}
                        placeholder="Enter course title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={course.description || ""}
                        onChange={handleInputChange}
                        placeholder="Enter course description"
                        rows={5}
                      />
                    </div>

                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        name="points"
                        type="number"
                        min="0"
                        value={course.points}
                        onChange={handleInputChange}
                        placeholder="Enter points value"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving ? "Saving..." : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Course
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Course Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-video bg-muted rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">No image selected</p>
                    </div>
                  )}

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="picture">Upload Image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="picture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("picture")?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 1280x720 pixels (16:9 ratio)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
