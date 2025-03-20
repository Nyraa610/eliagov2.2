
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const apiKeySchema = z.object({
  key: z.string().min(1, "API key is required"),
});

interface APIKeyConnectorProps {
  connectorName: string;
  connected: boolean;
  onConnect: (key: string) => Promise<void>;
  onDisconnect: () => void;
  description?: string;
}

export function APIKeyConnector({ 
  connectorName, 
  connected, 
  onConnect, 
  onDisconnect,
  description 
}: APIKeyConnectorProps) {
  const apiForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      key: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof apiKeySchema>) => {
    try {
      await onConnect(values.key);
      apiForm.reset();
    } catch (error) {
      console.error(`Error connecting ${connectorName}:`, error);
    }
  };

  return (
    <div className="space-y-4">
      {connected ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Connected</AlertTitle>
          <AlertDescription className="text-green-700">
            Your {connectorName} is connected successfully. 
            You can now integrate data from this system.
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </Alert>
      ) : (
        <>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Connected</AlertTitle>
            <AlertDescription>
              {description || `Connect your ${connectorName} to enable data integration`}
            </AlertDescription>
          </Alert>
          
          <Form {...apiForm}>
            <form onSubmit={apiForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={apiForm.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your API key" 
                        type="password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the API key from your {connectorName} account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit">
                Connect {connectorName}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
