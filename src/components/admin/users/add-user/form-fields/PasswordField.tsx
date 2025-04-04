
import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AddUserFormValues } from "../useAddUserForm";

interface PasswordFieldProps {
  form: UseFormReturn<AddUserFormValues>;
}

export function PasswordField({ form }: PasswordFieldProps) {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password (Optional)</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Leave blank to generate random password"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Leave blank to auto-generate a secure password
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
