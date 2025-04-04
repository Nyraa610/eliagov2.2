
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAddUserForm } from "./useAddUserForm";
import { EmailField } from "./form-fields/EmailField";
import { RoleField } from "./form-fields/RoleField";
import { Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

interface AddUserFormProps {
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserForm({ onOpenChange, onUserAdded }: AddUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { form, onSubmit } = useAddUserForm({
    setIsSubmitting,
    toast,
    onOpenChange,
    onUserAdded,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <EmailField form={form} />
        <RoleField form={form} />
        
        <FormField
          control={form.control}
          name="sendInvitation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Send Invitation</FormLabel>
                <FormDescription>
                  Send an email invitation to set up account
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Add User"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
