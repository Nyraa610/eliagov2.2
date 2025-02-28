
import { supabaseService } from "./base/supabaseService";

const { supabase } = supabaseService;

export const storageService = {
  async uploadVideo(file: File): Promise<string> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Handle file name and extension safely
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      console.log("Starting video upload to path:", filePath);

      // Ensure the training_materials bucket exists
      const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();
      if (listBucketsError) {
        console.error("Error listing buckets:", listBucketsError);
        throw listBucketsError;
      }
      
      const trainingBucket = buckets?.find(b => b.name === 'training_materials');
      
      if (!trainingBucket) {
        console.log("Creating training_materials bucket");
        const { error: createBucketError } = await supabase.storage.createBucket('training_materials', {
          public: true
        });
        
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          throw createBucketError;
        }
        
        console.log("Bucket created successfully");
      } else {
        console.log("Bucket already exists");
      }

      // Upload the file to storage
      console.log("Uploading video file...");
      const { error: uploadError } = await supabase.storage
        .from('training_materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Video upload error:", uploadError);
        throw uploadError;
      }

      console.log("Video upload successful, getting public URL");

      // Get the public URL
      const { data } = supabase.storage
        .from('training_materials')
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      console.log("Video public URL:", data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Upload video error:", error);
      throw error;
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Handle file name and extension safely
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `images/${fileName}`;
      
      console.log("Starting image upload to path:", filePath);

      // Ensure the training_materials bucket exists
      const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();
      if (listBucketsError) {
        console.error("Error listing buckets:", listBucketsError);
        throw listBucketsError;
      }
      
      const trainingBucket = buckets?.find(b => b.name === 'training_materials');
      
      if (!trainingBucket) {
        console.log("Creating training_materials bucket");
        const { error: createBucketError } = await supabase.storage.createBucket('training_materials', {
          public: true
        });
        
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          throw createBucketError;
        }
        
        console.log("Bucket created successfully");
      } else {
        console.log("Bucket already exists");
      }

      // Upload the file to storage
      console.log("Uploading image file...");
      const { error: uploadError } = await supabase.storage
        .from('training_materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Image upload error:", uploadError);
        throw uploadError;
      }

      console.log("Image upload successful, getting public URL");

      // Get the public URL
      const { data } = supabase.storage
        .from('training_materials')
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      console.log("Image public URL:", data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Upload image error:", error);
      throw error;
    }
  }
};
