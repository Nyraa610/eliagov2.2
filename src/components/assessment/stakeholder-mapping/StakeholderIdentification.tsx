import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleUploadButton } from "@/components/shared/DocumentUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, Upload, Users } from "lucide-react";
import { stakeholderService } from "@/services/stakeholderService";
import { UploadedDocument } from "@/services/storage/supabaseStorageService";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  companyDescription: z.string().min(10, "Please provide a brief description of your company"),
  hasEmployees: z.boolean().default(false),
  hasShareholders: z.boolean().default(false),
  hasCustomers: z.boolean().default(false),
  hasSuppliers: z.boolean().default(false),
  hasLocalCommunities: z.boolean().default(false),
  hasGovernmentBodies: z.boolean().default(false),
  hasRegulators: z.boolean().default(false),
  hasNGOs: z.boolean().default(false),
  additionalStakeholders: z.string().optional(),
});

type StakeholderIdentificationProps = {
  onComplete: () => void;
};

export function StakeholderIdentification({ onComplete }: StakeholderIdentificationProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const { user, companyId } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyDescription: "",
      hasEmployees: false,
      hasShareholders: false,
      hasCustomers: false,
      hasSuppliers: false,
      hasLocalCommunities: false,
      hasGovernmentBodies: false,
      hasRegulators: false,
      hasNGOs: false,
      additionalStakeholders: "",
    },
  });

  const stakeholderTypes = [
    { id: "hasEmployees", label: "Employees" },
    { id: "hasShareholders", label: "Shareholders/Investors" },
    { id: "hasCustomers", label: "Customers/Clients" },
    { id: "hasSuppliers", label: "Suppliers/Vendors" },
    { id: "hasLocalCommunities", label: "Local Communities" },
    { id: "hasGovernmentBodies", label: "Government Bodies" },
    { id: "hasRegulators", label: "Regulators" },
    { id: "hasNGOs", label: "NGOs/Civil Society Organizations" },
  ];

  const handleDocumentUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      if (!companyId) {
        toast.error("Company ID is required to upload documents");
        setIsUploading(false);
        return;
      }
      
      const documents = await stakeholderService.uploadStakeholderDocuments(files);
      setUploadedDocuments(prev => [...prev, ...documents]);
      toast.success("Documents uploaded successfully");
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const selectedStakeholders = stakeholderTypes
        .filter(type => values[type.id as keyof typeof values])
        .map(type => type.label);
      
      if (values.additionalStakeholders) {
        const additionalList = values.additionalStakeholders
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        selectedStakeholders.push(...additionalList);
      }

      await stakeholderService.saveIdentifiedStakeholders({
        companyDescription: values.companyDescription,
        stakeholderTypes: selectedStakeholders,
        documents: uploadedDocuments.map(doc => doc.url)
      });
      
      toast.success("Stakeholder identification saved");
      onComplete();
    } catch (error) {
      console.error("Error saving stakeholders:", error);
      toast.error("Failed to save stakeholder information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoIdentify = async () => {
    if (!form.getValues().companyDescription) {
      toast.error("Please provide a company description first");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await stakeholderService.autoIdentifyStakeholders(form.getValues().companyDescription);
      
      if (result.stakeholders) {
        const formUpdate: any = {};
        stakeholderTypes.forEach(type => {
          formUpdate[type.id] = result.stakeholders.includes(type.label);
        });
        
        form.reset({
          ...form.getValues(),
          ...formUpdate
        });
      }
      
      toast.success("Auto-identification complete");
    } catch (error) {
      console.error("Error in auto-identification:", error);
      toast.error("Failed to auto-identify stakeholders");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Stakeholder Identification
          </CardTitle>
          <CardDescription>
            Identify all relevant stakeholders for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your organization, its activities, sectors, and geographic scope..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This helps identify relevant stakeholders for your organization.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAutoIdentify}
                  disabled={isSubmitting}
                >
                  Auto-Identify Stakeholders
                </Button>
              </div>

              <div>
                <FormLabel>Select Stakeholder Types</FormLabel>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {stakeholderTypes.map((stakeholder) => (
                    <FormField
                      key={stakeholder.id}
                      control={form.control}
                      name={stakeholder.id as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {stakeholder.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="additionalStakeholders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Stakeholders</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Media, Trade associations, etc. (comma-separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any stakeholders not listed above (comma-separated).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border rounded-md p-4">
                <FormLabel className="block mb-2">Upload Stakeholder Documents</FormLabel>
                <FormDescription className="mb-4">
                  Upload documents that can help identify stakeholders (org charts, reports, etc.)
                </FormDescription>
                <SimpleUploadButton 
                  onUploadComplete={(documents) => {
                    const files = documents.map(doc => new File([], doc.name, { type: doc.file_type }));
                    handleDocumentUpload(files);
                  }}
                  buttonText="Upload Documents"
                  validationRules={{
                    allowedTypes: [
                      'application/pdf',
                      'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    ],
                    maxFiles: 10,
                  }}
                />
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Uploaded Documents:</p>
                    <ul className="text-sm space-y-1">
                      {uploadedDocuments.map((doc, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-green-500" />
                          {doc.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
