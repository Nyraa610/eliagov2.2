
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAddUserForm } from "./useAddUserForm";
import { EmailField } from "./form-fields/EmailField";
import { PasswordField } from "./form-fields/PasswordField";
import { RoleField } from "./form-fields/RoleField";

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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <EmailField form={form} />
      <PasswordField form={form} />
      <RoleField form={form} />

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </DialogFooter>
    </form>
  );
}
