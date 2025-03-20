
import React from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const hubspotSchema = z.object({
  accessToken: z.string().min(1, "API token is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type HubspotFormValues = z.infer<typeof hubspotSchema>;

interface HubspotConnectionFormProps {
  onSubmit: (values: HubspotFormValues) => Promise<void>;
  isConnecting: boolean;
}

export function HubspotConnectionForm({ onSubmit, isConnecting }: HubspotConnectionFormProps) {
  const hubspotForm = useForm<HubspotFormValues>({
    resolver: zodResolver(hubspotSchema),
    defaultValues: {
      accessToken: "",
      refreshToken: "",
    },
  });

  const handleSubmit = async (values: HubspotFormValues) => {
    await onSubmit(values);
    hubspotForm.reset();
  };

  return (
    <>
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Connected</AlertTitle>
        <AlertDescription>
          Connect your HubSpot account to enable sales opportunities analysis
        </AlertDescription>
      </Alert>
      
      <Form {...hubspotForm}>
        <form onSubmit={hubspotForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={hubspotForm.control}
            name="accessToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Token</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your HubSpot API token" 
                    type="password" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Enter the API token from your HubSpot developer account
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={hubspotForm.control}
            name="refreshToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refresh Token</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your HubSpot refresh token" 
                    type="password" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Enter the refresh token from your HubSpot developer account
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect HubSpot"}
          </Button>
        </form>
      </Form>
    </>
  );
}
